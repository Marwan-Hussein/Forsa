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
                .GreaterThan(0)
                .WithMessage("You must book at least 1 ticket.")
                .LessThanOrEqualTo(10)
                .WithMessage("You cannot book more than 10 tickets at once.");
        }
    }
}
