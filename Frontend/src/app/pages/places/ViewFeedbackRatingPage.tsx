import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  Star,
  TrendingUp,
  MessageSquare,
  Calendar,
  User,
  Filter,
  ChevronRight,
  Building,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
} from "lucide-react";

// Mock feedback data
const mockFeedbacks = [
  {
    id: "1",
    organizationName: "Tech Events Inc.",
    eventName: "Tech Summit 2026",
    eventDate: "2026-03-15",
    rating: 5,
    feedback: "Excellent venue with top-notch facilities. The staff was incredibly helpful and responsive. The AV equipment worked flawlessly, and the space was perfect for our 500 attendees. Highly recommend!",
    submittedDate: "2026-03-16",
    isAnonymous: false,
    wouldRecommend: "yes",
    wouldUseAgain: "yes",
  },
  {
    id: "2",
    organizationName: "Anonymous Organizer",
    eventName: "Product Launch Event",
    eventDate: "2026-02-20",
    rating: 4,
    feedback: "Great venue overall. The space is beautiful and well-maintained. Minor issue with parking availability, but everything else was excellent. The catering service was outstanding.",
    submittedDate: "2026-02-21",
    isAnonymous: true,
    wouldRecommend: "yes",
    wouldUseAgain: "yes",
  },
  {
    id: "3",
    organizationName: "Corporate Solutions",
    eventName: "Business Conference",
    eventDate: "2026-01-10",
    rating: 3,
    feedback: "The venue is nice but could use some improvements. WiFi was spotty during our event which caused some issues. Staff was helpful in resolving problems. Good value for the price.",
    submittedDate: "2026-01-12",
    isAnonymous: false,
    wouldRecommend: "maybe",
    wouldUseAgain: "maybe",
  },
  {
    id: "4",
    organizationName: "Creative Agency",
    eventName: "Design Workshop",
    eventDate: "2026-02-05",
    rating: 5,
    feedback: "Perfect venue for our creative workshop! The natural lighting was amazing, and the flexible space setup allowed us to configure the room exactly as we needed. Will definitely book again.",
    submittedDate: "2026-02-06",
    isAnonymous: false,
    wouldRecommend: "yes",
    wouldUseAgain: "yes",
  },
  {
    id: "5",
    organizationName: "Anonymous Organizer",
    eventName: "Team Building Event",
    eventDate: "2026-01-28",
    rating: 4,
    feedback: "Good experience overall. The venue was clean and well-equipped. Staff was professional and accommodating. Only suggestion would be to improve the sound system in the main hall.",
    submittedDate: "2026-01-29",
    isAnonymous: true,
    wouldRecommend: "yes",
    wouldUseAgain: "yes",
  },
];

type RatingFilter = "all" | "5" | "4" | "3" | "2" | "1";

