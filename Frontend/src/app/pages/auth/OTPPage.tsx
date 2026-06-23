import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router";
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
      localStorage.setItem("forsa_user", JSON.stringify({
        fullName: result.fullName,
        email: result.email,
        expireOn: result.expireOn,
      }));

      setIsSuccess(true);
      toast.success(`Welcome to Forsa, ${result.fullName}!`);

      // Navigate to dashboard after a brief success animation
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
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
    <div className="min-h-screen bg-[#0B1120] py-12 px-4 relative overflow-hidden flex flex-col justify-center">
      {/* Premium Background */}
      <div className="absolute inset-0 z-0" style={{ background: "linear-gradient(135deg, #0B1120 0%, #1E3D61 100%)" }} />
      <div className="absolute inset-0 z-0 overflow-hidden mix-blend-screen pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full filter blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#3b82f6]/20 rounded-full filter blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <motion.div
        className="max-w-md w-full mx-auto relative z-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 mb-8 text-slate-400 hover:text-white transition-colors duration-300 font-['Inter:Regular',sans-serif] text-[14px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Registration
          </Link>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: isSuccess ? "color-mix(in srgb, #22c55e 20%, transparent)" : "color-mix(in srgb, #3b82f6 20%, transparent)" }}
          >
            {isSuccess ? (
              <CheckCircle className="h-8 w-8 text-green-400" />
            ) : (
              <ShieldCheck className="h-8 w-8 text-[#3b82f6]" />
            )}
          </motion.div>

          <motion.h1
            className="font-['Inter:Bold',sans-serif] font-bold text-[32px] sm:text-[36px] text-white mb-3 tracking-tight"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {isSuccess ? "Verified!" : "Verify Your Email"}
          </motion.h1>

          <motion.div
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <p className="font-['Inter:Regular',sans-serif] text-[16px] text-slate-300">
              {isSuccess
                ? "Your account has been created successfully."
                : "We've sent a 6-digit verification code to"
              }
            </p>
            {!isSuccess && (
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 mt-1">
                <Mail className="w-4 h-4 text-[#3b82f6]" />
                <span className="font-['Inter:Medium',sans-serif] text-[14px] text-white">
                  {maskedEmail}
                </span>
              </div>
            )}
          </motion.div>
        </div>

        {/* OTP Form */}
        {!isSuccess && (
          <motion.div
            className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Top accent line */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: "linear-gradient(to right, transparent, #3b82f6, transparent)" }}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 0.6, scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            />

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
                        className={`w-full aspect-square text-center font-['Inter:Bold',sans-serif] text-[24px] sm:text-[28px] rounded-xl border transition-all duration-300 bg-white/5 focus:bg-white/10 focus:outline-none ${
                          focusedIndex === index
                            ? "border-[#3b82f6] ring-2 ring-[#3b82f6]/30 text-white"
                            : digit
                            ? "border-white/30 text-white"
                            : "border-white/10 text-slate-400"
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

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isVerifying}
                className={`w-full bg-white text-[#0B1120] py-4 rounded-xl font-['Inter:Bold',sans-serif] font-bold text-[16px] shadow-lg transition-all duration-300 hover:bg-slate-100 hover:shadow-xl active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 ${isVerifying ? 'opacity-70 cursor-not-allowed' : ''}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={isVerifying ? {} : { scale: 1.02 }}
                whileTap={isVerifying ? {} : { scale: 0.98 }}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-[#0B1120]" />
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
                    : "text-[#3b82f6] hover:text-[#60a5fa] hover:underline underline-offset-2"
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
        )}

        {/* Success state */}
        {isSuccess && (
          <motion.div
            className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: "linear-gradient(to right, transparent, #22c55e, transparent)" }}
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
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
  );
}
