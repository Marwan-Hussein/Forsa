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
  Bell,
  ChevronRight,
  MapPin,
  Clock as ClockIcon,
  DollarSign,
  User,
} from "lucide-react";

// ----------------------------------------------------------------------
// Mock Data (inline)
// ----------------------------------------------------------------------
const mockEvents = [
  {
    id: "1",
    title: "Tech Conference 2025",
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
  {
    id: "5",
    title: "Marketing Masterclass",
    description: "Learn modern marketing strategies from experts.",
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Chicago, IL",
    category: "Business",
    price: 149,
    imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    capacity: 150,
    attendees: 98,
    organizer: "Marketing Pros",
    tags: ["Business", "Marketing"],
  },
  {
    id: "6",
    title: "Rock the Night",
    description: "Live rock concert with multiple bands.",
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    location: "Los Angeles, CA",
    category: "Music",
    price: 45,
    imageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    capacity: 800,
    attendees: 523,
    organizer: "Live Nation",
    tags: ["Music", "Rock", "Concert"],
  },
];

// ----------------------------------------------------------------------
// Event Card Components (inline)
// ----------------------------------------------------------------------
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

// Vertical Card (for grids)
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
      <div className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
        <div className="relative h-40">
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <button
            onClick={handleWishlistClick}
            className="absolute top-3 right-3 w-8 h-8 cursor-pointer bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
          >
            <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-[#ec4899] text-[#ec4899]' : 'text-muted-foreground'}`} />
          </button>
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-primary text-xs font-medium px-2.5 py-1 rounded-full">
            {event.category}
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-primary line-clamp-1">{event.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1 mb-2">{event.description}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <ClockIcon className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[100px]">{event.location}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="font-bold text-primary">${event.price}</span>
            <span className="text-xs text-muted-foreground">{event.attendees} going</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Horizontal Card (for list view)
function EventCardHorizontal({ event, onToggleWishlist, isInWishlist }: { event: Event; onToggleWishlist: (id: string) => void; isInWishlist: boolean }) {
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleWishlist(event.id);
  };

  return (
    <Link to={`/events/${event.id}`} className="group block cursor-pointer">
      <div className="bg-card rounded-xl border border-border p-3 flex gap-3 hover:shadow-md transition-all">
        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-primary text-sm line-clamp-1">{event.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{event.description}</p>
            </div>
            <button onClick={handleWishlistClick} className="ml-2 flex-shrink-0 cursor-pointer hover:text-[#ec4899] transition-all duration-300 ease-in-out">
              <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-[#ec4899] text-[#ec4899]' : 'text-muted-foreground'}`} />
            </button>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <ClockIcon className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[120px]">{event.location}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="font-semibold text-primary text-sm">${event.price}</span>
            <span className="text-xs text-muted-foreground">{event.attendees} going</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ----------------------------------------------------------------------
// Main Dashboard Component
// ----------------------------------------------------------------------
export default function AttendeeDashboard() {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const userName = "Alex";
  const userInterests = ["Business", "Technology", "Music"];

  const recommendedEvents = mockEvents
    .filter((event) => {
      const categoryMatch = userInterests.some((interest) =>
        event.category.toLowerCase().includes(interest.toLowerCase())
      );
      const tagMatch = event.tags.some((tag) =>
        userInterests.some((interest) => tag.toLowerCase().includes(interest.toLowerCase()))
      );
      return categoryMatch || tagMatch;
    })
    .slice(0, 4);

  const today = new Date();
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const thisWeekEvents = mockEvents
    .filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= today && eventDate <= weekFromNow;
    })
    .slice(0, 4);

  const toggleWishlist = (eventId: string) => {
    setWishlist((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    );
  };

  const quickStats = [
    { label: "Upcoming", value: "3", icon: Calendar, color: "#155dfc", link: "/my-events" },
    { label: "Wishlist", value: wishlist.length.toString(), icon: Heart, color: "#ec4899", link: "/wishlist" },
    { label: "Attended", value: "12", icon: Star, color: "#eab308", link: "/my-events" },
    { label: "Following", value: "2", icon: Zap, color: "#9810fa", link: "/organizations" },
  ];

  // Featured event (first in recommended)
  const featuredEvent = recommendedEvents[0] || mockEvents[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent via-card to-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header with avatar and search */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-bold text-xl">
              {userName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">Welcome back, {userName}!</h1>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 cursor-pointer text-muted-foreground hover:text-primary hover:bg-card rounded-xl transition-all">
              <Bell className="w-5 h-5" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search events..."
                className="pl-9 pr-4 py-2 bg-card border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-64"
              />
            </div>
          </div>
        </div>

        {/* Hero Featured Event */}
        {featuredEvent && (
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE_IN_OUT }}
          >
            <Link to={`/events/${featuredEvent.id}`} className="group block cursor-pointer">
              <div className="relative h-64 overflow-hidden rounded-3xl shadow-[0_20px_50px_-20px_rgb(var(--color-primary)/0.35)] ring-1 ring-white/10 transition-[transform,box-shadow] duration-300 ease-in-out group-hover:-translate-y-1 group-hover:shadow-[0_28px_60px_-18px_rgb(var(--color-primary)/0.45)] md:h-80">
                <img src={featuredEvent.imageUrl} alt={featuredEvent.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <span className="bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 inline-block">
                    Featured
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">{featuredEvent.title}</h2>
                  <p className="text-sm text-white/80 mb-3 line-clamp-2">{featuredEvent.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(featuredEvent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {featuredEvent.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {featuredEvent.attendees} going
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Quick Stats as Pills */}
        <div className="mb-10 flex flex-wrap gap-3">
          {quickStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3, ease: EASE_IN_OUT }}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to={stat.link}
                className="flex items-center gap-2 rounded-full border border-border bg-card/95 px-4 py-2 shadow-sm backdrop-blur-sm transition-shadow duration-300 ease-in-out hover:border-border/80 hover:shadow-md cursor-pointer"
              >
                <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
                <span className="text-sm font-medium text-primary">
                  {stat.value} {stat.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Your upcoming events (list) */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-primary">Your upcoming</h2>
              <Link to="/my-events" className="text-sm text-[#155dfc] hover:text-[#0f4ac0] flex items-center gap-1 cursor-pointer">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {thisWeekEvents.slice(0, 3).map((event) => (
                <EventCardHorizontal
                  key={event.id}
                  event={event}
                  onToggleWishlist={toggleWishlist}
                  isInWishlist={wishlist.includes(event.id)}
                />
              ))}
            </div>
          </div>

          {/* Right column: Recommended for you (grid) */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-semibold text-primary">Recommended for you</h2>
              </div>
              <Link to="/recommendations" className="text-sm text-[#155dfc] hover:text-[#0f4ac0] flex items-center gap-1 cursor-pointer">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>

        {/* Trending this week */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#155dfc]" />
              <h2 className="text-lg font-semibold text-primary">Trending this week</h2>
            </div>
            <Link to="/events" className="text-sm text-[#155dfc] hover:text-[#0f4ac0] flex items-center gap-1 cursor-pointer">
              See all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {thisWeekEvents.map((event) => (
              <EventCardVertical
                key={event.id}
                event={event}
                onToggleWishlist={toggleWishlist}
                isInWishlist={wishlist.includes(event.id)}
              />
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
          <Link
            to="/organizations"
            className="bg-white rounded-xl border border-muted/10 p-5 hover:shadow-md transition-all flex items-center gap-4 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#9810fa]/10 to-[#9810fa]/5 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#9810fa]" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-primary">Organizations</p>
              <p className="text-xs text-muted-foreground">Follow your favorites</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>

          <Link
            to="/wishlist"
            className="bg-white rounded-xl border border-muted/10 p-5 hover:shadow-md transition-all flex items-center gap-4 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#ec4899]/10 to-[#ec4899]/5 flex items-center justify-center">
              <Heart className="w-5 h-5 text-[#ec4899]" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Wishlist</p>
              <p className="text-xs text-muted-foreground">{wishlist.length} saved events</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>

          <Link
            to="/my-events"
            className="bg-white rounded-xl border border-muted/10 p-5 hover:shadow-md transition-all flex items-center gap-4 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#155dfc]/10 to-[#155dfc]/5 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#155dfc]" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">My events</p>
              <p className="text-xs text-muted-foreground">View your bookings</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </div>
  );
}