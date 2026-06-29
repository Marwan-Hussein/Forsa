using Domain.Common.Interfaces;

namespace Domain.Entities.AuthEntities
{
    public class UserGoogleToken : IEntity<int>
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public ApplicationUser User { get; set; }
        public string GoogleEmail { get; set; }
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public DateTime TokenExpiration { get; set; }
    }
}