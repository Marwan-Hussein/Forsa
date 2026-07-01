using Application.Core.DTOs.Payment;
using Application.Core.Interfaces;
using Domain.Entities.PaymentEntities;
using Domain.Entities.BookingEntities;
using Domain.Entities.EventEntities;
using Domain.Entities.PlaceEntities;
using Domain.Entities.OrganizerEntities;
using Domain.Entities.OwnerEntities;
using Domain.ENUMs;
using Domain.Interfaces;
using Domain.Interfaces.BookingInterfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Application.Services
{
    public class PaymobService(
        IBookingRepository bookingRepository,
        IUnitOfWork unitOfWork,
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        IQueryableRepository<PaymentTransaction> transactionRepo,
        IQueryableRepository<WalletBalance> walletRepo,
        IQueryableRepository<PayoutMethod> payoutMethodRepo,
        IQueryableRepository<Event> eventRepo,
        IQueryableRepository<BookingRequest> bookingRequestRepo,
        IQueryableRepository<PlaceAvailability> availabilityRepo,
        IQueryableRepository<Organizer> organizerRepo,
        IQueryableRepository<Owner> ownerRepo) : IPaymentService
    {
        public async Task<PaymentResponseDto> InitiatePaymentProcess(int transactionId)
        {
            var transaction = await transactionRepo.GetByIdAsync(transactionId);

            if (transaction == null)
            {
                return new PaymentResponseDto { IsSuccess = false, Message = "Transaction not found." };
            }

            if (transaction.TransactionStatus != TransactionStatus.Pending)
            {
                return new PaymentResponseDto { IsSuccess = false, Message = "This transaction has already been processed." };
            }

            var secretKey = configuration["PaymentGateway:PayMob:SecretKey"];
            bool isMockMode = string.IsNullOrEmpty(secretKey) || secretKey.StartsWith("mock", StringComparison.OrdinalIgnoreCase) || secretKey.StartsWith("dummy", StringComparison.OrdinalIgnoreCase);

            if (isMockMode)
            {
                var mockIntentionId = $"mock_intention_{transaction.ItemType.ToLower()}_{transaction.ReferenceId}";
                transaction.PaymobIntentionId = mockIntentionId;
                transactionRepo.Update(transaction);
                await unitOfWork.SaveChangesAsync();

                return new PaymentResponseDto
                {
                    IsSuccess = true,
                    Message = "[MOCK] Payment process initiated successfully.",
                    ClientSecret = "mock_client_secret_" + Guid.NewGuid().ToString("N"),
                    BookingId = transaction.ReferenceId
                };
            }

            var amountInPiasters = (int)(transaction.Amount * 100);

            var client = httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Token", secretKey);

            var jsonPayload = JsonSerializer.Serialize(new
            {
                amount = amountInPiasters,
                currency = "EGP",
                payment_methods = new[] { int.Parse(configuration["PaymentGateway:PayMob:IntegrationId:OnlineCard"]) },
                billing_data = new
                {
                    apartment = "NA",
                    email = "attendee@example.com",
                    floor = "NA",
                    first_name = "Event",
                    street = "NA",
                    building = "NA",
                    phone_number = "+201000000000",
                    last_name = "Attendee",
                    country = "EG",
                    city = "Cairo"
                }
            });

            try
            {
                var response = await client.PostAsync("https://accept.paymob.com/v1/intention/",
                              new StringContent(jsonPayload, System.Text.Encoding.UTF8, "application/json"));

                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    using var jsonDoc = JsonDocument.Parse(responseContent);
                    var paymobOrderId = jsonDoc.RootElement.GetProperty("id").GetString();
                    var clientSecret = jsonDoc.RootElement.GetProperty("client_secret").GetString();
                    transaction.PaymobIntentionId = paymobOrderId;
                    transactionRepo.Update(transaction);
                    await unitOfWork.SaveChangesAsync();
                    return new PaymentResponseDto
                    {
                        IsSuccess = true,
                        Message = "Payment process initiated successfully.",
                        ClientSecret = clientSecret,
                        BookingId = transaction.ReferenceId
                    };
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    return new PaymentResponseDto
                    {
                        IsSuccess = false,
                        Message = $"Paymob Error {response.StatusCode}: {errorContent}" 
                    };
                }
            }
            catch (Exception ex)
            {
                return new PaymentResponseDto
                {
                    IsSuccess = false,
                    Message = $"An error occurred while initiating payment process: {ex.Message}"
                };
            }
        }

        public async Task<bool> ProcessPaymentCallbackAsync(PaymobWebhookDto webhookPayload)
        {
            // 1. Guard Clauses
            if (webhookPayload?.Obj == null || string.IsNullOrEmpty(webhookPayload.Obj.IntentionId))
                return false;

            // 2. Fetch transaction
            var transaction = await transactionRepo.GetQueryable()
                .FirstOrDefaultAsync(t => t.PaymobIntentionId == webhookPayload.Obj.IntentionId);

            if (transaction == null) return false;

            // 3. Idempotency Check
            if (transaction.TransactionStatus != TransactionStatus.Pending) return true;

            transaction.PaymobTransactionId = webhookPayload.Obj.Id.ToString();

            bool isProcessed = false;

            // 4. Handle based on item type
            if (transaction.ItemType == "EventBooking")
            {
                isProcessed = await HandleEventBookingCallbackAsync(transaction, webhookPayload);
            }
            else if (transaction.ItemType == "PlaceBooking")
            {
                isProcessed = await HandlePlaceBookingCallbackAsync(transaction, webhookPayload);
            }

            if (!isProcessed) return false;

            // 5. Finalize all changes
            transactionRepo.Update(transaction);
            await unitOfWork.SaveChangesAsync();

            return true;
        }

        private async Task<bool> HandleEventBookingCallbackAsync(PaymentTransaction transaction, PaymobWebhookDto webhookPayload)
        {
            var booking = await bookingRepository.GetBookingWithEventAsync(transaction.ReferenceId);
            if (booking == null) return false;

            if (webhookPayload.Obj.Success)
            {
                transaction.TransactionStatus = TransactionStatus.Completed;
                booking.Status = BookingStatus.Confirmed;

                if (booking.Event != null)
                {
                    var organizerId = booking.Event.OrganizerId;
                    var wallet = await walletRepo.GetQueryable().FirstOrDefaultAsync(w => w.UserId == organizerId);

                    bool isNewWallet = false;
                    if (wallet == null)
                    {
                        wallet = new WalletBalance
                        {
                            UserId = organizerId,
                            CreatedAt = DateTime.UtcNow
                        };
                        isNewWallet = true;
                    }

                    var platformFee = transaction.Amount * 0.10m;
                    var organizerShare = transaction.Amount - platformFee;

                    wallet.AvailableBalance += organizerShare;
                    wallet.LastModifiedAt = DateTime.UtcNow;

                    if (isNewWallet) await walletRepo.AddAsync(wallet);
                    else walletRepo.Update(wallet);
                }
            }
            else
            {
                transaction.TransactionStatus = TransactionStatus.Failed;
                booking.Status = BookingStatus.Cancelled;

                if (booking.Event != null)
                {
                    booking.Event.RemainingTickets += booking.NumberOfTickets;
                    eventRepo.Update(booking.Event);
                }
            }

            bookingRepository.Update(booking);
            return true;
        }

        private async Task<bool> HandlePlaceBookingCallbackAsync(PaymentTransaction transaction, PaymobWebhookDto webhookPayload)
        {
            var request = await bookingRequestRepo.GetQueryable()
                .Include(br => br.Place)
                .FirstOrDefaultAsync(br => br.Id == transaction.ReferenceId);

            if (request == null) return false;

            if (webhookPayload.Obj.Success)
            {
                transaction.TransactionStatus = TransactionStatus.Completed;
                request.Status = RequestStatus.Accepted;

                if (request.Place != null && request.Place.OwnerId.HasValue)
                {
                    var ownerId = request.Place.OwnerId.Value;
                    var wallet = await walletRepo.GetQueryable()
                        .FirstOrDefaultAsync(w => w.UserId == ownerId);

                    bool isNewWallet = false;
                    if (wallet == null)
                    {
                        wallet = new WalletBalance
                        {
                            UserId = ownerId,
                            CreatedAt = DateTime.UtcNow
                        };
                        isNewWallet = true;
                    }

                    var platformFee = transaction.Amount * 0.10m;
                    var ownerShare = transaction.Amount - platformFee;

                    wallet.AvailableBalance += ownerShare;
                    wallet.LastModifiedAt = DateTime.UtcNow;

                    if (isNewWallet) await walletRepo.AddAsync(wallet);
                    else walletRepo.Update(wallet);
                }
            }
            else
            {
                transaction.TransactionStatus = TransactionStatus.Failed;
                request.Status = RequestStatus.Cancelled;

                // Release place availability slot
                var slot = await availabilityRepo.GetQueryable()
                    .FirstOrDefaultAsync(s => s.PlaceId == request.PlaceId 
                                               && s.Date == request.RequestedDate 
                                               && s.StartTime == request.StartTime 
                                               && s.EndTime == request.EndTime
                                               && s.Status == PlaceStatus.Booked);

                if (slot != null)
                {
                    slot.IsDeleted = true;
                    slot.DeletedAt = DateTime.UtcNow;
                    availabilityRepo.Update(slot);
                }
            }

            bookingRequestRepo.Update(request);
            return true;
        }

        public async Task<PayoutResponseDto> InitiateOrganizerPayoutAsync(int userId, decimal amount)
        {
            var isOrganizer = await organizerRepo.GetQueryable().AnyAsync(o => o.Id == userId);
            if (isOrganizer)
            {
                return await InitiateOrganizerPayoutInternalAsync(userId, amount);
            }

            var isOwner = await ownerRepo.GetQueryable().AnyAsync(o => o.Id == userId);
            if (isOwner)
            {
                return await InitiateOwnerPayoutInternalAsync(userId, amount);
            }

            return new PayoutResponseDto 
            { 
                IsSuccess = false, 
                Message = "User is neither an organizer nor a place owner.",
                Amount = amount 
            };
        }

        private async Task<PayoutResponseDto> InitiateOrganizerPayoutInternalAsync(int organizerId, decimal amount)
        {
            if (amount <= 0)
            {
                return new PayoutResponseDto { IsSuccess = false, Message = "Amount must be greater than zero." };
            }

            var wallet = await walletRepo.GetQueryable()
                .FirstOrDefaultAsync(w => w.UserId == organizerId);

            if (wallet == null || wallet.AvailableBalance < amount)
            {
                return new PayoutResponseDto 
                { 
                    IsSuccess = false, 
                    Message = "Insufficient available balance in organizer wallet.",
                    Amount = amount 
                };
            }

            var payoutMethod = await payoutMethodRepo.GetQueryable()
                .FirstOrDefaultAsync(p => p.UserId == organizerId && p.IsDefault);

            if (payoutMethod == null)
            {
                return new PayoutResponseDto 
                { 
                    IsSuccess = false, 
                    Message = "No default payout method configured for organizer.",
                    Amount = amount 
                };
            }

            wallet.AvailableBalance -= amount;
            wallet.TotalWithdrawn += amount;
            wallet.LastModifiedAt = DateTime.UtcNow;
            walletRepo.Update(wallet);

            var secretKey = configuration["PaymentGateway:PayMob:SecretKey"];
            bool isMockMode = string.IsNullOrEmpty(secretKey) || secretKey.StartsWith("mock", StringComparison.OrdinalIgnoreCase) || secretKey.StartsWith("dummy", StringComparison.OrdinalIgnoreCase);

            if (isMockMode)
            {
                await unitOfWork.SaveChangesAsync();
                return new PayoutResponseDto
                {
                    IsSuccess = true,
                    Message = "[MOCK] Organizer payout initiated successfully.",
                    PayoutId = "mock_organizer_payout_" + Guid.NewGuid().ToString("N"),
                    Amount = amount
                };
            }

            var client = httpClientFactory.CreateClient();
            
            string issuer = payoutMethod.Type switch
            {
                PayoutType.VodafoneCash => "vodafone",
                PayoutType.BankTransfer => "bank_card",
                PayoutType.InstaPay => "instant_bank",
                _ => "vodafone"
            };

            var payload = new
            {
                issuer = issuer,
                amount = (double)amount,
                national_id = "29001011234567",
                msisdn = payoutMethod.AccountNumber,
                bank_card_number = payoutMethod.AccountNumber,
                full_name = payoutMethod.AccountHolderName,
                client_reference_id = Guid.NewGuid().ToString()
            };

            try
            {
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Token", secretKey);

                var response = await client.PostAsync("https://payouts.paymob.com/api/secure/disburse/",
                    new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json"));

                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    using var jsonDoc = JsonDocument.Parse(responseContent);
                    
                    string payoutId = jsonDoc.RootElement.TryGetProperty("id", out var idProp) 
                        ? idProp.GetInt64().ToString() 
                        : Guid.NewGuid().ToString();

                    await unitOfWork.SaveChangesAsync();
                    return new PayoutResponseDto
                    {
                        IsSuccess = true,
                        Message = "Organizer payout initiated successfully.",
                        PayoutId = payoutId,
                        Amount = amount
                    };
                }
                else
                {
                    wallet.AvailableBalance += amount;
                    wallet.TotalWithdrawn -= amount;
                    walletRepo.Update(wallet);
                    await unitOfWork.SaveChangesAsync();

                    var errorContent = await response.Content.ReadAsStringAsync();
                    return new PayoutResponseDto
                    {
                        IsSuccess = false,
                        Message = $"Failed to initiate organizer payout. Paymob API Error: {errorContent}",
                        Amount = amount
                    };
                }
            }
            catch (Exception ex)
            {
                wallet.AvailableBalance += amount;
                wallet.TotalWithdrawn -= amount;
                walletRepo.Update(wallet);
                await unitOfWork.SaveChangesAsync();

                return new PayoutResponseDto
                {
                    IsSuccess = false,
                    Message = $"An error occurred during organizer payout: {ex.Message}",
                    Amount = amount
                };
            }
        }

        private async Task<PayoutResponseDto> InitiateOwnerPayoutInternalAsync(int ownerId, decimal amount)
        {
            if (amount <= 0)
            {
                return new PayoutResponseDto { IsSuccess = false, Message = "Amount must be greater than zero." };
            }

            var wallet = await walletRepo.GetQueryable()
                .FirstOrDefaultAsync(w => w.UserId == ownerId);

            if (wallet == null || wallet.AvailableBalance < amount)
            {
                return new PayoutResponseDto 
                { 
                    IsSuccess = false, 
                    Message = "Insufficient available balance in owner wallet.",
                    Amount = amount 
                };
            }

            var payoutMethod = await payoutMethodRepo.GetQueryable()
                .FirstOrDefaultAsync(p => p.UserId == ownerId && p.IsDefault);

            if (payoutMethod == null)
            {
                return new PayoutResponseDto 
                { 
                    IsSuccess = false, 
                    Message = "No default payout method configured for owner.",
                    Amount = amount 
                };
            }

            wallet.AvailableBalance -= amount;
            wallet.TotalWithdrawn += amount;
            wallet.LastModifiedAt = DateTime.UtcNow;
            walletRepo.Update(wallet);

            var secretKey = configuration["PaymentGateway:PayMob:SecretKey"];
            bool isMockMode = string.IsNullOrEmpty(secretKey) || secretKey.StartsWith("mock", StringComparison.OrdinalIgnoreCase) || secretKey.StartsWith("dummy", StringComparison.OrdinalIgnoreCase);

            if (isMockMode)
            {
                await unitOfWork.SaveChangesAsync();
                return new PayoutResponseDto
                {
                    IsSuccess = true,
                    Message = "[MOCK] Owner payout initiated successfully.",
                    PayoutId = "mock_owner_payout_" + Guid.NewGuid().ToString("N"),
                    Amount = amount
                };
            }

            var client = httpClientFactory.CreateClient();
            
            string issuer = payoutMethod.Type switch
            {
                PayoutType.VodafoneCash => "vodafone",
                PayoutType.BankTransfer => "bank_card",
                PayoutType.InstaPay => "instant_bank",
                _ => "vodafone"
            };

            var payload = new
            {
                issuer = issuer,
                amount = (double)amount,
                national_id = "29001011234567",
                msisdn = payoutMethod.AccountNumber,
                bank_card_number = payoutMethod.AccountNumber,
                full_name = payoutMethod.AccountHolderName,
                client_reference_id = Guid.NewGuid().ToString()
            };

            try
            {
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Token", secretKey);

                var response = await client.PostAsync("https://payouts.paymob.com/api/secure/disburse/",
                    new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json"));

                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    using var jsonDoc = JsonDocument.Parse(responseContent);
                    
                    string payoutId = jsonDoc.RootElement.TryGetProperty("id", out var idProp) 
                        ? idProp.GetInt64().ToString() 
                        : Guid.NewGuid().ToString();

                    await unitOfWork.SaveChangesAsync();
                    return new PayoutResponseDto
                    {
                        IsSuccess = true,
                        Message = "Owner payout initiated successfully.",
                        PayoutId = payoutId,
                        Amount = amount
                    };
                }
                else
                {
                    wallet.AvailableBalance += amount;
                    wallet.TotalWithdrawn -= amount;
                    walletRepo.Update(wallet);
                    await unitOfWork.SaveChangesAsync();

                    var errorContent = await response.Content.ReadAsStringAsync();
                    return new PayoutResponseDto
                    {
                        IsSuccess = false,
                        Message = $"Failed to initiate owner payout. Paymob API Error: {errorContent}",
                        Amount = amount
                    };
                }
            }
            catch (Exception ex)
            {
                wallet.AvailableBalance += amount;
                wallet.TotalWithdrawn -= amount;
                walletRepo.Update(wallet);
                await unitOfWork.SaveChangesAsync();

                return new PayoutResponseDto
                {
                    IsSuccess = false,
                    Message = $"An error occurred during owner payout: {ex.Message}",
                    Amount = amount
                };
            }
        }

        public async Task<RefundResponseDto> ProcessRefundAsync(int transactionId)
        {
            var transaction = await transactionRepo.GetByIdAsync(transactionId);

            if (transaction == null)
            {
                return new RefundResponseDto { IsSuccess = false, Message = "Transaction not found." };
            }

            if (transaction.TransactionStatus != TransactionStatus.Completed)
            {
                return new RefundResponseDto { IsSuccess = false, Message = "Only completed transactions can be refunded." };
            }

            var secretKey = configuration["PaymentGateway:PayMob:SecretKey"];
            bool isMockMode = string.IsNullOrEmpty(secretKey) || secretKey.StartsWith("mock", StringComparison.OrdinalIgnoreCase) || secretKey.StartsWith("dummy", StringComparison.OrdinalIgnoreCase);

            if (isMockMode)
            {
                transaction.TransactionStatus = TransactionStatus.Refunded;
                transactionRepo.Update(transaction);

                await ProcessRefundDatabaseUpdates(transaction);

                await unitOfWork.SaveChangesAsync();
                return new RefundResponseDto
                {
                    IsSuccess = true,
                    Message = "[MOCK] Transaction refunded successfully.",
                    RefundId = "mock_refund_" + Guid.NewGuid().ToString("N"),
                    Amount = transaction.Amount
                };
            }

            if (string.IsNullOrEmpty(transaction.PaymobTransactionId))
            {
                return new RefundResponseDto { IsSuccess = false, Message = "Paymob transaction ID is missing from transaction records." };
            }

            var client = httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Token", secretKey);

            var payload = new
            {
                transaction_id = long.Parse(transaction.PaymobTransactionId),
                amount_cents = (long)(transaction.Amount * 100)
            };

            try
            {
                var response = await client.PostAsync("https://accept.paymob.com/api/acceptance/void_refund/refund",
                    new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json"));

                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    using var jsonDoc = JsonDocument.Parse(responseContent);
                    string refundId = jsonDoc.RootElement.TryGetProperty("id", out var idProp) 
                        ? idProp.GetInt64().ToString() 
                        : Guid.NewGuid().ToString();

                    transaction.TransactionStatus = TransactionStatus.Refunded;
                    transactionRepo.Update(transaction);

                    await ProcessRefundDatabaseUpdates(transaction);

                    await unitOfWork.SaveChangesAsync();
                    return new RefundResponseDto
                    {
                        IsSuccess = true,
                        Message = "Transaction refunded successfully.",
                        RefundId = refundId,
                        Amount = transaction.Amount
                    };
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    return new RefundResponseDto
                    {
                        IsSuccess = false,
                        Message = $"Failed to process refund. Paymob API Error: {errorContent}"
                    };
                }
            }
            catch (Exception ex)
            {
                return new RefundResponseDto
                {
                    IsSuccess = false,
                    Message = $"An error occurred while processing refund: {ex.Message}"
                };
            }
        }

        private async Task ProcessRefundDatabaseUpdates(PaymentTransaction transaction)
        {
            if (transaction.ItemType == "EventBooking")
            {
                var booking = await bookingRepository.GetBookingWithEventAsync(transaction.ReferenceId);
                if (booking != null)
                {
                    booking.Status = BookingStatus.Cancelled;
                    bookingRepository.Update(booking);

                    if (booking.Event != null)
                    {
                        booking.Event.RemainingTickets += booking.NumberOfTickets;
                        eventRepo.Update(booking.Event);

                        var organizerId = booking.Event.OrganizerId;
                        var wallet = await walletRepo.GetQueryable()
                            .FirstOrDefaultAsync(w => w.UserId == organizerId);

                        if (wallet != null)
                        {
                            wallet.AvailableBalance -= transaction.Amount;
                            wallet.LastModifiedAt = DateTime.UtcNow;
                            walletRepo.Update(wallet);
                        }
                    }
                }
            }
            else if (transaction.ItemType == "PlaceBooking")
            {
                var request = await bookingRequestRepo.GetQueryable()
                    .Include(br => br.Place)
                    .FirstOrDefaultAsync(br => br.Id == transaction.ReferenceId);

                if (request != null)
                {
                    request.Status = RequestStatus.Cancelled;
                    bookingRequestRepo.Update(request);

                    var slot = await availabilityRepo.GetQueryable()
                        .FirstOrDefaultAsync(s => s.PlaceId == request.PlaceId 
                                               && s.Date == request.RequestedDate 
                                               && s.StartTime == request.StartTime 
                                               && s.EndTime == request.EndTime
                                               && s.Status == PlaceStatus.Booked);

                    if (slot != null)
                    {
                        slot.IsDeleted = true;
                        slot.DeletedAt = DateTime.UtcNow;
                        availabilityRepo.Update(slot);
                    }

                    if (request.Place != null && request.Place.OwnerId.HasValue)
                    {
                        var ownerId = request.Place.OwnerId.Value;
                        var wallet = await walletRepo.GetQueryable()
                            .FirstOrDefaultAsync(w => w.UserId == ownerId);

                        if (wallet != null)
                        {
                            var platformFee = transaction.Amount * 0.10m;
                            var ownerShare = transaction.Amount - platformFee;
                            wallet.AvailableBalance -= ownerShare;
                            wallet.LastModifiedAt = DateTime.UtcNow;
                            walletRepo.Update(wallet);
                        }
                    }
                }
            }
        }

        public async Task<bool> ConfigurePayoutMethodAsync(int userId, ConfigurePayoutMethodDto dto)
        {
            var userExists = await organizerRepo.GetQueryable().AnyAsync(o => o.Id == userId)
                             || await ownerRepo.GetQueryable().AnyAsync(o => o.Id == userId);

            if (!userExists) return false;

            // Deactivate existing default payout methods
            var existingDefaults = await payoutMethodRepo.GetQueryable()
                .Where(p => p.UserId == userId && p.IsDefault)
                .ToListAsync();

            foreach (var method in existingDefaults)
            {
                method.IsDefault = false;
                payoutMethodRepo.Update(method);
            }

            // Find next Id value (as Id column is not identity but is required)
            int nextId = 1;
            var maxIdMethod = await payoutMethodRepo.GetQueryable()
                .OrderByDescending(p => p.Id)
                .FirstOrDefaultAsync();
            if (maxIdMethod != null)
            {
                nextId = maxIdMethod.Id + 1;
            }

            var newMethod = new PayoutMethod
            {
                Id = nextId,
                Type = dto.Type,
                AccountNumber = dto.AccountNumber,
                AccountHolderName = dto.AccountHolderName,
                IsDefault = true,
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false,
                IsBlocked = false
            };

            await payoutMethodRepo.AddAsync(newMethod);
            await unitOfWork.SaveChangesAsync();

            return true;
        }
    }
}
