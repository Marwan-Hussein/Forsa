using Application.Core.DTOs.Event;
using FluentValidation;

namespace Application.Validators
{
    public class EventSearchParameterValidator : AbstractValidator<EventSearchParameter>
    {
        public EventSearchParameterValidator()
        {
            RuleFor(x => x.EventName)
                .MaximumLength(100)
                .WithMessage("Event name cannot exceed 100 characters")
                .When(x => !string.IsNullOrWhiteSpace(x.EventName));

            RuleFor(x => x.EventLocation)
                .MaximumLength(100)
                .WithMessage("Event location cannot exceed 100 characters")
                .When(x => !string.IsNullOrWhiteSpace(x.EventLocation));

            RuleFor(x => x.EventCategory)
                .MaximumLength(50)
                .WithMessage("Event category cannot exceed 50 characters")
                .When(x => !string.IsNullOrWhiteSpace(x.EventCategory));

            RuleFor(x => x.SortBy)
                .Must(sortBy => sortBy == null || 
                               sortBy.ToLower() == "title" || 
                               sortBy.ToLower() == "location" || 
                               sortBy.ToLower() == "date" || 
                               sortBy.ToLower() == "price")
                .WithMessage("SortBy must be one of: title, location, date, price");
        }
    }
}
