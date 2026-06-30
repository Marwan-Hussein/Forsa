using Application.Core.DTOs.Payment;
using Application.Core.Interfaces;
using Domain.Entities.PaymentEntities;
using Domain.ENUMs;
using Domain.Interfaces;
using Domain.Interfaces.BookingInterfaces;
using Microsoft.Extensions.Configuration;
using System.Text.Json;

namespace Application.Services
{
    public class PaymobService(IBookingRepository bookingRepository
                               , IUnitOfWork unitOfWork
                               , IConfiguration configuration
                               , IHttpClientFactory httpClientFactory
                               , IGenericRepository<PaymentTransaction> genericRepo) : IPaymentService
    {
        public async Task<PaymentResponseDto> InitiatePaymentProcess(int transactionId)
        {


            var transaction = await genericRepo.GetByIdAsync(transactionId);

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
                payment_methods = new[] { int.Parse(configuration["PaymentGateway:PayMob:IntegrationId:OnlineCard"]) }
            });

            try {
                var response = await client.PostAsync("https://accept.paymob.com/v1/intention/",
                              new StringContent(jsonPayload, System.Text.Encoding.UTF8, "application/json"));

                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    using var jsonDoc = JsonDocument.Parse(responseContent);
                    var paymobOrderId = jsonDoc.RootElement.GetProperty("id").GetInt32();
                    var clientSecret = jsonDoc.RootElement.GetProperty("client_secret").GetString();
                    transaction.PaymobIntentionId = paymobOrderId.ToString();
                    genericRepo.Update(transaction);
                    await unitOfWork.SaveChangesAsync();
                    return new PaymentResponseDto
                    {
                        IsSuccess = true,
                        Message = "Payment process initiated successfully.",
                        ClientSecret = clientSecret,
                        BookingId = transaction.ReferenceId
                    };
                }
                else {
                    return new PaymentResponseDto
                    {
                        IsSuccess = false,
                        Message = $"Failed to initiate payment process. Status Code: {response.StatusCode}"
                    };
                }

            }
            catch (Exception ex) { 
                return new PaymentResponseDto
                {
                    IsSuccess = false,
                    Message = $"An error occurred while initiating payment process: {ex.Message}"
                };
            }
        }
    }
}
