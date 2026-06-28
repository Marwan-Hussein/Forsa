import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Mail, Lock, Sparkles, GraduationCap, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ForSaLogo } from "../../components/ForSaLogo";
import { apiPost, ApiError } from "../../api/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [searchParams] = useSearchParams();
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
      
      const userRole = getRoleFromToken(token);
      localStorage.setItem("role", userRole);
      
      toast.success("Successfully signed in with Google!");
      navigate(routeByRole(userRole), { replace: true });
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

  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const getRoleFromToken = (token: string) => {
    const decoded = parseJwt(token);
    if (!decoded) return "Attendee"; // default fallback
    
    // .NET Identity typically puts roles here:
    const roleClaim = 
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || 
      decoded.role || 
      decoded.Role;
      
    // It can be an array if user has multiple roles, or a string
    if (Array.isArray(roleClaim)) {
      return roleClaim[0];
    }
    return roleClaim;
  };

  const routeByRole = (role: string) => {
    if (role === "Owner" || role === "PlaceOwner") return "/owner";
    if (role === "Organizer") return "/organizer";
    return "/dashboard";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    try {
      const result = await apiPost<{ token: string; refreshToken: string; fullName: string; email: string }>("/api/Auth/login", {
        email,
        password
      });

      const role = getRoleFromToken(result.token);
      
      // Prevent Admin from logging in from the normal login page (Security: Do not expose admin existence)
      if (role === "Admin") {
        toast.error("Invalid email or password.");
        return; // Do not save token or redirect
      }

      localStorage.setItem("forsa_token", result.token);
      localStorage.setItem("forsa_refresh_token", result.refreshToken);
      if (result.fullName) localStorage.setItem("forsa_user_name", result.fullName);
      if (result.email) localStorage.setItem("forsa_user_email", result.email);

      toast.success("Signed in successfully!");
      
      navigate(routeByRole(role), { replace: true });
    } catch (err: any) {
      if (err.message === "Email is not verified.") {
        toast.error("Please verify your email to continue.");
        // Resend OTP automatically
        try {
          await apiPost("/api/auth/register/resend", { email });
        } catch {
          // ignore resend error, they can click it manually on the next page
        }
        navigate("/verify-otp", { state: { email } });
      } else {
        toast.error(err.message || "Failed to sign in. Please check your credentials.");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0B1120] overflow-hidden selection:bg-blue-500/30">
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120] via-[#0B1120]/20 to-transparent" />
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
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white tracking-wide">Welcome to the future of events</span>
            </div>
            
            <h2 className="text-5xl font-bold text-white mb-6 leading-[1.15]">
              Unlock extraordinary <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">experiences</span> today.
            </h2>
            <p className="text-xl text-slate-300 font-light leading-relaxed mb-10 max-w-lg">
              Join the premier network of event professionals, venue owners, and enthusiastic attendees. Let's make every moment count.
            </p>
            
            {/* Quick stats floating bar */}
            <div className="grid grid-cols-2 gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
               <div className="flex flex-col">
                  <span className="text-3xl font-bold text-white">50k+</span>
                  <span className="text-sm text-slate-400 mt-1 uppercase tracking-wider font-medium">Active Users</span>
               </div>
               <div className="flex flex-col border-l border-white/10 pl-6">
                  <span className="text-3xl font-bold text-white">10k+</span>
                  <span className="text-sm text-slate-400 mt-1 uppercase tracking-wider font-medium">Premium Venues</span>
               </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Mobile Background */}
        <div className="lg:hidden absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B1120] to-[#1E3D61]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.03]" />
        </div>

        <motion.div
          className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mb-10 lg:mb-12">
          <Link
            to="/"
            className="mb-8 inline-block lg:hidden"
          >
            <ForSaLogo className="h-10 text-white" />
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
            className="font-['Inter:Regular',sans-serif] text-[16px] leading-relaxed text-slate-300"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.28 }}
          >
            Sign in to your account to continue
          </motion.p>
        </div>

        <motion.div
          className="rounded-3xl border border-white/10 bg-[#162032] p-8 sm:p-10 relative overflow-hidden shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                  }}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pl-12 pr-12 font-['Inter:Regular',sans-serif] text-white transition-all duration-300 ease-out focus:border-[#3b82f6] focus:bg-white/10 focus:ring-1 focus:ring-[#3b82f6]/50 focus:outline-none placeholder:text-slate-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-2 text-xs text-red-400">{errors.password}</p>}
            </motion.div>

            <motion.div
              className="flex items-center pt-2"
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
            </motion.div>

            <motion.button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 font-['Inter:Bold',sans-serif] text-[16px] font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-[0.98] mt-6"
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
            <svg viewBox="0 0 24 24" className="mr-3 h-5 w-5 bg-white rounded-full p-0.5 shadow-sm">
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

        <motion.div
          className="mt-8 flex flex-wrap items-center justify-start gap-6 text-[13px] text-slate-500 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.95 }}
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
      </motion.div>
      </div>
    </div>
  );
}
