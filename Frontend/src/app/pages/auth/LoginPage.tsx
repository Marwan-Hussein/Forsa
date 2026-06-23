import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Mail, Lock, Sparkles, GraduationCap } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ForSaLogo } from "../../components/ForSaLogo";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [searchParams] = useSearchParams();
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");
    const fullName = searchParams.get("fullName");
    const emailParam = searchParams.get("email");
    const error = searchParams.get("error");

    if (error) {
      toast.error(error);
    }

    if (token && refreshToken) {
      localStorage.setItem("forsa_token", token);
      localStorage.setItem("forsa_refresh_token", refreshToken);
      if (fullName) localStorage.setItem("forsa_user_name", fullName);
      if (emailParam) localStorage.setItem("forsa_user_email", emailParam);
      
      toast.success("Successfully signed in with Google!");
      navigate("/dashboard", { replace: true });
    }
  }, [searchParams, navigate]);

  const validate = () => {
    const next: typeof errors = {};
    if (!email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Please enter a valid email";
    }
    if (!password) {
      next.password = "Password is required";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    toast.success("Signed in successfully. (Demo — connect your API here.)");
    if (rememberMe) {
      try {
        localStorage.setItem("forsa_demo_remember", "1");
      } catch {
        /* ignore */
      }
    }
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0B1120] px-4 py-14 sm:py-16 md:py-20 relative overflow-hidden flex flex-col justify-center">
      {/* Premium Background */}
      <div className="absolute inset-0 z-0" style={{ background: "linear-gradient(135deg, #0B1120 0%, #1E3D61 100%)" }} />
      <div className="absolute inset-0 z-0 overflow-hidden mix-blend-screen pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full filter blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#3b82f6]/20 rounded-full filter blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <motion.div
        className="mx-auto max-w-lg w-full relative z-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mb-10 text-center sm:mb-12">
          <Link
            to="/"
            className="mb-8 inline-block"
          >
            <ForSaLogo className="h-12 text-white" />
          </Link>

          <motion.h1
            className="mb-3 font-['Inter:Bold',sans-serif] text-[34px] font-bold text-white sm:text-[36px] tracking-tight"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
          >
            Welcome back
          </motion.h1>
          <motion.p
            className="mx-auto max-w-sm font-['Inter:Regular',sans-serif] text-[16px] leading-relaxed text-slate-300"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.28 }}
          >
            Sign in to ForSa to manage events, bookings, and your profile.
          </motion.p>
        </div>

        <motion.div
          className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl sm:p-10 relative overflow-hidden"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Subtle shimmer accent line at the top of the card */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent opacity-60" />

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <label
                htmlFor="login-email"
                className="mb-2 block font-['Inter:Medium',sans-serif] text-sm font-medium text-slate-200"
              >
                Email address
              </label>
              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors duration-300 ${focusedField === "email" ? "text-white" : "text-slate-400"}`} />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                  }}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 font-['Inter:Regular',sans-serif] text-white transition-all duration-300 ease-out focus:border-[#3b82f6] focus:bg-white/10 focus:ring-1 focus:ring-[#3b82f6]/50 focus:outline-none placeholder:text-slate-500"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-2 text-xs text-red-400">{errors.email}</p>}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <label
                htmlFor="login-password"
                className="mb-2 block font-['Inter:Medium',sans-serif] text-sm font-medium text-slate-200"
              >
                Password
              </label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors duration-300 ${focusedField === "password" ? "text-white" : "text-slate-400"}`} />
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                  }}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 font-['Inter:Regular',sans-serif] text-white transition-all duration-300 ease-out focus:border-[#3b82f6] focus:bg-white/10 focus:ring-1 focus:ring-[#3b82f6]/50 focus:outline-none placeholder:text-slate-500"
                  placeholder="Enter your password"
                />
              </div>
              {errors.password && <p className="mt-2 text-xs text-red-400">{errors.password}</p>}
            </motion.div>

            <motion.div
              className="flex items-center justify-between pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <label className="flex cursor-pointer items-center gap-2 font-['Inter:Regular',sans-serif] text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/10 text-[#3b82f6] focus:ring-[#3b82f6]/30"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => toast.info("Password reset will be available when your API is connected.")}
                className="font-['Inter:Medium',sans-serif] text-sm font-medium text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
              >
                Forgot password?
              </button>
            </motion.div>

            <motion.button
              type="submit"
              className="w-full rounded-xl bg-white py-4 font-['Inter:Bold',sans-serif] text-[16px] font-bold text-[#0B1120] shadow-lg transition-all duration-300 hover:bg-slate-100 hover:shadow-xl active:scale-[0.98] cursor-pointer mt-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.65 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign in
            </motion.button>
          </form>

          <motion.div
            className="mt-8 flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <div className="h-px flex-1 bg-white/10"></div>
            <span className="mx-4 font-['Inter:Regular',sans-serif] text-xs text-slate-400 uppercase tracking-widest">
              Or continue with
            </span>
            <div className="h-px flex-1 bg-white/10"></div>
          </motion.div>

          <motion.button
            type="button"
            className="mt-6 flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 py-4 font-['Inter:Medium',sans-serif] text-[15px] font-medium text-white transition-all duration-300 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 active:scale-[0.98] cursor-pointer"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.75 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/Auth/external-login?provider=Google&role=Attendee`;
            }}
          >
            <svg viewBox="0 0 24 24" className="mr-3 h-5 w-5 bg-white rounded-full p-0.5">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </motion.button>

          <motion.p
            className="mt-8 text-center font-['Inter:Regular',sans-serif] text-[15px] text-slate-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.85 }}
          >
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-['Inter:Medium',sans-serif] font-medium text-white hover:text-[#3b82f6] transition-colors duration-300"
            >
              Create one
            </Link>
          </motion.p>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-6 text-[13px] text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.95 }}
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#3b82f6]" />
            Trusted by 50,000+ users
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-[#3b82f6]" />
            Bank-level security
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
