import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  Star,
  MessageSquare,
  Send,
  ChevronRight,
  MapPin,
  Calendar,
  Building,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function SubmitOrgToOwnerFeedbackPage() {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxChars = 500;

  // Mock place/venue data
  const mockPlace = {
    id: placeId || "1",
    name: "Grand Convention Center",
    address: "123 Main Street, San Francisco, CA",
    owner: "Michael Chen",
  };

  // Mock event data (the event that was hosted at this venue)
  const mockEvent = {
    id: "1",
    title: "Tech Summit 2026",
    date: "2026-03-15",
    attendees: 500,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert("Please provide a rating before submitting");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    
    // Show success message and redirect
    alert("Feedback submitted successfully! The venue owner will receive your review.");
    navigate("/organizer");
  };

  const feedbackCategories = [
    {
      title: "Venue Quality",
      aspects: ["Cleanliness", "Facilities", "Ambiance", "Space Layout"],
    },
    {
      title: "Service",
      aspects: ["Responsiveness", "Staff Support", "Setup Assistance", "Communication"],
    },
    {
      title: "Amenities",
      aspects: ["AV Equipment", "Catering", "Parking", "Accessibility"],
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 px-6 py-8 max-w-4xl mx-auto w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/organizer" className="hover:text-accent">Dashboard</Link>
          <ChevronRight className="size-4" />
          <Link to="/organizer" className="hover:text-accent">My Events</Link>
          <ChevronRight className="size-4" />
          <span className="text-foreground">Submit Feedback</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Submit Venue Feedback</h1>
          <p className="text-muted-foreground">Share your experience to help the venue owner improve their services</p>
        </div>

        {/* Venue & Event Info Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-border/10 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">VENUE INFORMATION</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building className="size-5 text-accent" />
                  <div>
                    <p className="font-bold text-foreground">{mockPlace.name}</p>
                    <p className="text-sm text-muted-foreground">{mockPlace.address}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  <strong className="text-foreground">Owner:</strong> {mockPlace.owner}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">YOUR EVENT</h3>
              <div className="space-y-2">
                <p className="font-bold text-foreground">{mockEvent.title}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-4" />
                    {new Date(mockEvent.date).toLocaleDateString()}
                  </span>
                  <span>{mockEvent.attendees} attendees</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-border/10">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Star className="size-6 text-accent" />
              Overall Rating *
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              How would you rate your overall experience with this venue?
            </p>
            
            <div className="flex items-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-all hover:scale-110"
                >
                  <Star
                    className={`size-12 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? "fill-accent text-accent"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            
            {rating > 0 && (
              <p className="text-sm text-muted-foreground">
                You rated this venue: <span className="font-semibold text-foreground">{rating} out of 5 stars</span>
              </p>
            )}
          </div>

          {/* Feedback Categories Guide */}
          <div className="bg-gradient-to-br from-primary/80 to-primary/60 rounded-xl p-6 text-white">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <AlertCircle className="size-5" />
              What to Include in Your Feedback
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {feedbackCategories.map((category, index) => (
                <div key={index}>
                  <h4 className="font-semibold mb-2">{category.title}</h4>
                  <ul className="space-y-1 text-sm text-white/90">
                    {category.aspects.map((aspect, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <span className="text-xs">•</span>
                        {aspect}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Feedback */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-border/10">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <MessageSquare className="size-6 text-accent" />
              Detailed Feedback *
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Please share your detailed experience with the venue. Your feedback helps the owner improve their services.
            </p>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required
              maxLength={maxChars}
              rows={8}
              placeholder="Share your thoughts about:&#10;• The venue's facilities and cleanliness&#10;• Staff support and responsiveness&#10;• Setup and technical support&#10;• Overall experience and any suggestions for improvement"
              className="w-full px-4 py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
            />
            
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-muted-foreground">
                {feedback.length} / {maxChars} characters
              </p>
              {feedback.length >= maxChars && (
                <p className="text-sm text-red-600">Character limit reached</p>
              )}
            </div>
          </div>

          {/* Additional Questions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-border/10">
            <h2 className="text-xl font-bold text-foreground mb-4">Additional Questions</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Would you recommend this venue to other organizers?
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="recommend"
                      value="yes"
                      className="size-4 text-accent focus:ring-accent"
                    />
                    <span className="text-foreground">Yes, definitely</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="recommend"
                      value="maybe"
                      className="size-4 text-accent focus:ring-accent"
                    />
                    <span className="text-foreground">Maybe</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="recommend"
                      value="no"
                      className="size-4 text-accent focus:ring-accent"
                    />
                    <span className="text-foreground">No</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Would you use this venue again for future events?
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="useAgain"
                      value="yes"
                      className="size-4 text-accent focus:ring-accent"
                    />
                    <span className="text-foreground">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="useAgain"
                      value="maybe"
                      className="size-4 text-accent focus:ring-accent"
                    />
                    <span className="text-foreground">Maybe</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="useAgain"
                      value="no"
                      className="size-4 text-accent focus:ring-accent"
                    />
                    <span className="text-foreground">No</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-border/10">
            <div className="flex items-start gap-3 mb-6">
              <input
                type="checkbox"
                id="anonymous"
                className="mt-1 size-5 rounded border-primary/20 text-accent focus:ring-accent"
              />
              <label htmlFor="anonymous" className="text-sm text-muted-foreground">
                Submit feedback anonymously (your identity will not be shared with the venue owner)
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 border border-primary text-foreground rounded-lg hover:bg-primary hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || rating === 0 || !feedback.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-accent to-accent/80 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="size-5" />
                    Submit Feedback
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
