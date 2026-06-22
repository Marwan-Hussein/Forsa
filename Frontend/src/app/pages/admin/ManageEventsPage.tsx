import { useState } from "react";
import { Search, Calendar, MapPin, CheckCircle, XCircle, Trash2, Eye, Filter, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Event {
  id: string;
  title: string;
  organizer: string;
  date: string;
  location: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  ticketsSold: number;
}

const MOCK_EVENTS: Event[] = [
  { id: "1", title: "Tech Conference 2026", organizer: "Tech Corp", date: "2026-08-15", location: "Grand Horizon Hall", status: "upcoming", ticketsSold: 450 },
  { id: "2", title: "Summer Music Festival", organizer: "Music Vibes", date: "2026-07-20", location: "Sunset Beach Resort", status: "upcoming", ticketsSold: 1200 },
  { id: "3", title: "AI Workshop", organizer: "Tech Corp", date: "2026-06-10", location: "Tech Hub Coworking", status: "completed", ticketsSold: 50 },
  { id: "4", title: "Local Art Expo", organizer: "Sara Sayed", date: "2026-09-05", location: "Cairo, Egypt", status: "cancelled", ticketsSold: 0 },
];

export default function ManageEventsPage() {
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || event.organizer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const cancelEvent = (id: string) => {
    if (window.confirm("Are you sure you want to cancel this event by force? This action alerts the organizer and attendees.")) {
      setEvents(events.map(e => e.id === id ? { ...e, status: "cancelled" } : e));
    }
  };

  const getStatusBadge = (status: Event["status"]) => {
    switch (status) {
      case "upcoming": return <span className="inline-flex items-center px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-['Inter:Bold',sans-serif] shadow-sm">Upcoming</span>;
      case "ongoing": return <span className="inline-flex items-center px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-['Inter:Bold',sans-serif] shadow-sm animate-pulse">Ongoing</span>;
      case "completed": return <span className="inline-flex items-center px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-['Inter:Bold',sans-serif] shadow-sm">Completed</span>;
      case "cancelled": return <span className="inline-flex items-center px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-['Inter:Bold',sans-serif] shadow-sm">Cancelled</span>;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 tracking-tight">Manage Events</h1>
          <p className="text-slate-500 font-['Inter:Regular',sans-serif] mt-1">Monitor and oversee all events on the platform.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search events..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-[rgba(39,55,77,0.1)] rounded-xl focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/50 shadow-sm transition-all w-full sm:w-64 font-['Inter:Regular',sans-serif] text-[14px]"
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-white border border-[rgba(39,55,77,0.1)] rounded-xl focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/50 shadow-sm transition-all w-full appearance-none cursor-pointer font-['Inter:Medium',sans-serif] text-[14px] text-slate-700"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[rgba(39,55,77,0.1)] overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-[13px] font-['Inter:Medium',sans-serif] uppercase tracking-wider">
                <th className="px-6 py-4">Event Title</th>
                <th className="px-6 py-4">Date & Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Tickets Sold</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {filteredEvents.map((event) => (
                  <motion.tr 
                    key={event.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3b82f6]/10 to-[#3b82f6]/20 flex items-center justify-center text-[#3b82f6] shrink-0 shadow-sm border border-[#3b82f6]/20 group-hover:scale-105 transition-transform">
                          <CalendarDays className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-['Inter:Bold',sans-serif] font-bold text-slate-800">{event.title}</p>
                          <p className="text-sm font-['Inter:Regular',sans-serif] text-slate-500 mt-0.5">Org: <span className="font-['Inter:Medium',sans-serif]">{event.organizer}</span></p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[14px] font-['Inter:Medium',sans-serif] text-slate-600">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {event.date}
                        </div>
                        <div className="flex items-center gap-2 text-[14px] font-['Inter:Medium',sans-serif] text-slate-600">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          {event.location}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(event.status)}
                    </td>
                    <td className="px-6 py-5 text-[15px] font-['Inter:Bold',sans-serif] font-bold text-slate-700">
                      {event.ticketsSold}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-[#3b82f6] hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition-colors shadow-sm" title="View Event Page">
                          <Eye className="w-4 h-4" />
                        </button>
                        {event.status !== 'cancelled' && event.status !== 'completed' && (
                          <button 
                            onClick={() => cancelEvent(event.id)}
                            className="p-2 text-rose-500 bg-white hover:bg-rose-50 border border-rose-200 shadow-sm rounded-lg transition-colors" 
                            title="Force Cancel Event"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Search className="w-8 h-8 mb-3 opacity-20" />
                      <p className="font-['Inter:Medium',sans-serif]">No events found matching your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
