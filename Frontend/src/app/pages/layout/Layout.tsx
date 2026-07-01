import { useLocation } from "react-router";
import { useEffect } from "react";
import { AnimatedOutlet } from "../../components/AnimatedOutlet";
import { Navigation } from "../../components/Navigation";
import { SiteFooter } from "../../components/SiteFooter";
import { Toaster } from "../../components/ui/sonner";

export default function Layout() {
  const { pathname } = useLocation();
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/verify-otp";
  const showAppChrome = !isAuthPage && pathname !== "/";
  const showNavigation = !isAuthPage;

  useEffect(() => {
    const btn = document.getElementById("scrollToTop");
    if (!btn) return;

    btn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });

    window.addEventListener("scroll", () => {
      if (window.scrollY > 200) {
        btn.style.opacity = "1";
        btn.style.transform = "scale(1)";
        btn.style.pointerEvents = "auto";
      } else {
        btn.style.opacity = "0";
        btn.style.transform = "scale(0.8)";
        btn.style.pointerEvents = "none";
      }
    });

    if (window.scrollY <= 200) {
      btn.style.opacity = "0";
      btn.style.transform = "scale(0.8)";
      btn.style.pointerEvents = "none";
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background relative selection:bg-primary/10 selection:text-primary">
      <style>{`
        .scroll-btn {
          position: fixed;
          right: 30px;
          width: 48px;
          height: 48px;
          background-color: var(--primary);
          color: var(--primary-foreground);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 9999;
          transition: opacity 0.3s, transform 0.3s;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        .scroll-btn:hover {
          transform: scale(1.1) !important;
          background-color: var(--accent);
        }
        .scroll-btn:active {
          transform: scale(0.95) !important;
        }
      `}</style>
      
      {showNavigation && <Navigation />}
      <main className="flex min-h-0 flex-1 flex-col w-full">
        <AnimatedOutlet />
      </main>
      {showAppChrome && <SiteFooter />}
      <Toaster />

      {/* Floating Action Buttons using user-provided SVG and attributes */}
      <div
        id="scrollToTop"
        className="scroll-btn"
        title="Go to top"
        style={{ bottom: "100px" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 11l-5-5-5 5M17 18l-5-5-5 5" />
        </svg>
      </div>

    </div>
  );
}