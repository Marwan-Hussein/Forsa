import { useLocation } from "react-router";
import { AnimatedOutlet } from "../../components/AnimatedOutlet";
import { Navigation } from "../../components/Navigation";
import { SiteFooter } from "../../components/SiteFooter";
import { Toaster } from "../../components/ui/sonner";

export default function Layout() {
  const { pathname } = useLocation();
  const showAppChrome = pathname !== "/";

  return (
    <div className="min-h-screen flex flex-col bg-[#f1f5f9]">
      <Navigation />
      <main className="flex min-h-0 flex-1 flex-col w-full">
        <AnimatedOutlet />
      </main>
      {showAppChrome && <SiteFooter />}
      <Toaster />
    </div>
  );
}