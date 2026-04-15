import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, Ticket, History, Star, X, CheckCircle2 } from "lucide-react";
import { getUserReviewForEvent, mockEvents } from "../../data/mockData";

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
    },
    {
      id: "4",
      title: "Startup Networking Mixer",
      date: "2026-03-18",
      time: "6:00 PM - 9:00 PM",
      location: "Innovation Center, Austin",
      ticketCount: 1,
      totalPrice: 25,
      bookingId: "BK-004",
      status: "confirmed" as const,
    },
  ];

  // Updated past events to use existing event IDs from mockData
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
    },
    {
      id: "6",
      title: "Food & Wine Tasting Experience",
      date: "2025-11-05",
      time: "7:00 PM - 10:00 PM",
      location: "Grand Hotel, Chicago",
      ticketCount: 1,
      totalPrice: 120,
      bookingId: "BK-103",
      attended: true,
    },
  ];

  const displayEvents = activeTab === "upcoming" ? upcomingEvents : pastEvents;

  // Get review for the event being viewed
  const currentReview = viewingReview ? getUserReviewForEvent(viewingReview) : null;
  const currentEvent = viewingReview ? mockEvents.find(e => e.id === viewingReview) : null;

  return (
    <div className="min-h-screen bg-[#eff6ff] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 mb-4 text-[#526d82] hover:text-[#27374d] transition-colors font-['Inter:Regular',sans-serif] text-[14px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[36px] text-[#27374d] mb-2">
            My Events
          </h1>
          <p className="font-['Inter:Regular',sans-serif] text-[16px] text-[#526d82]">
            View your booked and attended events
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`flex-1 py-4 px-6 font-['Inter:Medium',sans-serif] font-medium text-[16px] transition-colors ${
                activeTab === "upcoming"
                  ? "text-[#27374d] border-b-2 border-[#27374d] hover:opacity-90"
                  : "text-[#526d82] hover:text-[#27374d]"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Ticket className="w-5 h-5" />
                Upcoming Events ({upcomingEvents.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`flex-1 py-4 px-6 font-['Inter:Medium',sans-serif] font-medium text-[16px] transition-colors ${
                activeTab === "past"
                  ? "text-[#27374d] border-b-2 border-[#27374d] hover:opacity-90"
                  : "text-[#526d82] hover:text-[#27374d]"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <History className="w-5 h-5" />
                Past Events ({pastEvents.length})
              </div>
            </button>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {displayEvents.length > 0 ? (
            displayEvents.map((event) => (
              <div
                key={event.bookingId}
                className="bg-white rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch lg:justify-between lg:gap-6">
                  {/* Event Info */}
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-3 font-['Inter:Semi_Bold',sans-serif] text-[18px] font-semibold text-[#27374d]">
                      {event.title}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-[#EC9B3B]" />
                        <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82]">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#EC9B3B]" />
                        <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82]">
                          {event.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#EC9B3B]" />
                        <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82]">
                          {event.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-[#EC9B3B]" />
                        <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82]">
                          {event.ticketCount} ticket{event.ticketCount > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-['Inter:Regular',sans-serif] text-[12px] text-[#526d82]">
                        Booking ID: {event.bookingId}
                      </span>
                      <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] text-[#27374d]">
                        Total: {event.totalPrice === 0 ? "Free" : `$${event.totalPrice}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-3 border-t border-[rgba(82,109,130,0.12)] pt-4 lg:w-[180px] lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
                    <div className="flex min-h-[36px] items-center lg:justify-end">
                      {activeTab === "upcoming" && "status" in event && event.status === "confirmed" ? (
                        <span className="inline-flex items-center justify-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-['Inter:Medium',sans-serif] text-[12px] font-medium text-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
                          Confirmed
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-['Inter:Medium',sans-serif] text-[12px] font-medium text-slate-700">
                          <History className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
                          Attended
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/events/${event.id}`}
                      className="rounded-[8px] bg-[#27374d] px-4 py-2 text-center font-['Inter:Medium',sans-serif] text-[14px] font-medium text-[#dde6ed] transition-colors hover:bg-[#1e2936]"
                    >
                      View Details
                    </Link>
                    {activeTab === "past" && !getUserReviewForEvent(event.id) && (
                      <Link
                        to={`/events/${event.id}/feedback`}
                        className="bg-white border-[0.8px] border-[rgba(82,109,130,0.2)] text-[#27374d] px-4 py-2 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] hover:bg-[#f8f9fa] transition-colors text-center"
                      >
                        Leave Review
                      </Link>
                    )}
                    {activeTab === "past" && getUserReviewForEvent(event.id) && (
                      <button
                        onClick={() => setViewingReview(event.id)}
                        className="bg-[#eff6ff] text-[#27374d] px-4 py-2 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] hover:bg-[#dde6ed] transition-colors text-center flex items-center justify-center gap-1"
                      >
                        <Star className="w-4 h-4" />
                        View Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] p-12 text-center">
              <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[18px] text-[#27374d] mb-2">
                No {activeTab} events
              </p>
              <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82] mb-4">
                {activeTab === "upcoming"
                  ? "You haven't booked any events yet"
                  : "You haven't attended any events yet"}
              </p>
              <Link
                to="/events"
                className="inline-block bg-[#27374d] text-[#dde6ed] px-6 py-2 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] hover:bg-[#1e2936]"
              >
                Browse Events
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {viewingReview && currentReview && currentEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[14px] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-['Inter:Bold',sans-serif] font-bold text-[24px] text-[#27374d] mb-2">
                  Your Review
                </h2>
                <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82]">
                  {currentEvent.title}
                </p>
              </div>
              <button
                onClick={() => setViewingReview(null)}
                className="w-8 h-8 flex items-center justify-center hover:bg-[#eff6ff] rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-[#526d82]" />
              </button>
            </div>

            {/* Rating Display */}
            <div className="mb-6">
              <p className="font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[#27374d] mb-3">
                Your Rating
              </p>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-8 h-8 ${
                      star <= currentReview.rating
                        ? "fill-[#EC9B3B] text-[#EC9B3B]"
                        : "text-[#dde6ed]"
                    }`}
                  />
                ))}
              </div>
              <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-[#27374d]">
                {currentReview.rating === 5 && "Excellent!"}
                {currentReview.rating === 4 && "Very Good"}
                {currentReview.rating === 3 && "Good"}
                {currentReview.rating === 2 && "Fair"}
                {currentReview.rating === 1 && "Poor"}
              </p>
            </div>

            {/* Review Comment */}
            {currentReview.comment && (
              <div className="mb-6">
                <p className="font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[#27374d] mb-3">
                  Your Feedback
                </p>
                <div className="bg-[#eff6ff] rounded-[8px] p-4">
                  <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#27374d] leading-relaxed">
                    {currentReview.comment}
                  </p>
                </div>
              </div>
            )}

            {/* Review Date */}
            <div className="border-t border-[rgba(82,109,130,0.2)] pt-4">
              <p className="font-['Inter:Regular',sans-serif] text-[12px] text-[#526d82]">
                Reviewed on {new Date(currentReview.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setViewingReview(null)}
              className="w-full mt-6 bg-[#27374d] text-[#dde6ed] py-3 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] hover:bg-[#1e2936] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}