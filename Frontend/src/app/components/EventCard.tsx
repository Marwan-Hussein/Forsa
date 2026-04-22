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
    Business: "var(--Business)",
    Music: "var(--Music)",
    Art: "var(--Art)",
    Sports: "var(--Sports)",
    Food: "var(--Food)",
    Education: "var(--Education)",
    Technology: "var(--Technology)",
    Entertainment: "var(--Entertainment)",
  };

  const priceDisplay = event.price === "Free" ? "Free" : `$${event.price}`;
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
          <ImageWithFallback
            alt={event.title}
            className="absolute inset-0 h-full w-full object-cover"
            query={event.image}
          />
        </div>
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/50 via-primary/8 to-transparent"
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
        <h3 className="mb-3 line-clamp-2 min-h-[56px] font-['Inter:Semi_Bold',sans-serif] text-[18px] font-semibold text-primary">
          {event.title}
        </h3>

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
