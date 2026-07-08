import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Star, User, Calendar, Edit2, Trash2 } from "lucide-react";
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
        console.log(data);

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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 transition-all duration-200 ${
          i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "text-slate-200"
        }`}
      />
    ));
  };

  const handleEdit = () => navigate(`/events/${eventId}/feedback/edit`);
  const handleDelete = () => navigate(`/events/${eventId}/feedback/delete`);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-[var(--brand-navy)] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 mt-4 text-sm font-medium">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20">
      {/* Hero Header */}
      <div className="bg-[var(--brand-deep-navy)] pt-24 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(at_top_right,#4f46e510_0%,transparent_50%)]" />
        
        <div className="max-w-4xl mx-auto relative">
          <Link
            to={`/events/${eventId}`}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Event
          </Link>

          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">{eventTitle}</h1>
          
          {feedbacks.length > 0 && (
            <div className="flex items-center gap-4 text-white/80">
              <div className="flex items-center gap-1">
                {renderStars(averageRating)}
              </div>
              <span className="text-3xl font-semibold">{averageRating}</span>
              <span className="text-lg opacity-75">({feedbacks.length} reviews)</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-100 p-8 md:p-10">
          <h2 className="text-3xl font-semibold mb-10 flex items-center gap-4 text-slate-900">
            All Reviews
            <span className="text-base font-normal px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full">
              {feedbacks.length}
            </span>
          </h2>

          <AnimatePresence>
            {feedbacks.length > 0 ? (
              <div className="space-y-8">
                {feedbacks.map((feedback, index) => {
                  const isMyFeedback = currentUserId && feedback.attendeeId === currentUserId;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 25 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.5 }}
                      className="group border border-slate-100 hover:border-slate-200 rounded-3xl p-8 transition-all duration-300 hover:shadow-md bg-white"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-slate-100">
                            {feedback.attendeeImageUrl ? (
                              <img
                                    src={`http://localhost:5173/${feedback.attendeeImageUrl}`}

                                alt={feedback.attendeeName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                <User className="w-8 h-8 text-slate-500" />
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-xl text-slate-900">{feedback.attendeeName}</p>
                            {feedback.createdAt && (
                              <p className="text-sm text-slate-500 flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                {parseBackendDate(feedback.createdAt).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric"
                                })}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-5">
                          <div className="flex">{renderStars(feedback.rating)}</div>

                          {isMyFeedback && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={handleEdit}
                                className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:scale-105"
                                title="Edit your review"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={handleDelete}
                                className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-105"
                                title="Delete your review"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Enhanced Comment */}
                      <div className="mt-7 pl-1">
                        <p className="text-slate-700 text-[17px] leading-relaxed italic">
                          “{feedback.comment}”
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <Star className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-700">No reviews yet</h3>
                <p className="text-slate-500 mt-3 max-w-xs mx-auto">
                  Be the first to share your experience with this event.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}