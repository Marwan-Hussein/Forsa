import { Link } from "react-router";
import { Heart, Trash2 } from "lucide-react";
import { EventCard } from "../../components/EventCard";
import { PageHeader } from "../../components/PageHeader";
import { useWishlist } from "../../hooks/useWishlist";
import { mockEvents } from "../../data/mockData";

export default function WishlistPage() {
  const { wishlist, toggle: toggleWishlist, has: isInWishlist } = useWishlist(["1", "3", "6"]);

  const wishlistEvents = mockEvents.filter((event) => wishlist.includes(event.id));

  const clearAll = () => {
    if (window.confirm("Are you sure you want to clear your entire wishlist?")) {
      wishlistEvents.forEach((e) => toggleWishlist(e.id));
    }
  };

  return (
    <div className="min-h-screen bg-[#eff6ff] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="My Wishlist"
          subtitle={`${wishlistEvents.length} event${wishlistEvents.length !== 1 ? "s" : ""} saved for later`}
          titleIcon={<Heart className="h-8 w-8 fill-red-500 text-red-500" />}
          actions={
            wishlistEvents.length > 0 ? (
              <button
                onClick={clearAll}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-red-500 px-4 py-2 font-['Inter:Medium',sans-serif] text-[14px] font-medium text-red-500 transition-all duration-300 ease-in-out hover:bg-red-50 hover:text-red-600 active:scale-[0.98]"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </button>
            ) : undefined
          }
        />

        {wishlistEvents.length > 0 && (
          <div className="mb-6 rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eff6ff]">
                <Heart className="h-6 w-6 fill-red-500 text-red-500" />
              </div>
              <div>
                <h3 className="mb-2 font-['Inter:Semi_Bold',sans-serif] text-[16px] font-semibold text-[#27374d]">
                  Your Saved Events
                </h3>
                <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82]">
                  Events in your wishlist are saved for quick access. Book them before they sell out!
                </p>
              </div>
            </div>
          </div>
        )}

        {wishlistEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {wishlistEvents.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                animationIndex={index}
                onToggleWishlist={toggleWishlist}
                isInWishlist={isInWishlist(event.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] bg-white p-12 text-center">
            <Heart className="mx-auto mb-4 h-16 w-16 text-[#526d82]" />
            <p className="mb-2 font-['Inter:Semi_Bold',sans-serif] text-[18px] font-semibold text-[#27374d]">
              Your wishlist is empty
            </p>
            <p className="mb-6 font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82]">
              Start adding events to your wishlist to keep track of events you're interested in
            </p>
            <Link
              to="/events"
              className="inline-block rounded-lg bg-[#27374d] px-6 py-3 font-['Inter:Medium',sans-serif] text-[16px] font-medium text-[#dde6ed] transition-all duration-300 ease-in-out hover:bg-[#1e2936] active:scale-[0.98]"
            >
              Browse Events
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
