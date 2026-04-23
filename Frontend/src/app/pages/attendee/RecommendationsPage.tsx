import { Link } from "react-router";
import { Sparkles, RefreshCw } from "lucide-react";
import { EventCard } from "../../components/EventCard";
import { PageHeader } from "../../components/PageHeader";
import { useWishlist } from "../../hooks/useWishlist";
import { mockEvents } from "../../data/mockData";
import { toast } from "sonner";

export default function RecommendationsPage() {
  const userInterests = ["Business", "Technology", "Music"];
  const { toggle: toggleWishlist, has: isInWishlist } = useWishlist();

  const recommendedEvents = mockEvents
    .filter((event) => {
      const categoryMatch = userInterests.some((interest) =>
        event.category.toLowerCase().includes(interest.toLowerCase()),
      );
      const tagMatch = event.tags.some((tag) =>
        userInterests.some((interest) => tag.toLowerCase().includes(interest.toLowerCase())),
      );
      return categoryMatch || tagMatch;
    })
    .sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return 0;
    });

  const otherEvents = mockEvents.filter((event) => !recommendedEvents.includes(event));

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Recommended For You"
          subtitle="Events matched to your interests"
          titleIcon={<Sparkles className="h-8 w-8 text-accent" />}
          actions={
            <button
              onClick={() => toast.info("Recommendations refreshed! (demo)")}
              className="flex items-center gap-2 rounded-lg border border-[rgba(82,109,130,0.2)] bg-white px-4 py-2 font-['Inter:Medium',sans-serif] text-[14px] font-medium text-foreground transition-all duration-300 ease-in-out hover:border-primary/30 hover:bg-[#f8f9fa] active:scale-[0.98]"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          }
        />

        <div className="mb-6 rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] bg-white p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-background">
              <Sparkles className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="mb-2 font-['Inter:Semi_Bold',sans-serif] text-[16px] font-semibold text-foreground">
                Personalized Just For You
              </h3>
              <p className="mb-3 font-['Inter:Regular',sans-serif] text-[14px] text-muted-foreground">
                Based on your interests: {userInterests.join(", ")}
              </p>
              <Link
                to="/interests"
                className="inline-flex items-center gap-2 font-['Inter:Medium',sans-serif] text-[14px] font-medium text-foreground transition-colors duration-300 ease-in-out hover:text-[#1e2936]"
              >
                Update your interests →
              </Link>
            </div>
          </div>
        </div>

        {recommendedEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6 font-['Inter:Semi_Bold',sans-serif] text-[24px] font-semibold text-foreground">
              Top Picks For You
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommendedEvents.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  animationIndex={index}
                  onToggleWishlist={toggleWishlist}
                  isInWishlist={isInWishlist(event.id)}
                />
              ))}
            </div>
          </div>
        )}

        {otherEvents.length > 0 && (
          <div>
            <h2 className="mb-6 font-['Inter:Semi_Bold',sans-serif] text-[24px] font-semibold text-foreground">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {otherEvents.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  animationIndex={index + recommendedEvents.length}
                  onToggleWishlist={toggleWishlist}
                  isInWishlist={isInWishlist(event.id)}
                />
              ))}
            </div>
          </div>
        )}

        {recommendedEvents.length === 0 && otherEvents.length === 0 && (
          <div className="rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] bg-white p-12 text-center">
            <Sparkles className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <p className="mb-2 font-['Inter:Semi_Bold',sans-serif] text-[18px] font-semibold text-foreground">
              No recommendations yet
            </p>
            <p className="mb-6 font-['Inter:Regular',sans-serif] text-[14px] text-muted-foreground">
              Add some interests to get personalized event recommendations
            </p>
            <Link
              to="/interests"
              className="inline-block rounded-lg bg-primary px-6 py-3 font-['Inter:Medium',sans-serif] text-[16px] font-medium text-[#dde6ed] transition-all duration-300 ease-in-out hover:bg-[#1e2936] active:scale-[0.98]"
            >
              Set Your Interests
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
