import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { EASE_IN_OUT } from "../../lib/motion";
import {
  Sparkles,
  Calendar,
  ArrowRight,
  TrendingUp,
  Clock,
  Heart,
  Star,
  Zap,
  Users,
  Search,
  ChevronRight,
  MapPin,
  Clock as ClockIcon,
} from "lucide-react";

// Mock Data
const mockEvents = [
  {
    id: "1",
    title: "Tech Conference 2026",
    description: "Join the biggest tech conference of the year with industry leaders.",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    location: "San Francisco, CA",
    category: "Technology",
    price: 299,
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    capacity: 500,
    attendees: 342,
    organizer: "Tech Events Inc.",
    tags: ["Technology", "Business", "Networking"],
  },
  {
    id: "2",
    title: "Startup Pitch Night",
    description: "Watch top startups pitch to investors and network with founders.",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    location: "New York, NY",
    category: "Business",
    price: 50,
    imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    capacity: 200,
    attendees: 156,
    organizer: "Startup Grind",
    tags: ["Business", "Startup", "Networking"],
  },
  {
    id: "3",
    title: "Jazz in the Park",
    description: "An evening of smooth jazz with top musicians in the park.",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Austin, TX",
    category: "Music",
    price: 25,
    imageUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    capacity: 300,
    attendees: 187,
    organizer: "Austin Music Society",
    tags: ["Music", "Outdoor", "Jazz"],
  },
  {
    id: "4",
    title: "AI & Machine Learning Summit",
    description: "Deep dive into the latest AI advancements and applications.",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Boston, MA",
    category: "Technology",
    price: 399,
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    capacity: 400,
    attendees: 210,
    organizer: "AI Alliance",
    tags: ["Technology", "AI", "Machine Learning"],
  },
];

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  price: number;
  imageUrl: string;
  capacity: number;
  attendees: number;
  organizer: string;
  tags: string[];
}

