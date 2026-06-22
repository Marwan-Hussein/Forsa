import { Link } from "react-router";
import {
  Calendar,
  Users,
  MapPin,
  TrendingUp,
  DollarSign,
  Star,
  Plus,
  ChevronRight,
  BarChart3,
  CheckCircle,
  AlertCircle,
  ArrowUpRight
} from "lucide-react";
import { motion } from "motion/react";

export default function OrganizationDashboard() {
  const stats = {
    totalEvents: 12,
    upcomingEvents: 5,
    totalAttendees: 1254,
    totalRevenue: 125430,
    avgRating: 4.6,
    pendingRequests: 8,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 font-['Inter:Regular',sans-serif] mt-1">Track your event performance and attendee engagement.</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link 
            to="/organizer/events/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white font-['Inter:Bold',sans-serif] font-bold rounded-xl hover:shadow-lg hover:shadow-violet-500/30 transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Create Event
          </Link>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)] relative overflow-hidden group hover:border-violet-500/30 hover:shadow-md transition-all"
        >
          <div className="absolute -right-12 -top-12 w-32 h-32 bg-gradient-to-br from-violet-500 to-fuchsia-500 opacity-0 group-hover:opacity-5 rounded-full blur-2xl transition-opacity duration-500" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-[13px] font-['Inter:Bold',sans-serif] font-bold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5" /> +2 this month
            </div>
          </div>
          <h3 className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 mb-1">{stats.totalEvents}</h3>
          <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500">Total Events Organized</p>
          <p className="text-[13px] font-['Inter:Bold',sans-serif] text-violet-600 mt-2">{stats.upcomingEvents} upcoming</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)] relative overflow-hidden group hover:border-blue-500/30 hover:shadow-md transition-all"
        >
          <div className="absolute -right-12 -top-12 w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-5 rounded-full blur-2xl transition-opacity duration-500" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-[13px] font-['Inter:Bold',sans-serif] font-bold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5" /> +15%
            </div>
          </div>
          <h3 className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 mb-1">{stats.totalAttendees.toLocaleString()}</h3>
          <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500">Total Attendees</p>
          <p className="text-[13px] font-['Inter:Medium',sans-serif] text-slate-400 mt-2">Across all time</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)] relative overflow-hidden group hover:border-emerald-500/30 hover:shadow-md transition-all"
        >
          <div className="absolute -right-12 -top-12 w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-5 rounded-full blur-2xl transition-opacity duration-500" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-[13px] font-['Inter:Bold',sans-serif] font-bold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12%
            </div>
          </div>
          <h3 className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 mb-1">${stats.totalRevenue.toLocaleString()}</h3>
          <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500">Total Revenue</p>
          <p className="text-[13px] font-['Inter:Medium',sans-serif] text-emerald-600 mt-2">Net earnings</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[rgba(39,55,77,0.1)] flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-['Inter:Bold',sans-serif] font-bold text-slate-800">Recent Activity</h2>
            <button className="text-sm font-['Inter:Bold',sans-serif] text-violet-600 hover:text-violet-700">View All</button>
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-['Inter:Bold',sans-serif] font-bold text-slate-800">Venue booking approved</p>
                <p className="text-sm font-['Inter:Regular',sans-serif] text-slate-500 mt-0.5">Your request for "Grand Horizon Hall" has been accepted.</p>
              </div>
              <p className="text-xs font-['Inter:Medium',sans-serif] text-slate-400 whitespace-nowrap">2h ago</p>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 fill-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-['Inter:Bold',sans-serif] font-bold text-slate-800">New 5-star review</p>
                <p className="text-sm font-['Inter:Regular',sans-serif] text-slate-500 mt-0.5">Sarah left a glowing review for "Design Workshop".</p>
              </div>
              <p className="text-xs font-['Inter:Medium',sans-serif] text-slate-400 whitespace-nowrap">5h ago</p>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-['Inter:Bold',sans-serif] font-bold text-slate-800">100th Ticket Sold!</p>
                <p className="text-sm font-['Inter:Regular',sans-serif] text-slate-500 mt-0.5">"Tech Summit 2026" just hit a major milestone.</p>
              </div>
              <p className="text-xs font-['Inter:Medium',sans-serif] text-slate-400 whitespace-nowrap">1d ago</p>
            </div>
          </div>
        </motion.div>

        {/* Action Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-gradient-to-br from-[#0B1120] to-[#1E3D61] rounded-2xl p-6 sm:p-8 shadow-lg shadow-[#1E3D61]/20 flex flex-col text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/20 rounded-full filter blur-[60px] pointer-events-none" />
          
          <h2 className="text-xl font-['Inter:Bold',sans-serif] font-bold mb-6">Quick Tools</h2>
          <div className="flex-1 space-y-4 relative z-10">
            <Link to="/organizer/venue-requests" className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="font-['Inter:Bold',sans-serif] font-bold group-hover:text-amber-400 transition-colors">Pending Requests</p>
                <p className="text-xs text-white/60 mt-0.5">Check status of venue bookings</p>
              </div>
            </Link>

            <Link to="/organizer/events/1/attendees" className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-['Inter:Bold',sans-serif] font-bold">Manage Attendees</p>
                <p className="text-xs text-white/60 mt-0.5">Export lists & manage entry</p>
              </div>
            </Link>

            <div className="p-4 bg-white/5 rounded-xl border border-white/10 mt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-['Inter:Medium',sans-serif] text-white/80">Average Rating</p>
                <p className="text-lg font-['Inter:Bold',sans-serif] font-bold">{stats.avgRating.toFixed(1)}</p>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(stats.avgRating) ? "fill-amber-400 text-amber-400" : "text-white/20"}`} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}