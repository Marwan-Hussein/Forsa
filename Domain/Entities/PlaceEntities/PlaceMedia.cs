using Domain.ENUMs;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities.PlaceEntities
{
    public class PlaceMedia
    {
        public int Id { get; set; } 
        public string MediaURL { get; set; }
        public MediaType MediaType { get; set; }

        public int? PlaceId { get; set; }
        public Place Place { get; set; }
    }
}
