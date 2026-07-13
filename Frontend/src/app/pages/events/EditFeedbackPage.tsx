import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { ArrowLeft, Star, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { FloatingLabelTextarea } from "../../components/ui/floating-label-field";
import { eventsApi } from "../../api/eventsApi";
import { apiGet, apiPut, getUserIdFromToken } from "../../api/api";
import { EventDetailsDto } from "../../types";

export default function EditFeedbackPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const MotionLink = motion(Link);
  
  const [event, setEvent] = useState<EventDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!eventId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const attendeeId = getUserIdFromToken();

        // 1. جلب تفاصيل الحدث لعرض الكارد العلوي
        const eventData = await eventsApi.getEventDetails(Number(eventId));
        setEvent(eventData);

        // 2. جلب التقييم الحالي للمشترك لتعبئة الحقول تلقائياً
        const existingFeedback = await apiGet<any>(
          `/api/attendees/${attendeeId}/events/${eventId}/feedback`
        );

        if (existingFeedback) {
          setRating(existingFeedback.rating || 0);
          setComment(existingFeedback.comment || "");
        }
      } catch (err: any) {
        console.error("Failed to load edit details", err);
        toast.error("Failed to load your previous feedback details.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    
    const userId = getUserIdFromToken();
    if (!userId) {
      toast.error("User session expired. Please login again.");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // إرسال الكائن بالهيكل المطلوب للـ UpdateFeedbackDTO المطابق لـ Backend
      await apiPut(`/api/attendees/${userId}/events/${eventId}/feedback`, {
        rating,
        comment
      });

      toast.success("Feedback updated successfully!", {
        description: `Your review has been updated to ${rating} stars.`
      });
      
      navigate(`/events/${eventId}/feedbacks`);
    } catch (err: any) {
      console.error("Failed to update feedback", err);
      toast.error(err.message || "Failed to update feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-[var(--brand-navy)] animate-spin mb-3" />
          <p className="text-sm text-slate-500 font-medium font-['Inter:Medium',sans-serif]">
            Loading your feedback details...
          </p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-white rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] p-8 text-center">
          <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[20px] text-foreground mb-2">
            Event Not Found
          </h2>
          <p className="font-['Inter:Regular',sans-serif] text-[14px] text-muted-foreground mb-4">
            The event details could not be found.
          </p>
          <MotionLink
            to={`/events/${eventId}/feedbacks`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[var(--brand-slate-contrast)] to-[#1e2936] py-2 px-4 text-sm font-medium text-[#dde6ed] shadow-md transition-all hover:shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Feedbacks
          </MotionLink>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <MotionLink
            to={`/events/${eventId}/feedbacks`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group inline-flex items-center gap-2 mb-6 rounded-xl bg-gradient-to-br from-[var(--brand-slate-contrast)] to-[#1e2936] py-2 px-4 text-sm font-medium text-[#dde6ed] shadow-md transition-all hover:shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Feedbacks
          </MotionLink>
          <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[36px] text-foreground mb-2">
            Edit Your Feedback
          </h1>
          <p className="font-['Inter:Regular',sans-serif] text-[16px] text-muted-foreground">
            Update your review and shared experience details
          </p>
        </div>

        {/* Event Info Card */}
        <div className="bg-white rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] p-6 mb-6">
          <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[20px] text-foreground mb-2">
            {event.title}
          </h2>
          <p className="font-['Inter:Regular',sans-serif] text-[14px] text-muted-foreground">
            {event.startDate && new Date(event.startDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {" • "}
            {event.placeLocation || event.place || "Location TBD"}
          </p>
        </div>

        {/* Feedback Edit Form */}
        <div className="bg-white rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] p-8">
          <form onSubmit={handleSubmit}>
            
            {/* Rating */}
            <div className="mb-8">
              <label className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-foreground mb-3">
                How would you rate this event? *
              </label>
              <div className="flex gap-2 justify-center py-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-12 h-12 ${
                        star <= (hoveredRating || rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center font-['Inter:Medium',sans-serif] font-medium text-[14px] text-foreground">
                  {rating === 5 && "Excellent!"}
                  {rating === 4 && "Very Good"}
                  {rating === 3 && "Good"}
                  {rating === 2 && "Fair"}
                  {rating === 1 && "Poor"}
                </p>
              )}
            </div>

            {/* Comment */}
            <div className="mb-8">
              <FloatingLabelTextarea
                id="comment"
                label="Update your experience (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                rows={6}
              />
              <p className="mt-2 font-['Inter:Regular',sans-serif] text-[12px] text-muted-foreground">
                {comment.length} / 500 characters
              </p>
            </div>

            {/* Submit Button */}
             <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[var(--brand-slate-contrast)] to-[#1e2936] py-3 font-['Inter:Medium',sans-serif] text-[16px] font-medium text-[#dde6ed] shadow-lg ring-1 ring-white/10 transition-all duration-300 ease-in-out hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Updating...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" /> Update Feedback
                </>
              )}
            </motion.button>
          </form>
        </div>

        {/* Privacy Notice */}
        <div className="mt-6 bg-white rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] p-4">
          <p className="font-['Inter:Regular',sans-serif] text-[12px] text-muted-foreground text-center">
            Your feedback will be shared with the event organizer and may be displayed publicly to help other attendees make informed decisions.
          </p>
        </div>
      </div>
    </div>
  );
}