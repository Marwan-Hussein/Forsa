import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Lock, Mail, Sparkles, Key, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ForSaLogo } from "../../components/ForSaLogo";
import { apiPost } from "../../api/api";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get("email") || "";
    setEmail(emailParam);
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email address is missing. Please initiate forgot password flow again.");
      return;
    }
    if (!otp) {
      toast.error("Please enter the verification code.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiPost("/api/Auth/reset-password", {
        email,
        otp,
        newPassword
      });
      toast.success("Password reset successfully! You can now log in.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--brand-deep-navy)] overflow-hidden selection:bg-[var(--brand-blue-accent)]/30">
      {/* Left Panel - Visual/Animation */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col p-12 border-r border-white/5">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2074&auto=format&fit=crop" 
            alt="Security"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-deep-navy)] via-[var(--brand-deep-navy)]/80 to-transparent" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <ForSaLogo className="h-14 w-auto brightness-150" />
        </div>

        <div className="relative z-10 mt-auto space-y-4">
          <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
            Create a strong <br />new password
          </h2>
          <p className="text-slate-300 text-sm max-w-md font-medium leading-relaxed">
            Ensure your account is protected by setting a strong, unique password with at least 6 characters.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 md:p-20 relative z-10">
        <div className="my-auto max-w-[440px] w-full mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white font-['Inter:Bold',sans-serif]">
              Reset Password
            </h1>
            <p className="text-slate-400 text-[15px] mt-2 font-medium">
              Enter the OTP verification code and your new password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field (Disabled) */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <label
                htmlFor="reset-email"
                className="mb-2 block font-['Inter:Medium',sans-serif] text-sm font-medium text-slate-300"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  disabled
                  className="w-full rounded-xl border border-white/5 bg-white/5 py-4 pl-12 pr-4 font-['Inter:Regular',sans-serif] text-slate-400 cursor-not-allowed opacity-70 focus:outline-none"
                />
              </div>
            </motion.div>

            {/* OTP Field */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <label
                htmlFor="reset-otp"
                className="mb-2 block font-['Inter:Medium',sans-serif] text-sm font-medium text-slate-200"
              >
                6-Digit Verification Code (OTP)
              </label>
              <div className="relative group">
                <Key className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors duration-300 ${focusedField === "otp" ? "text-white" : "text-slate-400"}`} />
                <input
                  id="reset-otp"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onFocus={() => setFocusedField("otp")}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 font-['Inter:Regular',sans-serif] text-white tracking-widest text-lg font-bold transition-all duration-300 ease-out focus:border-[var(--brand-blue-accent)] focus:bg-white/10 focus:ring-1 focus:ring-[var(--brand-blue-accent)]/50 focus:outline-none placeholder:text-slate-500 placeholder:text-sm placeholder:tracking-normal placeholder:font-normal"
                  placeholder="------"
                  required
                />
              </div>
            </motion.div>

            {/* New Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <label
                htmlFor="reset-password"
                className="mb-2 block font-['Inter:Medium',sans-serif] text-sm font-medium text-slate-200"
              >
                New Password
              </label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors duration-300 ${focusedField === "password" ? "text-white" : "text-slate-400"}`} />
                <input
                  id="reset-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pl-12 pr-12 font-['Inter:Regular',sans-serif] text-white transition-all duration-300 ease-out focus:border-[var(--brand-blue-accent)] focus:bg-white/10 focus:ring-1 focus:ring-[var(--brand-blue-accent)]/50 focus:outline-none placeholder:text-slate-500"
                  placeholder="Minimum 6 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </motion.div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 font-['Inter:Bold',sans-serif] text-[16px] font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-[0.98] mt-6 cursor-pointer flex items-center justify-center gap-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? "Resetting password..." : "Reset Password"}
            </motion.button>
          </form>

          <div className="text-center">
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-300 text-sm font-medium cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Resend Code
            </Link>
          </div>
        </div>

        <motion.div
          className="mt-8 flex flex-wrap items-center justify-start gap-6 text-[13px] text-slate-500 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            Trusted by 50K+ users
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-blue-400" />
            Secure authentication
          </span>
        </motion.div>
      </div>
    </div>
  );
}
