import { useState, useEffect } from "react";
import {
  Search,
  Trash2,
  Loader2,
  Sparkles,
  MessageSquare,
  Star,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { adminApi, AdminReviewDTO } from "../../api/adminApi";

type FilterType = "all" | "event" | "place";

export default function ManageReviewsPage() {
  const [reviews, setReviews] = useState<AdminReviewDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const [deletingReview, setDeletingReview] = useState<AdminReviewDTO | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);

  async function fetchReviews() {
    setLoading(true);
    try {
      const data = await adminApi.getAllReviews();
      setReviews(data ?? []);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to load reviews");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReviews();
  }, []);

  const filtered = reviews.filter((r) => {
    // Filter by type
    if (filter === "event" && r.targetType.toLowerCase() !== "event")
      return false;
    if (filter === "place" && r.targetType.toLowerCase() !== "place")
      return false;

    // Filter by search
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      r.targetName?.toLowerCase().includes(q) ||
      r.reviewerName?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q)
    );
  });

  async function handleDelete() {
    if (!deletingReview) return;
    setSubmitting(true);
    try {
      await adminApi.deleteReview(deletingReview.id);
      toast.success(
        <div className="flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-500" />
          <span>Review deleted successfully.</span>
        </div>,
      );
      setReviews((prev) =>
        prev.map((r) =>
          r.id === deletingReview.id ? { ...r, isDeleted: true } : r,
        ),
      );
      setDeletingReview(null);
    } catch (e: any) {
      toast.error(`Deletion failed: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto pb-12 relative z-0">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-orange-400/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
      >
        <div className="relative">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-100 mb-4">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-amber-700 text-sm font-['Inter:SemiBold',sans-serif]">
              Review Moderation
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-['Inter:Bold',sans-serif] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
            Platform Reviews
          </h1>
          <p className="text-slate-500 font-['Inter:Medium',sans-serif] mt-3 text-[16px] max-w-xl">
            Monitor community feedback across all events and venues. Identify
            and remove abusive or inappropriate reviews.
          </p>
        </div>

        <div className="flex flex-col items-end gap-4 w-full lg:w-auto">
          {/* Tabs */}
          <div className="relative flex bg-slate-100/80 p-1.5 rounded-xl backdrop-blur-md border border-slate-200">
            {filter === "all" && (
              <motion.div
                layoutId="activeReviewTab"
                className="absolute top-1.5 bottom-1.5 left-1.5 w-[calc(33.33%-0.375rem)] bg-white rounded-lg shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {filter === "event" && (
              <motion.div
                layoutId="activeReviewTab"
                className="absolute top-1.5 bottom-1.5 left-[calc(33.33%+0.375rem)] w-[calc(33.33%-0.375rem)] bg-white rounded-lg shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {filter === "place" && (
              <motion.div
                layoutId="activeReviewTab"
                className="absolute top-1.5 bottom-1.5 right-1.5 w-[calc(33.33%-0.375rem)] bg-white rounded-lg shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}

            <button
              onClick={() => setFilter("all")}
              className={`relative z-10 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-['Inter:SemiBold',sans-serif] w-28 transition-colors ${
                filter === "all"
                  ? "text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("event")}
              className={`relative z-10 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-['Inter:SemiBold',sans-serif] w-28 transition-colors ${
                filter === "event"
                  ? "text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Events
            </button>
            <button
              onClick={() => setFilter("place")}
              className={`relative z-10 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-['Inter:SemiBold',sans-serif] w-28 transition-colors ${
                filter === "place"
                  ? "text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Venues
            </button>
          </div>

          <div className="relative w-full lg:w-[360px] group">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
            <div className="relative flex items-center bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-amber-500/10 focus-within:border-amber-300 transition-all">
              <Search className="w-5 h-5 ml-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search reviews or users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-3 pr-4 py-3.5 bg-transparent border-none focus:outline-none font-['Inter:Medium',sans-serif] text-[14px] text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center justify-center py-32 bg-white/50 backdrop-blur-xl rounded-[2rem] border border-white shadow-sm"
          >
            <div className="w-16 h-16 relative flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-amber-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin" />
            </div>
            <p className="text-slate-600 font-['Inter:Bold',sans-serif] mt-4 tracking-wide text-sm">
              FETCHING REVIEWS
            </p>
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            key={`empty-${filter}-${search ? "search" : "all"}`}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center justify-center py-32 bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white shadow-sm"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-200/50">
              <MessageSquare className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-slate-900 font-['Inter:Bold',sans-serif] text-[20px] mb-2 tracking-tight">
              No Reviews Found
            </h3>
            <p className="text-slate-500 font-['Inter:Medium',sans-serif] text-[15px] max-w-md text-center">
              {search
                ? "No reviews match your current search criteria."
                : "There are no reviews left on the platform yet."}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={`grid-${filter}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((review, i) => (
              <motion.div
                layout
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{
                  delay: i * 0.05,
                  duration: 0.4,
                  type: "spring",
                  bounce: 0.3,
                }}
                className={`group relative bg-white rounded-[2rem] p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-1 border transition-all duration-300 flex flex-col ${
                  review.isDeleted
                    ? "border-red-200 bg-red-50/30"
                    : "border-slate-100"
                }`}
              >
                {/* Status Badges */}
                <div className="absolute top-6 right-6 flex flex-col gap-2 items-end">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-['Inter:Bold',sans-serif] shadow-sm ${
                      review.targetType.toLowerCase() === "event"
                        ? "bg-purple-50 text-purple-600 border border-purple-200/50"
                        : "bg-blue-50 text-blue-600 border border-blue-200/50"
                    }`}
                  >
                    {review.targetType}
                  </span>

                  {review.isDeleted && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-['Inter:Bold',sans-serif] shadow-sm bg-red-100 text-red-600 border border-red-200/50">
                      Deleted
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-4 mb-4 pr-20">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center border border-amber-200/50 shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform mt-1">
                    <span className="text-amber-600 font-['Inter:Bold',sans-serif] text-lg">
                      {review.reviewerName?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[16px] leading-tight font-['Inter:Bold',sans-serif] text-slate-900 mb-0.5 truncate">
                      {review.reviewerName}
                    </h3>
                    <p className="text-[12px] font-['Inter:Medium',sans-serif] text-slate-400">
                      {review.reviewerType} • {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="mb-4">{renderStars(review.rating)}</div>

                <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-100/80 mb-5">
                  <p className="text-[11px] font-['Inter:SemiBold',sans-serif] text-slate-400 uppercase tracking-wider mb-1">
                    Target
                  </p>
                  <p className="text-[14px] font-['Inter:Bold',sans-serif] text-slate-800 truncate">
                    {review.targetName}
                  </p>
                </div>

                <div className="flex-1 mb-6">
                  <p className="text-slate-600 font-['Inter:Regular',sans-serif] text-[14px] leading-relaxed line-clamp-4 relative">
                    <span className="text-3xl font-serif text-slate-200 absolute -top-3 -left-2">
                      "
                    </span>
                    <span className="relative z-10 pl-2">{review.comment}</span>
                  </p>
                </div>

                <div className="mt-auto">
                  {!review.isDeleted && (
                    <button
                      onClick={() => setDeletingReview(review)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white border-2 border-red-100 text-red-600 font-['Inter:Bold',sans-serif] text-[14px] hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Review
                    </button>
                  )}
                  {review.isDeleted && (
                    <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 border-2 border-slate-100 text-slate-400 font-['Inter:Bold',sans-serif] text-[14px]">
                      Already Deleted
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !submitting && setDeletingReview(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 to-red-600" />

              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>

              <h2 className="text-2xl font-['Inter:Bold',sans-serif] text-slate-900 mb-3">
                Delete Review
              </h2>
              <p className="text-slate-500 font-['Inter:Medium',sans-serif] text-[15px] mb-8 leading-relaxed">
                Are you sure you want to delete this review by{" "}
                <strong>{deletingReview.reviewerName}</strong>? This action
                cannot be undone.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  disabled={submitting}
                  onClick={handleDelete}
                  className="w-full py-3.5 rounded-xl bg-red-500 text-white font-['Inter:Bold',sans-serif] text-[15px] hover:bg-red-600 shadow-[0_4px_15px_rgba(239,68,68,0.3)] hover:shadow-[0_8px_20px_rgba(239,68,68,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Yes, delete review"
                  )}
                </button>
                <button
                  disabled={submitting}
                  onClick={() => setDeletingReview(null)}
                  className="w-full py-3.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-['Inter:Bold',sans-serif] text-[15px] hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
