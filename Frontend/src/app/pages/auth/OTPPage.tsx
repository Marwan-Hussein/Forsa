import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, Mail, ArrowLeft, RefreshCw, Loader2, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { apiPost, ApiError } from "../../api/api";
import { toast } from "sonner";
import { ForSaLogo } from "../../components/ForSaLogo";

interface VerifyResponse {
  fullName: string;
  email: string;
  token: string;
  expireOn: string;
}

interface OtpResponse {
  email: string;
  message: string;
}

export default function OTPPage() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [timer, setTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string>("");
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from navigation state (passed from RegistrationPage)
  const email = location.state?.email || "";

  // Redirect to register if no email was provided
  useEffect(() => {
    if (!email) {
      navigate("/register", { replace: true });
    }
  }, [email, navigate]);

  // Handle countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return; // Only allow numbers
    
    setError("");
    const newOtp = [...otp];
    // Take only the last character if multiple are entered
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    
    // Check if pasted data contains only numbers
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      if (i < 6) {
        newOtp[i] = pastedData[i];
      }
    }
    setOtp(newOtp);
    
    // Focus the next empty input or the last input
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleResendCode = async () => {
    if (timer > 0 || !email) return;
    
    setIsResending(true);
    setError("");
    try {
      // Call the dedicated resend endpoint
      await apiPost<OtpResponse>("/api/auth/register/resend", {
        email: email,
      });
      toast.success("A new verification code has been sent!");
      setTimer(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to resend code. Please try again.");
      }
    } finally {
      setIsResending(false);
    }
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

  const routeByRole = (role: string) => {
    if (role === "Admin") return "/admin";
    if (role === "Owner" || role === "PlaceOwner") return "/owner";
    if (role === "Organizer") return "/organizer";
    return "/dashboard";
  };

  const getRoleFromToken = (token: string) => {
    const decoded = parseJwt(token);
    if (!decoded) return "Attendee";
    const roleClaim = 
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || 
      decoded.role || 
      decoded.Role;
    return Array.isArray(roleClaim) ? roleClaim[0] : (roleClaim || "Attendee");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    
    if (otpValue.length < 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const result = await apiPost<VerifyResponse>("/api/auth/register/verify", {
        email: email,
        otp: otpValue,
      });

      // Store token in localStorage
      localStorage.setItem("forsa_token", result.token);
      localStorage.setItem("forsa_user_name", result.fullName);
      localStorage.setItem("forsa_user_email", result.email);

      const role = getRoleFromToken(result.token);

      setIsSuccess(true);
      toast.success(`Welcome to Forsa, ${result.fullName}!`);

      // Navigate to dashboard after a brief success animation
      setTimeout(() => {
        navigate(routeByRole(role), { replace: true });
      }, 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        // Clear OTP fields on error
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        setError("Verification failed. Please try again.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // Mask the email for display
  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_: string, start: string, middle: string, end: string) => 
        start + "*".repeat(Math.min(middle.length, 5)) + end
      )
    : "your email";

  // Format time as MM:SS
  const formattedTime = `${Math.floor(timer / 60).toString().padStart(2, "0")}:${(timer % 60).toString().padStart(2, "0")}`;

  return (
    <div className="flex min-h-screen bg-[var(--brand-deep-navy)] overflow-hidden selection:bg-blue-500/30">
      {/* Left Panel - Visual/Animation */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col p-12 border-r border-white/5">
        {/* Stunning Image Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop" 
            alt="Event Concert"
            className="w-full h-full object-cover"
          />
          {/* Lighter Gradient Overlays for better visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-deep-navy)] via-[var(--brand-deep-navy)]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand-deep-navy)] via-[var(--brand-deep-navy)]/20 to-transparent" />
          <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <Link to="/" className="relative z-10 block mb-auto">
          <ForSaLogo className="h-14 text-white drop-shadow-lg" />
        </Link>

        <div className="relative z-10 max-w-xl pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6 shadow-lg">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white tracking-wide">Secure Authentication</span>
            </div>
            
            <h2 className="text-5xl font-bold text-white mb-6 leading-[1.15]">
              Verify your identity to <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">protect</span> your account.
            </h2>
            <p className="text-xl text-slate-300 font-light leading-relaxed mb-10 max-w-lg">
              We take security seriously. Please enter the code sent to your email to complete your registration.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Mobile Background */}
        <div className="lg:hidden absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-deep-navy)] to-[var(--brand-navy)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.03]" />
        </div>

        <motion.div
          className="w-full max-w-md relative z-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-8 lg:mb-10">
            <Link
              to="/"
              className="mb-8 inline-block lg:hidden"
            >
              <ForSaLogo className="h-14 text-white" />
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center gap-2 mb-6 text-slate-400 hover:text-white transition-colors duration-300 font-['Inter:Regular',sans-serif] text-[14px]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Registration
            </Link>

            <motion.h1
              className="mb-3 font-['Inter:Bold',sans-serif] text-[34px] font-bold text-white sm:text-[36px] tracking-tight"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
            >
              {isSuccess ? "Verified!" : "Verify Your Email"}
            </motion.h1>
            <motion.p
              className="font-['Inter:Regular',sans-serif] text-[16px] leading-relaxed text-slate-300"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.28 }}
            >
              {isSuccess
                ? "Your account has been created successfully."
                : "We've sent a 6-digit verification code to:"
              }
            </motion.p>
            {!isSuccess && (
              <motion.div 
                className="flex items-center gap-2 mt-3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.3 }}
              >
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                  <Mail className="w-4 h-4 text-[var(--brand-blue-accent)]" />
                  <span className="font-['Inter:Medium',sans-serif] text-[14px] text-white">
                    {maskedEmail}
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {!isSuccess ? (
            <motion.div
              className="rounded-3xl border border-white/10 bg-[#162032] p-8 sm:p-10 relative overflow-hidden shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                  <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                        className="flex-1"
                      >
                        <input
                          ref={(el) => (inputRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onFocus={() => setFocusedIndex(index)}
                          onBlur={() => setFocusedIndex(null)}
                          disabled={isVerifying}
                          className={`w-full aspect-square text-center font-['Inter:Bold',sans-serif] text-[24px] sm:text-[28px] rounded-xl border transition-all duration-300 bg-white/5 focus:outline-none ${
                            focusedIndex === index
                              ? "border-[var(--brand-blue-accent)] bg-white/10 ring-1 ring-[var(--brand-blue-accent)]/50 text-white shadow-inner"
                              : digit
                              ? "border-[var(--brand-blue-accent)]/50 text-white"
                              : "border-white/10 text-slate-400 hover:border-white/20"
                          } ${error ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20 text-red-400" : ""} ${isVerifying ? "opacity-60" : ""}`}
                        />
                      </motion.div>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -4, height: 0 }}
                        className="text-center text-[13px] text-red-400 mt-3"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button
                  type="submit"
                  disabled={isVerifying}
                  className={`w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 font-['Inter:Bold',sans-serif] text-[16px] font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 ${isVerifying ? 'opacity-70 cursor-not-allowed' : ''}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Account"
                  )}
                </motion.button>
              </form>

              {/* Resend Code */}
              <motion.div
                className="mt-8 flex flex-col items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <p className="font-['Inter:Regular',sans-serif] text-[14px] text-slate-400 text-center">
                  Didn't receive the code?
                </p>
                
                <button
                  onClick={handleResendCode}
                  disabled={timer > 0 || isResending}
                  className={`flex items-center gap-2 font-['Inter:Medium',sans-serif] text-[14px] transition-all duration-300 ${
                    timer > 0
                      ? "text-slate-500 cursor-not-allowed"
                      : "text-[var(--brand-blue-accent)] hover:text-[#60a5fa] transition-colors"
                  }`}
                >
                  {isResending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {timer > 0 ? `Resend code in ${formattedTime}` : "Resend Code"}
                </button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              className="rounded-3xl border border-white/10 bg-[#162032] p-8 sm:p-10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] relative overflow-hidden text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
              </motion.div>
              <h2 className="font-['Inter:Bold',sans-serif] font-bold text-[24px] text-white mb-2 tracking-tight">
                Welcome to ForSa!
              </h2>
              <p className="font-['Inter:Regular',sans-serif] text-[15px] text-slate-300">
                Redirecting you to your dashboard...
              </p>
            </motion.div>
          )}

        </motion.div>
      </div>
    </div>
  );
}
