import { useState, useEffect, useRef } from "react";
import {
  Users, Building2, CalendarDays, MessageSquare,
  AlertCircle, TrendingUp, Star, Wallet,
  Activity, ArrowUpRight, CheckCircle2, Clock,
  BarChart3, Ticket
} from "lucide-react";
import { motion, useInView, useMotionValue, useSpring } from "motion/react";
import { adminApi, DashboardStatsDTO } from "../../api/adminApi";

// Animated counting number component
function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 1200, bounce: 0 });
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) motionValue.set(value);
  }, [isInView, value, motionValue]);

  useEffect(() => {
    return spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = prefix + latest.toFixed(decimals) + suffix;
      }
    });
  }, [spring, prefix, suffix, decimals]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
}

// Mini donut chart for user breakdown
function DonutChart({ attendees, organizers, owners, total }: { attendees: number; organizers: number; owners: number; total: number }) {
  if (total === 0) return null;
  const a = (attendees / total) * 283;
  const o = (organizers / total) * 283;
  const ow = (owners / total) * 283;
  return (
    <div className="relative w-20 h-20 flex-shrink-0">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle cx="50" cy="50" r="45" fill="none" stroke="#6366f1" strokeWidth="10"
          strokeDasharray={`${a} ${283}`} strokeDashoffset="0" strokeLinecap="round" />
        <circle cx="50" cy="50" r="45" fill="none" stroke="#8b5cf6" strokeWidth="10"
          strokeDasharray={`${o} ${283}`} strokeDashoffset={`-${a}`} strokeLinecap="round" />
        <circle cx="50" cy="50" r="45" fill="none" stroke="#06b6d4" strokeWidth="10"
          strokeDasharray={`${ow} ${283}`} strokeDashoffset={`-${a + o}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-['Inter:Bold',sans-serif] text-slate-700">{total}</span>
      </div>
    </div>
  );
}

// Star rating visual
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
        />
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStatsDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await adminApi.getDashboardStats();
        setStats(data);
      } catch (e) {
        console.error("Failed to load dashboard stats", e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-16 h-16 relative flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-slate-400 font-['Inter:SemiBold',sans-serif] mt-4 tracking-widest text-xs uppercase">Loading Dashboard</p>
      </div>
    );
  }

  if (!stats) return null;

  const totalPending = stats.pendingPlaces + stats.pendingEvents;

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-16 relative">
      {/* Ambient Glows */}
      <div className="fixed top-20 right-1/4 w-[600px] h-[600px] bg-indigo-400/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/4 left-1/4 w-[500px] h-[500px] bg-purple-400/5 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-700 font-['Inter:SemiBold',sans-serif] text-xs uppercase tracking-wider">All Systems Operational</span>
          </div>
        </div>
        <h1 className="text-5xl font-['Inter:Black',sans-serif] tracking-tight text-slate-900">
          Admin Dashboard
        </h1>
        <p className="text-slate-400 font-['Inter:Medium',sans-serif] mt-2 text-base">
          Live platform overview — updates on every page load.
        </p>
      </motion.div>

      {/* ── Top KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Users */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: "spring", bounce: 0.3 }}
          className="group col-span-2 lg:col-span-1 relative bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 shadow-[0_8px_32px_-8px_rgba(99,102,241,0.5)] hover:shadow-[0_16px_48px_-8px_rgba(99,102,241,0.65)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -bottom-8 -left-4 w-24 h-24 bg-white/5 rounded-full" />
          <div className="flex items-start justify-between relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <DonutChart attendees={stats.totalAttendees} organizers={stats.totalOrganizers} owners={stats.totalOwners} total={stats.totalUsers} />
          </div>
          <div className="mt-4 relative z-10">
            <p className="text-indigo-200 font-['Inter:SemiBold',sans-serif] text-sm">Total Users</p>
            <p className="text-4xl font-['Inter:Black',sans-serif] text-white mt-1">
              <AnimatedNumber value={stats.totalUsers} />
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { label: "Attendees", val: stats.totalAttendees, color: "bg-indigo-400/40" },
                { label: "Organizers", val: stats.totalOrganizers, color: "bg-violet-400/40" },
                { label: "Owners", val: stats.totalOwners, color: "bg-cyan-400/40" },
              ].map(({ label, val, color }) => (
                <span key={label} className={`${color} text-white/90 text-xs px-2.5 py-1 rounded-lg font-['Inter:SemiBold',sans-serif]`}>
                  {val} {label}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Total Earnings */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, type: "spring", bounce: 0.3 }}
          className="group relative bg-white rounded-3xl p-6 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.12)] hover:-translate-y-1 border border-slate-100/80 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute -top-8 -right-8 w-28 h-28 bg-emerald-400/10 rounded-full blur-2xl group-hover:bg-emerald-400/20 transition-all" />
          <div className="flex items-center justify-between mb-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <Wallet className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex items-center gap-1 text-emerald-600 font-['Inter:SemiBold',sans-serif] text-xs bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              <TrendingUp className="w-3.5 h-3.5" /> Live
            </div>
          </div>
          <p className="text-slate-400 font-['Inter:SemiBold',sans-serif] text-sm">Total Earnings</p>
          <p className="text-3xl font-['Inter:Black',sans-serif] text-slate-900 mt-1">
            <AnimatedNumber value={Number(stats.totalEarnings)} prefix="EGP " decimals={0} />
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-slate-400 text-xs font-['Inter:Medium',sans-serif]">
            <Ticket className="w-3.5 h-3.5" />
            <span><AnimatedNumber value={stats.totalBookings} /> confirmed bookings</span>
          </div>
        </motion.div>

        {/* Venues */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", bounce: 0.3 }}
          className="group relative bg-white rounded-3xl p-6 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.12)] hover:-translate-y-1 border border-slate-100/80 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute -top-8 -right-8 w-28 h-28 bg-blue-400/10 rounded-full blur-2xl group-hover:bg-blue-400/20 transition-all" />
          <div className="flex items-center justify-between mb-5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            {stats.pendingPlaces > 0 && (
              <span className="bg-red-100 text-red-600 text-xs font-['Inter:Bold',sans-serif] px-2.5 py-1 rounded-full border border-red-200">
                {stats.pendingPlaces} pending
              </span>
            )}
          </div>
          <p className="text-slate-400 font-['Inter:SemiBold',sans-serif] text-sm">Total Venues</p>
          <p className="text-3xl font-['Inter:Black',sans-serif] text-slate-900 mt-1">
            <AnimatedNumber value={stats.totalPlaces} />
          </p>
          <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: stats.totalPlaces > 0 ? `${((stats.totalPlaces - stats.pendingPlaces) / stats.totalPlaces) * 100}%` : "0%" }}
              transition={{ delay: 0.6, duration: 1 }}
            />
          </div>
          <p className="text-slate-400 text-xs font-['Inter:Medium',sans-serif] mt-1">{stats.totalPlaces - stats.pendingPlaces} approved</p>
        </motion.div>

        {/* Events */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, type: "spring", bounce: 0.3 }}
          className="group relative bg-white rounded-3xl p-6 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.12)] hover:-translate-y-1 border border-slate-100/80 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute -top-8 -right-8 w-28 h-28 bg-purple-400/10 rounded-full blur-2xl group-hover:bg-purple-400/20 transition-all" />
          <div className="flex items-center justify-between mb-5">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center border border-purple-100">
              <CalendarDays className="w-6 h-6 text-purple-600" />
            </div>
            {stats.pendingEvents > 0 && (
              <span className="bg-red-100 text-red-600 text-xs font-['Inter:Bold',sans-serif] px-2.5 py-1 rounded-full border border-red-200">
                {stats.pendingEvents} pending
              </span>
            )}
          </div>
          <p className="text-slate-400 font-['Inter:SemiBold',sans-serif] text-sm">Total Events</p>
          <p className="text-3xl font-['Inter:Black',sans-serif] text-slate-900 mt-1">
            <AnimatedNumber value={stats.totalEvents} />
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs font-['Inter:Medium',sans-serif]">
            <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              <CheckCircle2 className="w-3 h-3" /> {stats.completedEvents} done
            </span>
            <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
              <Clock className="w-3 h-3" /> {stats.pendingEvents} pending
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Bottom Row: Reviews & Pending Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Reviews + Rating Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="lg:col-span-2 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-7 border border-amber-100 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.06)] relative overflow-hidden"
        >
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-200/30 rounded-full blur-2xl" />
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center border border-amber-200">
              <MessageSquare className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-slate-900 font-['Inter:Bold',sans-serif] text-lg">Platform Reviews</h3>
              <p className="text-slate-500 text-sm font-['Inter:Medium',sans-serif]">User feedback across all venues</p>
            </div>
          </div>

          <div className="flex items-end gap-6">
            <div>
              <p className="text-slate-400 text-sm font-['Inter:SemiBold',sans-serif] mb-1">Total Reviews</p>
              <p className="text-5xl font-['Inter:Black',sans-serif] text-slate-900">
                <AnimatedNumber value={stats.totalReviews} />
              </p>
            </div>
            <div className="pb-1">
              <p className="text-slate-400 text-sm font-['Inter:SemiBold',sans-serif] mb-1.5">Avg. Rating</p>
              <StarRating rating={stats.averageRating} />
              <p className="text-2xl font-['Inter:Black',sans-serif] text-amber-600 mt-1">
                <AnimatedNumber value={stats.averageRating} decimals={1} suffix=" / 5" />
              </p>
            </div>
          </div>

          {/* Rating bar breakdown */}
          <div className="mt-6 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-xs text-slate-500 font-['Inter:Medium',sans-serif]">{star}</span>
                </div>
                <div className="flex-1 h-1.5 bg-amber-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: star === Math.round(stats.averageRating) ? "75%" : star > Math.round(stats.averageRating) ? "20%" : "45%" }}
                    transition={{ delay: 0.7 + (5 - star) * 0.1, duration: 0.8 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pending Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="lg:col-span-3 bg-white rounded-3xl p-7 border border-slate-100 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.06)] relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center border border-red-100">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-slate-900 font-['Inter:Bold',sans-serif] text-lg">Action Required</h3>
                <p className="text-slate-400 text-sm font-['Inter:Medium',sans-serif]">Items awaiting your approval</p>
              </div>
            </div>
            {totalPending > 0 && (
              <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-[0_4px_12px_rgba(239,68,68,0.4)]">
                <span className="text-white font-['Inter:Black',sans-serif] text-sm">{totalPending}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {[
              {
                icon: Building2, label: "Venues Pending Approval",
                sub: "Owners waiting for venue activation",
                count: stats.pendingPlaces, color: "blue",
                bgIcon: "bg-blue-50", iconColor: "text-blue-600",
                barColor: "from-blue-500 to-indigo-500"
              },
              {
                icon: CalendarDays, label: "Events Pending Approval",
                sub: "Organizers waiting for event activation",
                count: stats.pendingEvents, color: "purple",
                bgIcon: "bg-purple-50", iconColor: "text-purple-600",
                barColor: "from-purple-500 to-pink-500"
              },
            ].map(({ icon: Icon, label, sub, count, bgIcon, iconColor, barColor }) => (
              <motion.div
                key={label}
                whileHover={{ x: 4 }}
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100/80 cursor-pointer group hover:bg-white hover:shadow-md hover:border-slate-200 transition-all duration-200"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bgIcon} flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-['Inter:Bold',sans-serif] text-slate-900 text-sm">{label}</h4>
                  <p className="text-slate-400 text-xs font-['Inter:Medium',sans-serif] mt-0.5">{sub}</p>
                  <div className="mt-2 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${barColor} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: count > 0 ? `${Math.min(count * 20, 100)}%` : "0%" }}
                      transition={{ delay: 0.8, duration: 0.8 }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-2xl font-['Inter:Black',sans-serif] ${count > 0 ? "text-red-500" : "text-emerald-500"}`}>
                    {count}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary Footer */}
          <div className="mt-5 pt-5 border-t border-slate-100">
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: "Approved Venues", value: stats.totalPlaces - stats.pendingPlaces, icon: CheckCircle2, color: "text-emerald-500" },
                { label: "Completed Events", value: stats.completedEvents, icon: BarChart3, color: "text-blue-500" },
                { label: "Confirmed Bookings", value: stats.totalBookings, icon: Ticket, color: "text-purple-500" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <Icon className={`w-5 h-5 ${color}`} />
                  <p className="text-xl font-['Inter:Black',sans-serif] text-slate-900">
                    <AnimatedNumber value={value} />
                  </p>
                  <p className="text-slate-400 text-xs font-['Inter:Medium',sans-serif] text-center leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
