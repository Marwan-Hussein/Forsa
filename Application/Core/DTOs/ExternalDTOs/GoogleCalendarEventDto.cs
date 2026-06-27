using Microsoft.VisualBasic;

namespace Application.Core.DTOs.ExternalDTOs
{
    public class GoogleCalendarEventDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime StartTime { get; set;  }
        public DateAndTime EndTime { get; set;  }
    }
}
