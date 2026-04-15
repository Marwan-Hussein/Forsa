import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { EventCard } from "../../components/EventCard";
import { PageHeader } from "../../components/PageHeader";
import { useWishlist } from "../../hooks/useWishlist";
import { mockEvents } from "../../data/mockData";

export default function EventsPage() {
  const [selectedDiscovery, setSelectedDiscovery] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDate, setSelectedDate] = useState("All");
  const [priceRange, setPriceRange] = useState("All");
  const [locationFilter, setLocationFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const { toggle: toggleWishlist, has: isInWishlist } = useWishlist();

  const discoveryFilters = ["All", "Recommended", "Near Me"];
  const categories = ["All", "Business", "Music", "Art", "Sports", "Food", "Education"];
  const dateFilters = ["All", "This Week", "This Month", "Next Month"];
  const priceFilters = ["All", "Free", "Under $50", "$50-$150", "Over $150"];
  const recommendedCategories = new Set(["Business", "Music", "Sports", "Education"]);
  const nearbyLocationKeywords = ["san francisco", "oakland", "san jose", "bay area"];

  const filteredEvents = mockEvents.filter((event) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory = selectedCategory === "All" || event.category === selectedCategory;

    // Location filter
    const matchesLocation =
      locationFilter === "" ||
      event.location.toLowerCase().includes(locationFilter.toLowerCase());

    // Price filter
    let matchesPrice = true;
    if (priceRange === "Free") {
      matchesPrice = event.price === "Free";
    } else if (priceRange === "Under $50") {
      matchesPrice = typeof event.price === "number" && event.price < 50;
    } else if (priceRange === "$50-$150") {
      matchesPrice = typeof event.price === "number" && event.price >= 50 && event.price <= 150;
    } else if (priceRange === "Over $150") {
      matchesPrice = typeof event.price === "number" && event.price > 150;
    }

    // Date filter (simplified)
    let matchesDate = true;
    if (selectedDate !== "All") {
      const eventDate = new Date(event.date);
      const today = new Date();
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      if (selectedDate === "This Week") {
        matchesDate = eventDate <= weekFromNow;
      } else if (selectedDate === "This Month") {
        matchesDate = eventDate <= monthFromNow;
      }
    }

    // Discovery filter
    let matchesDiscovery = true;
    if (selectedDiscovery === "Recommended") {
      matchesDiscovery = event.isFeatured || recommendedCategories.has(event.category);
    } else if (selectedDiscovery === "Near Me") {
      const normalizedLocation = event.location.toLowerCase();
      matchesDiscovery = nearbyLocationKeywords.some((keyword) =>
        normalizedLocation.includes(keyword),
      );
    }

    return (
      matchesSearch &&
      matchesCategory &&
      matchesLocation &&
      matchesPrice &&
      matchesDate &&
      matchesDiscovery
    );
  });

  const displayEvents = [...filteredEvents].sort((a, b) => {
    if (selectedDiscovery === "Recommended") {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      return b.attendees - a.attendees;
    }
    if (selectedDiscovery === "Near Me") {
      const score = (location: string) => {
        const normalized = location.toLowerCase();
        const idx = nearbyLocationKeywords.findIndex((keyword) =>
          normalized.includes(keyword),
        );
        return idx === -1 ? 999 : idx;
      };
      return score(a.location) - score(b.location);
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#eff6ff] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <PageHeader title="Browse Events" subtitle="Discover amazing events happening near you" />

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#526d82]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events by name, location, or keyword..."
                className="w-full pl-10 pr-4 py-3 rounded-[8px] border-[0.8px] border-[rgba(82,109,130,0.2)] focus:outline-none focus:border-[#27374d] font-['Inter:Regular',sans-serif] text-[14px]"
              />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex cursor-pointer items-center gap-2 px-6 py-3 bg-[#27374d] text-[#dde6ed] rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] hover:bg-[#1e2936] transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {(selectedDiscovery !== "All" ||
                selectedCategory !== "All" ||
                selectedDate !== "All" ||
                priceRange !== "All" ||
                locationFilter) && (
                <span className="ml-1 px-2 py-0.5 bg-[#EC9B3B] rounded-full text-[12px]">
                  Active
                </span>
              )}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-[rgba(82,109,130,0.2)] space-y-4">
              {/* Discovery Filter */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[#27374d] mb-2">
                  Discovery
                </label>
                <div className="flex flex-wrap gap-2">
                  {discoveryFilters.map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setSelectedDiscovery(mode)}
                      className={`cursor-pointer px-4 py-2 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] transition-colors ${
                        selectedDiscovery === mode
                          ? "bg-[#27374d] text-[#dde6ed] hover:bg-[#1e2936]"
                          : "bg-white border-[0.8px] border-[rgba(82,109,130,0.2)] text-[#27374d] hover:border-[#27374d] hover:bg-[#f8f9fa]"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[#27374d] mb-2">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`cursor-pointer px-4 py-2 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] transition-colors ${
                        selectedCategory === category
                          ? "bg-[#27374d] text-[#dde6ed] hover:bg-[#1e2936]"
                          : "bg-white border-[0.8px] border-[rgba(82,109,130,0.2)] text-[#27374d] hover:border-[#27374d] hover:bg-[#f8f9fa]"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[#27374d] mb-2">
                  Date Range
                </label>
                <div className="flex flex-wrap gap-2">
                  {dateFilters.map((date) => (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`cursor-pointer px-4 py-2 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] transition-colors ${
                        selectedDate === date
                          ? "bg-[#27374d] text-[#dde6ed] hover:bg-[#1e2936]"
                          : "bg-white border-[0.8px] border-[rgba(82,109,130,0.2)] text-[#27374d] hover:border-[#27374d] hover:bg-[#f8f9fa]"
                      }`}
                    >
                      {date}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[#27374d] mb-2">
                  Price Range
                </label>
                <div className="flex flex-wrap gap-2">
                  {priceFilters.map((price) => (
                    <button
                      key={price}
                      onClick={() => setPriceRange(price)}
                      className={`cursor-pointer px-4 py-2 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] transition-colors ${
                        priceRange === price
                          ? "bg-[#27374d] text-[#dde6ed] hover:bg-[#1e2936]"
                          : "bg-white border-[0.8px] border-[rgba(82,109,130,0.2)] text-[#27374d] hover:border-[#27374d] hover:bg-[#f8f9fa]"
                      }`}
                    >
                      {price}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[#27374d] mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  placeholder="Enter city or venue..."
                  className="w-full max-w-md px-4 py-3 rounded-[8px] border-[0.8px] border-[rgba(82,109,130,0.2)] focus:outline-none focus:border-[#27374d] font-['Inter:Regular',sans-serif] text-[14px]"
                />
              </div>

              {/* Clear Filters */}
              {(selectedDiscovery !== "All" ||
                selectedCategory !== "All" ||
                selectedDate !== "All" ||
                priceRange !== "All" ||
                locationFilter) && (
                <button
                  onClick={() => {
                    setSelectedDiscovery("All");
                    setSelectedCategory("All");
                    setSelectedDate("All");
                    setPriceRange("All");
                    setLocationFilter("");
                  }}
                  className="flex cursor-pointer items-center gap-2 px-4 py-2 text-[#526d82] hover:text-[#27374d] font-['Inter:Medium',sans-serif] font-medium text-[14px]"
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82]">
            Found {displayEvents.length} event{displayEvents.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Events Grid */}
        {displayEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayEvents.map((event, index) => (
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
          <div className="bg-white rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] p-12 text-center">
            <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[18px] text-[#27374d] mb-2">
              No events found
            </p>
            <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82]">
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </div>
    </div>
  );
}