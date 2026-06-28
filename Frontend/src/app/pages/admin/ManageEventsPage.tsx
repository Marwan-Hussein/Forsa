import { useState, useEffect } from "react";
import { Search, MapPin, Calendar, DollarSign, CheckCircle, XCircle, Loader2, Sparkles, AlertCircle, Trash2, List, Ticket } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { adminApi, EventDetailsDTO } from "../../api/adminApi";

type TabView = "pending" | "all";

export default function ManageEventsPage() {
  const [events, setEvents] = useState<EventDetailsDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabView>("pending");

  const [rejectingEvent, setRejectingEvent] = useState<EventDetailsDTO | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState<EventDetailsDTO | null>(null);

  async function fetchEvents() {
    setLoading(true);
    try {
      const data = await adminApi.getAllEvents();
      setEvents(data ?? []);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to load events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  const pendingEvents = events.filter(e => e.status.toLowerCase() === "pending");
  const allEvents = events;
  
  const currentEventsList = activeTab === "pending" ? pendingEvents : allEvents;

  const filtered = currentEventsList.filter(e => {
    const q = search.toLowerCase();
    return (
      e.title?.toLowerCase().includes(q) ||
      e.category?.toLowerCase().includes(q) ||
      e.placeLocation?.toLowerCase().includes(q) ||
      e.place?.toLowerCase().includes(q)
    );
  });

  async function handleApprove(event: EventDetailsDTO) {
    try {
      await adminApi.updateEventStatus(event.eventId, 2); // 2 = Approved
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <span><strong className="text-slate-800">{event.title}</strong> has been approved.</span>
        </div>
      );
      setEvents(prev => prev.map(e => e.eventId === event.eventId ? { ...e, status: "Approved" } : e));
    } catch (e: any) {
      toast.error(`Approval failed: ${e.message}`);
    }
  }

  async function handleReject() {
    if (!rejectingEvent) return;
    setSubmitting(true);
    try {
      // The API for Event Status only requires status, no reason is in DTO for now.
      await adminApi.updateEventStatus(rejectingEvent.eventId, 3); // 3 = Rejected
      toast.success(
        <div className="flex items-center gap-2">
          <XCircle className="w-5 h-5 text-rose-500" />
          <span><strong className="text-slate-800">{rejectingEvent.title}</strong> was rejected.</span>
        </div>
      );
      setEvents(prev => prev.map(e => e.eventId === rejectingEvent.eventId ? { ...e, status: "Rejected" } : e));
      setRejectingEvent(null);
    } catch (e: any) {
      toast.error(`Rejection failed: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deletingEvent) return;
    setSubmitting(true);
    try {
      await adminApi.deleteEvent(deletingEvent.eventId);
      toast.success(
        <div className="flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-500" />
          <span><strong className="text-slate-800">{deletingEvent.title}</strong> has been deleted.</span>
        </div>
      );
      setEvents(prev => prev.filter(e => e.eventId !== deletingEvent.eventId));
      setDeletingEvent(null);
    } catch (e: any) {
      toast.error(`Deletion failed: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  const renderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200/50 text-[12px] font-['Inter:Bold',sans-serif] shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Pending
          </span>
        );
      case "approved":
      case "published":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/50 text-[12px] font-['Inter:Bold',sans-serif] shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {status}
          </span>
        );
      case "rejected":
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200/50 text-[12px] font-['Inter:Bold',sans-serif] shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200/50 text-[12px] font-['Inter:Bold',sans-serif] shadow-sm">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
  };

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto pb-12 relative z-0">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-pink-400/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
      >
        <div className="relative">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-purple-50 border border-purple-100 mb-4">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-purple-700 text-sm font-['Inter:SemiBold',sans-serif]">Event Moderation</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-['Inter:Bold',sans-serif] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
            {activeTab === "pending" ? "Pending Events" : "All Events"}
          </h1>
          <p className="text-slate-500 font-['Inter:Medium',sans-serif] mt-3 text-[16px] max-w-xl">
            {activeTab === "pending" 
              ? "Review and approve new events before they become available to attendees." 
              : "Monitor and manage all events created across the platform."}
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-4 w-full lg:w-auto">
          {/* Tabs */}
          <div className="relative flex bg-slate-100/80 p-1.5 rounded-xl backdrop-blur-md border border-slate-200">
            {activeTab === "pending" && (
              <motion.div 
                layoutId="activeEventTabBg" 
                className="absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-0.375rem)] bg-white rounded-lg shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {activeTab === "all" && (
              <motion.div 
                layoutId="activeEventTabBg" 
                className="absolute top-1.5 bottom-1.5 right-1.5 w-[calc(50%-0.375rem)] bg-white rounded-lg shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            
            <button
              onClick={() => setActiveTab("pending")}
              className={`relative z-10 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-['Inter:SemiBold',sans-serif] w-40 transition-colors ${
                activeTab === "pending" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <AlertCircle className="w-4 h-4" /> Pending
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`relative z-10 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-['Inter:SemiBold',sans-serif] w-40 transition-colors ${
                activeTab === "all" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <List className="w-4 h-4" /> All Events
            </button>
          </div>

          <div className="relative w-full lg:w-[360px] group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
            <div className="relative flex items-center bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-purple-500/10 focus-within:border-purple-300 transition-all">
              <Search className="w-5 h-5 ml-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search events by name or location..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-3 pr-4 py-3.5 bg-transparent border-none focus:outline-none font-['Inter:Medium',sans-serif] text-[14px] text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white/50 backdrop-blur-xl rounded-[2rem] border border-white shadow-sm">
          <div className="w-16 h-16 relative flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-purple-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin" />
          </div>
          <p className="text-slate-600 font-['Inter:Bold',sans-serif] mt-4 tracking-wide text-sm">FETCHING EVENTS</p>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-32 bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white shadow-sm"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-200/50">
            <Ticket className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-slate-900 font-['Inter:Bold',sans-serif] text-[20px] mb-2 tracking-tight">Queue is Empty</h3>
          <p className="text-slate-500 font-['Inter:Medium',sans-serif] text-[15px] max-w-md text-center">
            {search 
              ? "No events match your search." 
              : activeTab === "pending" 
                ? "Awesome! You've reviewed all pending events."
                : "There are no events available on the platform yet."}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map((event, i) => (
              <motion.div
                layout
                key={event.eventId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ delay: i * 0.05, duration: 0.4, type: "spring", bounce: 0.3 }}
                className="group relative bg-white rounded-[2rem] p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-1 border border-slate-100 transition-all duration-300 flex flex-col"
              >
                {/* Status Badge */}
                <div className="absolute top-6 right-6 z-10">
                  {renderStatusBadge(event.status)}
                </div>

                <div className="flex items-start gap-4 mb-5 pr-24">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center border border-purple-200/50 shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform mt-1">
                    <Ticket className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[17px] leading-tight font-['Inter:Bold',sans-serif] text-slate-900 line-clamp-2 mb-1">{event.title}</h3>
                    <p className="text-[13px] font-['Inter:Medium',sans-serif] text-slate-500 line-clamp-1 flex items-center gap-1.5">
                      {event.category}
                    </p>
                  </div>
                </div>

                <p className="text-slate-600 font-['Inter:Regular',sans-serif] text-[14px] leading-relaxed line-clamp-3 mb-6 flex-1">
                  {event.description}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                      <Calendar className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-['Inter:SemiBold',sans-serif] text-slate-400 uppercase tracking-wider">Start Date</p>
                      <p className="text-[12px] font-['Inter:Bold',sans-serif] text-slate-700 truncate">{formatDate(event.startDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                      <DollarSign className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-['Inter:SemiBold',sans-serif] text-slate-400 uppercase tracking-wider">Ticket</p>
                      <p className="text-[12px] font-['Inter:Bold',sans-serif] text-slate-700 truncate">
                        {event.ticketPrice > 0 ? `${event.ticketPrice} EGP` : 'Free'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 col-span-2">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                      <MapPin className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-['Inter:SemiBold',sans-serif] text-slate-400 uppercase tracking-wider">Venue</p>
                      <p className="text-[12px] font-['Inter:Bold',sans-serif] text-slate-700 truncate">
                        {event.place} <span className="text-slate-400 font-['Inter:Regular',sans-serif]">({event.placeLocation})</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 mt-auto">
                  {event.status.toLowerCase() === "pending" ? (
                    <>
                      <button 
                        onClick={() => setRejectingEvent(event)}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white border-2 border-rose-100 text-rose-600 font-['Inter:Bold',sans-serif] text-[14px] hover:bg-rose-50 hover:border-rose-200 transition-all hover:-translate-y-0.5 shadow-sm"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                      <button 
                        onClick={() => handleApprove(event)}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 text-white font-['Inter:Bold',sans-serif] text-[14px] hover:bg-emerald-600 shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_20px_rgba(16,185,129,0.4)] transition-all hover:-translate-y-0.5"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => setDeletingEvent(event)}
                      className="col-span-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-white border-2 border-red-100 text-red-600 font-['Inter:Bold',sans-serif] text-[14px] hover:bg-red-50 hover:border-red-200 transition-all hover:-translate-y-0.5 shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Event
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      <AnimatePresence>
        {rejectingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !submitting && setRejectingEvent(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-400 to-rose-600" />
              
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-rose-500" />
              </div>

              <h2 className="text-2xl font-['Inter:Bold',sans-serif] text-slate-900 mb-3">Reject Event</h2>
              <p className="text-slate-500 font-['Inter:Medium',sans-serif] text-[15px] mb-8 leading-relaxed">
                Are you sure you want to reject <strong>{rejectingEvent.title}</strong>? The organizer will be notified that their event was not approved.
              </p>

              <div className="flex flex-col gap-3">
                <button 
                  disabled={submitting}
                  onClick={handleReject}
                  className="w-full py-3.5 rounded-xl bg-rose-500 text-white font-['Inter:Bold',sans-serif] text-[15px] hover:bg-rose-600 shadow-[0_4px_15px_rgba(225,29,72,0.3)] hover:shadow-[0_8px_20px_rgba(225,29,72,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Yes, reject event"}
                </button>
                <button 
                  disabled={submitting}
                  onClick={() => setRejectingEvent(null)}
                  className="w-full py-3.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-['Inter:Bold',sans-serif] text-[15px] hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !submitting && setDeletingEvent(null)}
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

              <h2 className="text-2xl font-['Inter:Bold',sans-serif] text-slate-900 mb-3">Delete Event</h2>
              <p className="text-slate-500 font-['Inter:Medium',sans-serif] text-[15px] mb-8 leading-relaxed">
                Are you sure you want to permanently delete <strong>{deletingEvent.title}</strong>? This action cannot be undone.
              </p>

              <div className="flex flex-col gap-3">
                <button 
                  disabled={submitting}
                  onClick={handleDelete}
                  className="w-full py-3.5 rounded-xl bg-red-500 text-white font-['Inter:Bold',sans-serif] text-[15px] hover:bg-red-600 shadow-[0_4px_15px_rgba(239,68,68,0.3)] hover:shadow-[0_8px_20px_rgba(239,68,68,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Yes, delete event"}
                </button>
                <button 
                  disabled={submitting}
                  onClick={() => setDeletingEvent(null)}
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
