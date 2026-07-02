import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Calendar,
  Heart,
  Star,
  MapPin,
  Clock,
  Loader2,
  Ticket,
  ChevronRight,
  CheckCircle2,
  User,
  LogOut,
  LayoutDashboard,
  Settings,
  QrCode,
  TicketX,
  X
} from "lucide-react";
import { useWishlist } from "../../hooks/useWishlist";
import { eventsApi } from "../../api/eventsApi";
import { attendeeApi } from "../../api/attendeeApi";
import { EventDetailsDto, AttendeeBookingDto } from "../../types";
import { getUserIdFromToken } from "../../api/api";

// --- Framer Motion Configurations ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 120, damping: 15 } }
};

// --- Custom Subcomponents for SaaS UI ---

function Barcode() {
  return (
    <div className="flex items-center justify-center gap-[2px] h-10 w-full opacity-60 bg-white/5 rounded px-2 py-1">
      {[1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 2].map((w, i) => (
        <div 
          key={i} 
          className="bg-current rounded-sm shrink-0" 
          style={{ width: `${w}px`, height: "100%" }} 
        />
      ))}
    </div>
  );
}

function PassbookTicket({ booking }: { booking: AttendeeBookingDto }) {
  const date = new Date(booking.eventStartDate);
  const month = date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const day = date.getDate();
  const year = date.getFullYear();
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  
  const [showQR, setShowQR] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);

  const handleViewTicket = async () => {
    setShowQR(true);
    if (!qrUrl) {
      try {
        setLoadingQr(true);
        const url = await attendeeApi.getTicketQr(booking.bookingId);
        setQrUrl(url);
      } catch (err) {
        console.error("Failed to load QR code", err);
      } finally {
        setLoadingQr(false);
      }
    }
  };

  return (
    <>
      <motion.div 
        variants={itemVariants}
        className="relative flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl hover:shadow-[#1E3D61]/5 hover:-translate-y-0.5 transition-all duration-300 group"
      >
        {/* Decorative ticket notch side cuts */}
        <div className="absolute left-full md:left-[70%] top-1/2 md:top-auto md:bottom-full w-5 h-5 bg-[#F8FAFC] rounded-full border border-slate-100 -translate-x-2.5 md:-translate-y-2.5 z-10 hidden sm:block" />
        <div className="absolute right-full md:right-[30%] top-1/2 md:top-auto md:top-full w-5 h-5 bg-[#F8FAFC] rounded-full border border-slate-100 translate-x-2.5 md:-translate-y-2.5 z-10 hidden sm:block" />

        {/* Main Stub */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Confirmed Booking
              </span>
              <span className="bg-slate-50 text-slate-600 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                {booking.eventCategory}
              </span>
            </div>
            
            <Link to={`/events/${booking.eventId}`}>
              <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-[#1E3D61] transition-colors leading-snug">
                {booking.eventTitle}
              </h3>
            </Link>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-[#1E3D61]" />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-slate-400">Date</p>
                  <p className="text-xs font-bold text-slate-700">{month} {day}, {year}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-slate-400">Time</p>
                  <p className="text-xs font-bold text-slate-700">{time}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-dashed border-slate-200">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500 font-medium truncate">
              {booking.eventPlace || "Location Details in Email"}
            </span>
          </div>
        </div>

        {/* Ticket Divider */}
        <div className="w-full md:w-auto flex md:flex-col items-center justify-between px-6 py-1 md:py-6 bg-slate-50/50 md:bg-transparent border-t border-b md:border-t-0 md:border-b-0 md:border-l md:border-r border-dashed border-slate-200 shrink-0">
          <div className="w-2 h-2 rounded-full bg-slate-200 hidden md:block" />
          <div className="h-[1px] md:h-12 w-full md:w-[1px] bg-slate-200 border-dashed" />
          <div className="w-2 h-2 rounded-full bg-slate-200 hidden md:block" />
        </div>

        {/* Barcode Stub */}
        <div className="w-full md:w-56 bg-slate-50 p-6 flex flex-col justify-between items-center text-slate-700">
          <div className="text-center w-full">
            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-2">Gate Pass Code</p>
            <div className="text-slate-800">
              <Barcode />
            </div>
            <p className="text-[9px] font-mono text-slate-400 mt-1">FORSA-{booking.eventId}-{day}{month}</p>
          </div>
          
          <button 
            onClick={handleViewTicket}
            className="w-full mt-4 bg-white hover:bg-[#1E3D61] text-[#1E3D61] hover:text-white border border-[#1E3D61]/15 hover:border-transparent font-bold text-xs py-2 px-3 rounded-lg shadow-sm hover:shadow-md transition-all text-center flex items-center justify-center gap-1.5"
          >
            <QrCode className="w-4 h-4" /> View Ticket
          </button>
        </div>
      </motion.div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowQR(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-auto"
            >
              <button 
                onClick={() => setShowQR(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center mb-6">
                <h3 className="font-bold text-xl text-slate-800 mb-1">Your Ticket</h3>
                <p className="text-sm text-slate-500 font-medium">{booking.eventTitle}</p>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-center aspect-square relative">
                {loadingQr ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-8 h-8 text-[#1E3D61] animate-spin mb-3" />
                    <p className="text-xs text-slate-500 font-medium">Loading ticket...</p>
                  </div>
                ) : qrUrl ? (
                  <img src={qrUrl} alt="Ticket QR" className="w-full h-full object-contain" />
                ) : (
                  <p className="text-rose-500 text-sm font-medium">Failed to load QR code</p>
                )}
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-xs text-slate-400 font-medium max-w-[200px] mx-auto">
                  Show this QR code at the entrance to check in
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function CleanCard({ event, isInWishlist, onToggle }: { event: EventDetailsDto; isInWishlist: boolean; onToggle: (id: string | number) => void }) {
  const date = new Date(event.startDate);
  const formattedDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const eventImg = (event as any).imageUrl || "";

  return (
    <motion.div 
      variants={itemVariants}
      className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-[#1E3D61]/20 hover:shadow-xl hover:shadow-[#1E3D61]/5 hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full group"
    >
      <div className="relative h-44 bg-slate-100 overflow-hidden shrink-0">
        <img
          src={eventImg}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(event.eventId); }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md z-10"
        >
          <Heart className={`w-3.5 h-3.5 transition-colors ${isInWishlist ? "fill-rose-500 text-rose-500" : "text-slate-500"}`} />
        </button>
        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-[#1E3D61] text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
          {event.category}
        </span>
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-white text-xs font-semibold drop-shadow-sm">
          <Clock className="w-3.5 h-3.5" />
          <span>{formattedDate}</span>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <Link to={`/events/${event.eventId}`} className="flex-1">
          <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 mb-2 group-hover:text-[#1E3D61] transition-colors">
            {event.title}
          </h3>
        </Link>
        <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-3">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate font-medium">{event.placeLocation || event.place || "Location TBD"}</span>
        </div>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
          <span className="font-bold text-[#1E3D61] text-sm">
            {event.ticketPrice === 0 ? "Free" : `$${event.ticketPrice}`}
          </span>
          <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
            event.availabilityStatus === "Available" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
          }`}>
            {event.availabilityStatus}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// --- Main Tabs Content Views ---

function OverviewView({ 
  stats, 
  recentWishlist, 
  recommendations, 
  wishlist, 
  toggleWishlist 
}: { 
  stats: any; 
  recentWishlist: EventDetailsDto[]; 
  recommendations: EventDetailsDto[]; 
  wishlist: string[]; 
  toggleWishlist: (id: string | number) => void; 
}) {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "My Bookings", value: stats.upcoming, icon: Ticket, color: "text-[#1E3D61]", bg: "bg-[#1E3D61]/5" },
          { label: "Wishlist", value: stats.wishlist, icon: Heart, color: "text-rose-500", bg: "bg-rose-50" },
          { label: "Attended", value: stats.attended, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Forsa points", value: stats.points, icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
        ].map((s, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants}
            className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-4 shadow-sm"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800 leading-tight">{s.value}</p>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Curated Recommendations */}
        <div className="xl:col-span-2 space-y-3">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" /> Curated matches
          </h2>
          {recommendations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendations.slice(0, 2).map((evt) => (
                <CleanCard key={evt.eventId} event={evt} isInWishlist={wishlist.includes(evt.eventId.toString())} onToggle={toggleWishlist} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-100 p-8 rounded-2xl text-center text-slate-400">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Personalizing your profile recommendations...</p>
            </div>
          )}
        </div>

        {/* Saved Events */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" /> Saved items
          </h2>
          <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50 overflow-hidden shadow-sm">
            {recentWishlist.length > 0 ? recentWishlist.slice(0, 3).map((event) => {
              const eventImg = event.imageUrl || "";
              return (
                <Link key={event.eventId} to={`/events/${event.eventId}`} className="flex items-center gap-3.5 p-3.5 hover:bg-slate-50/70 transition-colors group">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                    <img src={eventImg} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-xs line-clamp-1 group-hover:text-[#1E3D61] transition-colors">{event.title}</p>
                    <p className="text-slate-400 text-[10px] mt-1 font-medium">{event.category} · {event.ticketPrice === 0 ? "Free" : `$${event.ticketPrice}`}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#1E3D61] group-hover:translate-x-0.5 transition-all" />
                </Link>
              );
            }) : (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                <Heart className="w-6 h-6 text-slate-200 mb-2" />
                <p className="text-xs">Your wishlist is empty.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TicketsView({ events, isLoading }: { events: AttendeeBookingDto[]; isLoading: boolean }) {
  if (isLoading) return <div className="py-20 text-center text-slate-400"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#1E3D61]" /><p>Loading tickets...</p></div>;
  if (events.length === 0) return (
    <div className="py-16 text-center bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Ticket className="w-6 h-6 text-[#1E3D61]" />
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-1.5">No tickets yet</h3>
      <p className="text-slate-400 text-xs max-w-xs mx-auto mb-5">You haven't booked any tickets yet. Explore upcoming premium events and make your first booking.</p>
      <Link to="/events" className="inline-flex items-center justify-center px-5 py-2.5 bg-[#1E3D61] text-white text-xs font-bold rounded-lg hover:bg-[#152D4A] transition-colors shadow-md">
        Explore Events
      </Link>
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
      {events.map((evt) => (
        <PassbookTicket key={evt.bookingId} booking={evt} />
      ))}
    </motion.div>
  );
}

function WishlistView({ events, wishlist, toggleWishlist, isLoading }: { events: EventDetailsDto[]; wishlist: string[]; toggleWishlist: (id: string | number) => void; isLoading: boolean }) {
  if (isLoading) return <div className="py-20 text-center text-slate-400"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#1E3D61]" /><p>Loading wishlist...</p></div>;
  
  const wishlistedEvents = events.filter(e => wishlist.includes(e.eventId.toString()));
  
  if (wishlistedEvents.length === 0) return (
    <div className="py-16 text-center bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
      <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Heart className="w-6 h-6 text-rose-500" />
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-1.5">Your wishlist is empty</h3>
      <p className="text-slate-400 text-xs max-w-xs mx-auto mb-5">Discover events you like and tap the heart icon to save them here for quick planning.</p>
      <Link to="/events" className="inline-flex items-center justify-center px-5 py-2.5 bg-[#1E3D61] text-white text-xs font-bold rounded-lg hover:bg-[#152D4A] transition-colors shadow-md">
        Explore Events
      </Link>
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {wishlistedEvents.map((evt) => (
        <CleanCard key={evt.eventId} event={evt} isInWishlist={true} onToggle={toggleWishlist} />
      ))}
    </motion.div>
  );
}

function RecommendationsView({ events, wishlist, toggleWishlist, isLoading }: { events: EventDetailsDto[]; wishlist: string[]; toggleWishlist: (id: string | number) => void; isLoading: boolean }) {
  if (isLoading) return <div className="py-20 text-center text-slate-400"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#1E3D61]" /><p>Curating recommendations...</p></div>;
  
  if (events.length === 0) return (
    <div className="py-16 text-center bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
      <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-6 h-6 text-amber-500" />
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-1.5">No recommendations yet</h3>
      <p className="text-slate-400 text-xs max-w-xs mx-auto mb-5">Tell us more about your interests to get personalized event recommendations.</p>
      <Link to="/interests" className="inline-flex items-center justify-center px-5 py-2.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition-colors shadow-md">
        Update Interests
      </Link>
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-10 h-10 bg-white text-[#1E3D61] rounded-xl flex items-center justify-center shrink-0 shadow-sm">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Personalized Event Matches</h3>
          <p className="text-xs text-slate-500 mt-0.5">Calculated using your registered interests, category selections, and past bookings.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((evt) => (
          <CleanCard key={evt.eventId} event={evt} isInWishlist={wishlist.includes(evt.eventId.toString())} onToggle={toggleWishlist} />
        ))}
      </div>
    </motion.div>
  );
}

// --- Main Dashboard Layout ---

export default function AttendeeDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "tickets"; // Default to Tickets first
  
  const { wishlist, toggle: toggleWishlist, loading: wishlistLoading } = useWishlist();
  const [userName, setUserName] = useState("there");
  const [userEmail, setUserEmail] = useState("attendee@forsa.com");
  const [allEvents, setAllEvents] = useState<EventDetailsDto[]>([]);
  const [myTickets, setMyTickets] = useState<AttendeeBookingDto[]>([]);
  const [recommendedEvents, setRecommendedEvents] = useState<EventDetailsDto[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [stats, setStats] = useState({ upcoming: 0, attended: 0, wishlist: 0, points: 0 });
  
  const userId = getUserIdFromToken();

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    setUserName(localStorage.getItem("forsa_user_name") || "Attendee User");
    setUserEmail(localStorage.getItem("forsa_user_email") || "attendee@forsa.com");

    async function loadData() {
      if (!userId) return;
      try {
        const events = await eventsApi.getAllEvents();
        setAllEvents(events);
        
        const bookings = await attendeeApi.getBookings(userId);
        const attended = await attendeeApi.getAttendedEvents(userId);
        setMyTickets(bookings);

        // Fetch dynamic loyalty points
        let points = 0;
        try {
          const profile = await attendeeApi.getProfile(userId);
          points = profile.loyaltyPoint || 0;
        } catch (e) {
          console.error("Failed to load user loyalty points", e);
        }
        
        setStats({
          upcoming: bookings.length,
          attended: attended.length,
          wishlist: wishlist.length,
          points
        });

        // Filter recommendations dynamically by user interests
        let matched: EventDetailsDto[] = [];
        try {
          const interests = await attendeeApi.getInterests(userId);
          const interestNames = interests.map(i => i.name.toLowerCase());
          matched = events.filter(e => 
            interestNames.includes((e.category || "").toLowerCase())
          );
        } catch (e) {
          console.error("Failed to load user interests for recommendations", e);
        }
        setRecommendedEvents(matched.length ? matched : events.slice(0, 4));

      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setEventsLoading(false);
      }
    }
    
    loadData();
  }, [userId, wishlist.length, navigate]);

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const getHour = () => new Date().getHours();
  const greeting = getHour() < 12 ? "Good morning" : getHour() < 17 ? "Good afternoon" : "Good evening";

  // tickets first, recommendations second, wishlist third, overview fourth
  const menuItems = [
    { id: "tickets", label: "Booked Tickets", icon: Ticket },
    { id: "recommendations", label: "AI Matches", icon: Sparkles },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "overview", label: "Dashboard Hub", icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Modern SaaS Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left Panel Sidebar (Sticky Desktop) */}
          <aside className="lg:col-span-1 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm sticky top-24 z-10">
            {/* User Profile Mini Badge */}
            <div className="flex flex-col items-center text-center pb-5 border-b border-slate-100">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1E3D61] to-[#152D4A] text-white flex items-center justify-center font-bold text-lg shadow-md shadow-[#1E3D61]/15 mb-3">
                {userName.charAt(0)}
              </div>
              <h3 className="font-bold text-slate-800 text-sm leading-snug truncate max-w-full">{userName}</h3>
              <p className="text-xs text-slate-400 font-medium truncate max-w-full mt-1">{userEmail}</p>
              
              <div className="mt-3.5 bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-current" /> {stats.points.toLocaleString()} Points
              </div>
            </div>

            {/* Dashboard Sidebar Links */}
            <nav className="mt-5 space-y-1">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
                      isActive 
                        ? "bg-[#1E3D61]/5 text-[#1E3D61]" 
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? "text-[#1E3D61]" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div 
                        layoutId="sidebarActive" 
                        className="absolute left-0 top-3 bottom-3 w-1 bg-[#1E3D61] rounded-r-full"
                      />
                    )}
                  </button>
                );
              })}
            </nav>
            
            {/* Profile / Preferences Link Footer */}
            <div className="mt-6 pt-5 border-t border-slate-100 space-y-1.5">
              <Link 
                to="/profile" 
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" /> Account Settings
              </Link>
            </div>
          </aside>

          {/* Right Main Content Area */}
          <main className="lg:col-span-3 space-y-6">
            
            {/* Elegant Hero Greeting Panel */}
            <div className="bg-gradient-to-br from-[#0B1929] via-[#1E3D61] to-[#0F2847] rounded-2xl p-6 text-white relative overflow-hidden shadow-md shadow-[#1E3D61]/5">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400 via-indigo-900 to-slate-900" />
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-white/75 text-[10px] font-bold tracking-wider uppercase mb-0.5">{greeting}</p>
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    Welcome back, {userName.split(" ")[0]}!
                  </h1>
                  <p className="text-white/60 text-xs mt-1 max-w-md font-medium">
                    Explore personalized events, manage your bookings, and view loyalty passes.
                  </p>
                </div>
                <Link 
                  to="/interests" 
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-all shadow-sm shrink-0 flex items-center justify-center gap-1.5"
                >
                  <Star className="w-3.5 h-3.5 text-amber-300" /> Manage Interests
                </Link>
              </div>
            </div>

            {/* Mobile Tab Swiper Bar */}
            <div className="lg:hidden bg-white border border-slate-100 p-1.5 rounded-xl shadow-sm flex overflow-x-auto hide-scrollbar gap-1">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      isActive 
                        ? "bg-[#1E3D61] text-white shadow-sm" 
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Views Rendering with Animation */}
            <div className="min-h-[350px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  {activeTab === "overview" && (
                    <OverviewView 
                      stats={stats} 
                      recentWishlist={allEvents.filter(e => wishlist.includes(e.eventId.toString()))} 
                      recommendations={recommendedEvents} 
                      wishlist={wishlist} 
                      toggleWishlist={toggleWishlist} 
                    />
                  )}
                  
                  {activeTab === "tickets" && (
                    <TicketsView events={myTickets} isLoading={eventsLoading} />
                  )}
                  
                  {activeTab === "wishlist" && (
                    <WishlistView events={allEvents} wishlist={wishlist} toggleWishlist={toggleWishlist} isLoading={eventsLoading || wishlistLoading} />
                  )}
                  
                  {activeTab === "recommendations" && (
                    <RecommendationsView events={recommendedEvents} wishlist={wishlist} toggleWishlist={toggleWishlist} isLoading={eventsLoading} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>

      </div>
    </div>
  );
}