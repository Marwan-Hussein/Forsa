using Application.Core.DTOs.Payment;
using Application.Core.Interfaces;
using Domain.ENUMs;
using Domain.Interfaces;

namespace Application.Services
{
    public class PaymobService(IBookingRepository bookingRepository
                               ,IUnitOfWork unitOfWork) : IPaymentMethod
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

            HttpClient client = new HttpClient();
            var response = await client.PostAsync("https://paymentgateway.com/api/pay", new StringContent(JsonConvert.SerializeObject(dto), Encoding.UTF8, "application/json"));
        }
    }
}
