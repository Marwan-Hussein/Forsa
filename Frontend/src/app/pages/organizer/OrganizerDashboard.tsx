import { useEffect, useState } from "react";
import { Ticket, CalendarCheck, TrendingUp, DollarSign, MapPin } from "lucide-react";
import { motion, useSpring, useTransform } from "motion/react";
import { organizerApi, OrganizerDashboardStats } from "../../api/organizerApi";

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { bounce: 0, duration: 2000 });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

export default function OrganizerDashboard() {
  const [stats, setStats] = useState<OrganizerDashboardStats | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Hardcoded ID for demonstration if auth context is not providing it easily in this boilerplate
  // Ideally, this should come from a user context: const { user } = useAuth();
  const organizerId = 1; 

  useEffect(() => {
    const fetchData = async () => {
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
  }, [organizerId]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const statCards = [
    { 
      title: "Total Events", 
      value: stats.totalEvents, 
      trend: `${stats.completedEvents} Completed`, 
      icon: CalendarCheck, 
      color: "from-indigo-500 to-indigo-700",
      lightColor: "bg-indigo-50 text-indigo-600"
    },
    { 
      title: "Tickets Sold", 
      value: stats.totalTicketsSold, 
      trend: "All time", 
      icon: Ticket, 
      color: "from-fuchsia-500 to-fuchsia-600",
      lightColor: "bg-fuchsia-50 text-fuchsia-600"
    },
    { 
      title: "Total Revenue", 
      value: stats.totalRevenue, 
      trend: "Ticket Sales", 
      prefix: "EGP ",
      icon: DollarSign, 
      color: "from-emerald-500 to-emerald-600",
      lightColor: "bg-emerald-50 text-emerald-600"
    },
    { 
      title: "Places Booked", 
      value: stats.totalPlacesBooked, 
      trend: "Confirmed venues", 
      icon: MapPin, 
      color: "from-sky-500 to-sky-600",
      lightColor: "bg-sky-50 text-sky-600"
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
          <h1 className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 tracking-tight">Organizer Dashboard</h1>
          <p className="text-slate-500 font-['Inter:Regular',sans-serif] mt-1">Monitor your events, ticket sales, and revenue.</p>
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div 
            key={stat.title} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)] hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className={`absolute -right-12 -top-12 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 rounded-full blur-2xl transition-opacity duration-500`} />
            
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.lightColor} flex items-center justify-center shrink-0`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-[13px] font-['Inter:Bold',sans-serif] font-bold text-slate-500`}>
                {stat.trend}
              </div>
            </div>
            
            <div>
              <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500 mb-1">{stat.title}</p>
              <h3 className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 tracking-tight">
                {stat.prefix}<AnimatedNumber value={stat.value} />
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-[rgba(39,55,77,0.1)] p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-['Inter:Bold',sans-serif] font-bold text-slate-800">Your Recent Events</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-sm text-slate-500 font-['Inter:Medium',sans-serif]">
                  <th className="py-3 px-4">Event Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Sold / Total</th>
                  <th className="py-3 px-4 text-right">Occupancy</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">No events found.</td>
                  </tr>
                ) : (
                  events.map((ev) => {
                    const booked = ev.totalTickets - ev.remainingTickets;
                    const occupancy = ev.totalTickets > 0 ? (booked / ev.totalTickets) * 100 : 0;
                    return (
                      <tr key={ev.eventId} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-['Inter:Medium',sans-serif] text-slate-800">{ev.title}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-['Inter:Bold',sans-serif] ${ev.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                            {ev.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-['Inter:Medium',sans-serif] text-slate-600">
                          {booked} / {ev.totalTickets}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-sm font-['Inter:Medium',sans-serif] text-slate-600">{occupancy.toFixed(0)}%</span>
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${occupancy}%` }}></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-gradient-to-br from-[#0B1120] to-[#1E3D61] rounded-2xl shadow-sm border border-[rgba(39,55,77,0.1)] p-8 flex flex-col justify-center items-center text-center text-white"
        >
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
            <TrendingUp className="w-8 h-8 text-sky-400" />
          </div>
          <h2 className="text-xl font-['Inter:Bold',sans-serif] font-bold mb-2">Ready for your next event?</h2>
          <p className="text-slate-300 text-sm mb-8 font-['Inter:Regular',sans-serif]">
            Browse premium venues and start selling tickets to your audience today.
          </p>
          <button className="w-full py-3 bg-white text-[#0B1120] rounded-xl font-['Inter:Bold',sans-serif] font-bold hover:bg-slate-100 transition-colors shadow-lg">
            Create New Event
          </button>
        </motion.div>
      </div>
    </div>
  );
}
