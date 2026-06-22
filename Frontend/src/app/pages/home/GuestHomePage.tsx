import type { MouseEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
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
import { mockEvents } from "../../data/mockData";

// Premium Color Palette Constants
const DEEP_NAVY = "#1E3D61";

const HERO_GRADIENT = `linear-gradient(135deg, #0B1120 0%, ${DEEP_NAVY} 100%)`;

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
  const [eventFilter, setEventFilter] = useState<"all" | "week" | "month" | "featured">("featured");
  const [navElevated, setNavElevated] = useState(false);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 100]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    const onScroll = () => setNavElevated(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleProtectedAction = (e: MouseEvent) => {
    e.preventDefault();
    window.location.href = "/login";
  };

  const stats = [
    { label: "Successful Events Hosted", value: "10K+", icon: Calendar },
    { label: "Community Members", value: "50K+", icon: Users },
    { label: "Verified Premium Venues", value: "500+", icon: MapPin },
    { label: "Secure Ticket Bookings", value: "1M+", icon: Ticket },
  ];

  const eventCategories = [
    { name: "Business & Tech", icon: Briefcase, count: "2.3k Events" },
    { name: "Live Music", icon: Music, count: "1.8k Events" },
    { name: "Arts & Culture", icon: Palette, count: "1.2k Events" },
    { name: "Sports & Wellness", icon: Dumbbell, count: "980 Events" },
    { name: "Food & Dining", icon: UtensilsCrossed, count: "1.4k Events" },
    { name: "Education & Workshops", icon: GraduationCap, count: "2.1k Events" },
  ];

  const filteredEvents = useMemo(() => {
    const list = [...mockEvents];
    if (eventFilter === "featured") {
      const f = list.filter((e) => e.isFeatured);
      return f.length >= 6 ? f.slice(0, 6) : list.slice(0, 6);
    }
    return list.slice(0, 6);
  }, [eventFilter]);

  const eventTabs: { id: typeof eventFilter; label: string }[] = [
    { id: "featured", label: "✨ Featured" },
    { id: "all", label: "All Events" },
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-[#1E3D61] selection:text-white overflow-x-hidden">
      


      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center pt-24 pb-32 overflow-hidden bg-[#0B1120]">
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
             className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#3b82f6] rounded-full filter blur-[100px]" 
           />
           {/* Subtle moving grid */}
           <motion.div 
             animate={{ backgroundPosition: ["0px 0px", "40px 40px"] }}
             transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
             className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:40px_40px]"
           />
        </div>

        <motion.div 
          className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center text-center"
          style={{ y: heroY, opacity: heroOpacity }}
        >
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
            className="text-5xl md:text-7xl lg:text-[84px] font-extrabold text-white tracking-tight leading-[1.05] max-w-5xl"
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
            className="mt-8 text-lg md:text-xl text-slate-300 max-w-2xl font-light leading-relaxed"
          >
            Elevate your experiences. Gain access to exclusive gatherings, professional summits, and vibrant festivals all in one beautifully curated platform.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
            className="mt-14 w-full max-w-3xl relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-white/5 rounded-full blur-md group-hover:blur-lg transition-all duration-500 opacity-50 group-hover:opacity-100"></div>
            <div className="relative flex flex-col sm:flex-row items-center p-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl md:rounded-full shadow-2xl transition-all duration-300">
              <div className="flex-1 flex items-center w-full px-5 py-3 sm:py-0 border-b sm:border-b-0 sm:border-r border-white/10">
                <Search className="w-6 h-6 text-white/80" />
                <input 
                  type="text" 
                  placeholder="What are you looking for?" 
                  className="w-full bg-transparent border-none text-white placeholder-slate-300 focus:outline-none focus:ring-0 px-4 py-2 text-base md:text-lg font-medium"
                />
              </div>
              <div className="flex-1 flex items-center w-full px-5 py-3 sm:py-0">
                <MapPin className="w-6 h-6 text-white/80" />
                <input 
                  type="text" 
                  placeholder="Location" 
                  className="w-full bg-transparent border-none text-white placeholder-slate-300 focus:outline-none focus:ring-0 px-4 py-2 text-base md:text-lg font-medium"
                />
              </div>
              <button 
                className="w-full sm:w-auto px-10 py-4 rounded-2xl md:rounded-full font-bold text-[#1E3D61] bg-white transition-all duration-300 hover:bg-slate-50 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] active:scale-[0.98] mt-3 sm:mt-0 flex items-center justify-center gap-2"
              >
                Search <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section with Overlapping Cards (No Skew, Clean overlap) */}
      <section className="relative z-20 px-6 lg:px-8 transform -translate-y-16">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-7xl mx-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <motion.div key={idx} variants={itemVariants} className="bg-white rounded-2xl p-8 shadow-[0_10px_40px_rgb(0,0,0,0.08)] border border-slate-100 flex flex-col items-center text-center group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgb(30,61,97,0.12)]">
                <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] flex items-center justify-center mb-5 group-hover:bg-[#1E3D61] transition-colors duration-500">
                  <stat.icon className="w-7 h-7 text-[#1E3D61] group-hover:text-white transition-colors duration-500" strokeWidth={1.5} />
                </div>
                <h3 className="text-3xl font-bold text-[#0F172A] mb-2 tracking-tight">{stat.value}</h3>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Elegant Categories Section */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal y={20} className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-1 bg-[#1E3D61] rounded-full"></span>
                <span className="text-[#1E3D61] font-semibold tracking-wider text-sm uppercase">Browse By Category</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] tracking-tight mb-2">Explore Experiences</h2>
            </div>
            <Link to="/events" className="group text-[#1E3D61] font-semibold flex items-center gap-2 hover:opacity-80 transition-opacity">
              View All Categories 
              <span className="bg-[#1E3D61]/10 group-hover:bg-[#1E3D61]/20 p-1.5 rounded-full transition-colors">
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
                onClick={handleProtectedAction}
                className="w-full bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#1E3D61]/30 hover:-translate-y-1 transition-all duration-300 flex items-center gap-5 group text-left"
              >
                <div className="w-14 h-14 rounded-xl bg-[#F8FAFC] flex items-center justify-center group-hover:bg-[#1E3D61] transition-colors duration-300 shrink-0">
                  <cat.icon className="w-6 h-6 text-[#1E3D61] group-hover:text-white transition-colors duration-300" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-[#1E3D61] transition-colors">{cat.name}</h3>
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
          <ScrollReveal y={20} className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-1 bg-[#1E3D61] rounded-full"></span>
                <span className="text-[#1E3D61] font-semibold tracking-wider text-sm uppercase">Trending</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] tracking-tight">Curated For You</h2>
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
      <section className="py-32 px-6 lg:px-8 relative overflow-hidden bg-[#0B1120]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#1E3D61] rounded-full mix-blend-screen filter blur-[150px] opacity-40 pointer-events-none" />
        
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
                className="w-full sm:w-auto px-10 py-4 rounded-full text-[#1E3D61] bg-white font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all duration-300 hover:-translate-y-1"
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
