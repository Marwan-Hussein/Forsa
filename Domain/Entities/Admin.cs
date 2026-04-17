using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Admin
    {
        public int AdminId { get; set; }



        public int UserId { get; set; }
        public User User { get; set; }
    }
}
