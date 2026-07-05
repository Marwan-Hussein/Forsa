import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { User, Mail, Lock, Phone, MapPin, Calendar, Building2, Home, CheckCircle, Shield, Sparkles, Loader2, ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { apiPost, ApiError } from "../../api/api";
import { toast } from "sonner";
import { ForSaLogo } from "../../components/ForSaLogo";

interface OtpResponse {
  email: string;
  message: string;
}

export default function RegistrationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

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

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = "Required";
      if (!formData.username.trim()) newErrors.username = "Required";
      else if (formData.username.length < 3) newErrors.username = "Min 3 chars";
      if (!formData.email.trim()) newErrors.email = "Required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email";
    }

    if (step === 2) {
      if (!formData.password) newErrors.password = "Required";
      else if (formData.password.length < 8) newErrors.password = "Min 8 chars";
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords mismatch";
      if (!formData.phone.trim()) newErrors.phone = "Required";
    }

    if (step === 3) {
      if (!formData.location.trim()) newErrors.location = "Required";
      if (registrationType === "attendee" && !formData.birthdate) newErrors.birthdate = "Required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      if (validateStep(currentStep)) setCurrentStep(p => p + 1);
    } else {
      if (validateStep(3)) {
        submitForm();
      }
    }
  };

  const getRoleMap = (type: string) => {
    if (type === "organization") return "Organizer";
    if (type === "place") return "Owner";
    return "Attendee";
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    try {
      const result = await apiPost<OtpResponse>("/api/auth/register/initiate", {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phone,
        location: formData.location,
        role: getRoleMap(registrationType)
      });

      toast.success(result.message || "Verification code sent to your email!");
      navigate("/verify-otp", { state: { email: result.email } });
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeConfig = {
    attendee: {
      title: "Register as Attendee",
      description: "Join thousands of event-goers and start your journey today",
      icon: User,
      accentColor: "var(--brand-blue-accent)",
    },
    organization: {
      title: "Register as Organization",
      description: "Create events and manage your organization's profile",
      icon: Building2,
      accentColor: "#10b981",
    },
    place: {
      title: "Register as Place Owner",
      description: "List your venue and connect with event organizers",
      icon: Home,
      accentColor: "#f59e0b",
    },
  };

  const config = typeConfig[registrationType as keyof typeof typeConfig] || typeConfig.attendee;

  const registrationTypes = [
    { id: "attendee", label: "Attendee", icon: User, color: "var(--brand-blue-accent)" },
    { id: "organization", label: "Organization", icon: Building2, color: "#10b981" },
    { id: "place", label: "Place Owner", icon: Home, color: "#f59e0b" },
  ];

  const formFields = [
    { name: "fullName", label: registrationType === "organization" ? "Organization Name *" : registrationType === "place" ? "Owner Name *" : "Full Name *", type: "text", icon: User, placeholder: registrationType === "organization" ? "Enter organization name" : registrationType === "place" ? "Enter owner name" : "Enter your full name", step: 1 },
    { name: "username", label: "Username *", type: "text", icon: User, placeholder: "Choose a username", step: 1 },
    { name: "email", label: "Email Address *", type: "email", icon: Mail, placeholder: "your.email@example.com", step: 1 },
    
    { name: "password", label: "Password *", type: "password", icon: Lock, placeholder: "Create a strong password", step: 2 },
    { name: "confirmPassword", label: "Confirm Password *", type: "password", icon: Lock, placeholder: "Re-enter your password", step: 2 },
    { name: "phone", label: "Phone Number *", type: "tel", icon: Phone, placeholder: "+1 (555) 123-4567", step: 2 },
    
    { name: "location", label: "Location *", type: "text", icon: MapPin, placeholder: "City, State/Country", step: 3 },
  ];

  const currentFields = formFields.filter(f => f.step === currentStep);

  return (
    <div className="flex min-h-screen bg-[var(--brand-deep-navy)] overflow-hidden selection:bg-blue-500/30">
      {/* Left Panel - Visual/Animation */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col p-12 border-r border-white/5">
        {/* Stunning Image Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop" 
            alt="Event Concert"
            className="w-full h-full object-cover"
          />
          {/* Lighter Gradient Overlays for better visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-deep-navy)] via-[var(--brand-deep-navy)]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand-deep-navy)] via-[var(--brand-deep-navy)]/20 to-transparent" />
          <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <Link to="/" className="relative z-10 block mb-auto">
          <ForSaLogo className="h-10 text-white drop-shadow-lg" />
        </Link>

        <div className="relative z-10 max-w-xl pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6 shadow-lg">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-white tracking-wide drop-shadow-md">Your journey starts here</span>
            </div>
            
            <h2 className="text-5xl font-bold text-white mb-6 leading-[1.15] drop-shadow-lg">
              Begin your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 drop-shadow-md">journey</span> with us.
            </h2>
            <p className="text-xl text-slate-100 font-medium leading-relaxed mb-10 max-w-lg drop-shadow-md">
              Create an account to discover, manage, and elevate your events like never before. Welcome to endless possibilities.
            </p>

            {/* Quick benefits floating bar */}
            <div className="flex flex-col gap-4 p-6 rounded-2xl bg-white/10 border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                   <Shield className="w-5 h-5 text-blue-300" />
                 </div>
                 <div>
                   <h4 className="text-white font-semibold text-sm drop-shadow-sm">Secure & Reliable</h4>
                   <p className="text-slate-300 text-xs mt-0.5">Your data is safe with us.</p>
                 </div>
               </div>
               <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                   <Calendar className="w-5 h-5 text-emerald-300" />
                 </div>
                 <div>
                   <h4 className="text-white font-semibold text-sm drop-shadow-sm">Seamless Planning</h4>
                   <p className="text-slate-300 text-xs mt-0.5">Everything you need in one place.</p>
                 </div>
               </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto custom-scrollbar">
        {/* Mobile Background */}
        <div className="lg:hidden absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-deep-navy)] to-[var(--brand-navy)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.03]" />
        </div>

        <motion.div
          className="w-full max-w-lg relative z-10 my-auto"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className="mb-8 lg:mb-10">
          <Link
            to="/"
            className="mb-8 inline-block lg:hidden"
          >
            <ForSaLogo className="h-10 text-white" />
          </Link>

          <AnimatePresence mode="wait">
            <motion.h1
              key={`title-${registrationType}`}
              className="font-['Inter:Bold',sans-serif] font-bold text-[36px] text-white mb-2 tracking-tight"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {config.title}
            </motion.h1>
          </AnimatePresence>

          <motion.p
            className="font-['Inter:Regular',sans-serif] text-[16px] text-slate-300 mb-8"
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
                  onClick={() => setCurrentStep(1)} // Reset step on type change
                  className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-['Inter:Medium',sans-serif] font-medium text-[14px] transition-all duration-300 ease-out border ${
                    isActive
                      ? "text-white shadow-md border-transparent"
                      : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                  style={isActive ? { backgroundColor: type.color, borderColor: type.color } : undefined}
                >
                  <Icon className="w-4 h-4" />
                  {type.label}
                  {isActive && (
                    <motion.div
                      className="absolute -bottom-1 left-1/2 h-1 w-8 rounded-full bg-white/40"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      style={{ x: "-50%" }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Wizard Progress */}
        <div className="flex items-center justify-between mb-8">
            <div className="flex gap-2">
                {[1, 2, 3].map((step) => (
                    <div key={step} className={`h-1.5 rounded-full transition-all duration-500 ${step === currentStep ? 'w-8 bg-[var(--brand-blue-accent)]' : step < currentStep ? 'w-4 bg-[var(--brand-blue-accent)]/60' : 'w-4 bg-white/10'}`} />
                ))}
            </div>
            <span className="text-xs text-slate-400 font-medium tracking-widest uppercase">Step {currentStep} of {totalSteps}</span>
        </div>

        {/* Registration Form */}
        <motion.div
          className="rounded-3xl border border-white/10 bg-[#162032] p-8 sm:p-10 relative overflow-hidden shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Top accent line */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-[1px]"
            style={{ background: `linear-gradient(to right, transparent, ${config.accentColor}, transparent)` }}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 0.8, scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <form onSubmit={handleNextStep} className="space-y-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={`step-${currentStep}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                {currentFields.map((field) => {
                  const Icon = field.icon;
                  const isFocused = focusedField === field.name;
                  return (
                    <div key={field.name}>
                      <label
                        htmlFor={field.name}
                        className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-slate-200 mb-2"
                      >
                        {field.label}
                      </label>
                      <div className="relative">
                        <Icon
                          className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                            isFocused ? "text-white" : "text-slate-400"
                          }`}
                        />
                        <input
                          type={
                            field.name === "password"
                              ? (showPassword ? "text" : "password")
                              : field.name === "confirmPassword"
                              ? (showConfirmPassword ? "text" : "password")
                              : field.type
                          }
                          id={field.name}
                          name={field.name}
                          value={formData[field.name as keyof typeof formData]}
                          onChange={handleChange}
                          onFocus={() => setFocusedField(field.name)}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full pl-12 py-4 rounded-xl border border-white/10 bg-white/5 focus:outline-none focus:border-[var(--brand-blue-accent)] focus:bg-white/10 focus:ring-1 focus:ring-[var(--brand-blue-accent)]/50 font-['Inter:Regular',sans-serif] text-[15px] text-white placeholder:text-slate-500 transition-all duration-300 ${(field.name === "password" || field.name === "confirmPassword") ? 'pr-12' : 'pr-4'}`}
                          placeholder={field.placeholder}
                        />
                        {(field.name === "password" || field.name === "confirmPassword") && (
                          <button
                            type="button"
                            onClick={() => {
                              if (field.name === "password") setShowPassword(!showPassword);
                              if (field.name === "confirmPassword") setShowConfirmPassword(!showConfirmPassword);
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                          >
                            {(field.name === "password" ? showPassword : showConfirmPassword) ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        )}
                      </div>
                      {errors[field.name] && (
                        <p className="mt-1.5 text-[12px] text-red-400">{errors[field.name]}</p>
                      )}
                    </div>
                  );
                })}

                {/* Step 3 Additions */}
                {currentStep === 3 && registrationType === "attendee" && (
                    <div>
                      <label
                        htmlFor="birthdate"
                        className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-slate-200 mb-2"
                      >
                        Date of Birth *
                      </label>
                      <div className="relative">
                        <Calendar
                          className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                            focusedField === "birthdate" ? "text-white" : "text-slate-400"
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
                          className="w-full pl-12 pr-4 py-4 rounded-xl border border-white/10 bg-white/5 focus:outline-none focus:border-[var(--brand-blue-accent)] focus:bg-white/10 focus:ring-1 focus:ring-[var(--brand-blue-accent)]/50 font-['Inter:Regular',sans-serif] text-[15px] text-white placeholder:text-slate-500 transition-all duration-300"
                        />
                      </div>
                      {errors.birthdate && (
                        <p className="mt-1.5 text-[12px] text-red-400">{errors.birthdate}</p>
                      )}
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="flex items-start gap-3 pt-4">
                      <input
                        type="checkbox"
                        id="terms"
                        className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-[var(--brand-blue-accent)] focus:ring-[var(--brand-blue-accent)]/30"
                        required
                      />
                      <label
                        htmlFor="terms"
                        className="font-['Inter:Regular',sans-serif] text-[14px] text-slate-300 leading-tight"
                      >
                        I agree to the Terms of Service and Privacy Policy
                      </label>
                    </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Form Actions */}
            <div className="flex gap-4 mt-8 pt-4 border-t border-white/5">
                {currentStep > 1 && (
                    <button
                        type="button"
                        onClick={() => setCurrentStep(p => p - 1)}
                        className="flex-1 py-4 rounded-xl border border-white/10 bg-white/5 text-white font-semibold transition-all hover:bg-white/10 flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-[2] rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 font-['Inter:Bold',sans-serif] text-[16px] font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-[0.98] flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {isSubmitting ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
                    ) : currentStep < totalSteps ? (
                        <>Continue <ArrowRight className="w-4 h-4" /></>
                    ) : (
                        "Create Account"
                    )}
                </button>
            </div>
          </form>

          {/* Already have an account */}
          <div className="mt-8 text-center">
            <p className="font-['Inter:Regular',sans-serif] text-[15px] text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-['Inter:Medium',sans-serif] font-medium text-white hover:text-[var(--brand-blue-accent)] transition-colors duration-300"
              >
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          className="mt-8 flex flex-wrap items-center justify-start gap-6 text-[13px] text-slate-500 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <span className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
            Free to join
          </span>
          <span className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-blue-400" />
            Secure & Private
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Personalized experience
          </span>
        </motion.div>
      </motion.div>
      </div>
    </div>
  );
}