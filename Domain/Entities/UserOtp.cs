using Domain.Common.Interfaces;

namespace Domain.Entities
{
    public class UserOtp : IEntity<int>
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string OtpHash { get; set; }
        public DateTime ExpiryTime { get; set; }
    }
}
