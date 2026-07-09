import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Star, User, Calendar, Edit2, Trash2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { apiGet } from "../../api/api";
import { parseBackendDate } from "../../utils/mappers";
import { getUserIdFromToken } from "../../api/api";

interface FeedbackDTO {
  id?: number;
  rating: number;
  comment: string;
  attendeeName: string;
  eventTitle: string;
  attendeeId?: number;
  attendeeImageUrl?: string;
  createdAt?: string;
}

/** Resolve attendee image URL, handling relative paths and double-slash edge cases */
function resolveImageUrl(rawUrl: string | undefined): string {
  if (!rawUrl) return "";
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) return rawUrl;
  const base = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/+$/, "");
  const path = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;
  return `${base}${path}`;
}

/** Generate a deterministic hue from a name for avatar background */
function nameToHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
}

export default function EventFeedbacksPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [feedbacks, setFeedbacks] = useState<FeedbackDTO[]>([]);
  const [eventTitle, setEventTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const userId = getUserIdFromToken();
    setCurrentUserId(userId);

    const fetchFeedbacks = async () => {
      if (!eventId) return;
      try {
        setLoading(true);
        const data = await apiGet<FeedbackDTO[]>(`/api/events/${eventId}/feedbacks`);
        setFeedbacks(data);
        if (data.length > 0) {
          setEventTitle(data[0].eventTitle || "Event");
          const total = data.reduce((sum, f) => sum + f.rating, 0);
          setAverageRating(Math.round((total / data.length) * 10) / 10);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load feedbacks");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [eventId]);

  /** Count feedbacks per star level (5 → 1) */
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: feedbacks.filter((f) => Math.floor(f.rating) === star).length,
  }));

  const renderStars = (rating: number, size = "w-5 h-5") =>
    Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`${size} transition-all duration-200 ${
          i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "text-white/20"
        }`}
      />
    ));

  const renderStarsDark = (rating: number, size = "w-4 h-4") =>
    Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`${size} ${i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
      />
    ));

  const handleEdit = () => navigate(`/events/${eventId}/feedback/edit`);
  const handleDelete = () => navigate(`/events/${eventId}/feedback/delete`);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--brand-page-background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--brand-navy)] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium tracking-wide">Loading reviews…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--brand-page-background)] pb-24">

      {/* ── Hero Header ──────────────────────────────────────────── */}
      <div className="bg-[var(--brand-deep-navy)] pt-24 pb-20 px-4 relative overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute inset-0 z-0 overflow-hidden mix-blend-screen pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full filter blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--brand-blue-accent)]/20 rounded-full filter blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <Link
            to={`/events/${eventId}`}
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors text-sm font-medium backdrop-blur-md bg-white/5 px-4 py-2 rounded-full border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Event
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-white/50 text-sm font-medium uppercase tracking-widest mb-2">
              Community Feedback
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
              {eventTitle || "Event Reviews"}
            </h1>

            {feedbacks.length > 0 && (
              <div className="flex flex-wrap items-center gap-6">
                {/* Big score */}
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-white">{averageRating}</span>
                  <span className="text-white/50 text-lg">/&nbsp;5</span>
                </div>

                {/* Stars + count */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1">{renderStars(averageRating)}</div>
                  <span className="text-white/50 text-sm">
                    Based on {feedbacks.length} {feedbacks.length === 1 ? "review" : "reviews"}
                  </span>
                </div>

                {/* Breakdown bars */}
                <div className="flex-1 min-w-[200px] max-w-xs space-y-1.5">
                  {ratingBreakdown.map(({ star, count }) => {
                    const pct = feedbacks.length ? Math.round((count / feedbacks.length) * 100) : 0;
                    return (
                      <div key={star} className="flex items-center gap-2 text-xs text-white/60">
                        <span className="w-3 text-right">{star}</span>
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-amber-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.3 + (5 - star) * 0.05 }}
                          />
                        </div>
                        <span className="w-6 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-100 p-8 md:p-10">

          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-[var(--brand-blue-accent)]" />
              All Reviews
              <span className="text-sm font-normal px-3 py-1 bg-slate-100 text-slate-500 rounded-full">
                {feedbacks.length}
              </span>
            </h2>
          </div>

          <AnimatePresence>
            {feedbacks.length > 0 ? (
              <div className="space-y-6">
                {feedbacks.map((feedback, index) => {
                  const isMyFeedback = currentUserId && feedback.attendeeId === currentUserId;
                  const imgUrl = resolveImageUrl(feedback.attendeeImageUrl);
                  const hue = nameToHue(feedback.attendeeName);

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className={`group relative rounded-2xl border transition-all duration-300
                        ${isMyFeedback
                          ? "border-[var(--brand-blue-accent)]/30 bg-gradient-to-br from-blue-50/60 to-white shadow-[0_0_0_1px_rgba(59,130,246,0.15)]"
                          : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-md"
                        } p-7`}
                    >
                      {/* "My review" badge */}
                      {isMyFeedback && (
                        <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full">
                          Your review
                        </span>
                      )}

                      {/* Top row: avatar + name + date + stars + actions */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Avatar */}
                          <div
                            className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-offset-1"
                            style={{ ringColor: `hsl(${hue},60%,70%)` }}
                          >
                            {imgUrl ? (
                              <img
                                src={imgUrl}
                                alt={feedback.attendeeName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.style.display = "none";
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.style.background = `linear-gradient(135deg, hsl(${hue},70%,55%), hsl(${hue + 30},70%,50%))`;
                                    parent.innerHTML = `<span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:white;font-weight:700;font-size:18px;">${feedback.attendeeName.charAt(0).toUpperCase()}</span>`;
                                  }
                                }}
                              />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center text-white font-bold text-lg"
                                style={{
                                  background: `linear-gradient(135deg, hsl(${hue},70%,55%), hsl(${hue + 30},70%,50%))`,
                                }}
                              >
                                {feedback.attendeeName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>

                          {/* Name + date */}
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 text-base leading-tight">
                              {feedback.attendeeName}
                            </p>
                            {feedback.createdAt && (
                              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3" />
                                {parseBackendDate(feedback.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Stars + edit/delete */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="flex items-center gap-0.5">
                            {renderStarsDark(feedback.rating)}
                          </div>
                          <span className="text-sm font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg">
                            {feedback.rating}.0
                          </span>

                          {isMyFeedback && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button
                                onClick={handleEdit}
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all hover:scale-105"
                                title="Edit your review"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleDelete}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all hover:scale-105"
                                title="Delete your review"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Comment */}
                      <div className="mt-5 relative pl-4">
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--brand-blue-accent)]/40 to-transparent rounded-full" />
                        <p className="text-slate-600 text-[15px] leading-relaxed">
                          {feedback.comment}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-24"
              >
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                  <Star className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-bold text-slate-700">No reviews yet</h3>
                <p className="text-slate-400 mt-3 max-w-xs mx-auto text-sm leading-relaxed">
                  Be the first to share your experience with this event.
                </p>
                <Link
                  to={`/events/${eventId}`}
                  className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-[var(--brand-deep-navy)] text-white text-sm font-medium rounded-xl hover:bg-[var(--brand-navy)] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Event
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}