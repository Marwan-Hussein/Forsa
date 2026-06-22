import { Link } from "react-router";
import { Heart, Trash2, Calendar, MapPin, Clock } from "lucide-react";
import { useWishlist } from "../../hooks/useWishlist";
import { mockEvents } from "../../data/mockData";
import { motion, AnimatePresence } from "motion/react";
import { EASE_IN_OUT } from "../../lib/motion";

export default function WishlistPage() {
  const { wishlist, toggle: toggleWishlist, has: isInWishlist } = useWishlist(["1", "3", "6"]);
  const wishlistEvents = mockEvents.filter((event) => wishlist.includes(event.id));

  const clearAll = () => {
    if (window.confirm("Are you sure you want to clear your entire wishlist?")) {
      wishlistEvents.forEach((e) => toggleWishlist(e.id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 mb-4 text-slate-500 hover:text-blue-600 transition-colors font-['Inter:Medium',sans-serif] text-sm"
            >
              Back to Dashboard
            </Link>
            <h1 className="font-['Inter:Bold',sans-serif] text-4xl text-slate-800 mb-3 tracking-tight flex items-center gap-3">
              <Heart className="w-8 h-8 fill-rose-500 text-rose-500 drop-shadow-sm" />
              Your Wishlist
            </h1>
            <p className="font-['Inter:Medium',sans-serif] text-slate-500 text-lg">
              {wishlistEvents.length} event{wishlistEvents.length !== 1 ? "s" : ""} saved for later. Don't miss out!
            </p>
          </div>
          
          <AnimatePresence>
            {wishlistEvents.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-2 bg-white border border-rose-200 text-rose-600 px-6 py-3 rounded-xl font-['Inter:Bold',sans-serif] text-sm hover:bg-rose-50 hover:border-rose-300 transition-all shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {wishlistEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {wishlistEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3, delay: index * 0.05, ease: EASE_IN_OUT }}
                  className="bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 group flex flex-col"
                >
                  <div className="relative h-48 shrink-0">
                    <img src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(event.id);
                      }}
                      className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white hover:scale-110 shadow-sm transition-all z-10"
                    >
                      <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                    </button>
                    
                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-['Inter:Bold',sans-serif] px-3 py-1.5 rounded-full shadow-sm">
                      {event.category}
                    </span>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-['Inter:Bold',sans-serif] text-slate-800 text-lg line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors">
                      {event.title}
                    </h3>
                    
                    <div className="space-y-2 mt-auto mb-4">
                      <div className="flex items-center gap-2 text-xs font-['Inter:Medium',sans-serif] text-slate-500">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        <span className="mx-1">•</span>
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        {event.time}
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
                        className="bg-slate-50 text-blue-600 px-4 py-2 rounded-lg font-['Inter:Bold',sans-serif] text-sm hover:bg-blue-50 transition-colors"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm max-w-2xl mx-auto"
          >
            <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-rose-300" />
            </div>
            <p className="font-['Inter:Bold',sans-serif] text-2xl text-slate-800 mb-3">
              Your wishlist is empty
            </p>
            <p className="font-['Inter:Medium',sans-serif] text-slate-500 mb-8 max-w-sm mx-auto">
              Start exploring and save the events you don't want to miss. We'll keep them here for you.
            </p>
            <Link
              to="/events"
              className="inline-flex bg-blue-600 text-white px-8 py-3.5 rounded-xl font-['Inter:Bold',sans-serif] shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
            >
              Explore Events
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
