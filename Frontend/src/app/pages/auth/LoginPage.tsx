import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, Sparkles, GraduationCap } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
    <div className="min-h-screen bg-background px-4 py-14 sm:py-16 md:py-20 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div
        className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full opacity-[0.07] blur-3xl"
        style={{ background: "var(--accent)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full opacity-[0.05] blur-3xl"
        style={{ background: "var(--primary)" }}
        aria-hidden
      />

      <motion.div
        className="mx-auto max-w-2xl relative z-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mb-10 text-center sm:mb-12">
          <Link
            to="/"
            className="mb-4 inline-block font-['Inter:Regular',sans-serif] text-[14px] text-muted-foreground transition-colors duration-300 ease-in-out hover:text-accent"
          >
            ← Back to Home
          </Link>

          <motion.div
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <GraduationCap className="h-8 w-8 text-accent" />
          </motion.div>

          <motion.h1
            className="mb-2 font-['Inter:Bold',sans-serif] text-[34px] font-bold text-foreground sm:text-[36px]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
          >
            Welcome back
          </motion.h1>
          <motion.p
            className="mx-auto max-w-lg font-['Inter:Regular',sans-serif] text-[16px] leading-relaxed text-muted-foreground sm:text-[17px]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.28 }}
          >
            Sign in to ForSa to manage events, bookings, and your profile
          </motion.p>
        </div>

        <motion.div
          className="rounded-2xl border border-border bg-card p-8 shadow-lg shadow-primary/[0.04] sm:p-10 md:p-12 relative overflow-hidden"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Subtle shimmer accent line at the top of the card */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-60" />

          <form onSubmit={handleSubmit} className="space-y-7 sm:space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <label
                htmlFor="login-email"
                className="mb-2.5 block font-['Inter:Medium',sans-serif] text-[15px] font-medium text-foreground sm:text-[16px]"
              >
                Email address
              </label>
              <div className="relative group">
                <Mail className={`absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors duration-300 sm:left-4 ${focusedField === "email" ? "text-accent" : "text-muted-foreground"}`} />
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
                  className="w-full rounded-xl border border-border bg-background py-3.5 pl-11 pr-4 font-['Inter:Regular',sans-serif] text-[15px] text-foreground transition-all duration-300 ease-out focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none sm:py-4 sm:pl-12 sm:text-[16px]"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1.5 text-[12px] text-destructive">{errors.email}</p>}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <label
                htmlFor="login-password"
                className="mb-2.5 block font-['Inter:Medium',sans-serif] text-[15px] font-medium text-foreground sm:text-[16px]"
              >
                Password
              </label>
              <div className="relative group">
                <Lock className={`absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors duration-300 sm:left-4 ${focusedField === "password" ? "text-accent" : "text-muted-foreground"}`} />
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
                  className="w-full rounded-xl border border-border bg-background py-3.5 pl-11 pr-4 font-['Inter:Regular',sans-serif] text-[15px] text-foreground transition-all duration-300 ease-out focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none sm:py-4 sm:pl-12 sm:text-[16px]"
                  placeholder="Enter your password"
                />
              </div>
              {errors.password && <p className="mt-1.5 text-[12px] text-destructive">{errors.password}</p>}
            </motion.div>

            <motion.div
              className="flex flex-wrap items-center justify-between gap-3 pt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <label className="flex cursor-pointer items-center gap-2.5 font-['Inter:Regular',sans-serif] text-[15px] text-muted-foreground sm:text-[16px]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-accent focus:ring-accent/30 sm:h-[18px] sm:w-[18px]"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => toast.info("Password reset will be available when your API is connected.")}
                className="font-['Inter:Medium',sans-serif] text-[15px] font-medium text-accent underline-offset-2 transition-colors hover:text-accent/80 hover:underline sm:text-[16px]"
              >
                Forgot password?
              </button>
            </motion.div>

            <motion.button
              type="submit"
              className="w-full rounded-xl bg-primary py-3.5 font-['Inter:Medium',sans-serif] text-[16px] font-medium text-primary-foreground shadow-md shadow-primary/20 transition-all duration-300 ease-out hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] sm:py-4 sm:text-[17px] cursor-pointer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.65 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign in
            </motion.button>
          </form>

          <motion.div
            className="mt-6 flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <div className="h-px flex-1 bg-border"></div>
            <span className="mx-4 font-['Inter:Regular',sans-serif] text-[13px] text-muted-foreground uppercase tracking-wider">
              Or continue with
            </span>
            <div className="h-px flex-1 bg-border"></div>
          </motion.div>

          <motion.button
            type="button"
            className="mt-6 flex w-full items-center justify-center rounded-xl border border-border bg-background py-3.5 font-['Inter:Medium',sans-serif] text-[16px] font-medium text-foreground transition-all duration-300 ease-out hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/20 active:scale-[0.98] sm:py-4 sm:text-[17px] cursor-pointer"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.75 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toast.success("Google Sign-in clicked! (Demo — connect your provider here.)")}
          >
            <svg viewBox="0 0 24 24" className="mr-3 h-5 w-5">
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
            className="mt-8 text-center font-['Inter:Regular',sans-serif] text-[15px] text-muted-foreground sm:text-[16px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.85 }}
          >
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-['Inter:Medium',sans-serif] font-medium text-accent underline-offset-2 transition-colors duration-300 hover:underline"
            >
              Create one
            </Link>
          </motion.p>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-6 text-[13px] text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.95 }}
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Trusted by 50,000+ users
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-accent" />
            Bank-level security
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
