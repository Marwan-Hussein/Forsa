using Microsoft.AspNet.Identity.EntityFramework;

namespace Domain.Entities
{
    public class ApplicationUser: IdentityUser
    {
        public string FullName{ get; set; }
        public string Location{ get; set; }
        public DateTime BirthDate{ get; set; }
        public string ProfilePicture{ get; set; }
        public bool IsDeleted{ get; set; }

        // Relationships
        public List<Notification> Notifications{ get; set; }


    }
}
