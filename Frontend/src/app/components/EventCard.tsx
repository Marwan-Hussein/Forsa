import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Calendar, Clock, MapPin, Users, Heart } from "lucide-react";
import { Event } from "../types";
import { ImageWithFallback } from "@/app/components/ImageWithFallback";
import { parseBackendDate } from "../utils/mappers";
import { getUserRole } from "../utils/roleRouting";
import {
  EASE_IN_OUT,
  EASE_SCROLL,
  listStaggerDelay,
  SCROLL_REVEAL_DURATION,
  scrollRevealViewport,
} from "../lib/motion";

interface EventCardProps {
  event: Event;
  onToggleWishlist?: (eventId: string) => void;
  isInWishlist?: boolean;
  showActions?: boolean;
  animationIndex?: number;
  reveal?: "mount" | "scroll";
}

export function EventCard({
  event,
  onToggleWishlist,
  isInWishlist = false,
  showActions = true,
  animationIndex = 0,
  reveal = "mount",
}: EventCardProps) {
  const navigate = useNavigate();
  const role = getUserRole();
  const isAttendee = !role || (role !== "Admin" && role !== "Owner" && role !== "PlaceOwner" && role !== "Organizer");
  const now = new Date();
  const startDate = event.startDate ? parseBackendDate(event.startDate) : null;
  const endDate = event.endDate ? parseBackendDate(event.endDate) : null;
  const statusStr = (event.status || "").toLowerCase();
  
  const isApprovedOrActive = statusStr === "approved" || statusStr === "published" || statusStr === "soldout" || statusStr === "2" || statusStr === "4" || statusStr === "5";
  const isLive = isApprovedOrActive && startDate && endDate && startDate < now && now < endDate;
  const isCompleted = statusStr === "completed" || statusStr === "7" || (isApprovedOrActive && endDate && endDate < now);

  const categoryColors: Record<string, string> = {
    Business: "var(--Business)",
    Music: "var(--Music)",
    Art: "var(--Art)",
    Sports: "var(--Sports)",
    Food: "var(--Food)",
    Education: "var(--Education)",
    Technology: "var(--Technology)",
    Entertainment: "var(--Entertainment)",
  };

  const priceDisplay = event.price === "Free" ? "Free" : `${event.price} EGP`;
  const accent = categoryColors[event.category] || "hsl(var(--color-muted-foreground))";

  const enterMotion =
    reveal === "scroll"
      ? {
          initial: { opacity: 0, y: 26 } as const,
          whileInView: { opacity: 1, y: 0 } as const,
          viewport: scrollRevealViewport,
          transition: {
            duration: SCROLL_REVEAL_DURATION,
            ease: EASE_SCROLL,
            delay: listStaggerDelay(animationIndex, 10),
          },
        }
      : {
          initial: { opacity: 0, y: 16 } as const,
          animate: { opacity: 1, y: 0 } as const,
          transition: {
            duration: 0.36,
            ease: EASE_IN_OUT,
            delay: listStaggerDelay(animationIndex),
          },
        };

  return (
    <motion.article
      layout={false}
      {...enterMotion}
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/events/${event.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/events/${event.id}`);
        }
      }}
      className={[
        "group relative overflow-hidden rounded-2xl border bg-white",
        "border-border",
        "shadow-[0_2px_12px_-4px_rgb(var(--color-primary)/0.08)]",
        // --- Smooth hover: longer duration + ease-out for natural deceleration ---
        "translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[transform,box-shadow,border-color]",
        "cursor-pointer",
        "hover:-translate-y-1",
        "hover:shadow-[0_20px_40px_-12px_color-mix(in_srgb,var(--card-accent)_40%,transparent)]",
        "hover:border-[color-mix(in_srgb,var(--card-accent)_50%,transparent)]",
      ].join(" ")}
      style={{ "--card-accent": accent } as React.CSSProperties}
    >
      {/* Event Image */}
      <div className="relative h-[192px] overflow-hidden">
        <div className="absolute inset-0 transition-transform duration-[380ms] ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform group-hover:scale-105">
          {event.image && (event.image.startsWith("http") || event.image.startsWith("/")) ? (
            <ImageWithFallback
              alt={event.title}
              className="absolute inset-0 h-full w-full object-cover"
              src={event.image.startsWith("/") ? `http://localhost:5000${event.image}` : event.image}
            />
          ) : (
            <ImageWithFallback
              alt={event.title}
              className="absolute inset-0 h-full w-full object-cover"
              query={event.image}
            />
          )}
        </div>
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--brand-navy)]/50 via-slate-900/10 to-transparent"
          aria-hidden
        />
        {/* Category Badge */}
        <div
          className="absolute top-3 right-3 rounded-lg px-3 py-1 text-[12px] font-['Inter:Medium',sans-serif] font-medium text-white shadow-sm"
          style={{ backgroundColor: `${accent}ee` }}
        >
          {event.category}
        </div>
         {/* Wishlist Button */}
        {isAttendee && showActions && onToggleWishlist && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist(event.id);
            }}
            className="absolute top-3 left-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/90 text-muted-foreground shadow-sm transition-[background-color,color] duration-200 ease-out hover:bg-white hover:text-red-500 active:scale-95"
          >
            <Heart
              className={`h-4 w-4 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`}
            />
          </button>
        )}
      </div>

      {/* Event Content */}
      <div className="relative p-4">
        <div className="flex justify-between items-start mb-3 min-h-[56px]">
          <h3 className="line-clamp-2 font-['Inter:Semi_Bold',sans-serif] text-[18px] font-semibold text-primary pr-2">
            {event.title}
          </h3>
          {event.status && (() => {
            if (isLive) {
              return (
                <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 border border-red-200 animate-pulse flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-500 animate-ping" /> Live Now
                </span>
              );
            }
            if (isCompleted) {
              return (
                <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700">
                  Completed
                </span>
              );
            }
            if (statusStr === "approved" || statusStr === "2") {
              return (
                <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">
                  Approved
                </span>
              );
            }
            if (statusStr === "published" || statusStr === "4") {
              return (
                <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                  Published
                </span>
              );
            }
            if (statusStr === "pending" || statusStr === "1") {
              return (
                <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700">
                  Pending
                </span>
              );
            }
            if (statusStr === "cancelled" || statusStr === "6") {
              return (
                <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700">
                  Cancelled
                </span>
              );
            }
            return (
              <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                {event.status}
              </span>
            );
          })()}
        </div>

        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-accent" />
            <span className="font-['Inter:Regular',sans-serif] text-[14px] text-muted-foreground">
              {new Date(event.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-accent" />
            <span className="font-['Inter:Regular',sans-serif] text-[14px] text-muted-foreground">{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-accent" />
            <span className="truncate font-['Inter:Regular',sans-serif] text-[14px] text-muted-foreground">
              {event.location}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 shrink-0 text-accent" />
            <span className="font-['Inter:Regular',sans-serif] text-[14px] text-muted-foreground">
              {event.attendees} attending
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="font-['Inter:Semi_Bold',sans-serif] text-[16px] font-semibold text-primary">
            {priceDisplay}
          </span>
          <Link
            to={`/events/${event.id}`}
            className="rounded-lg bg-primary px-4 py-2 font-['Inter:Medium',sans-serif] text-[14px] font-medium text-primary-foreground shadow-sm transition-[background-color,transform] duration-200 ease-out hover:bg-primary/90 active:scale-[0.97]"
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
