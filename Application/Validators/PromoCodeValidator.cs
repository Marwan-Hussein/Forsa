using Application.Core.DTOs.Event;
using Domain.Entities;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Validators
{
    public class PromoCodeValidator : AbstractValidator<OrganizerPromoCodeDto>
    {
        public PromoCodeValidator()
        {
            RuleFor(PC => PC.Code)
                .NotEmpty().WithMessage("Promo code is required.")
                .Length(5, 10).WithMessage("Promo code must be between 5 and 10 characters.")
                .Matches(@"^[A-Z0-9_-]+$").WithMessage("Promo code must contain only uppercase letters, numbers, dashes, or underscores.");

            RuleFor(PC => PC.DiscountValue)
                .GreaterThan(0).WithMessage("Discount value must be positive.");

            RuleFor(PC => PC)
                .Must(PC => !PC.IsPercentage || PC.DiscountValue <= 100)
                .WithName("DiscountValue")
                .WithMessage("Percentage discount cannot exceed 100%.");

            RuleFor(PC => PC.StartDate)
                .GreaterThanOrEqualTo(DateTime.UtcNow.Date).WithMessage("Start date cannot be in the past.")
                .LessThan(PC => PC.ExpiryDate).WithMessage("Start date must be before expiry date.");

            RuleFor(PC => PC.ExpiryDate)
                .GreaterThan(DateTime.UtcNow).WithMessage("Expiry date must be in the future.");

            RuleFor(PC => PC.MaxUsageLimit)
                .GreaterThan(0).WithMessage("Max usage limit must be positive.");
        }
    }
}
