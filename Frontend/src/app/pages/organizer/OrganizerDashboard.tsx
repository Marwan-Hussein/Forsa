import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Ticket, CalendarCheck, DollarSign, MapPin, 
  Sparkles, Plus, ArrowRight, TrendingUp,
  Activity
} from "lucide-react";
import { motion, useSpring, useTransform } from "motion/react";
import { organizerApi, OrganizerDashboardStats } from "../../api/organizerApi";
import { getUserIdFromToken } from "../../api/api";

function AnimatedNumber({ value, prefix = "" }: { value: number; prefix?: string }) {
  const spring = useSpring(0, { bounce: 0, duration: 2000 });
  const display = useTransform(spring, (current) => 
    prefix + (Number.isInteger(value) ? Math.round(current).toLocaleString() : current.toFixed(1))
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

export default function OrganizerDashboard() {
  const [stats, setStats] = useState<OrganizerDashboardStats | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const organizerId = getUserIdFromToken();
      if (!organizerId) {
        navigate("/login");
        return;
      }

      try {
        const [statsData, eventsData] = await Promise.all([
          organizerApi.getDashboardStats(organizerId),
          organizerApi.getEventsDashboard(organizerId)
        ]);
        setStats(statsData);
        setEvents(eventsData.slice(0, 5));
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-16 h-16 relative flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-indigo-600 font-['Inter:Bold',sans-serif] mt-4 tracking-widest text-xs uppercase animate-pulse">Loading Magic...</p>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { 
      title: "Total Events", 
      value: stats.totalEvents, 
      trend: `${stats.completedEvents} Completed`, 
      icon: CalendarCheck, 
      lightColor: "bg-indigo-100 text-indigo-600 border-indigo-200",
      glow: "bg-indigo-400/15 group-hover:bg-indigo-400/30"
    },
    { 
      title: "Tickets Sold", 
      value: stats.totalTicketsSold, 
      trend: "All time", 
      icon: Ticket, 
      lightColor: "bg-blue-100 text-blue-600 border-blue-200",
      glow: "bg-blue-400/15 group-hover:bg-blue-400/30"
    },
    { 
      title: "Total Revenue", 
      value: stats.totalRevenue * 0.9, 
      trend: "Ticket Sales", 
      prefix: "EGP ",
      icon: DollarSign, 
      lightColor: "bg-emerald-100 text-emerald-600 border-emerald-200",
      glow: "bg-emerald-400/15 group-hover:bg-emerald-400/30"
    },
    { 
      title: "Available Balance", 
      value: stats.availableBalance || 0, 
      trend: "Ready to withdraw", 
      prefix: "EGP ",
      icon: DollarSign, 
      lightColor: "bg-teal-100 text-teal-600 border-teal-200",
      glow: "bg-teal-400/15 group-hover:bg-teal-400/30"
    },
    { 
      title: "Places Booked", 
      value: stats.totalPlacesBooked, 
      trend: "Confirmed venues", 
      icon: MapPin, 
      lightColor: "bg-violet-100 text-violet-600 border-violet-200",
      glow: "bg-violet-400/15 group-hover:bg-violet-400/30"
    },
  ];

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-16 relative">
      {/* Soft, Professional Ambient Glows */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-indigo-400/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Section */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white shadow-xl shadow-indigo-100/30">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-indigo-700 font-['Inter:Bold',sans-serif] text-xs uppercase tracking-wider">Organizer Portal</span>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-['Outfit:Bold',sans-serif] font-bold text-slate-800 tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-slate-500 font-['Inter:Medium',sans-serif] mt-2 text-base">
              Track your event performance and attendee engagement.
            </p>
          </div>
          <Link 
            to="/organizer/events/new"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white font-['Inter:Bold',sans-serif] font-bold rounded-2xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-1 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Create Event
          </Link>
        </div>
      </motion.div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat, index) => (
          <motion.div 
            key={stat.title} 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.1, type: "spring", bounce: 0.4 }}
            className="group relative bg-white/90 backdrop-blur-sm rounded-[2rem] p-6 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-indigo-200/40 hover:-translate-y-2 border border-white transition-all duration-300 overflow-hidden"
          >
            <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl transition-all duration-500 ${stat.glow}`} />
            
            <div className="flex items-start justify-between mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${stat.lightColor} shadow-inner`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-1 text-slate-500 font-['Inter:Bold',sans-serif] text-xs bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                {stat.trend}
              </div>
            </div>
            
            <div>
              <p className="text-slate-500 font-['Inter:Medium',sans-serif] text-sm mb-1">{stat.title}</p>
              <h3 className="text-3xl font-['Outfit:Bold',sans-serif] font-bold text-slate-800 tracking-tight">
                <AnimatedNumber value={stat.value} prefix={stat.prefix} />
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Events Section */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-white p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-['Outfit:Bold',sans-serif] font-bold text-slate-800">Recent Activity</h2>
              <p className="text-sm text-slate-500 mt-1">Your latest event activities and performance.</p>
            </div>
            <Link 
              to="/organizer/events"
              className="text-sm font-['Inter:Bold',sans-serif] text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {events.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-b from-slate-50 to-white rounded-3xl border border-dashed border-slate-200">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarCheck className="w-10 h-10 text-indigo-400" />
                </div>
                <p className="font-['Inter:Bold',sans-serif] text-lg text-slate-700 mb-1">No events yet!</p>
                <p className="text-sm text-slate-500">Create your first event to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((ev, i) => {
                  const booked = ev.totalTickets - ev.remainingTickets;
                  const occupancy = ev.totalTickets > 0 ? (booked / ev.totalTickets) * 100 : 0;
                  return (
                    <motion.div 
                      key={ev.eventId} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl hover:bg-indigo-50/50 border border-transparent hover:border-indigo-100 transition-all"
                    >
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                        <CalendarCheck className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-['Inter:Bold',sans-serif] text-slate-800 text-lg mb-1">{ev.title}</div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${ev.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                            {ev.status || 'Active'}
                          </span>
                          <span className="text-sm font-['Inter:Medium',sans-serif] text-slate-500">
                            {booked} / {ev.totalTickets} tickets sold
                          </span>
                        </div>
                      </div>
                      <div className="w-full sm:w-48 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-['Inter:Bold',sans-serif] text-slate-500">Capacity</span>
                          <span className="text-xs font-['Inter:Bold',sans-serif] text-slate-700">{occupancy.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full relative" style={{ width: `${occupancy}%` }}>
                            <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Fun CTA Card - Elegantly colored */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
          className="bg-indigo-600 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-500/30 flex flex-col justify-center items-center text-center text-white relative overflow-hidden"
        >
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl" />
          <div className="absolute -top-10 -left-10 w-40 h-40 border-4 border-white/10 rounded-full" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 border-4 border-white/10 rounded-full" />

          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8 relative z-10 shadow-inner border border-white/20 transform rotate-3 group-hover:rotate-6 transition-transform">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-3xl font-['Outfit:Bold',sans-serif] font-bold mb-3 relative z-10">
            Grow Your Reach!
          </h2>
          <p className="text-indigo-100 text-base mb-8 font-['Inter:Medium',sans-serif] relative z-10 max-w-[250px]">
            Ready to host an unforgettable experience? Let's bring your next event to life.
          </p>
          
          <Link 
            to="/organizer/events/new"
            className="w-full py-4 bg-white text-indigo-700 rounded-2xl font-['Inter:Bold',sans-serif] text-lg hover:bg-slate-50 transition-all shadow-xl active:scale-95 relative z-10 flex items-center justify-center gap-2 group"
          >
            Start Now
            <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
