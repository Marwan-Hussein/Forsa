import { Link, useNavigate } from "react-router";
import { Plus, Users, Search, Trash2, Edit2, Activity, Tag, CalendarCheck, Sparkles, ScanLine, TrendingUp, Star, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { organizerApi } from "../../api/organizerApi";
import { getUserIdFromToken } from "../../api/api";
import { parseBackendDate } from "../../utils/mappers";
import { toast } from "react-toastify";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";

function renderEventStatusBadge(event: any) {
  const now = new Date();
  const startDate = parseBackendDate(event.startDate);
  const endDate = parseBackendDate(event.endDate);
  const statusStr = (event.status || "").toLowerCase();

  // Cancelled (6)
  if (statusStr === "cancelled" || statusStr === "6") {
    return (
      <span className="px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider font-bold shadow-sm bg-rose-100 text-rose-700 border border-rose-200">
        Cancelled
      </span>
    );
  }
  // Rejected (3)
  if (statusStr === "rejected" || statusStr === "3") {
    return (
      <span className="px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider font-bold shadow-sm bg-rose-100 text-rose-700 border border-rose-200">
        Rejected
      </span>
    );
  }
  // Draft (0)
  if (statusStr === "draft" || statusStr === "0") {
    return (
      <span className="px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider font-bold shadow-sm bg-slate-100 text-slate-650 border border-slate-200">
        Draft
      </span>
    );
  }
  // Pending (1)
  if (statusStr === "pending" || statusStr === "1") {
    return (
      <span className="px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider font-bold shadow-sm bg-amber-100 text-amber-700 border border-amber-200 animate-pulse">
        Pending Approval
      </span>
    );
  }

  const isApprovedOrActive = statusStr === "approved" || statusStr === "published" || statusStr === "soldout" || statusStr === "2" || statusStr === "4" || statusStr === "5";

  // Completed (7)
  if (statusStr === "completed" || statusStr === "7" || (isApprovedOrActive && event.endDate && endDate < now)) {
    return (
      <span className="px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider font-bold shadow-sm bg-emerald-100 text-emerald-700 border border-emerald-200">
        Completed
      </span>
    );
  }

  // Live Now (only if event is approved/published/soldout AND time is between start and end)
  if (isApprovedOrActive && event.startDate && event.endDate && startDate < now && now < endDate) {
    return (
      <span className="px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider font-bold shadow-sm bg-red-100 text-red-700 border border-red-200 animate-pulse flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-red-650 animate-ping" /> Live Now
      </span>
    );
  }

  // Sold Out (5)
  if (event.remainingTickets === 0 || statusStr === "soldout" || statusStr === "5") {
    return (
      <span className="px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider font-bold shadow-sm bg-amber-100 text-amber-700 border border-amber-200">
        Sold Out
      </span>
    );
  }

  // Approved (2)
  if (statusStr === "approved" || statusStr === "2") {
    return (
      <span className="px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider font-bold shadow-sm bg-emerald-100 text-emerald-700 border border-emerald-200">
        Approved
      </span>
    );
  }

  // Published (4)
  if (statusStr === "published" || statusStr === "4") {
    return (
      <span className="px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider font-bold shadow-sm bg-indigo-100 text-indigo-700 border border-indigo-200">
        Published
      </span>
    );
  }

  return (
    <span className="px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider font-bold shadow-sm bg-indigo-100 text-indigo-700 border border-indigo-200">
      {event.status || "Active"}
    </span>
  );
}

export default function OrganizerEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    eventId: number;
    placeId: number;
    placeName: string;
  } | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState<string>("");
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);

  const handleOpenFeedback = (event: any) => {
    setFeedbackModal({
      isOpen: true,
      eventId: event.eventId,
      placeId: event.placeId,
      placeName: event.placeName || "Venue"
    });
    setFeedbackRating(5);
    setFeedbackComment("");
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackModal) return;
    const organizerId = getUserIdFromToken();
    if (!organizerId) return;

    try {
      setSubmittingFeedback(true);
      await organizerApi.submitPlaceFeedback(
        organizerId,
        feedbackModal.placeId,
        feedbackModal.eventId,
        feedbackRating,
        feedbackComment
      );
      toast.success("Feedback submitted successfully!");
      
      setEvents(events.map(e => 
        e.eventId === feedbackModal.eventId 
          ? { ...e, hasReviewedPlace: true } 
          : e
      ));

      setFeedbackModal(null);
    } catch (err: any) {
      toast.error("Failed to submit feedback: " + err.message);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      const organizerId = getUserIdFromToken();
      if (!organizerId) {
        navigate("/login");
        return;
      }
      try {
        const data = await organizerApi.getEventsDashboard(organizerId);
        setEvents(data || []);
      } catch (err: any) {
        toast.error("Failed to load events: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [navigate]);

  const handleDelete = async (eventId: number) => {
    try {
      await organizerApi.cancelEvent(eventId);
      toast.success("Event cancelled successfully!");
      setEvents(events.filter(e => e.eventId !== eventId));
    } catch (err: any) {
      toast.error("Failed to cancel event: " + err.message);
    }
  };

  const filteredEvents = events.filter(event => 
    event.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-16 relative">
      {/* Soft, Professional Ambient Glows */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-indigo-400/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Section */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white shadow-xl shadow-indigo-100/30">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-indigo-700 font-['Inter:Bold',sans-serif] text-xs uppercase tracking-wider">Organizer Portal</span>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-['Outfit:Bold',sans-serif] font-bold text-slate-800 tracking-tight">
              My Events
            </h1>
            <p className="text-slate-500 font-['Inter:Medium',sans-serif] mt-2 text-base">
              Manage your active and past events effectively.
            </p>
          </div>
          <Link 
            to="/organizer/events/new"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white font-['Inter:Bold',sans-serif] font-bold rounded-2xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-1 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Create Event
          </Link>
        </div>
      </motion.div>

      <div className="bg-white/90 backdrop-blur-sm rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-white p-6 lg:p-8">
        <div className="relative max-w-lg mb-10">
          <Search className="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400" />
          <input 
            type="text" 
            placeholder="Search events by title..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-14 pr-4 py-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 w-full font-['Inter:Medium',sans-serif] text-slate-700 transition-all shadow-inner"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
              <Activity className="w-8 h-8 text-indigo-500 animate-pulse" />
            </div>
            <p className="text-indigo-600 font-['Inter:Bold',sans-serif] mt-6 tracking-widest text-sm uppercase animate-pulse">Loading Events...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredEvents.map((event, index) => {
                const now = new Date();
                const startDate = parseBackendDate(event.startDate);
                const endDate = parseBackendDate(event.endDate);
                const statusStr = (event.status || "").toLowerCase();
                const isApprovedOrActive = statusStr === "approved" || statusStr === "published" || statusStr === "soldout" || statusStr === "2" || statusStr === "4" || statusStr === "5";
                const isCompleted = statusStr === "completed" || statusStr === "7" || (isApprovedOrActive && event.endDate && endDate < now);

                return (
                  <motion.div 
                    key={event.eventId}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white border-2 border-slate-100 rounded-[2rem] p-6 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-200/50 hover:-translate-y-2 transition-all duration-300 group flex flex-col relative overflow-hidden"
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${event.status === 'Cancelled' ? 'bg-rose-500' : 'bg-indigo-600'}`} />

                    <div className="flex-1 relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 pr-4">
                          <h3 className="text-xl font-['Outfit:Bold',sans-serif] font-bold text-slate-800 line-clamp-2 leading-tight mb-3 group-hover:text-indigo-700 transition-colors">{event.title}</h3>
                          {renderEventStatusBadge(event)}
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-8 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex justify-between text-xs font-['Inter:Bold',sans-serif] font-bold text-slate-500 mb-2">
                          <span className="flex items-center gap-1.5 text-indigo-600"><Tag className="w-4 h-4" /> Tickets Sold</span>
                          <span className="text-slate-800">{event.bookedTickets} / {event.totalTickets} ({event.occupancyPercentage}%)</span>
                        </div>
                        <div className="w-full bg-slate-200/50 rounded-full h-3 overflow-hidden shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 relative ${
                              event.occupancyPercentage >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, event.occupancyPercentage))}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Venue Rating/Review Section */}
                    {event.placeId && isCompleted && (
                      <div className="mb-4 relative z-10">
                        {event.hasReviewedPlace ? (
                          <div className="w-full text-center py-3 px-4 bg-slate-50 text-slate-400 rounded-2xl font-bold text-xs border border-slate-200">
                            Venue Reviewed ✓
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenFeedback(event)}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl font-bold text-sm transition-all shadow-md shadow-amber-500/10 hover:shadow-lg active:scale-95 cursor-pointer"
                          >
                            <Star className="w-4 h-4 fill-white" />
                            Rate Venue
                          </button>
                        )}
                      </div>
                    )}

                    <div className="flex gap-3 pt-2 relative z-10">
                      <Link
                        to={`/organizer/events/${event.eventId}/attendees`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all font-['Inter:Bold',sans-serif] text-sm border border-indigo-100 hover:border-indigo-600 shadow-sm"
                      >
                        <Users className="w-4 h-4" />
                        Attendees
                      </Link>
                      <Link
                          to={`/organizer/events/${event.eventId}/scan`}
                          className="flex items-center justify-center w-12 h-12
                                    bg-violet-50
                                    border border-violet-100
                                    text-violet-600
                                    rounded-2xl
                                    hover:bg-violet-600
                                    hover:text-white
                                    hover:scale-105
                                    transition-all
                                    shadow-sm"
                          title="Scan QR Tickets"
                      >
                          <ScanLine className="w-5 h-5" />
                      </Link>
                      <Link
                        to={`/organizer/events/${event.eventId}/edit`}
                        className="flex items-center justify-center w-12 h-12 bg-sky-50 border border-sky-100 text-sky-600 rounded-2xl hover:bg-sky-500 hover:text-white transition-all shadow-sm"
                        title="Edit Event"
                      >
                        <Edit2 className="w-5 h-5" />
                      </Link>
                      
                      {/* Premium Animated AlertDialog for Delete */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button 
                            className="flex items-center justify-center w-12 h-12 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                            title="Cancel Event"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white rounded-[2rem] p-8 border-none shadow-2xl shadow-rose-900/10 sm:max-w-[425px]">
                          <div className="mx-auto w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6 relative">
                            <div className="absolute inset-0 rounded-full border-4 border-rose-100 animate-pulse" />
                            <Trash2 className="w-10 h-10 text-rose-500" />
                          </div>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-center text-3xl font-['Outfit:Bold',sans-serif] text-slate-800 tracking-tight">Cancel Event?</AlertDialogTitle>
                            <AlertDialogDescription className="text-center font-['Inter:Medium',sans-serif] text-slate-500 text-base mt-2">
                              Are you sure you want to cancel <span className="font-bold text-slate-700">"{event.title}"</span>? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="mt-8 flex flex-col sm:flex-row gap-3 sm:space-x-0">
                            <AlertDialogCancel className="flex-1 rounded-2xl font-['Inter:Bold',sans-serif] py-6 bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-slate-900 mt-0">No, keep it</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(event.eventId)} 
                              className="flex-1 rounded-2xl font-['Inter:Bold',sans-serif] py-6 bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/30 text-white"
                            >
                              Yes, cancel it
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {!loading && filteredEvents.length === 0 && (
          <div className="text-center py-24 text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-[3rem]">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarCheck className="w-12 h-12 text-indigo-400" />
            </div>
            <p className="font-['Outfit:Bold',sans-serif] text-3xl text-slate-800 mb-3">No events found!</p>
            <p className="font-['Inter:Medium',sans-serif] text-slate-500 mb-8 text-lg">You don't have any events matching this search.</p>
            <Link 
              to="/organizer/events/new"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white font-['Inter:Bold',sans-serif] font-bold rounded-2xl hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/30 transition-all hover:-translate-y-1"
            >
              <Sparkles className="w-5 h-5" />
              Create First Event
            </Link>
          </div>
        )}
      </div>

      {/* Premium Star Rating Modal */}
      <AnimatePresence>
        {feedbackModal?.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => !submittingFeedback && setFeedbackModal(null)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500" />
              
              <h3 className="text-2xl font-['Outfit:Bold',sans-serif] text-slate-800 mb-2">Rate Event Venue</h3>
              <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500 mb-6">
                How was your experience hosting the event at <span className="font-semibold text-slate-700">{feedbackModal.placeName}</span>?
              </p>

              {/* Star Rating Selectors */}
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    className="p-1 transition-transform active:scale-90 hover:scale-110 cursor-pointer"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= feedbackRating
                          ? "text-amber-400 fill-amber-400 drop-shadow-sm"
                          : "text-slate-300 fill-transparent hover:text-amber-300"
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>

              {/* Feedback Comment Input */}
              <div className="space-y-2 mb-6">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Your Review / Feedback
                </label>
                <textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Share details about amenities, staff support, technical equipment..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 font-['Inter:Medium',sans-serif] text-slate-700 placeholder:text-slate-400 transition-all resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={submittingFeedback}
                  onClick={() => setFeedbackModal(null)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submittingFeedback || !feedbackComment.trim()}
                  onClick={handleSubmitFeedback}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {submittingFeedback ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
