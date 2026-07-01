using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Core.DTOs.Event;

namespace Application.Core.Interfaces.EventInterfaces
{
    public interface IEventMediaService
    {
        Task<List<EventMediaDto>> UploadEventMediaAsync(int organizerId, int eventId, List<EventMediaUploadDto> mediaFiles);
        Task<bool> DeleteEventMediaAsync(int organizerId, int eventId, int mediaId);
    }
}
