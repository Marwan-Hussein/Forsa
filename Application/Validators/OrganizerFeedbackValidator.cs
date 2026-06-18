using Application.Core.DTOs.Owner;
using FluentValidation;

namespace Application.Validators
{
    public class OrganizerFeedbackValidator : AbstractValidator<OrganizerFeedbackDto>
    {
        public OrganizerFeedbackValidator()
        {
            RuleFor(x => x.Rating)
                .InclusiveBetween(1, 5)
                .WithMessage("Rating must be between 1 and 5.");

            RuleFor(x => x.Comment)
                .NotEmpty().WithMessage("Comment is required.")
                .MaximumLength(500).WithMessage("Comment cannot exceed 500 characters.");
        }
    }
}
