using Microsoft.AspNetCore.Identity;
using Domain.Common.Interfaces;
namespace Domain.Entities
{
    // ✏️ Modified: Implements IEntity<int> instead of IBaseEntity, and removed unnecessary commented Id
    public class ApplicationUser: IdentityUser<int> , IEntity<int>
    {

        public string FullName{ get; set; }
        public string Location{ get; set; }
        public DateTime BirthDate{ get; set; }
        public string ProfilePicture{ get; set; }
        public bool IsDeleted{ get; set; }

        // Relationships
        public List<Notification> Notifications{ get; set; }
        // IBaseEntity properties
        public DateTime CreatedAt { get; set; }
        public DateTime? LastModifiedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        public string? CreatedBy { get; set; }
        public string? ModifiedBy { get; set; }
        public string? DeletedBy { get; set; }
    }
}
