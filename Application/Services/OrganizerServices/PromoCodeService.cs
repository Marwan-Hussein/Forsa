using Application.Core.DTOs.Event;
using Application.Core.Interfaces.OrganizerInterfaces;
using Domain.Entities;
using Domain.Interfaces;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services.OrganizerServices
{
    public class PromoCodeService(IPromoCodeRepository repo , IValidator<OrganizerPromoCodeDto> validator) : IPromoService
    {
        public async Task<(bool IsSuccess, string Message)> GeneratePromoCode(int eventId,OrganizerPromoCodeDto dto)
        {
           var validationResult= await validator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                var errors = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage));
                return (false, $"Validation failed: {errors}");
            }
            var normalizedCode = dto.Code.ToUpper().Trim();

            var IsExist = await repo.GetByCodeAsync(eventId, normalizedCode);
            if (IsExist != null)
                return (false, $"The promo code '{normalizedCode}' already exists for this event.");
            var promoCode = new PromoCode
            {
                EventId = eventId,
                Code = dto.Code,
                DiscountValue = dto.DiscountValue,
                IsPercentage = dto.IsPercentage,
                StartDate = dto.StartDate,
                ExpiryDate = dto.ExpiryDate,
                MaxUsageLimit = dto.MaxUsageLimit
            };
            await repo.AddAsync(promoCode);
            return (true, "Promo code generated successfully.");
        }

        public async Task<(bool IsSuccess, string Message)> TerminatePromoCode(int eventId,OrganizerPromoCodeDto dto)
        {
            var victemCode = await repo.GetByCodeAsync(eventId, dto.Code);
            if (victemCode == null)
                return (false, $"The promo code '{dto.Code}' does not exist for this event.");
            await repo.DeletePromoCode(eventId, victemCode.Code);
            return (true, "Promo code terminated successfully.");
        }

        public async Task<(bool IsSuccess, string Message)> ValidatePromoCode(AttendeePromoCodeDto dto)
        {
            var normalizedCode = dto.Code?.Trim().ToUpper();
            if (string.IsNullOrWhiteSpace(normalizedCode))
            {
                return (false, "Promo code cannot be empty.");
            }

            var promoCode = await repo.GetByCodeAsync(dto.EventId, normalizedCode);
            if (promoCode == null)
            {
                return (false, "The promo code is invalid for this event.");
            }

            if (!promoCode.IsActive)
            {
                return (false, "The promo code is no longer active.");
            }

            if (promoCode.IsExpired)
            {
                return (false, "The promo code has expired.");
            }

            if (promoCode.CurrentUsage >= promoCode.MaxUsageLimit)
            {
                return (false, "The promo code has reached its maximum usage limit.");
            }

            return (true, "The promo code is valid.");
        }
    }
}
