import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { ArrowLeft, Star, Send } from "lucide-react";
import { mockEvents, addReview, getUserReviewForEvent } from "../../data/mockData";
import { toast } from "sonner";
import { FloatingLabelTextarea } from "../../components/ui/floating-label-field";

export default function FeedbackPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const event = mockEvents.find((e) => e.id === eventId);
  
  // Check if user already reviewed this event
  const existingReview = eventId ? getUserReviewForEvent(eventId) : null;

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [attendanceConfirmed, setAttendanceConfirmed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (attendanceConfirmed && rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      if (attendanceConfirmed && eventId) {
        // Save the review
        addReview({
          eventId,
          userId: "user1",
          userName: "John Doe",
          rating,
          comment,
        });
      }
      
      setIsSubmitting(false);
      toast.success("Thank you for your feedback!", {
        description: attendanceConfirmed 
          ? `Your ${rating}-star review has been submitted.`
          : "We appreciate you letting us know.",
      });
      navigate("/my-events");
    }, 800);
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-[#eff6ff] flex items-center justify-center p-4">
        <div className="bg-white rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] p-8 text-center">
          <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[20px] text-[#27374d] mb-2">
            Event Not Found
          </h2>
          <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82] mb-4">
            The event you're looking for doesn't exist.
          </p>
          <Link
            to="/my-events"
            className="inline-block bg-[#27374d] text-[#dde6ed] px-6 py-2 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] hover:bg-[#1e2936]"
          >
            My Events
          </Link>
        </div>
      </div>
    );
  }

  // If user already reviewed, show message
  if (existingReview) {
    return (
      <div className="min-h-screen bg-[#eff6ff] flex items-center justify-center p-4">
        <div className="bg-white rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-[#eff6ff] rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-[#EC9B3B] fill-[#EC9B3B]" />
          </div>
          <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[20px] text-[#27374d] mb-2">
            Already Reviewed
          </h2>
          <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82] mb-6">
            You've already submitted a review for this event. You can view your review from the My Events page.
          </p>
          <Link
            to="/my-events"
            className="inline-block bg-[#27374d] text-[#dde6ed] px-6 py-2 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] hover:bg-[#1e2936]"
          >
            Go to My Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eff6ff] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/my-events"
            className="inline-flex items-center gap-2 mb-4 text-[#526d82] hover:text-[#27374d] transition-colors font-['Inter:Regular',sans-serif] text-[14px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Events
          </Link>
          <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[36px] text-[#27374d] mb-2">
            Share Your Feedback
          </h1>
          <p className="font-['Inter:Regular',sans-serif] text-[16px] text-[#526d82]">
            Help others by sharing your experience
          </p>
        </div>

        {/* Event Info Card */}
        <div className="bg-white rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] p-6 mb-6">
          <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[20px] text-[#27374d] mb-2">
            {event.title}
          </h2>
          <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82]">
            {new Date(event.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {" • "}
            {event.location}
          </p>
        </div>

        {/* Feedback Form */}
        <div className="bg-white rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] p-8">
          <form onSubmit={handleSubmit}>
            {/* Attendance Confirmation */}
            <div className="mb-8">
              <label className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[#27374d] mb-3">
                Did you attend this event?
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setAttendanceConfirmed(true)}
                  className={`flex-1 py-3 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] transition-colors ${
                    attendanceConfirmed
                      ? "bg-[#27374d] text-[#dde6ed] hover:bg-[#1e2936]"
                      : "bg-[#eff6ff] text-[#27374d] hover:bg-[#dde6ed]"
                  }`}
                >
                  Yes, I attended
                </button>
                <button
                  type="button"
                  onClick={() => setAttendanceConfirmed(false)}
                  className={`flex-1 py-3 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] transition-colors ${
                    !attendanceConfirmed
                      ? "bg-[#27374d] text-[#dde6ed] hover:bg-[#1e2936]"
                      : "bg-[#eff6ff] text-[#27374d] hover:bg-[#dde6ed]"
                  }`}
                >
                  No, I couldn't make it
                </button>
              </div>
            </div>

            {attendanceConfirmed ? (
              <>
                {/* Rating */}
                <div className="mb-8">
                  <label className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[#27374d] mb-3">
                    How would you rate this event? *
                  </label>
                  <div className="flex gap-2 justify-center py-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-12 h-12 ${
                            star <= (hoveredRating || rating)
                              ? "fill-[#EC9B3B] text-[#EC9B3B]"
                              : "text-[#526d82]"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-center font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[#27374d]">
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
                    label="Share your experience (optional)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={500}
                    rows={6}
                  />
                  <p className="mt-2 font-['Inter:Regular',sans-serif] text-[12px] text-[#526d82]">
                    {comment.length} / 500 characters
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#27374d] text-[#dde6ed] py-3 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[16px] hover:bg-[#1e2936] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82] mb-6">
                  We're sorry you couldn't attend. Would you like to tell us why?
                </p>
                <div className="mb-4">
                  <FloatingLabelTextarea
                    id="comment-absent"
                    label="What prevented you from attending?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={500}
                    rows={4}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#27374d] text-[#dde6ed] py-3 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[16px] hover:bg-[#1e2936] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Privacy Notice */}
        <div className="mt-6 bg-white rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] p-4">
          <p className="font-['Inter:Regular',sans-serif] text-[12px] text-[#526d82] text-center">
            Your feedback will be shared with the event organizer and may be displayed publicly to help other attendees make informed decisions.
          </p>
        </div>
      </div>
    </div>
  );
}