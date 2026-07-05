import { useState, useEffect } from "react";
import { Search, Calendar, MapPin, CheckCircle, XCircle, Clock, Check, X, CalendarCheck, Loader2, ClipboardList, Star, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ownerApi, BookingRequest } from "../../api/ownerApi";
import { toast } from "sonner";

type Tab = "all" | "pending" | "accepted" | "rejected";

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: number; accept: boolean } | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{ bookingId: number, organizerName: string } | null>(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const data = await ownerApi.getBookingRequests();
      setBookings(data);
    } catch {
      toast.error("Failed to load booking requests.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: number, accept: boolean) => {
    try {
      setIsProcessing(id);
      const updatedRequest = await ownerApi.processBookingRequest(id, accept, accept ? undefined : "Owner rejected");
      setBookings(bookings.map(b => b.id === id ? updatedRequest : b));
      toast.success(`Booking ${accept ? "accepted ✓" : "rejected"} successfully.`);
    } catch {
      toast.error(`Failed to ${accept ? "accept" : "reject"} booking.`);
    } finally {
      setIsProcessing(null);
      setConfirmAction(null);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackModal || rating === 0) return;
    setIsSubmittingFeedback(true);
    try {
      await ownerApi.submitOrganizerFeedback(feedbackModal.bookingId, { rating, comment });
      toast.success("Feedback submitted successfully!");
      setFeedbackModal(null);
      setRating(0);
      setComment("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit feedback");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const getStatusKey = (status: string | number): "pending" | "accepted" | "rejected" => {
    const s = String(status).toLowerCase();
    if (s === "1" || s === "accepted") return "accepted";
    if (s === "2" || s === "rejected") return "rejected";
    return "pending";
  };

  const statusConfigs = {
    pending: { label: "Pending", icon: <Clock className="w-3 h-3" />, className: "text-amber-700 bg-amber-50 border-amber-200" },
    accepted: { label: "Accepted", icon: <CheckCircle className="w-3 h-3" />, className: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    rejected: { label: "Rejected", icon: <XCircle className="w-3 h-3" />, className: "text-rose-700 bg-rose-50 border-rose-200" },
  };

  const counts = {
    all: bookings.length,
    pending: bookings.filter(b => getStatusKey(b.status) === "pending").length,
    accepted: bookings.filter(b => getStatusKey(b.status) === "accepted").length,
    rejected: bookings.filter(b => getStatusKey(b.status) === "rejected").length,
  };

  const tabs: { key: Tab; label: string; color: string; activeClass: string; dotColor: string }[] = [
    { key: "all", label: "All", color: "text-slate-500", activeClass: "bg-white text-slate-800 shadow-sm border border-slate-200", dotColor: "bg-slate-400" },
    { key: "pending", label: "Pending", color: "text-amber-600", activeClass: "bg-amber-50 text-amber-700 shadow-sm border border-amber-200", dotColor: "bg-amber-500" },
    { key: "accepted", label: "Accepted", color: "text-emerald-600", activeClass: "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-200", dotColor: "bg-emerald-500" },
    { key: "rejected", label: "Rejected", color: "text-rose-600", activeClass: "bg-rose-50 text-rose-700 shadow-sm border border-rose-200", dotColor: "bg-rose-500" },
  ];

  const filteredBookings = bookings
    .filter(b => activeTab === "all" || getStatusKey(b.status) === activeTab)
    .filter(b =>
      b.organizerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.placeName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-6 pb-12">

      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-indigo-500" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Booking Management</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manage Bookings</h1>
            <p className="text-slate-400 text-sm mt-1">Review and respond to incoming reservation requests</p>
          </div>

          {counts.pending > 0 && (
            <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 shadow-sm flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-amber-700 font-bold text-sm">{counts.pending} pending {counts.pending === 1 ? "request" : "requests"}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── TABS + SEARCH ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 flex-shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === tab.key ? tab.activeClass : `${tab.color} hover:bg-white/60`
                }`}
            >
              {tab.label}
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${activeTab === tab.key ? "bg-white/80 text-slate-700 shadow-sm" : "bg-slate-200/80 text-slate-500"
                }`}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search organizer or venue..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 bg-white border border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/8 focus:outline-none transition-all shadow-sm"
          />
        </div>
      </motion.div>

      {/* ── CONTENT ── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-slate-400 font-semibold text-sm tracking-wide">Loading requests…</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">

          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[1.2fr_1.4fr_100px_110px_170px] gap-4 px-6 py-3.5 border-b border-slate-100 bg-slate-50/70">
            {["Organizer", "Venue & Date", "Requested", "Status", "Actions"].map(h => (
              <span key={h} className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{h}</span>
            ))}
          </div>

          <div className="divide-y divide-slate-100">
            <AnimatePresence mode="popLayout">
              {filteredBookings.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-slate-50 border border-slate-100">
                    <CalendarCheck className="w-7 h-7 text-slate-300" />
                  </div>
                  <div className="text-center">
                    <p className="text-slate-700 font-bold text-base">
                      {searchTerm ? "No results found" : `No ${activeTab === "all" ? "" : activeTab} bookings`}
                    </p>
                    <p className="text-slate-400 text-sm mt-1">
                      {searchTerm ? "Try a different search term" : "They'll appear here when available"}
                    </p>
                  </div>
                </motion.div>
              ) : (
                filteredBookings.map((booking, i) => {
                  const sk = getStatusKey(booking.status);
                  const cfg = statusConfigs[sk];
                  const isPending = sk === "pending";

                  const leftAccent =
                    sk === "pending" ? "border-l-amber-400" :
                      sk === "accepted" ? "border-l-emerald-400" :
                        "border-l-rose-400";

                  return (
                    <motion.div
                      key={booking.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ delay: i * 0.035, duration: 0.25 }}
                      className={`group border-l-2 ${leftAccent} px-6 py-4 hover:bg-slate-50/60 transition-colors`}
                    >
                      {/* Mobile */}
                      <div className="sm:hidden space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border text-sm font-bold flex-shrink-0 ${sk === "pending" ? "bg-amber-50 border-amber-200 text-amber-600" :
                                sk === "accepted" ? "bg-emerald-50 border-emerald-200 text-emerald-600" :
                                  "bg-rose-50 border-rose-200 text-rose-500"
                              }`}>
                              {booking.organizerName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-slate-800 text-sm font-bold leading-tight">{booking.organizerName}</p>
                              <p className="text-slate-400 text-xs">{booking.placeName}</p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.className}`}>
                            {cfg.icon}{cfg.label}
                          </span>
                        </div>
                        {isPending && (
                          <div className="flex gap-2">
                            <button onClick={() => setConfirmAction({ id: booking.id, accept: true })}
                              disabled={isProcessing === booking.id}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors disabled:opacity-50">
                              {isProcessing === booking.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Accept
                            </button>
                            <button onClick={() => setConfirmAction({ id: booking.id, accept: false })}
                              disabled={isProcessing === booking.id}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors disabled:opacity-50">
                              <X className="w-3 h-3" /> Reject
                            </button>
                          </div>
                        )}
                        {sk === "accepted" && new Date(booking.requestedDate) < new Date() && (
                          <div className="mt-2">
                            <button
                              onClick={() => setFeedbackModal({ bookingId: booking.id, organizerName: booking.organizerName })}
                              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
                            >
                              <Star className="w-3.5 h-3.5" /> Rate Organizer
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Desktop */}
                      <div className="hidden sm:grid grid-cols-[1.2fr_1.4fr_100px_110px_170px] gap-4 items-center">
                        {/* Organizer avatar + name */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 border ${sk === "pending" ? "bg-amber-50 border-amber-200 text-amber-700" :
                              sk === "accepted" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                                "bg-rose-50 border-rose-200 text-rose-600"
                            }`}>
                            {booking.organizerName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-slate-800 text-sm font-bold truncate">{booking.organizerName}</p>
                            <p className="text-slate-400 text-xs">Organizer</p>
                          </div>
                        </div>

                        {/* Venue + Date */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 text-slate-700 text-sm font-semibold truncate">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{booking.placeName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-0.5">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span>{new Date(booking.requestedDate).toLocaleDateString("en-EG", { day: "numeric", month: "short", year: "numeric" })}</span>
                          </div>
                        </div>

                        {/* Requested on */}
                        <span className="text-slate-500 text-xs font-medium">
                          {new Date(booking.createdAt).toLocaleDateString("en-EG", { day: "numeric", month: "short" })}
                        </span>

                        {/* Status badge */}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border w-fit ${cfg.className}`}>
                          {cfg.icon}{cfg.label}
                        </span>

                        {/* Actions */}
                        <div className="flex items-center gap-2 justify-end">
                          {isPending ? (
                            <>
                              <button onClick={() => setConfirmAction({ id: booking.id, accept: true })}
                                disabled={isProcessing === booking.id}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-50">
                                {isProcessing === booking.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                Accept
                              </button>
                              <button onClick={() => setConfirmAction({ id: booking.id, accept: false })}
                                disabled={isProcessing === booking.id}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-sm disabled:opacity-50">
                                <X className="w-3.5 h-3.5" /> Decline
                              </button>
                            </>
                          ) : sk === "accepted" ? (
                            <div className="flex items-center gap-2">
                              {new Date(booking.requestedDate) < new Date() && (
                                <button
                                  onClick={() => setFeedbackModal({ bookingId: booking.id, organizerName: booking.organizerName })}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors shadow-sm"
                                >
                                  <Star className="w-3.5 h-3.5" /> Rate
                                </button>
                              )}
                              <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
                                <CheckCircle className="w-3.5 h-3.5" /> Accepted
                              </span>
                            </div>
                          ) : (
                            <span className="flex items-center gap-1.5 text-rose-500 text-xs font-semibold">
                              <XCircle className="w-3.5 h-3.5" /> Declined
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

          {/* Footer count */}
          {filteredBookings.length > 0 && (
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                Showing <span className="font-bold text-slate-600">{filteredBookings.length}</span> of <span className="font-bold text-slate-600">{counts.all}</span> requests
              </span>
              {activeTab !== "all" && (
                <button onClick={() => setActiveTab("all")} className="text-xs text-indigo-500 font-semibold hover:underline">
                  View all
                </button>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* ── CONFIRM MODAL ── */}
      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setConfirmAction(null)}
            />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative rounded-2xl w-full max-w-sm p-7 bg-white shadow-2xl border border-slate-100 text-center overflow-hidden"
            >
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${confirmAction.accept ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-rose-400 to-rose-600'}`} />

              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 mt-2 ${confirmAction.accept ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"}`}>
                {confirmAction.accept ? <Check className="w-7 h-7" /> : <X className="w-7 h-7" />}
              </div>
              <h3 className="text-slate-800 font-extrabold text-xl mb-2">{confirmAction.accept ? "Accept Booking?" : "Decline Booking?"}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {confirmAction.accept
                  ? "The organizer will be notified that their booking has been accepted."
                  : "The organizer will be notified that their booking was declined."}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmAction(null)} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button onClick={() => updateStatus(confirmAction.id, confirmAction.accept)}
                  disabled={isProcessing !== null}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 ${confirmAction.accept ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'} disabled:opacity-60`}>
                  {isProcessing !== null ? <Loader2 className="w-4 h-4 animate-spin" /> : (confirmAction.accept ? "Yes, Accept" : "Yes, Decline")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── FEEDBACK MODAL ── */}
      <AnimatePresence>
        {feedbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !isSubmittingFeedback && setFeedbackModal(null)}
            />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative rounded-2xl w-full max-w-md p-7 bg-white shadow-2xl border border-slate-100"
            >
              <h3 className="text-slate-800 font-extrabold text-xl mb-1 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Rate Organizer
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                How was your experience hosting <span className="font-bold text-slate-700">{feedbackModal.organizerName}</span>?
              </p>

              <div className="mb-6 flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110 p-1"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${star <= (hoveredRating || rating)
                          ? "fill-amber-500 text-amber-500"
                          : "text-slate-200"
                        }`}
                    />
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-400" /> Add a comment (optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about their communication, setup, etc."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 resize-none h-24"
                />
              </div>

              <div className="flex gap-2">
                <button onClick={() => { setFeedbackModal(null); setRating(0); setComment(""); }} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50" disabled={isSubmittingFeedback}>
                  Cancel
                </button>
                <button onClick={handleFeedbackSubmit}
                  disabled={rating === 0 || isSubmittingFeedback}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                  {isSubmittingFeedback ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Feedback"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
