import { NavLink, Outlet, useNavigate, Link } from "react-router";
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  Calendar, 
  LogOut, 
  Bell, 
  Settings,
  Menu,
  X,
  Home
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { ForSaLogo } from "../../components/ForSaLogo";
import { motion } from "motion/react";
import { Toaster } from "sonner";
import { NotificationBell } from "../../components/NotificationBell";
import { AiChatbot } from "../../components/AiChatbot";

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

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userName, setUserName] = useState("Admin");
  const [userEmail, setUserEmail] = useState("");
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("forsa_token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const decoded = parseJwt(token);
    const roleClaim = decoded?.role || decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    
    if (roleClaim !== "Admin") {
      navigate("/login", { replace: true });
    }

    // Populate user info from localStorage
    const name = localStorage.getItem("forsa_user_name") || "Admin";
    const email = localStorage.getItem("forsa_user_email") || "";
    setUserName(name);
    setUserEmail(email);

    // Outside click detection
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("forsa_token");
    localStorage.removeItem("forsa_refresh_token");
    localStorage.removeItem("forsa_user_name");
    localStorage.removeItem("forsa_user_email");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard, exact: true },
    { name: "Manage Users", path: "/admin/users", icon: Users },
    { name: "Manage Venues", path: "/admin/places", icon: MapPin },
    { name: "Manage Events", path: "/admin/events", icon: Calendar },
    { name: "Manage Reviews", path: "/admin/reviews", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Toaster 
        position="bottom-right" 
        richColors
        toastOptions={{
          style: {
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            borderRadius: "14px",
            boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15)",
          },
        }}
      />
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[var(--brand-deep-navy)] text-white transition-transform duration-300 lg:translate-x-0 lg:static lg:flex-shrink-0 flex flex-col overflow-hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Premium Background Effects */}
        <div className="absolute inset-0 z-0" style={{ background: "linear-gradient(135deg, var(--brand-deep-navy) 0%, var(--brand-navy) 100%)" }} />
        <div className="absolute inset-0 z-0 overflow-hidden mix-blend-screen pointer-events-none opacity-50">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full filter blur-[80px]" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-[var(--brand-blue-accent)]/10 rounded-full filter blur-[80px]" />
        </div>

        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3.5">
            <Link to="/">
              <ForSaLogo className="h-9 brightness-0 invert cursor-pointer hover:opacity-90 transition-opacity" />
            </Link>
            <div className="h-6 w-[1px] bg-white/20 self-center" />
            <span className="text-lg font-bold tracking-wide text-white whitespace-nowrap">Admin Portal</span>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white transition-colors" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto relative z-10 custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 relative group overflow-hidden ${
                  isActive 
                    ? "text-white bg-white/10 border border-white/10 shadow-lg" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div 
                      layoutId="activeNavBackground"
                      className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50" 
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--brand-blue-accent)] rounded-r-full" />
                  )}
                  <item.icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? "text-[var(--brand-blue-accent)]" : "group-hover:text-white"}`} />
                  <span className={`relative z-10 font-['Inter:Medium',sans-serif] ${isActive ? "font-bold" : "font-medium"}`}>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50">
        {/* Top Navbar */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-6 lg:px-10 z-10 sticky top-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-2xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 hidden sm:block tracking-tight">Welcome back, Admin</h2>
              <p className="text-sm font-['Inter:Regular',sans-serif] text-slate-500 hidden sm:block">Here's what's happening on ForSa today.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-5 relative">
            <NotificationBell />
            <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all hidden sm:block">
              <Settings className="w-5 h-5" />
            </button>
            
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="h-10 w-10 rounded-full bg-gradient-to-br from-[var(--brand-deep-navy)] to-[var(--brand-navy)] flex items-center justify-center text-white font-bold border-2 border-white shadow-md cursor-pointer hover:scale-105 transition-transform overflow-hidden"
              >
                {userName.charAt(0).toUpperCase()}
              </button>
              
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <p className="font-['Inter:Bold',sans-serif] font-bold text-slate-800 text-sm">{userName}</p>
                    <p className="text-xs font-['Inter:Medium',sans-serif] text-slate-500 truncate">{userEmail}</p>
                  </div>
                  <div className="p-2">
                    <Link 
                      to="/" 
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-['Inter:Medium',sans-serif] text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                    >
                      <Home className="w-4 h-4" /> Back to Home
                    </Link>
                  </div>
                  <div className="p-2 border-t border-slate-100">
                    <button 
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }} 
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-['Inter:Medium',sans-serif] text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 lg:p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
      <AiChatbot />
    </div>
  );
}
