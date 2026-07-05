import { Link } from "react-router";
import { ForSaLogo } from "./ForSaLogo";

export function SiteFooter() {
  return (
    <footer className="mt-auto w-full bg-[var(--brand-deep-navy)] border-t border-white/10 pt-20 pb-10 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="inline-block transition-opacity duration-300 ease-in-out hover:opacity-80">
              <ForSaLogo className="h-14 text-white mb-6" />
            </Link>
            <p className="text-slate-400 font-light max-w-sm leading-relaxed text-base">
              The ultimate platform for discovering, organizing, and experiencing the world's most premium events and gatherings.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6">Platform</h4>
            <ul className="space-y-4 text-slate-400 font-light">
              <li><Link to="/events" className="hover:text-white transition-colors">Browse Events</Link></li>
              <li><Link to="/places" className="hover:text-white transition-colors">Venues</Link></li>
              <li><Link to="/organizations" className="hover:text-white transition-colors">Organizers</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6">Legal</h4>
            <ul className="space-y-4 text-slate-400 font-light">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© 2026 ForSa Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {['Twitter', 'LinkedIn', 'Instagram'].map((social) => (
              <a key={social} href="#" className="text-slate-500 hover:text-white text-sm transition-colors">{social}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
