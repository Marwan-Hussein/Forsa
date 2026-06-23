using Application.Core.DTOs.Event;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Validators
{
    public class OrganizerPromoCodeDtoValidator : AbstractValidator<OrganizerPromoCodeDto>
    {
        public OrganizerPromoCodeDtoValidator()
        {
            // Example Validation Rules: Update these to match your actual DTO properties!

            RuleFor(x => x.Code) // Assuming your DTO has a 'Code' property
                .NotEmpty().WithMessage("Promo code cannot be empty.")
                .MinimumLength(3).WithMessage("Promo code must be at least 3 characters.");

            RuleFor(x => x.DiscountValue) // Assuming a discount property
                .InclusiveBetween(1, 100).WithMessage("Discount must be between 1% and 100%.");

            // Add any other rules your DTO needs here
        }
    }
}
