using Microsoft.AspNetCore.Http;

namespace Application.Core.DTOs.Place
{
    public class MediaUploadDto
    {
        public IFormFile File { get; set; }
        public int MediaType { get; set; } // 1 = Image, 2 = Video
    }
}
