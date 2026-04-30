using FluentValidation;
namespace Application.Validators
{
    public class OTPValidator : AbstractValidator<string>
    {
        public OTPValidator() { 
            RuleFor(otp => otp)
                .NotEmpty()
                .WithMessage("OTP is required.")

                .Length(5)
                .WithMessage("OTP must be 5 digits.")
                
                .Must(otp => otp.All(char.IsDigit))
                .WithMessage("OTP must contain only digits.");
        }
    }
}
