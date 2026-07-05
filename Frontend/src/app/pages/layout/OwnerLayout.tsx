import { NavLink, Outlet, useNavigate, Link } from "react-router";
import { 
  LayoutDashboard, 
  MapPin, 
  CalendarCheck,
  LogOut, 
  Bell, 
  Settings,
  Menu,
  X,
  ClipboardList
} from "lucide-react";
import { useState, useEffect } from "react";
import { ForSaLogo } from "../../components/ForSaLogo";
import { motion } from "motion/react";
import { getUserIdFromToken } from "../../api/api";
import { ownerApi } from "../../api/ownerApi";
import { Toaster } from "sonner";

export default function OwnerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const id = getUserIdFromToken();
        if (!id) return;
        const profile = await ownerApi.getProfile(id);
        if (profile.profilePicture) {
          setProfilePictureUrl(profile.profilePicture);
        }
      } catch (err) {}
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("forsa_token");
    localStorage.removeItem("forsa_refresh_token");
    localStorage.removeItem("forsa_user_name");
    localStorage.removeItem("forsa_user_email");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/owner", icon: LayoutDashboard, exact: true },
    { name: "My Venues", path: "/owner/places", icon: MapPin },
    { name: "Booking Requests", path: "/owner/bookings", icon: CalendarCheck },
    { name: "Profile", path: "/owner/profile", icon: Settings },
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
          <div className="flex items-center gap-3">
            <ForSaLogo className="h-8 brightness-0 invert" />
            <span className="font-['Inter:Bold',sans-serif] font-bold text-xl tracking-wide text-white">Owner Portal</span>
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
                      layoutId="ownerActiveNavBackground"
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

        <div className="p-4 border-t border-white/10 relative z-10 bg-[var(--brand-deep-navy)]/50 backdrop-blur-md">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 w-full px-4 py-3.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 font-['Inter:Medium',sans-serif]"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
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
              <h2 className="text-2xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 hidden sm:block tracking-tight">Welcome back</h2>
              <p className="text-sm font-['Inter:Regular',sans-serif] text-slate-500 hidden sm:block">Here's what's happening with your venues today.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-5">
            <Link to="/notifications" className="relative p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white"></span>
            </Link>
            <Link to="/owner/profile" className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold border-2 border-white shadow-md ml-2 cursor-pointer hover:scale-105 transition-transform overflow-hidden">
              {profilePictureUrl ? (
                <img src={`${import.meta.env.VITE_API_BASE_URL || ""}${profilePictureUrl}`} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                "O"
              )}
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 lg:p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
