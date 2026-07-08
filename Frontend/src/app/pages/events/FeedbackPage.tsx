import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Star, Send, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { FloatingLabelTextarea } from "../../components/ui/floating-label-field";
import { eventsApi } from "../../api/eventsApi";
import { attendeeApi } from "../../api/attendeeApi";
import { EventDetailsDto } from "../../types";
import { getUserIdFromToken } from "../../api/api";

export default function FeedbackPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState<EventDetailsDto | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [attendanceConfirmed, setAttendanceConfirmed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    eventsApi.getEventDetails(Number(eventId))
      .then((data) => setEvent(data))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load event details");
      })
      .finally(() => setLoadingEvent(false));
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (attendanceConfirmed && rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    const userId = getUserIdFromToken();
    if (!userId) {
      toast.error("Please login again");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (attendanceConfirmed && eventId) {
        await attendeeApi.submitFeedback(userId, Number(eventId), { rating, comment });
        toast.success("Thank you for your feedback!", {
          description: `Your ${rating}-star review has been submitted.`
        });
      } else {
        toast.info("Thank you for your response.");
      }
      
      setSubmitted(true);
      setTimeout(() => navigate("/dashboard?tab=tickets"), 1800);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingEvent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-[var(--brand-navy)] animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return <div className="text-center py-20">Event not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-24 pb-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Back Button */}
        <Link
          to="/dashboard?tab=tickets"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Events
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-2xl mb-3">
              <Star className="w-6 h-6 text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">
              Share Your Experience
            </h1>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              Your feedback helps us improve and helps other attendees make better choices
            </p>
          </div>

          {/* Event Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-5">
            <h2 className="font-bold text-lg text-slate-900 mb-1">{event.title}</h2>
            <p className="text-sm text-slate-600">
              {event.startDate && new Date(event.startDate).toLocaleDateString("en-US", {
                weekday: "long", year: "numeric", month: "long", day: "numeric"
              })}
              {" • "}
              {event.placeLocation || event.place || "Location TBD"}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Attendance Toggle */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2.5">
                  Did you attend this event?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAttendanceConfirmed(true)}
                    className={`py-2.5 rounded-xl font-medium text-sm transition-all duration-300 border cursor-pointer ${
                      attendanceConfirmed 
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md" 
                        : "border-slate-200 hover:border-slate-300 text-slate-650"
                    }`}
                  >
                    Yes, I Attended
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendanceConfirmed(false)}
                    className={`py-2.5 rounded-xl font-medium text-sm transition-all duration-300 border cursor-pointer ${
                      !attendanceConfirmed 
                        ? "bg-rose-600 text-white border-rose-600 shadow-md" 
                        : "border-slate-200 hover:border-slate-300 text-slate-650"
                    }`}
                  >
                    No, I Couldn't
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {attendanceConfirmed ? (
                  <>
                    {/* Rating */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        How would you rate this event?
                      </label>
                      <div className="flex justify-center gap-2 py-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button
                            key={star}
                            type="button"
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="transition-all cursor-pointer"
                          >
                            <Star
                              className={`w-9 h-9 transition-colors duration-200 ${
                                star <= (hoveredRating || rating)
                                  ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                                  : "text-slate-200"
                              }`}
                            />
                          </motion.button>
                        ))}
                      </div>
                      {rating > 0 && (
                        <p className="text-center text-sm font-medium text-amber-600">
                          {rating === 5 && "Outstanding!"}
                          {rating === 4 && "Very Good"}
                          {rating === 3 && "Good"}
                          {rating === 2 && "Average"}
                          {rating === 1 && "Needs Improvement"}
                        </p>
                      )}
                    </div>

                    {/* Comment */}
                    <div>
                      <FloatingLabelTextarea
                        id="comment"
                        label="Tell us more about your experience (optional)"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={600}
                        rows={4}
                        className="text-sm resize-y min-h-[100px]"
                      />
                      <p className="text-right text-xs text-slate-400 mt-1">
                        {comment.length} / 600
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="py-2">
                    <FloatingLabelTextarea
                      id="comment-absent"
                      label="What prevented you from attending? (optional)"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      maxLength={500}
                      rows={4}
                      className="text-sm resize-y min-h-[100px]"
                    />
                  </div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-gradient-to-r from-[var(--brand-navy)] to-indigo-700 hover:from-indigo-700 hover:to-[var(--brand-navy)] text-white py-3 rounded-xl font-semibold text-base flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all disabled:opacity-70 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Feedback
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}