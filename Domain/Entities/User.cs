namespace Domain.Entities
{
    public class User
    {
        public int UserId { get; set; }
        public string UserName { get; set; }

        public string UserEmail { get; set; }
        public string EncryptedPassword { get; set; }

        public string UserPhone { get; set; }

        public string  Location { get; set; }

        public DateTime BirthDate { get; set; }

        public string ProfilePicture { get; set; }



        public Attendee Attendee { get; set; }
        
        public Owner Owner { get; set; }

        public Admin Admin { get; set; }


    }
}
