import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { User, Mail, Lock, Phone, MapPin, Calendar, Building2, Home } from "lucide-react";

export default function RegistrationPage() {
  const [searchParams] = useSearchParams();
  const registrationType = searchParams.get("type") || "attendee";
  
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    location: "",
    birthdate: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (registrationType === "attendee" && !formData.birthdate) {
      newErrors.birthdate = "Birthdate is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted:", formData);
      alert(`${registrationType.charAt(0).toUpperCase() + registrationType.slice(1)} registration successful! (This is a demo)`);
    }
  };

  const getTitle = () => {
    switch (registrationType) {
      case "organization":
        return "Register as Organization";
      case "place":
        return "Register as Place Owner";
      default:
        return "Register as Attendee";
    }
  };

  const getDescription = () => {
    switch (registrationType) {
      case "organization":
        return "Create events and manage your organization's profile";
      case "place":
        return "List your venue and connect with event organizers";
      default:
        return "Join thousands of event-goers and start your journey today";
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-block mb-4 text-muted-foreground hover:text-primary transition-colors"
          >
            ← Back to Home
          </Link>
          <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[36px] text-primary mb-2">
            {getTitle()}
          </h1>
          <p className="font-['Inter:Regular',sans-serif] text-[16px] text-muted-foreground mb-6">
            {getDescription()}
          </p>

          {/* Registration Type Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-6">
            <Link
              to="/register?type=attendee"
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] transition-all duration-300 ease-in-out ${
                registrationType === "attendee"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-card border-[0.8px] border-border text-primary hover:bg-[#f8f9fa]"
              }`}
            >
              <User className="w-4 h-4" />
              Attendee
            </Link>
            <Link
              to="/register?type=organization"
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] transition-all duration-300 ease-in-out ${
                registrationType === "organization"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-card border-[0.8px] border-border text-primary hover:bg-[#f8f9fa]"
              }`}
            >
              <Building2 className="w-4 h-4" />
              Organization
            </Link>
            <Link
              to="/register?type=place"
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] transition-all duration-300 ease-in-out ${
                registrationType === "place"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-card border-[0.8px] border-border text-primary hover:bg-[#f8f9fa]"
              }`}
            >
              <Home className="w-4 h-4" />
              Place Owner
            </Link>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-card rounded-[14px] border-[0.8px] border-border p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-primary mb-2"
              >
                {registrationType === "organization" ? "Organization Name *" : registrationType === "place" ? "Owner Name *" : "Full Name *"}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-[8px] border-[0.8px] border-border focus:outline-none focus:border-primary font-['Inter:Regular',sans-serif] text-[14px] text-primary"
                  placeholder={registrationType === "organization" ? "Enter organization name" : registrationType === "place" ? "Enter owner name" : "Enter your full name"}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-[12px] text-red-500">{errors.fullName}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-primary mb-2"
              >
                Username *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-[8px] border-[0.8px] border-border focus:outline-none focus:border-primary font-['Inter:Regular',sans-serif] text-[14px] text-primary"
                  placeholder="Choose a username"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-[12px] text-red-500">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-primary mb-2"
              >
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-[8px] border-[0.8px] border-border focus:outline-none focus:border-primary font-['Inter:Regular',sans-serif] text-[14px] text-primary"
                  placeholder="your.email@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-[12px] text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-primary mb-2"
              >
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-[8px] border-[0.8px] border-border focus:outline-none focus:border-primary font-['Inter:Regular',sans-serif] text-[14px] text-primary"
                  placeholder="Create a strong password"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-[12px] text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-primary mb-2"
              >
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-[8px] border-[0.8px] border-border focus:outline-none focus:border-primary font-['Inter:Regular',sans-serif] text-[14px] text-primary"
                  placeholder="Re-enter your password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-[12px] text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-primary mb-2"
              >
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-[8px] border-[0.8px] border-border focus:outline-none focus:border-primary font-['Inter:Regular',sans-serif] text-[14px] text-primary"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-[12px] text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-primary mb-2"
              >
                Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-[8px] border-[0.8px] border-border focus:outline-none focus:border-primary font-['Inter:Regular',sans-serif] text-[14px] text-primary"
                  placeholder="City, State/Country"
                />
              </div>
              {errors.location && (
                <p className="mt-1 text-[12px] text-red-500">{errors.location}</p>
              )}
            </div>

            {/* Birthdate - Only for attendees */}
            {registrationType === "attendee" && (
              <div>
                <label
                  htmlFor="birthdate"
                  className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-primary mb-2"
                >
                  Date of Birth *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="date"
                    id="birthdate"
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-[8px] border-[0.8px] border-border focus:outline-none focus:border-primary font-['Inter:Regular',sans-serif] text-[14px] text-primary"
                  />
                </div>
                {errors.birthdate && (
                  <p className="mt-1 text-[12px] text-red-500">{errors.birthdate}</p>
                )}
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary"
                required
              />
              <label
                htmlFor="terms"
                className="font-['Inter:Regular',sans-serif] text-[14px] text-muted-foreground"
              >
                I agree to the Terms of Service and Privacy Policy
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[16px] hover:bg-primary/90 transition-colors"
            >
              Create Account
            </button>
          </form>

          {/* Already have an account */}
          <div className="mt-6 text-center">
            <p className="font-['Inter:Regular',sans-serif] text-[14px] text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-['Inter:Medium',sans-serif] font-medium text-primary underline-offset-2 transition-colors hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}