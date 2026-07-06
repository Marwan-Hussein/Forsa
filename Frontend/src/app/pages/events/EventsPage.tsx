import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { EventCard } from "../../components/EventCard";
import { PageHeader } from "../../components/PageHeader";
import { useWishlist } from "../../hooks/useWishlist";
import { apiGet } from "../../api/api";
import { mapEventDetailsDtoToEvent } from "../../utils/mappers";
import type { Event as EventType } from "../../types/index";

export default function EventsPage() {
  const [searchParams] = useSearchParams();
  
  const [selectedDiscovery, setSelectedDiscovery] = useState("All");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [selectedDate, setSelectedDate] = useState("All");
  const [priceRange, setPriceRange] = useState("All");
  const [locationFilter, setLocationFilter] = useState(searchParams.get("location") || "");
  const [showFilters, setShowFilters] = useState(false);
  const { toggle: toggleWishlist, has: isInWishlist } = useWishlist();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedDate, priceRange, locationFilter, selectedDiscovery]);

  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
    setSelectedCategory(searchParams.get("category") || "All");
    setLocationFilter(searchParams.get("location") || "");
  }, [searchParams]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await apiGet("/api/events") as any[];
        setEvents(data.map(mapEventDetailsDtoToEvent));
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const discoveryFilters = ["All", "Recommended", "Near Me"];
  const categories = ["All", "Business", "Music", "Art", "Sports", "Food", "Education"];
  const dateFilters = ["All", "This Week", "This Month", "Next Month"];
  const priceFilters = ["All", "Free", "Under $50", "$50-$150", "Over $150"];
  const recommendedCategories = new Set(["Business", "Music", "Sports", "Education"]);
  const nearbyLocationKeywords = ["san francisco", "oakland", "san jose", "bay area"];

  const filteredEvents = events.filter((event) => {
    // Status filter - only show Approved or Published events
    if (event.status !== "Approved" && event.status !== "Published") {
      return false;
    }

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
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative bg-[var(--brand-deep-navy)] pt-36 pb-28 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0" style={{ background: "linear-gradient(135deg, var(--brand-deep-navy) 0%, var(--brand-navy) 100%)" }} />
        <div className="absolute inset-0 z-0 overflow-hidden mix-blend-screen pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full filter blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--brand-blue-accent)]/20 rounded-full filter blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-white/90 text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-md border border-white/20">
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
            Discover & Book <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-blue-400">Exceptional Events</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed font-light">
            Elevate your experiences. Gain access to exclusive gatherings, professional summits, and vibrant festivals all in one beautifully curated platform.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-10 pb-20">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-xl shadow-[var(--brand-shadow-soft)] border border-slate-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[var(--brand-navy)] transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events by name, location, or keyword..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:outline-none focus:border-[var(--brand-navy)] focus:ring-1 focus:ring-[var(--brand-navy)]/30 font-medium text-slate-800 transition-all duration-300 bg-slate-50 focus:bg-white"
              />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-8 py-4 bg-[var(--brand-navy)] text-white rounded-xl font-bold hover:bg-[var(--brand-navy)]/90 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
              {(selectedDiscovery !== "All" ||
                selectedCategory !== "All" ||
                selectedDate !== "All" ||
                priceRange !== "All" ||
                locationFilter) && (
                <span className="ml-2 w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              )}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Discovery Filter */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Discovery
                </label>
                <div className="flex flex-wrap gap-2">
                  {discoveryFilters.map((mode) => {
                    const isActive = selectedDiscovery === mode;
                    return (
                      <button
                        key={mode}
                        onClick={() => setSelectedDiscovery(mode)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          isActive
                            ? "bg-[var(--brand-navy)] text-white shadow-md shadow-[var(--brand-navy)]/20 scale-105"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
                        }`}
                      >
                        {mode}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-3 lg:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const isActive = selectedCategory === category;
                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          isActive
                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 scale-105"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Filter */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Date Range
                </label>
                <div className="flex flex-wrap gap-2">
                  {dateFilters.map((date) => {
                    const isActive = selectedDate === date;
                    return (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          isActive
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-105"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
                        }`}
                      >
                        {date}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Filter */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Price
                </label>
                <div className="flex flex-wrap gap-2">
                  {priceFilters.map((price) => {
                    const isActive = priceRange === price;
                    return (
                      <button
                        key={price}
                        onClick={() => setPriceRange(price)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          isActive
                            ? "bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-105"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
                        }`}
                      >
                        {price}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location Filter */}
              <div className="space-y-3 lg:col-span-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Location
                </label>
                <input
                  type="text"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  placeholder="Enter city, neighborhood, or venue..."
                  className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[var(--brand-navy)] focus:ring-1 focus:ring-[var(--brand-navy)]/30 font-medium text-slate-800 transition-all duration-300 bg-slate-50 focus:bg-white"
                />
              </div>

              {/* Clear Filters */}
              <div className="flex items-end lg:col-span-1 pb-1">
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
                    className="flex items-center justify-center gap-2 w-full py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold text-sm transition-colors border border-transparent hover:border-red-100 active:scale-95"
                  >
                    <X className="w-4 h-4" />
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Trending Now</h2>
          <p className="font-medium text-sm text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
            Found <span className="text-[var(--brand-navy)] font-bold">{displayEvents.length}</span> event{displayEvents.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="bg-white rounded-[14px] border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
             <div className="w-10 h-10 border-4 border-[var(--brand-navy)] border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="font-semibold text-lg text-slate-800 mb-2">
               Discovering events...
             </p>
          </div>
        ) : displayEvents.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  animationIndex={index}
                  onToggleWishlist={toggleWishlist}
                  isInWishlist={isInWishlist(event.id)}
                />
              ))}
            </div>
            
            {Math.ceil(displayEvents.length / itemsPerPage) > 1 && (
              <div className="flex justify-center mt-12 gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage(p => p - 1);
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-lg disabled:opacity-50 font-medium text-slate-600 hover:bg-slate-50 transition-colors bg-white shadow-sm"
                >
                  Previous
                </button>
                <div className="flex gap-1 overflow-x-auto max-w-[200px] sm:max-w-none no-scrollbar">
                  {Array.from({ length: Math.ceil(displayEvents.length / itemsPerPage) }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentPage(i + 1);
                        window.scrollTo({ top: 400, behavior: 'smooth' });
                      }}
                      className={`min-w-[40px] h-10 rounded-lg font-bold transition-all flex items-center justify-center ${currentPage === i + 1 ? 'bg-[var(--brand-navy)] text-white shadow-md' : 'text-slate-600 bg-white shadow-sm hover:bg-slate-50 border border-slate-200'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button 
                  disabled={currentPage === Math.ceil(displayEvents.length / itemsPerPage)}
                  onClick={() => {
                    setCurrentPage(p => p + 1);
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-lg disabled:opacity-50 font-medium text-slate-600 hover:bg-slate-50 transition-colors bg-white shadow-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-[14px] border border-slate-200 shadow-sm p-12 text-center">
            <p className="font-semibold text-lg text-slate-800 mb-2">
              No events found
            </p>
            <p className="text-sm text-slate-500">
              Try adjusting your filters or search query
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
