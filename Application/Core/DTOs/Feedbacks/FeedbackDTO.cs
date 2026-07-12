using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core.DTOs.Feedbacks
{
    public class FeedbackDTO
    {
        public int Rating { get; set; }
        public string Comment { get; set; }
        public string AttendeeName { get; set; }
        public string EventTitle { get; set; }
        public string? attendeeImageUrl { get; set; }
        public int attendeeId { get; set; }
    }
}