export default function ViewFeedbackRatingPage() {
  const { placeId } = useParams();
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
  const [selectedFeedback, setSelectedFeedback] = useState<typeof mockFeedbacks[0] | null>(null);

  const mockPlace = {
    id: placeId || "1",
    name: "Grand Convention Center",
    address: "123 Main Street, San Francisco, CA",
    owner: "Michael Chen",
  };

  const filteredFeedbacks = mockFeedbacks.filter(feedback => {
    if (ratingFilter === "all") return true;
    return feedback.rating === parseInt(ratingFilter);
  });

  // Calculate statistics
  const stats = {
    totalReviews: mockFeedbacks.length,
    averageRating: (mockFeedbacks.reduce((sum, f) => sum + f.rating, 0) / mockFeedbacks.length).toFixed(1),
    recommendationRate: Math.round((mockFeedbacks.filter(f => f.wouldRecommend === "yes").length / mockFeedbacks.length) * 100),
    ratingDistribution: {
      5: mockFeedbacks.filter(f => f.rating === 5).length,
      4: mockFeedbacks.filter(f => f.rating === 4).length,
      3: mockFeedbacks.filter(f => f.rating === 3).length,
      2: mockFeedbacks.filter(f => f.rating === 2).length,
      1: mockFeedbacks.filter(f => f.rating === 1).length,
    },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/owner-dashboard" className="hover:text-accent">Dashboard</Link>
          <ChevronRight className="size-4" />
          <Link to="/my-places" className="hover:text-accent">My Venues</Link>
          <ChevronRight className="size-4" />
          <span className="text-foreground">Feedback & Ratings</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Feedback & Ratings</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building className="size-5" />
            <span>{mockPlace.name}</span>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-border/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-accent to-accent/80 rounded-lg">
                <Star className="size-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Average Rating</p>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-bold text-foreground">{stats.averageRating}</p>
              <div className="flex items-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 ${
                      i < Math.floor(parseFloat(stats.averageRating))
                        ? "fill-accent text-accent"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-border/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-lg">
                <MessageSquare className="size-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Reviews</p>
            <p className="text-4xl font-bold text-foreground">{stats.totalReviews}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-border/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <ThumbsUp className="size-6 text-green-600" />
              </div>
              <TrendingUp className="size-5 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Would Recommend</p>
            <p className="text-4xl font-bold text-green-600">{stats.recommendationRate}%</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-border/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-primary/80 to-primary/60 rounded-lg">
                <BarChart3 className="size-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">5-Star Reviews</p>
            <p className="text-4xl font-bold text-foreground">{stats.ratingDistribution[5]}</p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-border/10 mb-6">
          <h2 className="text-xl font-bold text-foreground mb-6">Rating Distribution</h2>
          <div className="space-y-4">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
              const percentage = (count / stats.totalReviews) * 100;
              
              return (
                <div key={rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm font-medium text-foreground">{rating}</span>
                    <Star className="size-4 fill-accent text-accent" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-accent to-accent/80 h-full rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-16 text-right">{count} ({percentage.toFixed(0)}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)] mb-6">
          <div className="flex items-center gap-4">
            <Filter className="size-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filter by rating:</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setRatingFilter("all")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  ratingFilter === "all"
                    ? "bg-primary text-white hover:brightness-95"
                    : "bg-gray-100 text-muted-foreground hover:bg-gray-200"
                }`}
              >
                All ({mockFeedbacks.length})
              </button>
              {[5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setRatingFilter(String(rating) as RatingFilter)}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1 ${
                    ratingFilter === String(rating)
                      ? "bg-accent text-white hover:brightness-95"
                      : "bg-gray-100 text-muted-foreground hover:bg-gray-200"
                  }`}
                >
                  {rating} <Star className="size-4" /> ({stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Customer Reviews ({filteredFeedbacks.length})</h2>
          
          {filteredFeedbacks.length === 0 ? (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-[rgba(39,55,77,0.1)] text-center">
              <MessageSquare className="size-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-foreground mb-2">No reviews found</h3>
              <p className="text-muted-foreground">
                {ratingFilter !== "all"
                  ? "Try adjusting your filter to see more reviews"
                  : "You haven't received any feedback yet"}
              </p>
            </div>
          ) : (
            filteredFeedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)] hover:border-accent transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`size-5 ${
                              i < feedback.rating
                                ? "fill-accent text-accent"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-lg font-bold text-foreground">{feedback.rating}.0</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <User className="size-4" />
                        {feedback.isAnonymous ? "Anonymous Organizer" : feedback.organizationName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-4" />
                        Event: {new Date(feedback.eventDate).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-semibold text-foreground mb-2">{feedback.eventName}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">{feedback.feedback}</p>

                    <div className="flex items-center gap-4 text-sm">
                      {feedback.wouldRecommend === "yes" && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                          <ThumbsUp className="size-3" />
                          Would Recommend
                        </span>
                      )}
                      {feedback.wouldUseAgain === "yes" && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                          Would Use Again
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right text-sm text-muted-foreground">
                    <p>Submitted</p>
                    <p className="font-semibold">{new Date(feedback.submittedDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Insights Section */}
        {filteredFeedbacks.length > 0 && (
          <div className="mt-8 bg-gradient-to-br from-primary to-primary/80 rounded-xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="size-6" />
              Insights & Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Most Common Praise</h3>
                <ul className="text-sm space-y-1 text-white/90">
                  <li>• Excellent facilities</li>
                  <li>• Helpful staff</li>
                  <li>• Great location</li>
                  <li>• Professional service</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Areas for Improvement</h3>
                <ul className="text-sm space-y-1 text-white/90">
                  <li>• WiFi connectivity</li>
                  <li>• Parking availability</li>
                  <li>• Sound system quality</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Quick Stats</h3>
                <ul className="text-sm space-y-1 text-white/90">
                  <li>• {stats.recommendationRate}% would recommend</li>
                  <li>• {Math.round((mockFeedbacks.filter(f => f.wouldUseAgain === "yes").length / mockFeedbacks.length) * 100)}% would book again</li>
                  <li>• {stats.ratingDistribution[5]} five-star reviews</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
