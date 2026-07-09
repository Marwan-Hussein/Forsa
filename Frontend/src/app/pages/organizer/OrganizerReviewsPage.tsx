import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Star, MessageSquare, ArrowLeft, Calendar, Loader2, Sparkles, Filter, ChevronDown, Check } from "lucide-react";
import { toast } from "sonner";
import { getUserIdFromToken } from "../../api/api";
import { organizerApi } from "../../api/organizerApi";

interface Review {
  id: number;
  rating: number;
  comment: string;
  attendeeName: string;
  attendeeImageUrl: string | null;
  eventTitle: string;
  eventId: number;
  createdAt: string;
}

interface DropdownOption {
  value: string;
  label: string;
}

function CustomDropdown({
  options,
  value,
  onChange,
  placeholder
}: {
  options: DropdownOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm text-slate-700 font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/80 cursor-pointer"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 left-0 mt-2 z-20 bg-white border border-slate-100 rounded-xl shadow-xl shadow-indigo-950/5 py-1.5 overflow-hidden max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-100">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors cursor-pointer ${
                  opt.value === value
                    ? "bg-indigo-50/70 text-indigo-700 font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="truncate mr-2">{opt.label}</span>
                {opt.value === value && <Check className="w-4 h-4 text-indigo-650 shrink-0" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function OrganizerReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviews = async () => {
      const organizerId = getUserIdFromToken();
      if (!organizerId) {
        navigate("/login");
        return;
      }
      try {
        const data = await organizerApi.getOrganizerReviews(organizerId);
        setReviews(data);
      } catch (err: any) {
        console.error("Failed to load reviews:", err);
        toast.error("Failed to load reviews: " + (err.message || ""));
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-12 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Loading reviews...</p>
        </div>
      </div>
    );
  }

  // Get unique events list for the filter
  const uniqueEvents = Array.from(new Set(reviews.map((r) => r.eventTitle)));

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    const matchesRating = ratingFilter === "all" || r.rating === parseInt(ratingFilter);
    const matchesEvent = eventFilter === "all" || r.eventTitle === eventFilter;
    return matchesRating && matchesEvent;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
        }`}
      />
    ));
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  // Build options
  const eventOptions: DropdownOption[] = [
    { value: "all", label: "All Events" },
    ...uniqueEvents.map((title) => ({ value: title, label: title }))
  ];

  const ratingOptions: DropdownOption[] = [
    { value: "all", label: "All Ratings" },
    { value: "5", label: "5 Stars Only" },
    { value: "4", label: "4 Stars" },
    { value: "3", label: "3 Stars" },
    { value: "2", label: "2 Stars" },
    { value: "1", label: "1 Star" }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <Link
              to="/organizer"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-semibold mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
              Reviews & Ratings <Sparkles className="w-5 h-5 text-indigo-500" />
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Here is what your event attendees are saying.
            </p>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-4 text-center justify-center min-w-[150px]">
            <div>
              <p className="text-3xl font-black text-indigo-700">{getAverageRating()}</p>
              <p className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">Average Rating</p>
            </div>
            <div className="w-[1px] h-8 bg-indigo-200" />
            <div>
              <p className="text-3xl font-black text-indigo-700">{reviews.length}</p>
              <p className="text-[10px] uppercase font-bold text-indigo-500 tracking-wider">Total Reviews</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
            <Filter className="w-4 h-4 text-indigo-500" /> Filters
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 max-w-2xl">
            {/* Event Filter */}
            <CustomDropdown
              options={eventOptions}
              value={eventFilter}
              onChange={setEventFilter}
              placeholder="All Events"
            />

            {/* Rating Filter */}
            <CustomDropdown
              options={ratingOptions}
              value={ratingFilter}
              onChange={setRatingFilter}
              placeholder="All Ratings"
            />
          </div>
        </div>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-150">
            <MessageSquare className="w-16 h-16 text-slate-350 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800">No reviews found</h3>
            <p className="text-slate-500 text-sm mt-1">There are no reviews matching your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredReviews.map((review) => {
              const formattedDate = new Date(review.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              });
              const rawImg = review.attendeeImageUrl || "";
              const attendeeImg = rawImg.startsWith('http') ? rawImg : (rawImg ? `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}${rawImg.startsWith('/') ? '' : '/'}${rawImg}` : "");
              
              return (
                <div
                  key={review.id}
                  className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-start animate-in fade-in slide-in-from-bottom-2 duration-200"
                >
                  {/* Attendee Info */}
                  <div className="flex items-center gap-3 shrink-0 w-full md:w-48">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                      {attendeeImg ? (
                        <img src={attendeeImg} alt={review.attendeeName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-indigo-600 font-bold text-sm">
                          {review.attendeeName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm truncate max-w-[130px]">{review.attendeeName}</h4>
                      <p className="text-[11px] text-slate-400">Attendee</p>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg text-amber-700 font-bold text-xs">
                        {review.rating} {renderStars(review.rating)}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {formattedDate}
                      </div>
                    </div>
                    <p className="text-slate-650 text-sm leading-relaxed font-medium">
                      "{review.comment}"
                    </p>
                    <div className="pt-2 border-t border-slate-50 flex items-center gap-2">
                      <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">
                        Event
                      </span>
                      <Link
                        to="/organizer/events"
                        className="text-xs font-semibold text-slate-650 hover:text-indigo-650 transition-colors"
                      >
                        {review.eventTitle}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
  );
}
