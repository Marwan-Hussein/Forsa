using Application.Core.DTOs.AttendeeDTOs;
using FluentValidation;

namespace Application.Validators.AttendeeValidators
{
    public class UpdateAttendeeInterestsDtoValidator : AbstractValidator<UpdateAttendeeInterestsDto>
    {
        public UpdateAttendeeInterestsDtoValidator()
        {
            RuleFor(x => x.InterestIds)
                .NotNull().WithMessage("InterestIds is required.")
                .Must(ids => ids != null && ids.Count > 0).WithMessage("At least one interest must be selected.")
                .Must(ids => ids == null || ids.Distinct().Count() == ids.Count)
                .WithMessage("InterestIds must not contain duplicates.");

            RuleForEach(x => x.InterestIds)
                .GreaterThan(0).WithMessage("Each interest id must be greater than 0.");
        }
    }
}
