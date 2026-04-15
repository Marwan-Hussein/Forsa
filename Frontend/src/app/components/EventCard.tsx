import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Calendar, Clock, MapPin, Users, Heart } from "lucide-react";
import { Event } from "../data/mockData";
import { ImageWithFallback } from "@/app/components/ImageWithFallback";
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
  const categoryColors: Record<string, string> = {
    Business: "#155dfc",
    Music: "#9810fa",
    Art: "#ec4899",
    Sports: "#16a34a",
    Food: "#f97316",
    Education: "#eab308",
  };

  const priceDisplay = event.price === "Free" ? "Free" : `$${event.price}`;
  const accent = categoryColors[event.category] || "#526d82";

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
        "border-[rgba(82,109,130,0.14)]",
        "shadow-[0_2px_12px_-4px_rgba(39,55,77,0.10)]",
        // --- ALL hover via CSS (GPU-composited, no JS per frame) ---
        "translate-y-0 transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform",
        "cursor-pointer",
        "hover:-translate-y-1.5",
        "hover:shadow-[0_16px_32px_-10px_rgba(39,55,77,0.18)]",
        "hover:border-[rgba(39,55,77,0.20)]",
      ].join(" ")}
    >
      {/* Event Image */}
      <div className="relative h-[192px] overflow-hidden">
        <div className="absolute inset-0 transition-transform duration-[380ms] ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform group-hover:scale-105">
          <ImageWithFallback
            alt={event.title}
            className="absolute inset-0 h-full w-full object-cover"
            query={event.image}
          />
        </div>
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#27374d]/50 via-[#27374d]/8 to-transparent"
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
        {showActions && onToggleWishlist && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist(event.id);
            }}
            className="absolute top-3 left-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[#526d82] shadow-sm transition-[background-color,color] duration-200 ease-out hover:bg-white hover:text-red-500 active:scale-95"
          >
            <Heart
              className={`h-4 w-4 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`}
            />
          </button>
        )}
      </div>

      {/* Event Content */}
      <div className="relative p-4">
        <h3 className="mb-3 line-clamp-2 min-h-[56px] font-['Inter:Semi_Bold',sans-serif] text-[18px] font-semibold text-[#27374d]">
          {event.title}
        </h3>

        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-[#EC9B3B]" />
            <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82]">
              {new Date(event.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-[#EC9B3B]" />
            <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82]">{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-[#EC9B3B]" />
            <span className="truncate font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82]">
              {event.location}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 shrink-0 text-[#EC9B3B]" />
            <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82]">
              {event.attendees} attending
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[rgba(82,109,130,0.12)] pt-3">
          <span className="font-['Inter:Semi_Bold',sans-serif] text-[16px] font-semibold text-[#27374d]">
            {priceDisplay}
          </span>
          <Link
            to={`/events/${event.id}`}
            className="rounded-lg bg-[#27374d] px-4 py-2 font-['Inter:Medium',sans-serif] text-[14px] font-medium text-[#dde6ed] shadow-sm transition-[background-color,transform] duration-200 ease-out hover:bg-[#1e2936] active:scale-[0.97]"
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
