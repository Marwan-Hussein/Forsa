import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Shield, Lock, Mail, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { toast, Toaster } from "sonner";
import { ForSaLogo } from "../../components/ForSaLogo";
import { apiPost } from "../../api/api";

// Simple JWT parser
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

interface LoginResponse {
  token: string;
  refreshToken: string;
}

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all security fields.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiPost<LoginResponse>("/api/Auth/login", { email, password });
      
      if (!response.token) {
        throw new Error("Invalid server response. Token missing.");
      }

      // Validate Admin Role
      const decoded = parseJwt(response.token);
      const roleClaim = decoded?.role || decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      if (roleClaim !== "Admin") {
        toast.error("Access Denied: You do not have Administrator privileges.");
        return;
      }

      // Success
      localStorage.setItem("forsa_token", response.token);
      localStorage.setItem("forsa_refresh_token", response.refreshToken);
      
      toast.success("Admin access granted.");
      navigate("/admin");
    } catch (error: any) {
      toast.error(error.message || "Failed to authenticate. Check credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] flex relative overflow-hidden">
      <Toaster position="top-center" theme="dark" />
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020817] to-[#020817]" />
        
        {/* Animated grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: "linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)", 
            backgroundSize: "32px 32px" 
          }} 
        />
        
        {/* Glowing Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600 rounded-full blur-[128px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[128px]" 
        />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[440px]"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 shadow-2xl mb-6 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Shield className="w-8 h-8 text-blue-400" />
            </motion.div>
            
            <h1 className="text-3xl font-['Inter:Bold',sans-serif] text-white tracking-tight mb-2">
              System Authorization
            </h1>
            <p className="text-slate-400 font-['Inter:Medium',sans-serif]">
              Restricted access. Please verify your credentials.
            </p>
          </div>

          {/* Login Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-[#0B1121]/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden"
          >
            {/* Top scanning line effect */}
            <motion.div 
              animate={{ y: [0, 400, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"
            />

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-['Inter:Bold',sans-serif] text-slate-400 uppercase tracking-wider">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'email' ? 'text-blue-400' : 'text-slate-500'}`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-[#131B2C] border border-white/5 text-white text-sm font-['Inter:Medium',sans-serif] rounded-xl px-11 py-3.5 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                    placeholder="Enter admin email..."
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-xs font-['Inter:Bold',sans-serif] text-slate-400 uppercase tracking-wider">
                  Master Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${focusedField === 'password' ? 'text-blue-400' : 'text-slate-500'}`} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-[#131B2C] border border-white/5 text-white text-sm font-['Inter:Medium',sans-serif] rounded-xl px-11 py-3.5 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                    placeholder="••••••••••••"
                    required
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full relative group mt-6 bg-blue-600 hover:bg-blue-500 text-white font-['Inter:Bold',sans-serif] py-4 rounded-xl flex items-center justify-center gap-2 overflow-hidden transition-all disabled:opacity-70"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Login</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-slate-500 font-['Inter:Medium',sans-serif]">
              <Lock className="w-3.5 h-3.5" />
              End-to-end encrypted connection
            </div>
          </motion.div>
          
          <div className="mt-8 text-center flex items-center justify-center">
            <ForSaLogo className="h-6 text-slate-600 opacity-50 grayscale" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
