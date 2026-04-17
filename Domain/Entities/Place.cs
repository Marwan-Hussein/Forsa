using Domain.ENUMs;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Place
    {
        public int PlaceId { get; set; }
        public string Name { get; set; }
        public string Location { get; set; }
        public int Capacity { get; set; }
        public string Description { get; set; }
        public decimal HourlyPrice { get; set; }
        public decimal DailyPrice { get; set; }
        public PlaceStatus Status { get; set; }
        public FacilityName FacilityName { get; set; }
        public bool IsLocked { get; set; }
        public string? Reason { get; set; }

        // relationsships
        public List<PlaceMedia> PlaceMedias { get; set; }
        public Owner Owner { get; set; }
        [ForeignKey("Owner")]
        public int? OwnerId { get; set; }
        // 1 to many place to booking request
        // to do

        // 1 to many place to FeedBack
        // to do
    }
}
