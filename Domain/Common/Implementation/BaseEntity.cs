using Domain.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Common.Implementation
{
    // ✏️ Modified: Implements IEntity<int> and adds Id property for a common primary key contract
    public abstract class BaseEntity : IEntity<int>
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastModifiedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        public string? CreatedBy { get; set; }
        public string? ModifiedBy { get; set; }
        public string? DeletedBy { get; set; }
        public bool IsDeleted { get; set; }
    }
}
