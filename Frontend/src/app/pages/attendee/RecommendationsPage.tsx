import { useState } from "react";
import { Link } from "react-router";
import { Sparkles, RefreshCw, ArrowLeft, Heart, Calendar, MapPin, Star } from "lucide-react";
import { useWishlist } from "../../hooks/useWishlist";
import { mockEvents } from "../../data/mockData";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { EASE_IN_OUT } from "../../lib/motion";

export default function RecommendationsPage() {
  const userInterests = ["Business", "Technology", "Music"];
  const { wishlist, toggle: toggleWishlist } = useWishlist(["1", "3", "6"]);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Algorithm updated. New recommendations loaded!");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-96 h-96 bg-rose-400/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="mb-10">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 mb-6 text-slate-500 hover:text-blue-600 transition-colors font-['Inter:Medium',sans-serif] text-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-['Inter:Bold',sans-serif] text-4xl text-slate-800 mb-3 tracking-tight flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-amber-500" />
                Made For You
              </h1>
              <p className="font-['Inter:Medium',sans-serif] text-slate-500 text-lg">
                Personalized experiences matching your unique taste
              </p>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-['Inter:Bold',sans-serif] text-sm hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm group disabled:opacity-70"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
              {isRefreshing ? "Updating..." : "Refresh Feed"}
            </button>
          </div>
        </div>

        {/* AI Insight Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 sm:p-10 mb-12 shadow-xl shadow-blue-900/20 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
              <Star className="w-10 h-10 text-amber-300" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-['Inter:Bold',sans-serif] text-2xl mb-2">Algorithm Insights</h3>
              <p className="font-['Inter:Medium',sans-serif] text-blue-100 text-lg mb-4">
                We've selected these events because you showed interest in <span className="text-white font-['Inter:Bold',sans-serif]">{userInterests.join(", ")}</span>.
              </p>
              <Link
                to="/interests"
                className="inline-flex items-center bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-md px-5 py-2 rounded-xl text-white font-['Inter:Bold',sans-serif] text-sm transition-all"
              >
                Refine Interests
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Top Picks */}
        {recommendedEvents.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-2 h-8 bg-blue-500 rounded-full" />
              <h2 className="font-['Inter:Bold',sans-serif] text-2xl text-slate-800">Top Match Picks</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recommendedEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4, ease: EASE_IN_OUT }}
                  className="bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 group flex flex-col relative"
                >
                  <div className="absolute top-4 left-4 z-20">
                    <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-['Inter:Bold',sans-serif] shadow-lg flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" /> 98% Match
                    </span>
                  </div>

                  <div className="relative h-48 shrink-0">
                    <img src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <button
                      onClick={(e) => { e.preventDefault(); toggleWishlist(event.id); }}
                      className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white hover:scale-110 shadow-sm transition-all z-10"
                    >
                      <Heart className={`w-5 h-5 ${wishlist.includes(event.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                    </button>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-['Inter:Bold',sans-serif] text-slate-800 text-lg line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-2 mt-auto mb-4">
                      <div className="flex items-center gap-2 text-xs font-['Inter:Medium',sans-serif] text-slate-500">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-['Inter:Medium',sans-serif] text-slate-500">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <span className="font-['Inter:Bold',sans-serif] text-slate-800 text-lg">
                        {event.price === "Free" ? "Free" : `$${event.price}`}
                      </span>
                      <Link
                        to={`/events/${event.id}`}
                        className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-['Inter:Bold',sans-serif] text-sm hover:bg-blue-100 transition-colors"
                      >
                        Explore
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* More to Explore */}
        {otherEvents.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-2 h-8 bg-slate-300 rounded-full" />
              <h2 className="font-['Inter:Bold',sans-serif] text-2xl text-slate-800">More to Explore</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 opacity-90 hover:opacity-100 transition-opacity">
              {otherEvents.slice(0, 4).map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col"
                >
                  <div className="relative h-40 shrink-0">
                    <img src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <button
                      onClick={(e) => { e.preventDefault(); toggleWishlist(event.id); }}
                      className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white transition-all z-10"
                    >
                      <Heart className={`w-4 h-4 ${wishlist.includes(event.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                    </button>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-['Inter:Bold',sans-serif] text-slate-800 text-base line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors">
                      {event.title}
                    </h3>
                    <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="font-['Inter:Bold',sans-serif] text-slate-800 text-sm">
                        {event.price === "Free" ? "Free" : `$${event.price}`}
                      </span>
                      <Link
                        to={`/events/${event.id}`}
                        className="text-blue-600 font-['Inter:Bold',sans-serif] text-sm hover:text-blue-700"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
