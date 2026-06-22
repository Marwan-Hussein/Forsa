import { useState } from "react";
import { Search, Calendar, MapPin, CheckCircle, XCircle, Clock, Check, X, CalendarCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BookingRequest {
  id: string;
  eventName: string;
  organizerName: string;
  venueName: string;
  requestedDates: string;
  status: "pending" | "accepted" | "rejected";
  priceOffer: string;
}

const MOCK_BOOKINGS: BookingRequest[] = [
  { id: "1", eventName: "Tech Conference 2026", organizerName: "Tech Corp", venueName: "Grand Horizon Hall", requestedDates: "Aug 15 - Aug 17, 2026", status: "pending", priceOffer: "$3,500" },
  { id: "2", eventName: "AI Summit", organizerName: "Future Works", venueName: "Grand Horizon Hall", requestedDates: "Sep 10, 2026", status: "accepted", priceOffer: "$1,200" },
  { id: "3", eventName: "Local Meetup", organizerName: "Startup Hub", venueName: "Downtown Meeting Room", requestedDates: "Jul 05, 2026", status: "rejected", priceOffer: "$200" },
];

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<BookingRequest[]>(MOCK_BOOKINGS);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBookings = bookings.filter(b => 
    b.eventName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.organizerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateStatus = (id: string, newStatus: BookingRequest["status"]) => {
    if (window.confirm(`Are you sure you want to ${newStatus} this booking?`)) {
      setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
    }
  };

  const getStatusBadge = (status: BookingRequest["status"]) => {
    switch (status) {
      case "pending": return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-['Inter:Bold',sans-serif] shadow-sm"><Clock className="w-3.5 h-3.5"/> Action Required</span>;
      case "accepted": return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-['Inter:Bold',sans-serif] shadow-sm"><CheckCircle className="w-3.5 h-3.5"/> Accepted</span>;
      case "rejected": return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-['Inter:Bold',sans-serif] shadow-sm"><XCircle className="w-3.5 h-3.5"/> Rejected</span>;
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
          <h1 className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 tracking-tight">Booking Requests</h1>
          <p className="text-slate-500 font-['Inter:Regular',sans-serif] mt-1">Review and manage incoming reservation requests for your venues.</p>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search bookings..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border border-[rgba(39,55,77,0.1)] rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 shadow-sm transition-all w-full sm:w-64 font-['Inter:Regular',sans-serif] text-[14px]"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[rgba(39,55,77,0.1)] overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-[13px] font-['Inter:Medium',sans-serif] uppercase tracking-wider">
                <th className="px-6 py-4">Event & Organizer</th>
                <th className="px-6 py-4">Venue & Dates</th>
                <th className="px-6 py-4">Offer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {filteredBookings.map((booking) => (
                  <motion.tr 
                    key={booking.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                    className={`transition-colors group ${booking.status === 'pending' ? 'hover:bg-amber-50/30' : 'hover:bg-slate-50/50'}`}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border transition-transform group-hover:scale-105 ${
                          booking.status === 'pending' 
                            ? 'bg-amber-50 text-amber-600 border-amber-200/50'
                            : 'bg-slate-50 text-slate-500 border-slate-200/50'
                        }`}>
                          <CalendarCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-['Inter:Bold',sans-serif] font-bold text-slate-800">{booking.eventName}</p>
                          <p className="text-sm font-['Inter:Regular',sans-serif] text-slate-500 mt-0.5">By: <span className="font-['Inter:Medium',sans-serif] text-slate-700">{booking.organizerName}</span></p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[14px] font-['Inter:Bold',sans-serif] text-[#1E3D61]">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          {booking.venueName}
                        </div>
                        <div className="flex items-center gap-2 text-[14px] font-['Inter:Medium',sans-serif] text-slate-600">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {booking.requestedDates}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[16px] font-['Inter:Bold',sans-serif] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">{booking.priceOffer}</span>
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-5 text-right">
                      {booking.status === "pending" ? (
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => updateStatus(booking.id, "accepted")}
                            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#0B1120] to-[#1E3D61] text-white hover:shadow-lg hover:shadow-[#1E3D61]/20 rounded-xl text-[13px] font-['Inter:Bold',sans-serif] transition-all"
                            title="Accept Booking"
                          >
                            <Check className="w-4 h-4" /> Accept
                          </button>
                          <button 
                            onClick={() => updateStatus(booking.id, "rejected")}
                            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-[13px] font-['Inter:Bold',sans-serif] transition-all shadow-sm"
                            title="Reject Booking"
                          >
                            <X className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-['Inter:Medium',sans-serif] text-[13px] italic bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          Responded
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <CalendarCheck className="w-8 h-8 mb-3 opacity-20" />
                      <p className="font-['Inter:Medium',sans-serif]">No booking requests found.</p>
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
