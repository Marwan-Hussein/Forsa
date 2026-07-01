using Microsoft.AspNetCore.Http;

namespace Application.Core.DTOs.Event
{
    public class EventMediaUploadDto
    {
        public IFormFile File { get; set; }
    }
}
