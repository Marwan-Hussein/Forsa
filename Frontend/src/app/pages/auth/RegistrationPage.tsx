import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { User, Mail, Lock, Phone, MapPin, Calendar, Building2, Home, CheckCircle, Shield, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const typeConfig = {
    attendee: {
      title: "Register as Attendee",
      description: "Join thousands of event-goers and start your journey today",
      icon: User,
      accentColor: "var(--accent)",
    },
    organization: {
      title: "Register as Organization",
      description: "Create events and manage your organization's profile",
      icon: Building2,
      accentColor: "var(--Business)",
    },
    place: {
      title: "Register as Place Owner",
      description: "List your venue and connect with event organizers",
      icon: Home,
      accentColor: "var(--Entertainment)",
    },
  };

  const config = typeConfig[registrationType as keyof typeof typeConfig] || typeConfig.attendee;
  const TypeIcon = config.icon;

  const registrationTypes = [
    { id: "attendee", label: "Attendee", icon: User, color: "var(--accent)" },
    { id: "organization", label: "Organization", icon: Building2, color: "var(--Business)" },
    { id: "place", label: "Place Owner", icon: Home, color: "var(--Entertainment)" },
  ];

  const formFields = [
    { name: "fullName", label: registrationType === "organization" ? "Organization Name *" : registrationType === "place" ? "Owner Name *" : "Full Name *", type: "text", icon: User, placeholder: registrationType === "organization" ? "Enter organization name" : registrationType === "place" ? "Enter owner name" : "Enter your full name" },
    { name: "username", label: "Username *", type: "text", icon: User, placeholder: "Choose a username" },
    { name: "email", label: "Email Address *", type: "email", icon: Mail, placeholder: "your.email@example.com" },
    { name: "password", label: "Password *", type: "password", icon: Lock, placeholder: "Create a strong password" },
    { name: "confirmPassword", label: "Confirm Password *", type: "password", icon: Lock, placeholder: "Re-enter your password" },
    { name: "phone", label: "Phone Number *", type: "tel", icon: Phone, placeholder: "+1 (555) 123-4567" },
    { name: "location", label: "Location *", type: "text", icon: MapPin, placeholder: "City, State/Country" },
  ];

  return (
    <div className="min-h-screen bg-background py-12 px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div
        className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full opacity-[0.06] blur-3xl"
        style={{ background: config.accentColor }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-1/2 -left-32 h-96 w-96 rounded-full opacity-[0.04] blur-3xl"
        style={{ background: "var(--primary)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 right-1/4 h-80 w-80 rounded-full opacity-[0.05] blur-3xl"
        style={{ background: "var(--Education)" }}
        aria-hidden
      />

      <motion.div
        className="max-w-2xl mx-auto relative z-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-block mb-4 text-muted-foreground hover:text-accent transition-colors duration-300 font-['Inter:Regular',sans-serif] text-[14px]"
          >
            ← Back to Home
          </Link>

          <AnimatePresence mode="wait">
            <motion.div
              key={registrationType}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `color-mix(in srgb, ${config.accentColor} 12%, transparent)` }}
            >
              <TypeIcon className="h-8 w-8" style={{ color: config.accentColor }} />
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.h1
              key={`title-${registrationType}`}
              className="font-['Inter:Bold',sans-serif] font-bold text-[36px] text-foreground mb-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {config.title}
            </motion.h1>
          </AnimatePresence>

          <motion.p
            className="font-['Inter:Regular',sans-serif] text-[16px] text-muted-foreground mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            {config.description}
          </motion.p>

          {/* Registration Type Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-6">
            {registrationTypes.map((type) => {
              const Icon = type.icon;
              const isActive = registrationType === type.id;
              return (
                <Link
                  key={type.id}
                  to={`/register?type=${type.id}`}
                  className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-['Inter:Medium',sans-serif] font-medium text-[14px] transition-all duration-300 ease-out border ${
                    isActive
                      ? "text-white shadow-md border-transparent"
                      : "bg-card border-border text-foreground hover:border-muted-foreground/30 hover:shadow-sm"
                  }`}
                  style={isActive ? { backgroundColor: type.color, borderColor: type.color } : undefined}
                >
                  <Icon className="w-4 h-4" />
                  {type.label}
                  {isActive && (
                    <motion.div
                      className="absolute -bottom-1 left-1/2 h-1 w-8 rounded-full bg-white/40"
                      layoutId="activeTypeIndicator"
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      style={{ x: "-50%" }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Registration Form */}
        <motion.div
          className="bg-card rounded-2xl border border-border p-8 shadow-lg shadow-primary/[0.04] relative overflow-hidden"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Top accent line that changes with registration type */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ background: `linear-gradient(to right, transparent, ${config.accentColor}, transparent)` }}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 0.6, scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          />

          <form onSubmit={handleSubmit} className="space-y-5">
            {formFields.map((field, index) => {
              const Icon = field.icon;
              const isFocused = focusedField === field.name;
              return (
                <motion.div
                  key={field.name}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.3 + index * 0.06 }}
                >
                  <label
                    htmlFor={field.name}
                    className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-foreground mb-2"
                  >
                    {field.label}
                  </label>
                  <div className="relative">
                    <Icon
                      className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                        isFocused ? "text-accent" : "text-muted-foreground"
                      }`}
                    />
                    <input
                      type={field.type}
                      id={field.name}
                      name={field.name}
                      value={formData[field.name as keyof typeof formData]}
                      onChange={handleChange}
                      onFocus={() => setFocusedField(field.name)}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 font-['Inter:Regular',sans-serif] text-[14px] text-foreground transition-all duration-300"
                      placeholder={field.placeholder}
                    />
                  </div>
                  {errors[field.name] && (
                    <motion.p
                      className="mt-1.5 text-[12px] text-destructive"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {errors[field.name]}
                    </motion.p>
                  )}
                </motion.div>
              );
            })}

            {/* Birthdate - Only for attendees */}
            <AnimatePresence>
              {registrationType === "attendee" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label
                    htmlFor="birthdate"
                    className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-foreground mb-2"
                  >
                    Date of Birth *
                  </label>
                  <div className="relative">
                    <Calendar
                      className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                        focusedField === "birthdate" ? "text-accent" : "text-muted-foreground"
                      }`}
                    />
                    <input
                      type="date"
                      id="birthdate"
                      name="birthdate"
                      value={formData.birthdate}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("birthdate")}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 font-['Inter:Regular',sans-serif] text-[14px] text-foreground transition-all duration-300"
                    />
                  </div>
                  {errors.birthdate && (
                    <p className="mt-1.5 text-[12px] text-destructive">{errors.birthdate}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Terms and Conditions */}
            <motion.div
              className="flex items-start gap-3 pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <input
                type="checkbox"
                id="terms"
                className="mt-1 w-4 h-4 rounded border-border text-accent focus:ring-accent/30"
                required
              />
              <label
                htmlFor="terms"
                className="font-['Inter:Regular',sans-serif] text-[14px] text-muted-foreground"
              >
                I agree to the Terms of Service and Privacy Policy
              </label>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-['Inter:Medium',sans-serif] font-medium text-[16px] shadow-md shadow-primary/20 transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] cursor-pointer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              Create Account
            </motion.button>
          </form>

          {/* Already have an account */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.95 }}
          >
            <p className="font-['Inter:Regular',sans-serif] text-[14px] text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-['Inter:Medium',sans-serif] font-medium text-accent underline-offset-2 transition-colors duration-300 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </motion.div>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-6 text-[13px] text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <span className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-accent" />
            Free to join
          </span>
          <span className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-accent" />
            Secure & Private
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Personalized experience
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}