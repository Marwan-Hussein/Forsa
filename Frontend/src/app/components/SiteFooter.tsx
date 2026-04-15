import { Link } from "react-router";
import { brandNavy } from "../lib/brand";
import { ForSaLogo } from "./ForSaLogo";

const linkClass =
  "font-['Inter:Regular',sans-serif] text-[14px] leading-[20px] text-[rgba(221,230,237,0.8)] hover:text-[#dde6ed] transition-colors";
const headingClass =
  "font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-[#dde6ed] mb-4";

export function SiteFooter() {
  return (
    <footer className="mt-auto w-full text-[#dde6ed]" style={{ backgroundColor: brandNavy }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/dashboard" className="mb-4 inline-block transition-opacity duration-300 ease-in-out hover:opacity-80">
              <ForSaLogo className="h-14 sm:h-16" />
            </Link>
            <p className="font-['Inter:Regular',sans-serif] text-[14px] leading-[22px] text-[rgba(221,230,237,0.8)] max-w-[280px]">
              Your one-stop platform for discovering and managing events.
            </p>
          </div>

          <div>
            <h4 className={headingClass}>Explore</h4>
            <ul className="flex flex-col gap-2">
              <li>
                <Link to="/events" className={linkClass}>
                  Browse Events
                </Link>
              </li>
              <li>
                <Link to="/events" className={linkClass}>
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/recommendations" className={linkClass}>
                  Featured Events
                </Link>
              </li>
              <li>
                <Link to="/events" className={linkClass}>
                  Near Me
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className={headingClass}>Organizers</h4>
            <ul className="flex flex-col gap-2">
              <li>
                <Link to="/organization-dashboard" className={linkClass}>
                  Create Event
                </Link>
              </li>
              <li>
                <span className={linkClass + " cursor-default"}>Pricing</span>
              </li>
              <li>
                <span className={linkClass + " cursor-default"}>Resources</span>
              </li>
              <li>
                <span className={linkClass + " cursor-default"}>Help Center</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className={headingClass}>Company</h4>
            <ul className="flex flex-col gap-2">
              <li>
                <span className={linkClass + " cursor-default"}>About Us</span>
              </li>
              <li>
                <span className={linkClass + " cursor-default"}>Contact</span>
              </li>
              <li>
                <span className={linkClass + " cursor-default"}>Privacy Policy</span>
              </li>
              <li>
                <span className={linkClass + " cursor-default"}>Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[rgba(221,230,237,0.2)]">
        <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[rgba(221,230,237,0.8)] text-center py-6 px-4">
          © 2026 ForSa. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
