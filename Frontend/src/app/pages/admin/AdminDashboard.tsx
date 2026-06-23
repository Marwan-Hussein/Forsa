import { Users, MapPin, Calendar, Activity, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "motion/react";

export default function AdminDashboard() {
  const stats = [
    { 
      title: "Total Users", 
      value: "1,248", 
      trend: "+12.5%", 
      trendUp: true,
      icon: Users, 
      color: "from-blue-500 to-blue-600",
      lightColor: "bg-blue-50 text-blue-600"
    },
    { 
      title: "Total Venues", 
      value: "86", 
      trend: "+3.2%", 
      trendUp: true,
      icon: MapPin, 
      color: "from-indigo-500 to-indigo-600",
      lightColor: "bg-indigo-50 text-indigo-600"
    },
    { 
      title: "Active Events", 
      value: "32", 
      trend: "-2.4%", 
      trendUp: false,
      icon: Calendar, 
      color: "from-emerald-500 to-emerald-600",
      lightColor: "bg-emerald-50 text-emerald-600"
    },
    { 
      title: "System Health", 
      value: "99.9%", 
      trend: "Stable", 
      trendUp: true,
      icon: Activity, 
      color: "from-rose-500 to-rose-600",
      lightColor: "bg-rose-50 text-rose-600"
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
          <h1 className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 tracking-tight">Overview</h1>
          <p className="text-slate-500 font-['Inter:Regular',sans-serif] mt-1">Here is the latest data for your platform.</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-['Inter:Medium',sans-serif] hover:bg-slate-50 hover:shadow-sm transition-all">
            <Calendar className="w-4 h-4 text-slate-400" />
            Last 30 Days
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
              <div className={`flex items-center gap-1 text-sm font-['Inter:Medium',sans-serif] ${stat.trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
                {stat.trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
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
            <h2 className="text-lg font-['Inter:Bold',sans-serif] font-bold text-slate-800">Platform Growth</h2>
            <button className="text-slate-400 hover:text-slate-600">
              <TrendingUp className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 border-dashed text-slate-400 font-['Inter:Medium',sans-serif]">
            [ Interactive Chart Container ]
          </div>
        </motion.div>

        {/* Recent Activity Placeholder */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-[rgba(39,55,77,0.1)] p-6 flex flex-col"
        >
          <h2 className="text-lg font-['Inter:Bold',sans-serif] font-bold text-slate-800 mb-6">Recent Activity</h2>
          <div className="flex-1 flex flex-col gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 shrink-0" />
                <div>
                  <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-800">New user registered</p>
                  <p className="text-xs text-slate-500 mt-0.5">2 minutes ago</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full py-2.5 rounded-xl text-sm font-['Inter:Medium',sans-serif] text-[#3b82f6] hover:bg-[#3b82f6]/5 transition-colors">
            View All Activity
          </button>
        </motion.div>
      </div>
    </div>
  );
}