function EventCardVertical({ event, onToggleWishlist, isInWishlist }: { event: Event; onToggleWishlist: (id: string) => void; isInWishlist: boolean }) {
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleWishlist(event.id);
  };

  return (
    <Link to={`/events/${event.id}`} className="group block cursor-pointer">
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300">
        <div className="relative h-48">
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <button
            onClick={handleWishlistClick}
            className="absolute top-4 right-4 w-10 h-10 cursor-pointer bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white hover:scale-110 shadow-sm transition-all z-10"
          >
            <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
          </button>
          <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-['Inter:Bold',sans-serif] font-bold px-3 py-1.5 rounded-full shadow-sm">
            {event.category}
          </span>
        </div>
        <div className="p-5">
          <h3 className="font-['Inter:Bold',sans-serif] font-bold text-slate-800 text-lg line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">{event.title}</h3>
          <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500 line-clamp-2 mb-4">{event.description}</p>
          <div className="flex items-center gap-4 text-xs font-['Inter:Medium',sans-serif] text-slate-500 mb-4">
            <div className="flex items-center gap-1.5">
              <ClockIcon className="w-4 h-4 text-blue-500" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span className="truncate max-w-[100px]">{event.location}</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="font-['Inter:Bold',sans-serif] font-bold text-slate-800 text-lg">${event.price}</span>
            <span className="text-xs font-['Inter:Bold',sans-serif] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">{event.attendees} going</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function EventCardHorizontal({ event, onToggleWishlist, isInWishlist }: { event: Event; onToggleWishlist: (id: string) => void; isInWishlist: boolean }) {
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleWishlist(event.id);
  };

  return (
    <Link to={`/events/${event.id}`} className="group block cursor-pointer">
      <div className="bg-white rounded-2xl border border-slate-100 p-3 flex gap-4 hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-100 transition-all duration-300">
        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 relative">
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-['Inter:Bold',sans-serif] font-bold text-slate-800 text-base line-clamp-1 group-hover:text-blue-600 transition-colors">{event.title}</h3>
              <div className="flex items-center gap-3 mt-1.5 text-xs font-['Inter:Medium',sans-serif] text-slate-500">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-blue-500" />{formattedDate}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-rose-500" /><span className="truncate max-w-[120px]">{event.location}</span></span>
              </div>
            </div>
            <button onClick={handleWishlistClick} className="flex-shrink-0 cursor-pointer p-1.5 hover:bg-rose-50 rounded-full transition-all">
              <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-rose-500 text-rose-500' : 'text-slate-300 hover:text-rose-400'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="font-['Inter:Bold',sans-serif] font-bold text-slate-800">${event.price}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function AttendeeDashboard() {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const userName = "Alex";

  const recommendedEvents = mockEvents.slice(0, 4);
  const thisWeekEvents = mockEvents.slice(0, 3);
  const featuredEvent = mockEvents[0];

  const toggleWishlist = (eventId: string) => {
    setWishlist((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    );
  };

  const quickStats = [
    { label: "Upcoming", value: "3", icon: Calendar, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", link: "/my-events" },
    { label: "Wishlist", value: wishlist.length.toString(), icon: Heart, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", link: "/wishlist" },
    { label: "Attended", value: "12", icon: Star, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", link: "/my-events" },
    { label: "Following", value: "2", icon: Zap, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100", link: "/organizations" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 tracking-tight">
              Ready for your next experience, {userName}? 🚀
            </h1>
            <p className="text-slate-500 font-['Inter:Medium',sans-serif] mt-2 text-lg">
              Discover amazing events tailored just for you.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search events, venues..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-['Inter:Medium',sans-serif] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {quickStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3, ease: EASE_IN_OUT }}
            >
              <Link
                to={stat.link}
                className={`flex items-center gap-4 p-4 rounded-2xl bg-white border ${stat.border} hover:shadow-md transition-all group`}
              >
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 leading-tight">{stat.value}</p>
                  <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500">{stat.label}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Hero Featured Event */}
        {featuredEvent && (
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE_IN_OUT }}
          >
            <Link to={`/events/${featuredEvent.id}`} className="group block cursor-pointer">
              <div className="relative h-80 sm:h-96 md:h-[450px] overflow-hidden rounded-[2.5rem] shadow-2xl shadow-blue-900/10 transition-transform duration-500 hover:scale-[1.01]">
                <img src={featuredEvent.imageUrl} alt={featuredEvent.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-transparent mix-blend-overlay" />
                
                <div className="absolute bottom-0 left-0 p-8 sm:p-12 w-full md:w-2/3">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-['Inter:Bold',sans-serif] font-bold px-4 py-1.5 rounded-full shadow-lg">
                      Featured Event
                    </span>
                    <span className="bg-white/20 backdrop-blur-md text-white border border-white/20 text-xs font-['Inter:Bold',sans-serif] font-bold px-4 py-1.5 rounded-full">
                      {featuredEvent.category}
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-['Inter:Bold',sans-serif] font-bold text-white mb-3 leading-tight text-balance group-hover:text-blue-200 transition-colors">
                    {featuredEvent.title}
                  </h2>
                  <p className="text-base sm:text-lg font-['Inter:Medium',sans-serif] text-white/80 mb-6 line-clamp-2 max-w-2xl">
                    {featuredEvent.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-6 text-sm font-['Inter:Medium',sans-serif] text-white/90">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                        <Calendar className="w-4 h-4" />
                      </div>
                      {new Date(featuredEvent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                        <MapPin className="w-4 h-4" />
                      </div>
                      {featuredEvent.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                        <Users className="w-4 h-4" />
                      </div>
                      {featuredEvent.attendees} Attending
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Right column: Recommended for you (Grid) - Order flipped on desktop */}
          <div className="lg:col-span-2 lg:order-2">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-amber-500" /> For You
                </h2>
                <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500 mt-1">Curated based on your interests</p>
              </div>
              <Link to="/recommendations" className="text-sm font-['Inter:Bold',sans-serif] text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
                See all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {recommendedEvents.map((event) => (
                <EventCardVertical
                  key={event.id}
                  event={event}
                  onToggleWishlist={toggleWishlist}
                  isInWishlist={wishlist.includes(event.id)}
                />
              ))}
            </div>
          </div>

          {/* Left column: Upcoming events (List) */}
          <div className="lg:col-span-1 lg:order-1">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-rose-500" /> Trending
                </h2>
                <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500 mt-1">Popular right now</p>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3">
              {thisWeekEvents.map((event) => (
                <EventCardHorizontal
                  key={event.id}
                  event={event}
                  onToggleWishlist={toggleWishlist}
                  isInWishlist={wishlist.includes(event.id)}
                />
              ))}
              <Link to="/events" className="block w-full py-3 mt-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-['Inter:Bold',sans-serif] text-center rounded-xl transition-colors">
                Explore More Events
              </Link>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Technology', 'Music', 'Business', 'Arts'].map((cat, i) => (
              <Link key={cat} to="/events" className={`relative h-32 rounded-2xl overflow-hidden group border border-slate-100 shadow-sm cursor-pointer`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  i === 0 ? 'from-blue-500 to-indigo-600' :
                  i === 1 ? 'from-rose-400 to-pink-600' :
                  i === 2 ? 'from-emerald-400 to-teal-600' :
                  'from-amber-400 to-orange-500'
                } opacity-90 group-hover:opacity-100 transition-opacity`} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="font-['Inter:Bold',sans-serif] font-bold text-white text-xl group-hover:scale-110 transition-transform">{cat}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}