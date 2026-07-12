using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Core.DTOs.Feedbacks
{
    public class UpdateFeedbackDTO
    {
        public string Comment { get; set; }
        public int Rating { get; set; }
        public int FeedbackId { get; set; }
    }
}
