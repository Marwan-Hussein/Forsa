import type { CSSProperties } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X, ArrowRight, Bell, User, Heart, Calendar, LogOut, LayoutDashboard } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, useRef } from "react";
import { ForSaLogo } from "./ForSaLogo";
import { EASE_IN_OUT } from "../lib/motion";

export function Navigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navElevated, setNavElevated] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Mock authentication state (Assume logged in for attendee redesign)
  const isLoggedIn = true;
  const userName = "Alex";

  useEffect(() => {
    const onScroll = () => setNavElevated(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    { path: "/places", label: "Venues" },
    { path: "/organizations", label: "Organizers" },
  ];

  return (
    <>
      <nav
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          navElevated
            ? "bg-white/95 backdrop-blur-2xl border-b border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] py-3"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group outline-none">
            <ForSaLogo className={`h-8 md:h-10 w-auto transition-all duration-500 ${navElevated ? 'text-blue-600' : 'text-white drop-shadow-md'}`} fill={navElevated ? '#2563eb' : '#ffffff'} />
            <span className={`text-2xl font-['Inter:Bold',sans-serif] font-bold tracking-tight transition-colors duration-500 ${navElevated ? 'text-slate-800' : 'text-white drop-shadow-md'}`}>
              ForSa
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            {links.map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                className={`relative font-['Inter:Medium',sans-serif] text-sm transition-colors group ${
                  navElevated ? 'text-slate-600 hover:text-blue-600' : 'text-white/90 hover:text-white drop-shadow-sm'
                }`}
              >
                {item.label}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 rounded-full transition-all duration-300 group-hover:w-full ${navElevated ? 'bg-blue-600' : 'bg-white'}`}></span>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-6">
            {isLoggedIn ? (
              <>
                <Link 
                  to="/notifications" 
                  className={`relative p-2 rounded-full transition-colors ${
                    navElevated ? 'text-slate-500 hover:bg-slate-100' : 'text-white hover:bg-white/10'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white shadow-sm"></span>
                </Link>

                <div className="relative" ref={userMenuRef}>
                  <button 
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full transition-all ${
                      navElevated ? 'hover:bg-slate-100 border border-transparent' : 'bg-white/10 hover:bg-white/20 border border-white/20'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-['Inter:Bold',sans-serif] text-sm ${
                      navElevated ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' : 'bg-white text-blue-600'
                    }`}>
                      {userName.charAt(0)}
                    </div>
                    <span className={`text-sm font-['Inter:Medium',sans-serif] ${navElevated ? 'text-slate-700' : 'text-white'}`}>
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
                          <p className="text-xs font-['Inter:Medium',sans-serif] text-slate-500 truncate">alex@example.com</p>
                        </div>
                        <div className="p-2">
                          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-['Inter:Medium',sans-serif] text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                          </Link>
                          <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-['Inter:Medium',sans-serif] text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                            <User className="w-4 h-4" /> My Profile
                          </Link>
                          <Link to="/my-events" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-['Inter:Medium',sans-serif] text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                            <Calendar className="w-4 h-4" /> My Tickets
                          </Link>
                          <Link to="/wishlist" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-['Inter:Medium',sans-serif] text-slate-600 hover:bg-slate-50 hover:text-rose-500 transition-colors">
                            <Heart className="w-4 h-4" /> Wishlist
                          </Link>
                        </div>
                        <div className="p-2 border-t border-slate-100">
                          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-['Inter:Medium',sans-serif] text-rose-600 hover:bg-rose-50 transition-colors">
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
                  navElevated 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20' 
                    : 'bg-white text-blue-600 hover:bg-slate-50'
                }`}
              >
                <span className="relative z-10 flex items-center gap-2">Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center gap-4">
            {isLoggedIn && (
              <Link 
                to="/notifications" 
                className={`relative p-2 rounded-full transition-colors ${
                  navElevated ? 'text-slate-500' : 'text-white'
                }`}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white shadow-sm"></span>
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${navElevated ? 'text-slate-800' : 'text-white'}`}
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
                    <Link to="/dashboard" className="flex items-center gap-3 rounded-xl px-4 py-3 font-['Inter:Medium',sans-serif] text-slate-600 hover:bg-slate-50">
                      <LayoutDashboard className="w-5 h-5" /> Dashboard
                    </Link>
                    <Link to="/profile" className="flex items-center gap-3 rounded-xl px-4 py-3 font-['Inter:Medium',sans-serif] text-slate-600 hover:bg-slate-50">
                      <User className="w-5 h-5" /> My Profile
                    </Link>
                    <Link to="/my-events" className="flex items-center gap-3 rounded-xl px-4 py-3 font-['Inter:Medium',sans-serif] text-slate-600 hover:bg-slate-50">
                      <Calendar className="w-5 h-5" /> My Tickets
                    </Link>
                    <Link to="/wishlist" className="flex items-center gap-3 rounded-xl px-4 py-3 font-['Inter:Medium',sans-serif] text-slate-600 hover:bg-slate-50">
                      <Heart className="w-5 h-5" /> Wishlist
                    </Link>
                    <button className="flex items-center gap-3 rounded-xl px-4 py-3 font-['Inter:Bold',sans-serif] text-rose-600 hover:bg-rose-50 w-full text-left mt-2 border-t border-slate-100 pt-4">
                      <LogOut className="w-5 h-5" /> Sign Out
                    </button>
                  </>
                ) : (
                  <div className="pt-4 mt-2 border-t border-slate-100">
                    <Link
                      to="/login"
                      className="flex justify-center items-center gap-2 rounded-xl px-4 py-3 font-['Inter:Bold',sans-serif] text-white bg-blue-600"
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
