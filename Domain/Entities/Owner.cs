using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Owner : ApplicationUser
    {

        // Relationships
        public List <Place> Places { get; set; }
    }
}
