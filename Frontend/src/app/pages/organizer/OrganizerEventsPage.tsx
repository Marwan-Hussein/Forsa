import { Link } from "react-router";
import { Plus, Calendar, Users, DollarSign, Star, Edit2, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

const mockOrganizationEvents = [
  {
    id: "1",
    title: "Tech Summit 2026",
    date: "2026-04-15",
    status: "upcoming",
    attendees: 234,
    capacity: 500,
    revenue: 23400,
    rating: 4.5,
    reviews: 12,
  },
  {
    id: "2",
    title: "Design Workshop",
    date: "2026-03-20",
    status: "upcoming",
    attendees: 45,
    capacity: 50,
    revenue: 2250,
    rating: 4.8,
    reviews: 8,
  },
  {
    id: "3",
    title: "Startup Pitch Night",
    date: "2026-02-10",
    status: "completed",
    attendees: 150,
    capacity: 150,
    revenue: 6000,
    rating: 4.3,
    reviews: 45,
  },
];

export default function OrganizerEventsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEvents = mockOrganizationEvents.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 tracking-tight">My Events</h1>
          <p className="text-slate-500 font-['Inter:Regular',sans-serif] mt-1">Manage your active and past events.</p>
        </div>
        <Link 
          to="/organizer/events/new"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white font-['Inter:Bold',sans-serif] font-bold rounded-xl hover:shadow-lg hover:shadow-violet-500/30 transition-all hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Create Event
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[rgba(39,55,77,0.1)] p-6">
        <div className="relative max-w-lg mb-8">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search events..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 w-full font-['Inter:Medium',sans-serif] text-slate-700 transition-all shadow-sm"
          />
        </div>

        <div className="space-y-6">
          <AnimatePresence>
            {filteredEvents.map((event, index) => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white border border-[rgba(39,55,77,0.1)] rounded-2xl p-6 sm:p-8 hover:border-violet-500/30 hover:shadow-md transition-all group flex flex-col md:flex-row gap-6 relative overflow-hidden"
              >
                {/* Decorative Side Ribbon */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${event.status === 'upcoming' ? 'bg-violet-500' : 'bg-slate-300'}`} />

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-['Inter:Bold',sans-serif] font-bold text-slate-800">{event.title}</h3>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-['Inter:Bold',sans-serif] font-bold border ${
                        event.status === "upcoming"
                          ? "bg-violet-50 text-violet-700 border-violet-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {event.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-['Inter:Medium',sans-serif] text-slate-500 mb-6">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-violet-500" />
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                      ${event.revenue.toLocaleString()} Revenue
                    </span>
                    <span className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      {event.rating} ({event.reviews} reviews)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="max-w-md">
                    <div className="flex justify-between text-xs font-['Inter:Bold',sans-serif] font-bold text-slate-600 mb-2">
                      <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-slate-400" /> Attendees</span>
                      <span>{event.attendees} / {event.capacity} ({Math.round((event.attendees / event.capacity) * 100)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/50">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          event.attendees >= event.capacity ? 'bg-emerald-500' : 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
                        }`}
                        style={{ width: `${(event.attendees / event.capacity) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6 shrink-0">
                  <Link
                    to={`/organizer/events/${event.id}/attendees`}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0B1120] text-white rounded-xl hover:bg-[#1E3D61] transition-colors font-['Inter:Bold',sans-serif] text-sm shadow-sm hover:shadow-md"
                  >
                    <Users className="w-4 h-4" />
                    Manage Attendees
                  </Link>
                  <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-['Inter:Medium',sans-serif] text-sm">
                    <Edit2 className="w-4 h-4" />
                    Edit Event
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredEvents.length === 0 && (
            <div className="text-center py-20 text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-['Inter:Medium',sans-serif] text-lg">No events found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
