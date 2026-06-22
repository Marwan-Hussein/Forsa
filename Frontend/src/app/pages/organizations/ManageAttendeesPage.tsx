import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  Users,
  Search,
  Download,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  QrCode,
  UserCheck,
  UserX,
  ChevronRight,
  ShieldCheck,
  Ticket
} from "lucide-react";
import { motion } from "motion/react";

const mockAttendees = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    phone: "+1 (555) 234-5678",
    ticketType: "VIP",
    ticketCount: 2,
    bookingDate: "2026-03-05",
    checkInStatus: "checked-in",
    checkInTime: "2026-03-14 09:15",
    paymentStatus: "paid",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael.chen@example.com",
    phone: "+1 (555) 345-6789",
    ticketType: "General",
    ticketCount: 1,
    bookingDate: "2026-03-08",
    checkInStatus: "not-checked-in",
    checkInTime: null,
    paymentStatus: "paid",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@example.com",
    phone: "+1 (555) 456-7890",
    ticketType: "VIP",
    ticketCount: 3,
    bookingDate: "2026-03-10",
    checkInStatus: "checked-in",
    checkInTime: "2026-03-14 10:30",
    paymentStatus: "paid",
  },
  {
    id: "4",
    name: "David Kim",
    email: "david.kim@example.com",
    phone: "+1 (555) 567-8901",
    ticketType: "General",
    ticketCount: 1,
    bookingDate: "2026-03-12",
    checkInStatus: "not-checked-in",
    checkInTime: null,
    paymentStatus: "pending",
  },
  {
    id: "5",
    name: "Jessica Martinez",
    email: "jessica.martinez@example.com",
    phone: "+1 (555) 678-9012",
    ticketType: "Early Bird",
    ticketCount: 2,
    bookingDate: "2026-02-20",
    checkInStatus: "checked-in",
    checkInTime: "2026-03-14 08:45",
    paymentStatus: "paid",
  },
];

const mockEvent = {
  id: "1",
  title: "Tech Summit 2026",
  date: "2026-04-15",
  location: "Grand Convention Center",
  totalCapacity: 500,
  totalBookings: 234,
};

type CheckInFilter = "all" | "checked-in" | "not-checked-in";
type TicketFilter = "all" | "VIP" | "General" | "Early Bird";

