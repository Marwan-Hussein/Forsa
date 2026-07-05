import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  MapPin, CalendarCheck, TrendingUp, DollarSign, Star, Clock,
  CheckCircle, XCircle, ArrowRight, Building2, Sparkles,
  ArrowUpRight, BarChart3, Zap, AlertCircle, Activity
} from "lucide-react";
import { motion, useSpring, useTransform, AnimatePresence } from "motion/react";
import { ownerApi, OwnerDashboardStats, BookingRequest } from "../../api/ownerApi";

function AnimatedNumber({ value, prefix = "" }: { value: number; prefix?: string }) {
  const spring = useSpring(0, { bounce: 0, duration: 1800 });
  const display = useTransform(spring, (current) =>
    prefix + (Number.isInteger(value) ? Math.round(current).toLocaleString() : current.toFixed(1))
  );
  useEffect(() => { spring.set(value); }, [spring, value]);
  return <motion.span>{display}</motion.span>;
}

function RequestStatusBadge({ status }: { status: number | string }) {
  const s = String(status).toLowerCase();
  
  if (s === "2" || s === "accepted") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border text-emerald-700 bg-emerald-50 border-emerald-200">
        <CheckCircle className="w-3 h-3" />Accepted
      </span>
    );
  }
  
  if (s === "3" || s === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border text-rose-700 bg-rose-50 border-rose-200">
        <XCircle className="w-3 h-3" />Rejected
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border text-amber-700 bg-amber-50 border-amber-200">
      <Clock className="w-3 h-3" />Action Required
    </span>
  );
}

