import type { MouseEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { ForSaLogo } from "../../components/ForSaLogo";
import { ScrollReveal } from "../../components/ScrollReveal";
import {
  Calendar,
  MapPin,
  Users,
  Search,
  Ticket,
  ArrowRight,
  Star,
  Music,
  Palette,
  Dumbbell,
  UtensilsCrossed,
  GraduationCap,
  Briefcase,
  Play
} from "lucide-react";
import { EventCard } from "../../components/EventCard";
import { apiGet } from "../../api/api";
import type { Event as EventType } from "../../types/index";
import { mapEventDetailsDtoToEvent } from "../../utils/mappers";

// Premium Color Palette Constants
const DEEP_NAVY = "var(--brand-navy)";

const HERO_GRADIENT = `linear-gradient(135deg, var(--brand-deep-navy) 0%, ${DEEP_NAVY} 100%)`;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

export default function GuestHomePage() {
  const navigate = useNavigate();
  const [eventFilter, setEventFilter] = useState<"all" | "week" | "month" | "featured">("featured");
  const [navElevated, setNavElevated] = useState(false);
  const [events, setEvents] = useState<EventType[]>([]);
  const [eventCategories, setEventCategories] = useState<{name: string, icon: any, count: string, color: string}[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 100]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    const onScroll = () => setNavElevated(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = () => {
    navigate(`/events?search=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(searchLocation)}`);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await apiGet('/api/events') as any[];
        setEvents(data.map(e => ({ ...e, id: e.eventId || e.id })));
        
        // Extract Categories
        const categoryMap = new Map<string, number>();
        data.forEach((e: EventType) => {
          if (e.category) {
            categoryMap.set(e.category, (categoryMap.get(e.category) || 0) + 1);
          }
        });
        
        const categoryIconMap: Record<string, any> = {
          "Business": Briefcase,
          "Tech": Briefcase,
          "Music": Music,
          "Art": Palette,
          "Sports": Dumbbell,
          "Food": UtensilsCrossed,
          "Education": GraduationCap,
        };

        const categoryColorMap: Record<string, string> = {
          "Business": "text-blue-600 bg-blue-50",
          "Tech": "text-indigo-600 bg-indigo-50",
          "Music": "text-rose-600 bg-rose-50",
          "Art": "text-fuchsia-600 bg-fuchsia-50",
          "Sports": "text-emerald-600 bg-emerald-50",
          "Food": "text-orange-600 bg-orange-50",
          "Education": "text-cyan-600 bg-cyan-50",
        };

        const categories = Array.from(categoryMap.entries()).map(([name, count]) => ({
          name,
          icon: categoryIconMap[name] || Calendar,
          count: `${count} Event${count !== 1 ? 's' : ''}`,
          color: categoryColorMap[name] || "text-[var(--brand-navy)] bg-[var(--brand-page-background)]",
        }));
        
        setEventCategories(categories);
      } catch (err) {
        console.error("Failed to fetch events", err);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const list = [...events].filter(e => (e as any).status === "Approved" || (e as any).status === "Published");
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    let filtered = list;
    if (eventFilter === "featured") {
      filtered = list.slice(0, 6);
    } else if (eventFilter === "week") {
      filtered = list.filter(e => {
        const d = new Date((e as any).startDate);
        return d >= now && d <= oneWeekFromNow;
      });
    } else if (eventFilter === "month") {
      filtered = list.filter(e => {
        const d = new Date((e as any).startDate);
        return d >= now && d <= oneMonthFromNow;
      });
    }
    
    // Map backend EventDetailsDto to Event contract
    return filtered
      .map(e => mapEventDetailsDtoToEvent(e as any));
  }, [eventFilter, events]);

  const eventTabs: { id: typeof eventFilter; label: string }[] = [
    { id: "featured", label: "✨ Featured" },
    { id: "all", label: "All Events" },
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
  ];

  return (
    <div className="min-h-screen bg-[var(--brand-page-background)] text-[var(--brand-text-dark)] font-sans selection:bg-[var(--brand-navy)] selection:text-white overflow-x-hidden">
      


      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center pt-24 pb-32 overflow-hidden bg-[var(--brand-deep-navy)]">
        <div className="absolute inset-0 z-0" style={{ background: HERO_GRADIENT }} />
        
        {/* Elegant Animated Background Elements (Adding 'حركات') */}
        <div className="absolute inset-0 z-0 overflow-hidden mix-blend-screen pointer-events-none">
           <motion.div 
             animate={{ 
               x: [0, 50, -20, 0], 
               y: [0, 30, -40, 0],
               scale: [1, 1.2, 0.9, 1],
               opacity: [0.1, 0.15, 0.1]
             }}
             transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
             className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-white rounded-full filter blur-[120px]" 
           />
           <motion.div 
             animate={{ 
               x: [0, -30, 40, 0], 
               y: [0, -50, 20, 0],
               scale: [1, 1.1, 0.8, 1],
               opacity: [0.05, 0.1, 0.05]
             }}
             transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
             className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[var(--brand-blue-accent)] rounded-full filter blur-[100px]" 
           />
           {/* Subtle moving grid */}
           <motion.div 
             animate={{ backgroundPosition: ["0px 0px", "40px 40px"] }}
             transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
             className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:40px_40px]"
           />
        </div>

        <motion.div 
          className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          {/* Left Column - Content & Search */}
          <div className="lg:col-span-7 flex flex-col items-start">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              <span className="text-sm font-semibold text-white tracking-wide opacity-90 uppercase">The Premier Event Platform in 2026</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.05] max-w-2xl"
            >
              Discover & Book <br/>
              <motion.span 
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-300 to-white bg-[length:200%_auto]"
              >
                Exceptional Events
              </motion.span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 text-base md:text-lg text-slate-300 max-w-xl font-light leading-relaxed text-left"
            >
              Elevate your experiences. Gain access to exclusive gatherings, professional summits, and vibrant festivals all in one beautifully curated platform.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
              className="mt-10 w-full max-w-2xl relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl blur-md group-hover:blur-lg transition-all duration-500 opacity-50 group-hover:opacity-100"></div>
              <div className="relative flex flex-col sm:flex-row items-center p-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl transition-all duration-300">
                <div className="flex-1 flex items-center w-full px-5 py-3 sm:py-0 border-b sm:border-b-0 sm:border-r border-white/10">
                  <Search className="w-5 h-5 text-white/80" />
                  <input 
                    type="text" 
                    placeholder="Search events..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full bg-transparent border-none text-white placeholder-slate-300 focus:outline-none focus:ring-0 px-4 py-2 text-sm font-medium"
                  />
                </div>
                <div className="flex-1 flex items-center w-full px-5 py-3 sm:py-0">
                  <MapPin className="w-5 h-5 text-white/80" />
                  <input 
                    type="text" 
                    placeholder="Location" 
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full bg-transparent border-none text-white placeholder-slate-300 focus:outline-none focus:ring-0 px-4 py-2 text-sm font-medium"
                  />
                </div>
                <button 
                  onClick={handleSearch}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-[var(--brand-navy)] bg-white transition-all duration-300 hover:bg-slate-50 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] active:scale-[0.98] mt-3 sm:mt-0 flex items-center justify-center gap-2 text-sm shrink-0"
                >
                  Search <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Visual Mockup representation of event ticketing */}
          <div className="lg:col-span-5 hidden lg:flex flex-col items-center relative">
            <div className="relative w-80 h-96 select-none pointer-events-none">
              {/* Fake Event Card Mockup */}
              <div className="absolute top-0 left-0 w-72 h-80 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 shadow-2xl rotate-[-6deg] transform hover:rotate-0 transition-transform duration-500">
                <div className="h-36 rounded-xl overflow-hidden bg-slate-900/40 relative">
                  <img 
                    src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&q=80" 
                    alt="Event"
                    className="w-full h-full object-cover opacity-80" 
                  />
                  <div className="absolute top-3 left-3 bg-[var(--brand-navy)] text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-md">
                    Featured Event
                  </div>
                </div>
                <div className="mt-4 text-white">
                  <h4 className="font-bold text-sm leading-snug line-clamp-2">Creative Design & AI Conference 2026</h4>
                  <div className="flex items-center gap-1.5 text-white/60 text-[10px] mt-3">
                    <Calendar className="w-3.5 h-3.5 text-blue-300" />
                    <span>March 25, 2026</span>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                    <span className="font-bold text-xs">$150.00</span>
                    <span className="text-[9px] font-bold text-emerald-400 uppercase">Available</span>
                  </div>
                </div>
              </div>

              {/* Fake Passbook Ticket Mockup */}
              <div className="absolute bottom-4 right-0 w-64 bg-[var(--brand-navy)] border border-white/10 rounded-2xl p-4 shadow-2xl rotate-[8deg] transform hover:rotate-0 transition-transform duration-500 flex flex-col justify-between">
                <div className="border-b border-dashed border-white/15 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[8px] font-mono text-white/50">TICKET PASS</span>
                    <span className="text-[8px] font-bold text-amber-400">LOYALTY PASS</span>
                  </div>
                  <h5 className="font-bold text-xs text-white truncate">Global Tech Summit</h5>
                  <div className="flex gap-4 mt-2">
                    <div>
                      <p className="text-[7px] text-white/40 font-bold uppercase">DATE</p>
                      <p className="text-[9px] text-white font-bold">AUG 11</p>
                    </div>
                    <div>
                      <p className="text-[7px] text-white/40 font-bold uppercase">TIME</p>
                      <p className="text-[9px] text-white font-bold">10:00 AM</p>
                    </div>
                  </div>
                </div>
                <div className="pt-3">
                  <div className="flex items-center gap-0.5 justify-center h-8 opacity-75">
                    {[1, 2, 1, 3, 2, 4, 1, 2, 3, 1, 2, 4, 1, 2, 1, 3].map((w, i) => (
                      <div key={i} className="bg-white rounded-sm shrink-0" style={{ width: `${w}px`, height: "100%" }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>


      {/* Elegant Categories Section */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal y={20} className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-1 bg-[var(--brand-navy)] rounded-full"></span>
                <span className="text-[var(--brand-navy)] font-semibold tracking-wider text-sm uppercase">Browse By Category</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--brand-text-dark)] tracking-tight mb-2">Explore Experiences</h2>
            </div>
            <Link to="/events" className="group text-[var(--brand-navy)] font-semibold flex items-center gap-2 hover:opacity-80 transition-opacity">
              View All Categories 
              <span className="bg-[var(--brand-navy)]/10 group-hover:bg-[var(--brand-navy)]/20 p-1.5 rounded-full transition-colors">
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </ScrollReveal>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {eventCategories.map((cat, idx) => (
              <motion.button 
                key={cat.name}
                variants={itemVariants}
                onClick={() => navigate(`/events?category=${encodeURIComponent(cat.name)}`)}
                className="w-full bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-[var(--brand-navy)]/30 hover:-translate-y-1 transition-all duration-300 flex items-center gap-5 group text-left"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 ${cat.color.split(' ')[1]} group-hover:opacity-80`}>
                  <cat.icon className={`w-6 h-6 transition-colors duration-300 ${cat.color.split(' ')[0]}`} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className={`font-bold text-lg mb-1 transition-colors ${cat.color.split(' ')[0]}`}>{cat.name}</h3>
                  <p className="text-sm font-medium text-slate-500">{cat.count}</p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-24 px-6 lg:px-8 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal y={20} className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-1 bg-[var(--brand-navy)] rounded-full"></span>
                <span className="text-[var(--brand-navy)] font-semibold tracking-wider text-sm uppercase">Trending</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--brand-text-dark)] tracking-tight">Curated For You</h2>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex bg-slate-100 p-1.5 rounded-xl gap-1 shrink-0">
              {eventTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setEventFilter(tab.id)}
                  className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                    eventFilter === tab.id
                      ? "bg-[var(--brand-navy)] text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </ScrollReveal>

          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredEvents.slice(0, 3).map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  showActions={false}
                  animationIndex={index}
                  reveal="scroll"
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="py-32 px-6 lg:px-8 relative overflow-hidden bg-[var(--brand-deep-navy)]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--brand-navy)] rounded-full mix-blend-screen filter blur-[150px] opacity-40 pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <ScrollReveal y={30} className="flex flex-col items-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 shadow-lg">
              <Play className="w-6 h-6 text-white ml-1" />
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6 leading-tight">
              Ready to create your <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400">unforgettable moment?</span>
            </h2>
            <p className="text-xl text-slate-300 font-light mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of professionals, enthusiasts, and creators on ForSa. Elevate your event experience today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <Link
                to="/register"
                className="w-full sm:w-auto px-10 py-4 rounded-full text-[var(--brand-navy)] bg-white font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all duration-300 hover:-translate-y-1"
              >
                Join ForSa Now
              </Link>
              <Link
                to="/register?type=organization"
                className="w-full sm:w-auto px-10 py-4 rounded-full text-white font-bold text-lg bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                Become an Organizer
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>


    </div>
  );
}
