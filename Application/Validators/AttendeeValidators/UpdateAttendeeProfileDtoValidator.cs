using Application.Core.DTOs.AttendeeDTOs;
using FluentValidation;

namespace Application.Validators.AttendeeValidators
{
    public class UpdateAttendeeProfileDtoValidator : AbstractValidator<UpdateAttendeeProfileDto>
    {
        public UpdateAttendeeProfileDtoValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Full name is required.");


            RuleFor(x => x.PhoneNumber)
                .NotEmpty().WithMessage("Phone number is required.");

            RuleFor(x => x.Location)
                .NotEmpty().WithMessage("Location is required.");

            RuleFor(x => x.BirthDate)
                .NotEmpty().WithMessage("Birth date is required.")
                .LessThan(DateTime.Today).WithMessage("Birth date must be in the past.");
        }
    }
}
