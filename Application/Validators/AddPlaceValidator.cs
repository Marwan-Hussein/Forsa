using Application.Core.DTOs.Place;
using FluentValidation;

namespace Application.Validators
{
    public class AddPlaceValidator : AbstractValidator<AddPlaceDto>
    {
        public AddPlaceValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Place name is required.")
                .MaximumLength(200).WithMessage("Place name cannot exceed 200 characters.");

            RuleFor(x => x.Location)
                .NotEmpty().WithMessage("Location is required.");

            RuleFor(x => x.Capacity)
                .GreaterThan(0).WithMessage("Capacity must be greater than 0.");

            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("Description is required.")
                .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters.");

            RuleFor(x => x.HourlyPrice)
                .GreaterThanOrEqualTo(0).WithMessage("Hourly price cannot be negative.");

            RuleFor(x => x.DailyPrice)
                .GreaterThanOrEqualTo(0).WithMessage("Daily price cannot be negative.");
                
            RuleFor(x => x.Latitude)
                .NotNull().WithMessage("Latitude is required.")
                .InclusiveBetween(-90, 90).WithMessage("Latitude must be between -90 and 90.");

            RuleFor(x => x.Longitude)
                .NotNull().WithMessage("Longitude is required.")
                .InclusiveBetween(-180, 180).WithMessage("Longitude must be between -180 and 180.");
        }
    }
}
