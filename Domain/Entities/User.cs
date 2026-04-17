using Microsoft.AspNet.Identity.EntityFramework;

namespace Domain.Entities
{
    public class User : IdentityUser
    {
        //public int UserId { get; set; }
        //public string UserName { get; set; }

        //public string UserEmail { get; set; }
        //public string EncryptedPassword { get; set; }

        //public string UserPhone { get; set; }

        public string  Location { get; set; }

        public DateTime BirthDate { get; set; }

        public string ProfilePicture { get; set; }

        public bool IsDeleted { get; set; }

        //public Attendee Attendee { get; set; }

        //public Owner Owner { get; set; }

        //public Admin Admin { get; set; }


        // relations
        public List<Notification>? Notifications { get; set; }

    }
}