export default function ManageAttendeesPage() {
  const { eventId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [checkInFilter, setCheckInFilter] = useState<CheckInFilter>("all");
  const [ticketFilter, setTicketFilter] = useState<TicketFilter>("all");

  const filteredAttendees = mockAttendees.filter(attendee => {
    const matchesSearch = 
      attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCheckIn = checkInFilter === "all" || attendee.checkInStatus === checkInFilter;
    const matchesTicket = ticketFilter === "all" || attendee.ticketType === ticketFilter;
    return matchesSearch && matchesCheckIn && matchesTicket;
  });

  const stats = {
    total: mockAttendees.length,
    checkedIn: mockAttendees.filter(a => a.checkInStatus === "checked-in").length,
    notCheckedIn: mockAttendees.filter(a => a.checkInStatus === "not-checked-in").length,
    vipTickets: mockAttendees.filter(a => a.ticketType === "VIP").reduce((sum, a) => sum + a.ticketCount, 0),
  };

  const handleExportCSV = () => {
    alert("Exporting attendees to CSV...");
  };

  const handleSendEmail = (attendee: typeof mockAttendees[0]) => {
    alert(`Sending email to ${attendee.email}`);
  };

  const handleCheckIn = (attendee: typeof mockAttendees[0]) => {
    alert(`Checking in ${attendee.name}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-['Inter:Medium',sans-serif] text-slate-400 mb-2">
        <Link to="/organizer" className="hover:text-violet-500 transition-colors">Dashboard</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/organizer/events" className="hover:text-violet-500 transition-colors">Events</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-700">Manage Attendees</span>
      </div>

      {/* Event Header Card */}
      <div className="bg-gradient-to-br from-[#0B1120] to-[#1E3D61] rounded-2xl p-8 sm:p-10 text-white relative overflow-hidden shadow-lg shadow-[#1E3D61]/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/30 rounded-full filter blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/20 rounded-full filter blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-['Inter:Bold',sans-serif] font-bold mb-4">{mockEvent.title}</h1>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 font-['Inter:Medium',sans-serif] text-slate-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-violet-400" />
                <span>{new Date(mockEvent.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <span>{mockEvent.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>{mockEvent.totalBookings} / {mockEvent.totalCapacity} Booked</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 shrink-0">
            <Link
              to={`/organizer/events/${eventId}/scan`}
              className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white font-['Inter:Bold',sans-serif] font-bold rounded-xl hover:shadow-lg hover:shadow-violet-500/30 transition-all flex items-center justify-center gap-2 group"
            >
              <QrCode className="w-5 h-5 group-hover:scale-110 transition-transform" />
              QR Check-in Scanner
            </Link>
            <button
              onClick={handleExportCSV}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-['Inter:Medium',sans-serif] rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV List
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)] flex items-center justify-between group hover:border-violet-500/30 transition-all">
          <div>
            <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500 mb-1">Total Expected</p>
            <p className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-slate-800">{stats.total}</p>
          </div>
          <div className="w-12 h-12 bg-slate-50 text-slate-400 group-hover:bg-violet-50 group-hover:text-violet-500 rounded-xl flex items-center justify-center transition-colors">
            <Users className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)] flex items-center justify-between group hover:border-emerald-500/30 transition-all">
          <div>
            <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500 mb-1">Checked In</p>
            <p className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-emerald-600">{stats.checkedIn}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)] flex items-center justify-between group hover:border-amber-500/30 transition-all">
          <div>
            <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500 mb-1">Not Checked In</p>
            <p className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-amber-600">{stats.notCheckedIn}</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
            <UserX className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)] flex items-center justify-between group hover:border-fuchsia-500/30 transition-all">
          <div>
            <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500 mb-1">VIP Guests</p>
            <p className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-fuchsia-600">{stats.vipTickets}</p>
          </div>
          <div className="w-12 h-12 bg-fuchsia-50 text-fuchsia-500 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-[rgba(39,55,77,0.1)] overflow-hidden">
        {/* Filters and Search Bar */}
        <div className="p-6 border-b border-slate-100 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 font-['Inter:Medium',sans-serif] text-sm text-slate-700 transition-all shadow-sm"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-100 shadow-sm">
                {(['all', 'checked-in', 'not-checked-in'] as CheckInFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setCheckInFilter(filter)}
                    className={`px-3 py-1.5 rounded-md text-xs font-['Inter:Bold',sans-serif] transition-all capitalize ${
                      checkInFilter === filter 
                        ? 'bg-violet-100 text-violet-700' 
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {filter.replace(/-/g, ' ')}
                  </button>
                ))}
              </div>
              <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-100 shadow-sm">
                {(['all', 'VIP', 'General', 'Early Bird'] as TicketFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTicketFilter(filter)}
                    className={`px-3 py-1.5 rounded-md text-xs font-['Inter:Bold',sans-serif] transition-all ${
                      ticketFilter === filter 
                        ? 'bg-fuchsia-100 text-fuchsia-700' 
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-['Inter:Bold',sans-serif] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Attendee</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Ticket</th>
                <th className="px-6 py-4">Check-in Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAttendees.map((attendee) => (
                <tr key={attendee.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center text-violet-700 font-['Inter:Bold',sans-serif] font-bold shrink-0">
                        {attendee.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-['Inter:Bold',sans-serif] font-bold text-slate-800">{attendee.name}</p>
                        <p className="text-xs font-['Inter:Medium',sans-serif] text-slate-400 mt-0.5">Booked: {new Date(attendee.bookingDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-['Inter:Medium',sans-serif] text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {attendee.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-['Inter:Medium',sans-serif] text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {attendee.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-1.5">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-['Inter:Bold',sans-serif] font-bold uppercase tracking-wider border ${
                        attendee.ticketType === 'VIP' ? 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200' :
                        attendee.ticketType === 'Early Bird' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        'bg-blue-50 text-blue-600 border-blue-200'
                      }`}>
                        {attendee.ticketType}
                      </span>
                      <span className="text-xs font-['Inter:Medium',sans-serif] text-slate-500 flex items-center gap-1">
                        <Ticket className="w-3 h-3" /> {attendee.ticketCount} Qty
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-['Inter:Bold',sans-serif] uppercase ${
                        attendee.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {attendee.paymentStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {attendee.checkInStatus === 'checked-in' ? (
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-['Inter:Bold',sans-serif] font-bold">
                          <CheckCircle className="w-3.5 h-3.5" /> Checked In
                        </span>
                        <p className="text-[11px] font-['Inter:Medium',sans-serif] text-slate-400 mt-1.5">
                          {attendee.checkInTime ? new Date(attendee.checkInTime).toLocaleString([], {hour: '2-digit', minute:'2-digit', month: 'short', day: 'numeric'}) : ''}
                        </p>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-md text-xs font-['Inter:Bold',sans-serif] font-bold">
                        <XCircle className="w-3.5 h-3.5" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {attendee.checkInStatus === 'not-checked-in' && (
                        <button
                          onClick={() => handleCheckIn(attendee)}
                          className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors tooltip-trigger"
                          title="Manual Check-in"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleSendEmail(attendee)}
                        className="p-2 text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors tooltip-trigger"
                        title="Send Email"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAttendees.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-['Inter:Medium',sans-serif] text-lg">No attendees match your filters.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
