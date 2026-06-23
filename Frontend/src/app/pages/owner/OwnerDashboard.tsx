import { MapPin, CalendarCheck, TrendingUp, Users, ArrowUpRight, ArrowDownRight, DollarSign } from "lucide-react";
import { motion } from "motion/react";

export default function OwnerDashboard() {
  const stats = [
    { 
      title: "My Venues", 
      value: "3", 
      trend: "Active", 
      trendUp: true,
      icon: MapPin, 
      color: "from-[#0B1120] to-[#1E3D61]",
      lightColor: "bg-slate-100 text-slate-800"
    },
    { 
      title: "Pending Requests", 
      value: "12", 
      trend: "Action Required", 
      trendUp: false,
      icon: CalendarCheck, 
      color: "from-amber-500 to-amber-600",
      lightColor: "bg-amber-50 text-amber-600"
    },
    { 
      title: "Total Bookings", 
      value: "148", 
      trend: "+15.3%", 
      trendUp: true,
      icon: TrendingUp, 
      color: "from-blue-500 to-blue-600",
      lightColor: "bg-blue-50 text-blue-600"
    },
    { 
      title: "Total Revenue", 
      value: "$24,500", 
      trend: "+8.1%", 
      trendUp: true,
      icon: DollarSign, 
      color: "from-emerald-500 to-emerald-600",
      lightColor: "bg-emerald-50 text-emerald-600"
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 font-['Inter:Regular',sans-serif] mt-1">Here is the latest data for your venues.</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-['Inter:Medium',sans-serif] hover:bg-slate-50 hover:shadow-sm transition-all">
            <CalendarCheck className="w-4 h-4 text-slate-400" />
            This Month
          </button>
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div 
            key={stat.title} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)] hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            {/* Subtle background glow effect on hover */}
            <div className={`absolute -right-12 -top-12 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 rounded-full blur-2xl transition-opacity duration-500`} />
            
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.lightColor} flex items-center justify-center shrink-0`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-[13px] font-['Inter:Bold',sans-serif] font-bold ${stat.trendUp ? 'text-emerald-600' : 'text-amber-600'}`}>
                {stat.trendUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {stat.trend}
              </div>
            </div>
            
            <div>
              <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500 mb-1">{stat.title}</p>
              <h3 className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 tracking-tight">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Placeholder */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-[rgba(39,55,77,0.1)] p-6 min-h-[400px] flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-['Inter:Bold',sans-serif] font-bold text-slate-800">Revenue & Bookings</h2>
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <TrendingUp className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center rounded-xl bg-slate-50 border border-slate-100 border-dashed text-slate-400 font-['Inter:Medium',sans-serif]">
            <TrendingUp className="w-12 h-12 mb-4 opacity-20" />
            <p>[ Interactive Revenue Chart Container ]</p>
          </div>
        </motion.div>

        {/* Recent Bookings Placeholder */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-[rgba(39,55,77,0.1)] p-6 flex flex-col"
        >
          <h2 className="text-lg font-['Inter:Bold',sans-serif] font-bold text-slate-800 mb-6">Recent Requests</h2>
          <div className="flex-1 flex flex-col gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-4 p-3 -mx-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-['Inter:Bold',sans-serif] font-bold text-slate-800 truncate">Tech Summit 2026</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">Grand Horizon Hall</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-['Inter:Medium',sans-serif] text-slate-400">2h ago</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full py-2.5 rounded-xl text-sm font-['Inter:Bold',sans-serif] font-bold text-amber-600 hover:bg-amber-50 transition-colors">
            View All Requests
          </button>
        </motion.div>
      </div>
    </div>
  );
}
