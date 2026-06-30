using Application.Core.DTOs.Payment;
using Application.Core.Interfaces;
using Domain.Entities.PaymentEntities;
using Domain.Entities.BookingEntities;
using Domain.Entities.EventEntities;
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
        IQueryableRepository<Event> eventRepo) : IPaymentService
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
            var publicKey = configuration["PaymentGateway:PayMob:PublicKey"];
            var apiKey = configuration["PaymentGateway:PayMob:APIKey"];
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
            }}

        public async Task<bool> ProcessPaymentCallbackAsync(PaymobWebhookDto webhookPayload)
        {
            // 1. Initial Guard Clauses
            if (webhookPayload?.Obj == null || string.IsNullOrEmpty(webhookPayload.Obj.IntentionId))
                return false;

            // 2. Fetch the transaction from the database
            var transaction = await transactionRepo.GetQueryable()
                .FirstOrDefaultAsync(t => t.PaymobIntentionId == webhookPayload.Obj.IntentionId);

            if (transaction == null) return false;

            // 3. Idempotency Check: Don't process if already done
            if (transaction.TransactionStatus != TransactionStatus.Pending) return true;

            transaction.PaymobTransactionId = webhookPayload.Obj.Id.ToString();

            // 4. Handle Event Bookings specifically
            if (transaction.ItemType == "EventBooking")
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

                        // Math: 10% Platform Fee, 90% to Organizer
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
                        // Return tickets to pool
                        booking.Event.RemainingTickets += booking.NumberOfTickets;
                        eventRepo.Update(booking.Event);
                    }
                }

                bookingRepository.Update(booking);
            }

            // 5. Finalize all changes
            transactionRepo.Update(transaction);
            await unitOfWork.SaveChangesAsync();

            return true;
        }
        public async Task<PayoutResponseDto> InitiateOrganizerPayoutAsync(int organizerId, decimal amount)
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
                    Message = "Insufficient available balance.",
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
                    Message = "No default payout method configured.",
                    Amount = amount 
                };
            }

            // Deduct from wallet first (optimistic ledger style)
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
                    Message = "[MOCK] Payout initiated successfully.",
                    PayoutId = "mock_payout_" + Guid.NewGuid().ToString("N"),
                    Amount = amount
                };
            }

            // Real Paymob Payouts integration
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
                national_id = "29001011234567", // dummy national id required by Paymob
                msisdn = payoutMethod.AccountNumber, // for wallet payouts
                bank_card_number = payoutMethod.AccountNumber, // for card payouts
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
                        Message = "Payout initiated successfully.",
                        PayoutId = payoutId,
                        Amount = amount
                    };
                }
                else
                {
                    // Rollback the balance deduction since the API call failed
                    wallet.AvailableBalance += amount;
                    wallet.TotalWithdrawn -= amount;
                    walletRepo.Update(wallet);
                    await unitOfWork.SaveChangesAsync();

                    var errorContent = await response.Content.ReadAsStringAsync();
                    return new PayoutResponseDto
                    {
                        IsSuccess = false,
                        Message = $"Failed to initiate payout. Paymob API Error: {errorContent}",
                        Amount = amount
                    };
                }
            }
            catch (Exception ex)
            {
                // Rollback the balance deduction
                wallet.AvailableBalance += amount;
                wallet.TotalWithdrawn -= amount;
                walletRepo.Update(wallet);
                await unitOfWork.SaveChangesAsync();

                return new PayoutResponseDto
                {
                    IsSuccess = false,
                    Message = $"An error occurred during payout: {ex.Message}",
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

                // Update Booking and Organizer Wallet
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

                    // Update Booking and Organizer Wallet
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
        }
    }
}
