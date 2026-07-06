import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Sparkles, Lock, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ForSaLogo } from "../../components/ForSaLogo";
import { apiPost } from "../../api/api";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiPost("/api/Auth/forgot-password", { email });
      toast.success("OTP verification code sent to your email!");
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate password reset.");
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
            Recover your <br />Forsa account password
          </h2>
          <p className="text-slate-300 text-sm max-w-md font-medium leading-relaxed">
            Enter your email and we'll send you a secure 6-digit verification code to reset your password.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 md:p-20 relative z-10">
        <div className="my-auto max-w-[440px] w-full mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white font-['Inter:Bold',sans-serif]">
              Forgot Password
            </h1>
            <p className="text-slate-400 text-[15px] mt-2 font-medium">
              Enter your email address to recover your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <label
                htmlFor="forgot-email"
                className="mb-2 block font-['Inter:Medium',sans-serif] text-sm font-medium text-slate-200"
              >
                Email address
              </label>
              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors duration-300 ${focusedField === "email" ? "text-white" : "text-slate-400"}`} />
                <input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 font-['Inter:Regular',sans-serif] text-white transition-all duration-300 ease-out focus:border-[var(--brand-blue-accent)] focus:bg-white/10 focus:ring-1 focus:ring-[var(--brand-blue-accent)]/50 focus:outline-none placeholder:text-slate-500"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </motion.div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 font-['Inter:Bold',sans-serif] text-[16px] font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-[0.98] mt-6 cursor-pointer flex items-center justify-center gap-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? "Sending code..." : "Send Verification Code"}
            </motion.button>
          </form>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-300 text-sm font-medium cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>

        <motion.div
          className="mt-8 flex flex-wrap items-center justify-start gap-6 text-[13px] text-slate-500 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
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
