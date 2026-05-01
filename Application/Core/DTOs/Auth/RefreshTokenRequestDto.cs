using System.ComponentModel.DataAnnotations;

namespace Application.Core.DTOs.Auth
{
    public class RefreshTokenRequestDto
    {
        [Required(ErrorMessage = "Refresh token is required.")]
        public string RefreshToken { get; set; }
    }
}
