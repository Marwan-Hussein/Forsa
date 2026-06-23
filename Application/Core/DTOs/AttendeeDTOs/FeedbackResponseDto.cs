using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core.DTOs.AttendeeDTOs
{
    public class FeedbackResponseDto
    {
        public int FeedbackId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; }
        public int EventId { get; set; }
        public int AttendeeId { get; set; }
        public int? OrganizerId { get; set; }
        public string OrganizerName { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
