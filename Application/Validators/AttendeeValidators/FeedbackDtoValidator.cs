using Application.Core.DTOs.AttendeeDTOs;
using FluentValidation;

namespace Application.Validators.AttendeeValidators
{
    public class FeedbackDtoValidator : AbstractValidator<FeedbackDto>
    {
        public FeedbackDtoValidator()
        {
            RuleFor(f => f.Rating)
                .InclusiveBetween(1, 5).WithMessage("Rating must be between 1 and 5 stars.");

            RuleFor(f => f.Comment)
                .MaximumLength(500).WithMessage("Comment cannot exceed 500 characters.");
        }
    }
}
