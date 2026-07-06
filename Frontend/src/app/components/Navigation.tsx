import type { CSSProperties } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X, ArrowRight, Bell, User, Heart, Calendar, LogOut, LayoutDashboard } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, useRef } from "react";
import { ForSaLogo } from "./ForSaLogo";
import { EASE_IN_OUT } from "../lib/motion";
import { attendeeApi } from "../api/attendeeApi";
import { getUserIdFromToken } from "../api/api";
import { getDashboardPath, getUserRole } from "../utils/roleRouting";

export function Navigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navElevated, setNavElevated] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Guest");
  const [userEmail, setUserEmail] = useState("user@forsa.com");
  const dashboardPath = getDashboardPath(getUserRole());

  useEffect(() => {
    const token = localStorage.getItem("forsa_token");
    if (token) {
      setIsLoggedIn(true);
      setUserName(localStorage.getItem("forsa_user_name") || "User");
      setUserEmail(localStorage.getItem("forsa_user_email") || "user@forsa.com");
      
      const role = localStorage.getItem("role");
      if (role === "Attendee") {
        const userId = getUserIdFromToken();
        if (userId) {
          attendeeApi.getProfile(userId).then(profile => {
            if (profile.profilePicture) {
              localStorage.setItem("forsa_profile_picture", profile.profilePicture);
            }
          }).catch(() => {});
        }
      }
    }
    const onScroll = () => setNavElevated(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("forsa_token");
    localStorage.removeItem("forsa_refresh_token");
    localStorage.removeItem("forsa_user_name");
    localStorage.removeItem("forsa_user_email");
    localStorage.removeItem("forsa_profile_picture");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const links = [
    { path: "/events", label: "Events" },
    { path: "/organizations", label: "Organizations" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact Us" },
  ];

  const isHomePage = location.pathname === "/";
  const shouldElevate = navElevated || !isHomePage;

  return (
    <>
      <nav
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          shouldElevate
            ? "bg-white/90 backdrop-blur-md border-b border-slate-200/40 shadow-[0_8px_32px_rgba(30,61,97,0.05)] py-3"
            : "bg-transparent border-b border-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group outline-none">
            {/* <ForSaLogo className={`h-12 md:h-14 w-auto transition-all duration-500 ${shouldElevate ? 'brightness-50' : 'brightness-50 invert'}`} /> */}
            {/* <ForSaLogo className={`h-12 md:h-14 w-auto transition-all duration-500 brightness-50`} /> */}
            <ForSaLogo className={`h-14 md:h-15 w-auto transition-all duration-500 ${shouldElevate ? 'brightness-50' : 'brightness-150'}`} />
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            {links.map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                className={`relative font-['Inter:Medium',sans-serif] text-sm font-semibold tracking-wide transition-colors group ${
                  shouldElevate ? 'text-slate-600 hover:text-[var(--brand-navy)]' : 'text-white/80 hover:text-white drop-shadow-sm'
                }`}
              >
                {item.label}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 rounded-full transition-all duration-300 group-hover:w-full ${shouldElevate ? 'bg-[var(--brand-navy)]' : 'bg-white'}`}></span>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-6">
            {isLoggedIn ? (
              <>


                <div className="relative" ref={userMenuRef}>
                  <button 
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full transition-all ${
                      shouldElevate ? 'hover:bg-slate-100 border border-transparent' : 'bg-white/10 hover:bg-white/20 border border-white/20'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-['Inter:Bold',sans-serif] text-sm overflow-hidden ${

                      shouldElevate ? 'bg-gradient-to-br from-[var(--brand-navy)] to-[var(--brand-navy-hover)] text-white' : 'bg-white text-[var(--brand-navy)]'
                    }`}>
                      {localStorage.getItem("forsa_profile_picture") ? (
                        <img src={`${import.meta.env.VITE_API_BASE_URL || ""}${localStorage.getItem("forsa_profile_picture")}`} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        userName.charAt(0)
                      )}
                    </div>
                    <span className={`text-sm font-['Inter:Medium',sans-serif] ${shouldElevate ? 'text-slate-700' : 'text-white'}`}>
                      {userName}
                    </span>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
                      >
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                          <p className="font-['Inter:Bold',sans-serif] text-slate-800">{userName}</p>
                          <p className="text-xs font-['Inter:Medium',sans-serif] text-slate-500 truncate">{userEmail}</p>
                        </div>
                        <div className="p-2">
                          <Link to={dashboardPath} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-['Inter:Medium',sans-serif] text-slate-600 hover:bg-slate-50 hover:text-[var(--brand-navy)] transition-colors">
                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                          </Link>
                        </div>
                        <div className="p-2 border-t border-slate-100">
                          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-['Inter:Medium',sans-serif] text-rose-600 hover:bg-rose-50 transition-colors">
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className={`relative overflow-hidden text-sm font-['Inter:Bold',sans-serif] font-bold px-8 py-2.5 rounded-full shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 group ${
                  shouldElevate 
                    ? 'bg-[var(--brand-navy)] text-white hover:bg-[var(--brand-navy-hover)] shadow-[var(--brand-navy)]/20' 
                    : 'bg-white text-[var(--brand-navy)] hover:bg-slate-50'
                }`}
              >
                <span className="relative z-10 flex items-center gap-2">Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center gap-4">

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${shouldElevate ? 'text-slate-800' : 'text-white'}`}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {mobileMenuOpen && (
            <motion.div
              key="mobile-nav"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: EASE_IN_OUT }}
              className="overflow-hidden bg-white md:hidden border-t border-slate-100 shadow-xl absolute top-full left-0 w-full"
            >
              <div className="space-y-1 px-4 py-4 flex flex-col gap-2">
                {links.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="block rounded-xl px-4 py-3 font-['Inter:Bold',sans-serif] text-slate-700 hover:bg-slate-50"
                  >
                    {item.label}
                  </Link>
                ))}
                
                {isLoggedIn ? (
                  <>
                    <div className="my-2 border-t border-slate-100"></div>
                    <Link to={dashboardPath} className="flex items-center gap-3 rounded-xl px-4 py-3 font-['Inter:Medium',sans-serif] text-slate-600 hover:bg-slate-50">
                      <LayoutDashboard className="w-5 h-5" /> Dashboard
                    </Link>

                    <button onClick={handleSignOut} className="flex items-center gap-3 rounded-xl px-4 py-3 font-['Inter:Bold',sans-serif] text-rose-600 hover:bg-rose-50 w-full text-left mt-2 border-t border-slate-100 pt-4">
                      <LogOut className="w-5 h-5" /> Sign Out
                    </button>
                  </>
                ) : (
                  <div className="pt-4 mt-2 border-t border-slate-100">
                    <Link
                      to="/login"
                      className="flex justify-center items-center gap-2 rounded-xl px-4 py-3 font-['Inter:Bold',sans-serif] text-white bg-[var(--brand-navy)] hover:bg-[var(--brand-navy-hover)]"
                    >
                      Sign In <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
