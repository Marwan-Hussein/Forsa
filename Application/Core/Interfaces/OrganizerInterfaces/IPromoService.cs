using Application.Core.DTOs.Event;
using Application.Core.DTOs.PromoCode;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core.Interfaces.OrganizerInterfaces
{
    public interface IPromoService
    {
        Task<(bool IsSuccess , string Message)> GeneratePromoCode(int eventId,OrganizerPromoCodeDto dto);
        Task<(bool IsSuccess, string Message)> ValidatePromoCode(AttendeePromoCodeDto dto);
        Task<(bool IsSuccess, string Message)> TerminatePromoCode(int eventId , OrganizerTerminatePromoCodeDTO dto);
    }
}
