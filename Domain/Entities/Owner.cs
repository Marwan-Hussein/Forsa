using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Owner
    {
        public int OwnerId { get; set; }
        //public int UserId { get; set; }
        //public User user { get; set;  }


        // relations
        public List<Place> Places { get; set; }

    }
}
