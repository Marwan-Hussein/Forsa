import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, Ticket, History, Star, X, CheckCircle2, QrCode } from "lucide-react";
import { getUserReviewForEvent, mockEvents } from "../../data/mockData";
import { motion, AnimatePresence } from "motion/react";

export default function MyEventsPage() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [viewingReview, setViewingReview] = useState<string | null>(null);

  const upcomingEvents = [
    {
      id: "1",
      title: "Tech Conference 2026: Future of AI",
      date: "2026-03-25",
      time: "9:00 AM - 5:00 PM",
      location: "San Francisco Convention Center",
      ticketCount: 2,
      totalPrice: 598,
      bookingId: "BK-001",
      status: "confirmed" as const,
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "2",
      title: "Summer Music Festival 2026",
      date: "2026-04-15",
      time: "2:00 PM - 11:00 PM",
      location: "Central Park, New York",
      ticketCount: 1,
      totalPrice: 150,
      bookingId: "BK-002",
      status: "confirmed" as const,
      image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
  ];

  const pastEvents = [
    {
      id: "7",
      title: "Digital Marketing Masterclass",
      date: "2025-12-10",
      time: "1:00 PM - 6:00 PM",
      location: "Business Center, Seattle",
      ticketCount: 1,
      totalPrice: 199,
      bookingId: "BK-101",
      attended: true,
      image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "3",
      title: "Creative Design Workshop",
      date: "2025-10-20",
      time: "10:00 AM - 4:00 PM",
      location: "Design Hub, Los Angeles",
      ticketCount: 2,
      totalPrice: 0,
      bookingId: "BK-102",
      attended: true,
      image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
  ];

  const displayEvents = activeTab === "upcoming" ? upcomingEvents : pastEvents;

  const currentReview = viewingReview ? getUserReviewForEvent(viewingReview) : null;
  const currentEvent = viewingReview ? mockEvents.find(e => e.id === viewingReview) : null;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 mb-6 text-slate-500 hover:text-blue-600 transition-colors font-['Inter:Medium',sans-serif] text-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-['Inter:Bold',sans-serif] text-4xl text-slate-800 mb-2 tracking-tight">
                My Tickets
              </h1>
              <p className="font-['Inter:Medium',sans-serif] text-slate-500">
                Access your upcoming event tickets and past history
              </p>
            </div>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex p-1 bg-slate-200/50 rounded-2xl w-full max-w-md mb-8">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-['Inter:Bold',sans-serif] text-sm transition-all duration-300 ${
              activeTab === "upcoming"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Ticket className="w-4 h-4" />
            Upcoming ({upcomingEvents.length})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-['Inter:Bold',sans-serif] text-sm transition-all duration-300 ${
              activeTab === "past"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <History className="w-4 h-4" />
            Past ({pastEvents.length})
          </button>
        </div>

        {/* Events List */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {displayEvents.length > 0 ? (
              displayEvents.map((event, index) => (
                <motion.div
                  key={event.bookingId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col md:flex-row group hover:shadow-blue-900/5 transition-all"
                >
                  {/* Event Image */}
                  <div className="md:w-64 h-48 md:h-auto shrink-0 relative overflow-hidden">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 to-transparent md:hidden" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent hidden md:block" />
                    {activeTab === "upcoming" && (
                      <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-['Inter:Bold',sans-serif] shadow-lg flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                      </div>
                    )}
                  </div>

                  {/* Ticket Details */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-center relative bg-white">
                    <h3 className="font-['Inter:Bold',sans-serif] text-2xl text-slate-800 mb-4 pr-12">
                      {event.title}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mb-6">
                      <div className="flex items-center gap-3 text-slate-600 font-['Inter:Medium',sans-serif] text-sm">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                          <CalendarIcon className="w-4 h-4" />
                        </div>
                        {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                      <div className="flex items-center gap-3 text-slate-600 font-['Inter:Medium',sans-serif] text-sm">
                        <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                        {event.time}
                      </div>
                      <div className="flex items-center gap-3 text-slate-600 font-['Inter:Medium',sans-serif] text-sm sm:col-span-2">
                        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        {event.location}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100">
                      <div className="flex items-center gap-4">
                        <span className="font-['Inter:Medium',sans-serif] text-sm text-slate-500">
                          Booking ID: <span className="font-['Inter:Bold',sans-serif] text-slate-800">{event.bookingId}</span>
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        <span className="font-['Inter:Medium',sans-serif] text-sm text-slate-500">
                          {event.ticketCount} Ticket{event.ticketCount > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tear-off Stub (Desktop) / Bottom Action (Mobile) */}
                  <div className="md:w-64 relative bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 border-dashed flex flex-col justify-center items-center p-6 md:p-8 shrink-0">
                    {/* Semi-circles for ticket effect */}
                    <div className="hidden md:block absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-50 rounded-full border-r border-slate-200 border-dashed" style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)' }} />
                    <div className="hidden md:block absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-slate-50 rounded-full border-b border-slate-200 border-dashed" style={{ clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)' }} />
                    <div className="hidden md:block absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-slate-50 rounded-full border-t border-slate-200 border-dashed" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }} />

                    {activeTab === "upcoming" ? (
                      <>
                        <QrCode className="w-24 h-24 text-slate-800 mb-4 opacity-80" />
                        <Link
                          to={`/events/${event.id}`}
                          className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl text-center font-['Inter:Bold',sans-serif] text-sm hover:bg-blue-700 transition-colors shadow-sm"
                        >
                          View Details
                        </Link>
                      </>
                    ) : (
                      <div className="flex flex-col items-center w-full gap-3">
                        <div className="w-16 h-16 rounded-full bg-slate-200/50 flex items-center justify-center mb-2">
                          <History className="w-8 h-8 text-slate-400" />
                        </div>
                        <span className="font-['Inter:Bold',sans-serif] text-slate-600 mb-2 text-center">Attended</span>
                        
                        {!getUserReviewForEvent(event.id) ? (
                          <Link
                            to={`/events/${event.id}/feedback`}
                            className="w-full bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-center font-['Inter:Bold',sans-serif] text-sm hover:bg-slate-100 transition-colors shadow-sm"
                          >
                            Leave Review
                          </Link>
                        ) : (
                          <button
                            onClick={() => setViewingReview(event.id)}
                            className="w-full bg-amber-50 text-amber-600 px-4 py-2.5 rounded-xl text-center font-['Inter:Bold',sans-serif] text-sm hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
                          >
                            <Star className="w-4 h-4 fill-amber-500" />
                            View Review
                          </button>
                        )}
                        <Link
                          to={`/events/${event.id}`}
                          className="w-full text-slate-500 hover:text-blue-600 text-center font-['Inter:Medium',sans-serif] text-sm transition-colors mt-2"
                        >
                          Event Page
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Ticket className="w-10 h-10 text-slate-300" />
                </div>
                <p className="font-['Inter:Bold',sans-serif] text-2xl text-slate-800 mb-3">
                  No {activeTab} tickets
                </p>
                <p className="font-['Inter:Medium',sans-serif] text-slate-500 mb-8 max-w-sm mx-auto">
                  {activeTab === "upcoming"
                    ? "You haven't booked any upcoming events yet. Discover what's happening around you."
                    : "You haven't attended any events yet."}
                </p>
                <Link
                  to="/events"
                  className="inline-flex bg-blue-600 text-white px-8 py-3.5 rounded-xl font-['Inter:Bold',sans-serif] shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
                >
                  Explore Events
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Review Modal (Glassmorphism) */}
      <AnimatePresence>
        {viewingReview && currentReview && currentEvent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2rem] p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              <button
                onClick={() => setViewingReview(null)}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-700"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mb-8 pr-12">
                <h2 className="font-['Inter:Bold',sans-serif] text-3xl text-slate-800 mb-2">
                  Your Review
                </h2>
                <p className="font-['Inter:Medium',sans-serif] text-slate-500">
                  {currentEvent.title}
                </p>
              </div>

              {/* Rating Display */}
              <div className="bg-slate-50 rounded-3xl p-6 mb-6">
                <p className="font-['Inter:Bold',sans-serif] text-sm text-slate-500 mb-4 uppercase tracking-wider">
                  Rating
                </p>
                <div className="flex gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-10 h-10 ${
                        star <= currentReview.rating
                          ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                          : "text-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="font-['Inter:Bold',sans-serif] text-xl text-slate-800">
                  {currentReview.rating === 5 && "Excellent! 🌟"}
                  {currentReview.rating === 4 && "Very Good 👍"}
                  {currentReview.rating === 3 && "Good 🙂"}
                  {currentReview.rating === 2 && "Fair 😐"}
                  {currentReview.rating === 1 && "Poor 😞"}
                </p>
              </div>

              {/* Review Comment */}
              {currentReview.comment && (
                <div className="mb-8">
                  <p className="font-['Inter:Bold',sans-serif] text-sm text-slate-500 mb-3 uppercase tracking-wider">
                    Feedback
                  </p>
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm text-slate-700 font-['Inter:Medium',sans-serif] leading-relaxed">
                    "{currentReview.comment}"
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="font-['Inter:Medium',sans-serif] text-sm text-slate-400">
                  Reviewed on {new Date(currentReview.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
                <button
                  onClick={() => setViewingReview(null)}
                  className="bg-slate-800 text-white px-6 py-2.5 rounded-xl font-['Inter:Bold',sans-serif] text-sm hover:bg-slate-700 transition-colors shadow-lg shadow-slate-900/20"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}