using Application.Core.DTOs.Payment;
using Application.Core.Interfaces;
using Domain.ENUMs;
using Domain.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Application.Services
{
    public class PaymobService(IBookingRepository bookingRepository
                               ,IUnitOfWork unitOfWork
                               ,IConfiguration configuration
                               ,IHttpClientFactory httpClientFactory   ) : IPaymentMethod
    {
        public async Task<PaymentResponseDto> InitiatePaymentProcess(PaymentRequestDto dto)
        {
            var booking = await bookingRepository.GetBookingWithEventAsync(dto.bookingId);

            if (booking.Event.Status is EventStatus.Cancelled or EventStatus.SoldOut)
            {
                return new PaymentResponseDto
                {
                    IsSuccess = false,
                    Message = $"Cannot proceed. This event is currently {booking.Event.Status}."
                };
            }

            if (booking.Status is BookingStatus.Cancelled or BookingStatus.Attended)
            {
                return new PaymentResponseDto
                {
                    IsSuccess = false,
                    Message = "Booking is cancelled or attended"
                };
            }

            if (booking.Status == BookingStatus.Confirmed)
            {
                return new PaymentResponseDto
                {
                    IsSuccess = false,
                    Message = "This booking has already been paid for."
                };
            }

            var secretKey = configuration["PaymentGateway:PayMob:SecretKey"];
            var PublicKey = configuration["PaymentGateway:PayMob:PublicKey"];
            var apiKey = configuration["PaymentGateway:PayMob:APIKey"];
            var IntegrationId = configuration["PaymentGateway:PayMob:IntegrationId:OnlineCard"];

            var amountInPiasters = (int)(booking.NumberOfTickets * booking.Event.TicketPrice) * 100;
            var paymobRequestedData = new
            {
                Amount = amountInPiasters,
                Currancy = "EGY", 
                PaymentMethod = configuration["PaymentGateway:PayMob:IntegrationId"]
            };

            var client = httpClientFactory.CreateClient();

            
        }
    }
}
