import type { CSSProperties } from "react";
import { Link, useLocation } from "react-router";
import { Bell, User, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ForSaLogo } from "./ForSaLogo";
import { brandNavy, brandNavyElevated } from "../lib/brand";
import { EASE_IN_OUT } from "../lib/motion";

const linkBase =
  "font-['Inter:Medium',sans-serif] font-medium text-[14px] px-3 py-2 rounded-[8px] transition-colors duration-300 ease-in-out";
const linkInactive = "text-white/90 hover:bg-white/10 hover:text-white";
const linkActive = "text-white bg-white/15";
const roleTabBase =
  "rounded-[8px] px-3 py-1.5 text-[13px] font-['Inter:Medium',sans-serif] transition-colors duration-300 ease-in-out";
const roleTabInactive = "text-white/80 hover:bg-white/10 hover:text-white";
const roleTabActive = "bg-white/15 text-white";

type NavRole = "attendee" | "organization" | "placeOwner";

const roleConfig: Record<
  NavRole,
  { label: string; defaultPath: string; links: Array<{ path: string; label: string }> }
> = {
  attendee: {
    label: "Attendee",
    defaultPath: "/events",
    links: [
      { path: "/events", label: "Browse Events" },
      { path: "/my-events", label: "My Events" },
      { path: "/wishlist", label: "Wishlist" },
      { path: "/calendar", label: "Calendar" },
    ],
  },
  organization: {
    label: "Organization",
    defaultPath: "/organization-dashboard",
    links: [
      { path: "/organization-dashboard", label: "Dashboard" },
      { path: "/booking-requests", label: "Booking Requests" },
      { path: "/events", label: "Browse Events" },
    ],
  },
  placeOwner: {
    label: "Place Owner",
    defaultPath: "/places",
    links: [
      { path: "/places", label: "My Places" },
      { path: "/my-booking-requests", label: "My Booking Requests" },
    ],
  },
};

function detectRole(pathname: string): NavRole | null {
  if (
    pathname.startsWith("/profile") ||
    pathname.startsWith("/notifications")
  ) {
    // Shared pages: keep whatever role the user selected previously.
    return null;
  }
  if (
    pathname.startsWith("/organization-dashboard") ||
    pathname.startsWith("/booking-requests") ||
    pathname.startsWith("/manage-attendees") ||
    pathname.startsWith("/qr-scanner")
  ) {
    return "organization";
  }
  if (
    pathname.startsWith("/places") ||
    pathname.startsWith("/my-booking-requests")
  ) {
    return "placeOwner";
  }
  return "attendee";
}

function pathMatches(pathname: string, path: string): boolean {
  return pathname === path || pathname.startsWith(`${path}/`);
}

const navShell = (elevated: boolean) =>
  [
    "sticky top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300 ease-in-out",
    elevated
      ? "border-b border-white/10 shadow-lg shadow-black/15 backdrop-blur-md backdrop-saturate-150"
      : "border-b border-transparent shadow-[0_4px_6px_-1px_rgb(0,0,0/0.15)]",
  ].join(" ");

const navBarStyle = (elevated: boolean): CSSProperties => ({
  backgroundColor: elevated ? brandNavyElevated : brandNavy,
});

export function Navigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [elevated, setElevated] = useState(false);
  const [selectedRole, setSelectedRole] = useState<NavRole>(() => detectRole(location.pathname) ?? "attendee");

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const inferredRole = detectRole(location.pathname);
    if (inferredRole) {
      setSelectedRole(inferredRole);
    }
  }, [location.pathname]);

  if (location.pathname === "/") {
    return null;
  }

  const isActive = (path: string) => pathMatches(location.pathname, path);
  const roleLinks = roleConfig[selectedRole].links;
  const roleOrder: NavRole[] = ["attendee", "organization", "placeOwner"];

  return (
    <>
      <nav className={`${navShell(elevated)} hidden lg:block`} style={navBarStyle(elevated)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[84px]">
            <Link
              to="/dashboard"
              className="flex shrink-0 items-center rounded-lg py-1 outline-none ring-white/0 transition-[transform,box-shadow] duration-300 ease-in-out hover:opacity-95 focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <ForSaLogo className="h-14 sm:h-16 max-h-[4.5rem]" />
            </Link>

            <div className="flex flex-1 items-center justify-center gap-4 px-4">
              <div className="flex items-center gap-1 rounded-[10px] bg-white/5 p-1">
                {roleOrder.map((role) => (
                  <Link
                    key={role}
                    to={roleConfig[role].defaultPath}
                    onClick={() => setSelectedRole(role)}
                    className={`${roleTabBase} ${
                      selectedRole === role ? roleTabActive : roleTabInactive
                    }`}
                  >
                    {roleConfig[role].label}
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-1">
                {roleLinks.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`${linkBase} ${isActive(item.path) ? linkActive : linkInactive}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Link
                to="/notifications"
                className={`flex h-10 w-10 items-center justify-center rounded-[8px] text-white transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 ${
                  isActive("/notifications") ? "bg-white/15" : "hover:bg-white/10"
                }`}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </Link>
              <Link
                to="/profile"
                className={`flex h-10 w-10 items-center justify-center rounded-[8px] text-white transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 ${
                  isActive("/profile") ? "bg-white/15" : "hover:bg-white/10"
                }`}
                aria-label="Profile"
              >
                <User className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <nav className={`${navShell(elevated)} lg:hidden`} style={navBarStyle(elevated)}>
        <div className="px-4">
          <div className="flex h-[72px] items-center justify-between">
            <Link
              to="/dashboard"
              className="flex items-center rounded-lg py-1 outline-none transition-opacity duration-300 ease-in-out hover:opacity-95 focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <ForSaLogo className="h-12 sm:h-14 max-h-16" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-[8px] text-white transition-all duration-300 ease-in-out hover:bg-white/10 active:scale-95"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
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
              className="overflow-hidden border-t border-white/10"
            >
              <div className="space-y-1 px-4 py-4">
                <div className="mb-2 flex items-center gap-1 rounded-[10px] bg-white/5 p-1">
                  {roleOrder.map((role) => (
                    <Link
                      key={role}
                      to={roleConfig[role].defaultPath}
                      onClick={() => {
                        setSelectedRole(role);
                        setMobileMenuOpen(false);
                      }}
                      className={`${roleTabBase} text-center ${
                        selectedRole === role ? roleTabActive : roleTabInactive
                      }`}
                    >
                      {roleConfig[role].label}
                    </Link>
                  ))}
                </div>
                {roleLinks.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block rounded-[8px] px-4 py-3 font-['Inter:Medium',sans-serif] text-[15px] font-medium transition-colors duration-300 ease-in-out ${
                      isActive(item.path)
                        ? "bg-white/15 text-white"
                        : "text-white/90 hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/notifications"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-[8px] px-4 py-3 text-white/90 transition-colors duration-300 ease-in-out hover:bg-white/10"
                >
                  <Bell className="h-5 w-5" />
                  Notifications
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-[8px] px-4 py-3 text-white/90 transition-colors duration-300 ease-in-out hover:bg-white/10"
                >
                  <User className="h-5 w-5" />
                  Profile
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
