using Application.Core.DTOs.Booking;
using FluentValidation;

namespace Application.Validators
{
    public class CreateBookingValidator : AbstractValidator<CreateBookingRequestDto>
    {
        public CreateBookingValidator()
        {
            RuleFor(x => x.AttendeeId)
                .GreaterThan(0)
                .WithMessage("AttendeeId must be a valid positive number.");

            RuleFor(x => x.EventId)
                .GreaterThan(0)
                .WithMessage("EventId must be a valid positive number.");

            RuleFor(x => x.NumberOfTickets)
                .Equal(1)
                .WithMessage("You can only book exactly 1 ticket per booking.");
        }
    }
}
