using System;
using System.ComponentModel.DataAnnotations;

public class MinimumAgeAttribute : ValidationAttribute
{
    private readonly int _minimumAge;

    public MinimumAgeAttribute(int minimumAge)
    {
        _minimumAge = minimumAge;
    }

    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is not DateTime birthDate)
            return new ValidationResult("Birthdate is required.");

        if (birthDate >= DateTime.Today)
            return new ValidationResult("Birthdate must be in the past.");

        var age = DateTime.Today.Year - birthDate.Year;

        if (birthDate.Date > DateTime.Today.AddYears(-age))
            age--;

        if (age < _minimumAge)
            return new ValidationResult($"You must be at least {_minimumAge} years old.");

        return ValidationResult.Success;
    }
}