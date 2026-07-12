import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Bot, Loader2, User } from "lucide-react";
import { apiPost, getUserIdFromToken } from "../api/api";
import { attendeeApi } from "../api/attendeeApi";
import { organizerApi } from "../api/organizerApi";
import { ownerApi } from "../api/ownerApi";
import { adminApi } from "../api/adminApi";
import { getUserRole } from "../utils/roleRouting";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { RobotLauncher } from "./RobotLauncher";
import type {
  AttendeeProfileDto,
  AttendeeBookingDto,
  WishlistEventDto,
} from "../types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  content: string;
  isUser: boolean;
}

/** Unified context bag — different roles populate different fields. */
interface UserContext {
  role: string;
  userName: string;
  // Attendee-specific
  profile?: AttendeeProfileDto | null;
  bookings?: AttendeeBookingDto[];
  wishlist?: WishlistEventDto[];
  attendedEvents?: AttendeeBookingDto[];
  // Organizer-specific
  organizerProfile?: any;
  organizerStats?: any;
  organizerEvents?: any[];
  organizerReviews?: any[];
  organizerVenueRequests?: any[];
  // PlaceOwner-specific
  ownerProfile?: any;
  ownerStats?: any;
  ownerPlaces?: any[];
  ownerBookingRequests?: any[];
  ownerReviews?: any[];
  // Admin-specific
  adminStats?: any;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(dateStr: string | null | undefined): string {
  if (!dateStr) return "Unknown date";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function cur(amount: number | null | undefined): string {
  if (amount == null) return "0 EGP";
  return `${amount.toLocaleString()} EGP`;
}

/**
 * Compose a structured context string for the AI from whichever fields are populated.
 * Keeps it compact (≤ ~2 KB) so it doesn't balloon the LLM prompt.
 */
function buildSystemContext(ctx: UserContext): string {
  const lines: string[] = [];
  lines.push(`=== FORSA USER CONTEXT ===`);
  lines.push(`Role: ${ctx.role}`);
  lines.push(`Name: ${ctx.userName}`);

  // ── ATTENDEE ──────────────────────────────────────────────────────────────
  if (ctx.role === "Attendee" && ctx.profile) {
    const p = ctx.profile;
    lines.push(`Username: ${p.userName}`);
    lines.push(`Email: ${p.email}`);
    if (p.phoneNumber) lines.push(`Phone: ${p.phoneNumber}`);
    if (p.location) lines.push(`Location: ${p.location}`);
    lines.push(`Loyalty Points: ${p.loyaltyPoint ?? 0}`);
    if (p.interests?.length)
      lines.push(`Interests: ${p.interests.map((i: any) => i.name).join(", ")}`);

    const active = (ctx.bookings ?? []).filter(
      (b) => !["cancelled", "rejected"].includes(b.status.toLowerCase())
    );
    if (active.length) {
      lines.push(`\nActive Bookings (${active.length}):`);
      active.forEach((b) =>
        lines.push(
          `  - "${b.eventTitle}" | ${b.eventCategory} | ${fmt(b.eventStartDate)} | ${b.numberOfTickets} ticket(s) | Status: ${b.status} | Venue: ${b.eventPlace ?? "TBA"}${b.hasSubmittedFeedback ? " | Feedback: submitted" : ""}`
        )
      );
    } else {
      lines.push(`\nActive Bookings: None`);
    }

    const attended = ctx.attendedEvents ?? [];
    if (attended.length) {
      lines.push(`\nAttended Events (${attended.length}):`);
      attended.slice(0, 8).forEach((b) =>
        lines.push(
          `  - "${b.eventTitle}" on ${fmt(b.eventStartDate)}${b.hasSubmittedFeedback ? " [reviewed]" : " [no review yet]"}`
        )
      );
    } else {
      lines.push(`\nAttended Events: None yet`);
    }

    const wl = ctx.wishlist ?? [];
    if (wl.length) {
      lines.push(`\nWishlist (${wl.length}):`);
      wl.slice(0, 8).forEach((w) =>
        lines.push(
          `  - "${w.title}" | ${w.category} | ${fmt(w.startDate)} | ${w.ticketPrice === 0 ? "Free" : cur(w.ticketPrice)} | ${w.status}`
        )
      );
    } else {
      lines.push(`\nWishlist: Empty`);
    }
  }

  // ── ORGANIZER ─────────────────────────────────────────────────────────────
  if (ctx.role === "Organizer") {
    const p = ctx.organizerProfile;
    if (p) {
      if (p.email) lines.push(`Email: ${p.email}`);
      if (p.phoneNumber) lines.push(`Phone: ${p.phoneNumber}`);
      if (p.location) lines.push(`Location: ${p.location}`);
    }

    const s = ctx.organizerStats;
    if (s) {
      lines.push(`\nDashboard Summary:`);
      lines.push(`  Total Events: ${s.totalEvents ?? 0}`);
      lines.push(`  Completed: ${s.completedEvents ?? 0} | Pending: ${s.pendingEvents ?? 0}`);
      lines.push(`  Tickets Sold: ${s.totalTicketsSold ?? 0}`);
      lines.push(`  Revenue: ${cur(s.totalRevenue)} | Available Balance: ${cur(s.availableBalance)}`);
      lines.push(`  Venue Bookings: ${s.totalPlacesBooked ?? 0}`);
    }

    const events = ctx.organizerEvents ?? [];
    if (events.length) {
      lines.push(`\nMy Events (${events.length}):`);
      events.slice(0, 8).forEach((e: any) =>
        lines.push(
          `  - "${e.title}" | ${e.category} | ${fmt(e.startDate)} → ${fmt(e.endDate)} | Price: ${e.ticketPrice === 0 ? "Free" : cur(e.ticketPrice)} | Tickets: ${e.remainingTickets ?? "?"}/${e.totalTickets ?? "?"} remaining | Status: ${e.status}`
        )
      );
    } else {
      lines.push(`\nMy Events: None`);
    }

    const reviews = ctx.organizerReviews ?? [];
    if (reviews.length) {
      lines.push(`\nEvent Reviews Received (${reviews.length}):`);
      reviews.slice(0, 5).forEach((r: any) =>
        lines.push(
          `  - ${r.rating}★ on "${r.eventTitle}" by ${r.attendeeName}: "${r.comment?.slice(0, 60)}…"`
        )
      );
    }

    const vr = ctx.organizerVenueRequests ?? [];
    if (vr.length) {
      lines.push(`\nVenue Booking Requests (${vr.length}):`);
      vr.slice(0, 5).forEach((r: any) =>
        lines.push(
          `  - Place: ${r.placeName} | For event: ${r.eventTitle ?? "?"} | Date: ${fmt(r.requestedDate)} | Status: ${r.status}`
        )
      );
    }
  }

  // ── PLACE OWNER ───────────────────────────────────────────────────────────
  if (ctx.role === "Owner" || ctx.role === "PlaceOwner") {
    const p = ctx.ownerProfile;
    if (p) {
      if (p.email) lines.push(`Email: ${p.email}`);
      if (p.phoneNumber) lines.push(`Phone: ${p.phoneNumber}`);
      if (p.location) lines.push(`Location: ${p.location}`);
    }

    const s = ctx.ownerStats;
    if (s) {
      lines.push(`\nDashboard Summary:`);
      lines.push(`  Total Places: ${s.totalPlaces ?? 0} | Active: ${s.activePlaces ?? 0} | Pending: ${s.pendingPlaces ?? 0}`);
      lines.push(`  Booking Requests: ${s.totalBookingRequests ?? 0} | Pending: ${s.pendingRequests ?? 0} | Confirmed: ${s.confirmedRequests ?? 0}`);
      lines.push(`  Total Earnings: ${cur(s.totalEarnings)} | Available Balance: ${cur(s.availableBalance)}`);
      lines.push(`  Average Place Rating: ${s.averageRating ?? "N/A"}`);
    }

    const places = ctx.ownerPlaces ?? [];
    if (places.length) {
      lines.push(`\nMy Places (${places.length}):`);
      places.forEach((pl: any) =>
        lines.push(
          `  - "${pl.name}" | ${pl.location} | Hourly: ${cur(pl.hourlyPrice)} / Daily: ${cur(pl.dailyPrice)} | Status: ${pl.status}`
        )
      );
    } else {
      lines.push(`\nMy Places: None`);
    }

    const req = ctx.ownerBookingRequests ?? [];
    const pendingReq = req.filter((r: any) =>
      String(r.status).toLowerCase().includes("pending") || r.status === 0
    );
    if (req.length) {
      lines.push(`\nBooking Requests (${req.length} total, ${pendingReq.length} pending):`);
      req.slice(0, 8).forEach((r: any) =>
        lines.push(
          `  - Place: ${r.placeName} | Organizer: ${r.organizerName} | Date: ${fmt(r.requestedDate)} | Status: ${r.status}`
        )
      );
    }

    const reviews = ctx.ownerReviews ?? [];
    if (reviews.length) {
      lines.push(`\nReviews Received (${reviews.length}):`);
      reviews.slice(0, 5).forEach((r: any) =>
        lines.push(
          `  - ${r.rating ?? "?"}★ on "${r.placeName ?? "?"}" by ${r.reviewerName ?? "?"}: "${String(r.comment ?? "").slice(0, 60)}…"`
        )
      );
    }
  }

  // ── ADMIN ─────────────────────────────────────────────────────────────────
  if (ctx.role === "Admin") {
    const s = ctx.adminStats;
    if (s) {
      lines.push(`\nPlatform-Wide Stats:`);
      lines.push(`  Users: ${s.totalUsers ?? 0} total | ${s.totalAttendees ?? 0} attendees | ${s.totalOrganizers ?? 0} organizers | ${s.totalOwners ?? 0} venue owners`);
      lines.push(`  Places: ${s.totalPlaces ?? 0} | Pending approval: ${s.pendingPlaces ?? 0}`);
      lines.push(`  Events: ${s.totalEvents ?? 0} | Pending: ${s.pendingEvents ?? 0} | Completed: ${s.completedEvents ?? 0}`);
      lines.push(`  Reviews: ${s.totalReviews ?? 0} | Avg Rating: ${s.averageRating ?? "N/A"}`);
      lines.push(`  Total Bookings: ${s.totalBookings ?? 0}`);
      lines.push(`  Platform Earnings: ${cur(s.totalEarnings)}`);
    }
  }

  lines.push(`\n=== END USER CONTEXT ===`);
  return lines.join("\n");
}

/** Quick-suggestion chips tailored to each role. */
function chipsForRole(role: string | null): string[] {
  switch (role) {
    case "Organizer":
      return ["My events", "My revenue", "Pending venue requests", "My reviews"];
    case "Owner":
    case "PlaceOwner":
      return ["My places", "Pending requests", "My earnings", "My reviews"];
    case "Admin":
      return ["Platform stats", "Pending events", "Pending places", "Total users"];
    default: // Attendee / guest
      return ["My bookings", "My wishlist", "Upcoming events", "My loyalty points"];
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AiChatbot() {
  // Auth & role — read synchronously (no hook) so hooks always run in same order.
  const role = getUserRole();
  const isAuthenticated = !!localStorage.getItem("forsa_token");

  // ── State ─────────────────────────────────────────────────────────────────
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [contextLoading, setContextLoading] = useState(false);
  const [context, setContext] = useState<UserContext | null>(null);
  const contextFetchedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isLoading]);

  // ── Context fetch — role-aware ─────────────────────────────────────────────
  const fetchContext = useCallback(async () => {
    if (contextFetchedRef.current) return;
    const userId = getUserIdFromToken();
    if (!userId) return;

    setContextLoading(true);

    try {
      let ctx: UserContext = { role: role ?? "Unknown", userName: "" };

      if (role === "Attendee" || role === null) {
        // ── Attendee ──────────────────────────────────────────────────────
        const [profile, bookings, wishlist, attended] = await Promise.allSettled([
          attendeeApi.getProfile(userId),
          attendeeApi.getBookings(userId),
          attendeeApi.getWishlist(userId),
          attendeeApi.getAttendedEvents(userId),
        ]);
        ctx.role = "Attendee";
        ctx.profile = profile.status === "fulfilled" ? profile.value : null;
        ctx.bookings = bookings.status === "fulfilled" ? bookings.value : [];
        ctx.wishlist = wishlist.status === "fulfilled" ? wishlist.value : [];
        ctx.attendedEvents = attended.status === "fulfilled" ? attended.value : [];
        ctx.userName = ctx.profile?.fullName ?? "";

      } else if (role === "Organizer") {
        // ── Organizer ─────────────────────────────────────────────────────
        const [profile, stats, events, reviews, venueReqs] = await Promise.allSettled([
          organizerApi.getProfile(userId),
          organizerApi.getDashboardStats(userId),
          organizerApi.getEventsDashboard(userId),
          organizerApi.getOrganizerReviews(userId),
          organizerApi.getOrganizerBookingRequests(userId),
        ]);
        ctx.organizerProfile = profile.status === "fulfilled" ? profile.value : null;
        ctx.organizerStats = stats.status === "fulfilled" ? stats.value : null;
        ctx.organizerEvents = events.status === "fulfilled" ? events.value : [];
        ctx.organizerReviews = reviews.status === "fulfilled" ? reviews.value : [];
        ctx.organizerVenueRequests = venueReqs.status === "fulfilled" ? venueReqs.value : [];
        ctx.userName = ctx.organizerProfile?.fullName ?? ctx.organizerProfile?.userName ?? "";

      } else if (role === "Owner" || role === "PlaceOwner") {
        // ── Place Owner ───────────────────────────────────────────────────
        const [profile, stats, places, bookingReqs, reviews] = await Promise.allSettled([
          ownerApi.getProfile(userId),
          ownerApi.getDashboardStats(),
          ownerApi.getPlaces(),
          ownerApi.getBookingRequests(),
          ownerApi.getOwnerReviews(),
        ]);
        ctx.ownerProfile = profile.status === "fulfilled" ? profile.value : null;
        ctx.ownerStats = stats.status === "fulfilled" ? stats.value : null;
        ctx.ownerPlaces = places.status === "fulfilled" ? places.value : [];
        ctx.ownerBookingRequests = bookingReqs.status === "fulfilled" ? bookingReqs.value : [];
        ctx.ownerReviews = reviews.status === "fulfilled" ? reviews.value : [];
        ctx.userName = ctx.ownerProfile?.fullName ?? ctx.ownerProfile?.userName ?? "";

      } else if (role === "Admin") {
        // ── Admin ─────────────────────────────────────────────────────────
        const [stats] = await Promise.allSettled([
          adminApi.getDashboardStats(),
        ]);
        ctx.adminStats = stats.status === "fulfilled" ? stats.value : null;
        ctx.userName = "Admin";
      }

      setContext(ctx);
      contextFetchedRef.current = true;
    } catch (err) {
      console.error("Failed to load user context for chatbot", err);
    } finally {
      setContextLoading(false);
    }
  }, [role]);

  // ── Open handler ──────────────────────────────────────────────────────────
  const handleOpen = () => {
    if (!isAuthenticated) {
      toast.info("Please sign in to use the Forsa AI Assistant");
      return;
    }
    setIsOpen(true);
    fetchContext();
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const sendText = async (text: string) => {
    if (!text.trim()) return;
    if (!isAuthenticated) {
      toast.info("Please sign in to use the Forsa AI Assistant");
      return;
    }

    setMessage("");
    setHistory((prev) => [...prev, { content: text, isUser: true }]);
    setIsLoading(true);

    try {
      const systemContext = context ? buildSystemContext(context) : "";
      const res = await apiPost<{ response: string }>("/api/LLM/ask", {
        message: text,
        history,
        ...(systemContext ? { systemContext } : {}),
      });
      setHistory((prev) => [
        ...prev,
        { content: res.response || "No response received.", isUser: false },
      ]);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to get a response from the AI");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => sendText(message);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Derived display values ────────────────────────────────────────────────
  const userName = context?.userName?.split(" ")[0] || null;
  const chips = chipsForRole(role);
  const greetingLine = contextLoading
    ? "Loading your profile…"
    : userName
    ? `Hi ${userName}! How can I help you today?`
    : "Hello! How can I help you today?";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <RobotLauncher isOpen={isOpen} onOpen={handleOpen} />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 left-6 w-[350px] sm:w-[400px] h-[540px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-[var(--brand-deep-navy)] text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">Forsa AI Assistant</h3>
                  {context?.userName && (
                    <p className="text-white/50 text-[10px] flex items-center gap-1">
                      <User className="w-2.5 h-2.5" />
                      {context.userName}
                      {role && role !== "Attendee" && (
                        <span className="ml-1 text-white/30">· {role}</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
              {history.length === 0 && (
                <div className="text-center mt-8 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--brand-deep-navy)]/10 flex items-center justify-center mx-auto">
                    <Bot className="w-6 h-6 text-[var(--brand-navy)]" />
                  </div>
                  {contextLoading ? (
                    <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Loading your profile…
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm px-4">{greetingLine}</p>
                  )}
                </div>
              )}

              {history.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.isUser
                        ? "bg-[var(--brand-deep-navy)] text-white rounded-br-sm"
                        : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm bg-white border border-slate-200 text-slate-400 shadow-sm flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--brand-navy)]" />
                    <span>Thinking…</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Pinned Quick suggestion chips */}
            {!contextLoading && (
              <div 
                className="px-3 py-2 bg-slate-50/95 backdrop-blur border-t border-slate-100 flex gap-1.5 overflow-x-auto shrink-0 no-scrollbar"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                <style>{`
                  .no-scrollbar::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                {chips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => sendText(chip)}
                    className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-[var(--brand-deep-navy)] hover:text-white hover:border-[var(--brand-deep-navy)] transition-all shrink-0 shadow-sm"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything…"
                disabled={contextLoading}
                className="flex-1 px-4 py-2.5 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-[var(--brand-navy)]/30 text-sm disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !message.trim() || contextLoading}
                className="w-10 h-10 bg-[var(--brand-deep-navy)] text-white rounded-xl flex items-center justify-center hover:bg-[var(--brand-navy)] disabled:opacity-40 transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