export default function OwnerDashboard() {
  const [stats, setStats] = useState<OwnerDashboardStats | null>(null);
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, reqsData] = await Promise.all([
          ownerApi.getDashboardStats(),
          ownerApi.getBookingRequests()
        ]);
        setStats(statsData);
        setRequests(reqsData.slice(0, 5));
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
            <Sparkles className="w-6 h-6 text-blue-500 animate-pulse" />
          </div>
          <p className="text-slate-400 text-sm font-bold tracking-wider uppercase">Loading Awesomeness</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <AlertCircle className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-slate-500 font-medium max-w-md">We couldn't load your dashboard data. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Active Venues",
      value: stats.activePlaces,
      sub: `${stats.pendingPlaces} pending approval`,
      icon: Building2,
      gradient: "from-blue-500 to-indigo-600",
      bgClass: "bg-blue-50",
      textClass: "text-blue-600",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Pending Bookings",
      value: stats.pendingRequests,
      sub: `${stats.confirmedRequests} confirmed total`,
      icon: Clock,
      gradient: "from-amber-500 to-orange-500",
      bgClass: "bg-amber-50",
      textClass: "text-amber-600",
      trend: "New",
      trendUp: true,
    },
    {
      title: "Total Revenue",
      value: stats.totalEarnings,
      sub: "from confirmed bookings",
      prefix: "EGP ",
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-500",
      bgClass: "bg-emerald-50",
      textClass: "text-emerald-600",
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Average Rating",
      value: stats.averageRating,
      sub: "across all your venues",
      icon: Star,
      gradient: "from-violet-500 to-purple-600",
      bgClass: "bg-violet-50",
      textClass: "text-violet-600",
      trend: "Top 10%",
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-700 font-['Inter:SemiBold',sans-serif] text-xs uppercase tracking-wider">All Systems Operational</span>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-5xl font-['Inter:Black',sans-serif] tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="text-slate-400 font-['Inter:Medium',sans-serif] mt-2 text-base">
              Live platform overview - updates on every page load.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/owner/places/new"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-lg shadow-blue-500/25 bg-gradient-to-r from-[var(--brand-blue-accent)] to-[var(--brand-navy)]"
            >
              <Building2 className="w-4 h-4" />
              Add New Venue
            </Link>
            <Link
              to="/owner/bookings"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
            >
              <CalendarCheck className="w-4 h-4 text-slate-400" />
              View Requests
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, type: "spring", bounce: 0.3 }}
            className="group relative bg-white rounded-3xl p-6 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.12)] hover:-translate-y-1 border border-slate-100/80 transition-all duration-300 overflow-hidden"
          >
            <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700 ease-out ${card.gradient.replace('from-', 'bg-').replace('to-', 'bg-').split(' ')[0]}/20`} />
            
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className={`w-12 h-12 rounded-2xl ${card.bgClass} flex items-center justify-center border border-white/50 shadow-sm`}>
                <card.icon className={`w-6 h-6 ${card.textClass}`} />
              </div>
              <div className={`flex items-center gap-1 font-['Inter:SemiBold',sans-serif] text-xs px-2.5 py-1 rounded-full border ${card.trendUp ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-amber-600 bg-amber-50 border-amber-100"}`}>
                {card.trendUp ? <TrendingUp className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />} 
                {card.trend}
              </div>
            </div>

            <p className="text-slate-400 font-['Inter:SemiBold',sans-serif] text-sm relative z-10">{card.title}</p>
            <h3 className="text-3xl font-['Inter:Black',sans-serif] text-slate-900 mt-1 relative z-10">
              <AnimatedNumber value={card.value} prefix={card.prefix} />
            </h3>
            <p className="mt-3 flex items-center gap-1.5 text-slate-400 text-xs font-['Inter:Medium',sans-serif] relative z-10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{card.sub}</span>
            </p>
          </motion.div>
        ))}
      </div>

      {/* ── BOTTOM SECTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* Booking overview */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-3 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col"
        >
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-indigo-50/50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Booking Overview</h2>
              <p className="text-slate-500 text-sm mt-1 font-medium">Your requests at a glance</p>
            </div>
            <Link to="/owner/bookings" className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-4 py-2 rounded-xl">
              Manage <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-6 relative z-10 flex-1">
            <div className="rounded-[2rem] p-6 bg-gradient-to-br from-amber-50/50 to-orange-50/30 border border-amber-100 flex flex-col justify-center items-center text-center group hover:shadow-lg hover:shadow-amber-500/5 transition-all">
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 text-amber-500 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-5xl font-black text-amber-600 mb-2 tracking-tight">{stats.pendingRequests}</p>
              <p className="text-amber-700/70 text-xs font-bold uppercase tracking-widest">Awaiting Review</p>
            </div>
            <div className="rounded-[2rem] p-6 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border border-emerald-100 flex flex-col justify-center items-center text-center group hover:shadow-lg hover:shadow-emerald-500/5 transition-all">
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 text-emerald-500 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-6 h-6" />
              </div>
              <p className="text-5xl font-black text-emerald-600 mb-2 tracking-tight">{stats.confirmedRequests}</p>
              <p className="text-emerald-700/70 text-xs font-bold uppercase tracking-widest">Confirmed</p>
            </div>
          </div>

          <div className="relative z-10 mt-8 pt-8 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-500 text-sm font-bold">Confirmation Rate</span>
              <span className="text-slate-800 text-base font-black">
                {stats.totalBookingRequests > 0
                  ? Math.round((stats.confirmedRequests / stats.totalBookingRequests) * 100)
                  : 0}%
              </span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden bg-slate-100 p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${stats.totalBookingRequests > 0
                    ? (stats.confirmedRequests / stats.totalBookingRequests) * 100
                    : 0}%`
                }}
                transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 shadow-sm"
              />
            </div>
          </div>
        </motion.div>

        {/* Recent requests feed */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Recent Activity</h2>
              <p className="text-slate-500 text-sm mt-1 font-medium">Latest requests</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
              <CalendarCheck className="w-5 h-5 text-slate-400" />
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[360px] custom-scrollbar pr-2">
            <AnimatePresence>
              {requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                    <CalendarCheck className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">No recent requests.<br/>When people book, they'll appear here.</p>
                </div>
              ) : (
                requests.map((req, i) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center bg-white shadow-sm border border-slate-100 text-slate-400 group-hover:text-blue-500 group-hover:border-blue-100 transition-colors">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 text-sm font-bold truncate mb-0.5">{req.placeName}</p>
                      <p className="text-slate-500 text-xs font-medium truncate">by {req.organizerName}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <RequestStatusBadge status={req.status} />
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-6"
      >
        {[
          {
            title: "Add New Venue",
            desc: "List a new property on ForSa",
            icon: Building2,
            to: "/owner/places/new",
            gradient: "from-blue-500 to-indigo-600",
            shadow: "shadow-blue-500/20",
          },
          {
            title: "My Venues",
            desc: "Manage & update your places",
            icon: MapPin,
            to: "/owner/places",
            gradient: "from-violet-500 to-purple-600",
            shadow: "shadow-violet-500/20",
          },
          {
            title: "Booking Requests",
            desc: "Review and respond to requests",
            icon: CalendarCheck,
            to: "/owner/bookings",
            gradient: "from-emerald-400 to-teal-500",
            shadow: "shadow-emerald-500/20",
          },
        ].map((action, i) => (
          <Link
            key={action.title}
            to={action.to}
            className="group relative flex items-center gap-5 p-6 rounded-3xl bg-white border border-slate-100 hover:border-slate-200 transition-all duration-300 overflow-hidden hover:-translate-y-1 hover:shadow-lg"
          >
            <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${action.shadow} bg-gradient-to-br ${action.gradient} group-hover:scale-110 transition-transform duration-500`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <div className="relative flex-1">
              <p className="text-slate-800 text-base font-bold mb-1">{action.title}</p>
              <p className="text-slate-500 text-xs font-medium leading-relaxed">{action.desc}</p>
            </div>
            <ArrowRight className="relative w-5 h-5 text-slate-300 group-hover:text-slate-800 group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
