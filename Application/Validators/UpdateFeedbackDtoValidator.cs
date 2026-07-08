using Application.Core.DTOs.Feedbacks;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Validators
{
    public class FeedbackDtoValidator : AbstractValidator<UpdateFeedbackDTO>
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
