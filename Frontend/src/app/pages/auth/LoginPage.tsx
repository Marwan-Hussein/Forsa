import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

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
    <div className="min-h-screen bg-accent px-4 py-14 sm:py-16 md:py-20">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 text-center sm:mb-12">
          <Link
            to="/"
            className="mb-4 inline-block font-['Inter:Regular',sans-serif] text-[14px] text-muted-foreground transition-colors duration-300 ease-in-out hover:text-primary"
          >
            ← Back to Home
          </Link>
          <h1 className="mb-2 font-['Inter:Bold',sans-serif] text-[34px] font-bold text-primary sm:text-[36px]">
            Welcome back
          </h1>
          <p className="mx-auto max-w-lg font-['Inter:Regular',sans-serif] text-[16px] leading-relaxed text-muted-foreground sm:text-[17px]">
            Sign in to ForSa to manage events, bookings, and your profile
          </p>
        </div>

        <div className="rounded-[14px] border-[0.8px] border-border bg-card p-8 shadow-sm sm:p-10 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-7 sm:space-y-8">
            <div>
              <label
                htmlFor="login-email"
                className="mb-2.5 block font-['Inter:Medium',sans-serif] text-[15px] font-medium text-primary sm:text-[16px]"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground sm:left-4" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                  }}
                  className="w-full rounded-[8px] border-[0.8px] border-border py-3.5 pl-11 pr-4 font-['Inter:Regular',sans-serif] text-[15px] text-primary transition-[border-color,box-shadow] duration-300 ease-in-out focus:border-primary focus:outline-none sm:py-4 sm:pl-12 sm:text-[16px]"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-[12px] text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-2.5 block font-['Inter:Medium',sans-serif] text-[15px] font-medium text-primary sm:text-[16px]"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground sm:left-4" />
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                  }}
                  className="w-full rounded-[8px] border-[0.8px] border-border py-3.5 pl-11 pr-4 font-['Inter:Regular',sans-serif] text-[15px] text-primary transition-[border-color,box-shadow] duration-300 ease-in-out focus:border-primary focus:outline-none sm:py-4 sm:pl-12 sm:text-[16px]"
                  placeholder="Enter your password"
                />
              </div>
              {errors.password && <p className="mt-1 text-[12px] text-red-500">{errors.password}</p>}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <label className="flex cursor-pointer items-center gap-2.5 font-['Inter:Regular',sans-serif] text-[15px] text-muted-foreground sm:text-[16px]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30 sm:h-[18px] sm:w-[18px]"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => toast.info("Password reset will be available when your API is connected.")}
                className="font-['Inter:Medium',sans-serif] text-[15px] font-medium text-primary underline-offset-2 transition-colors hover:underline sm:text-[16px]"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full rounded-[8px] bg-primary py-3.5 font-['Inter:Medium',sans-serif] text-[16px] font-medium text-primary-foreground transition-colors duration-300 ease-in-out hover:bg-primary/90 sm:py-4 sm:text-[17px]"
            >
              Sign in
            </button>
          </form>

          <p className="mt-8 text-center font-['Inter:Regular',sans-serif] text-[15px] text-muted-foreground sm:text-[16px]">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-['Inter:Medium',sans-serif] font-medium text-primary underline-offset-2 transition-colors duration-300 hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
