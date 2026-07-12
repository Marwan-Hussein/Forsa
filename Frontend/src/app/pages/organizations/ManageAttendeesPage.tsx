import { useState, useEffect } from "react";
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
  Ticket,
  Activity,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { organizerApi } from "../../api/organizerApi";
import { toast } from "react-toastify";
import { parseBackendDate } from "../../utils/mappers";

type CheckInFilter = "all" | "checked-in" | "not-checked-in";

export default function ManageAttendeesPage() {
  const { eventId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [checkInFilter, setCheckInFilter] = useState<CheckInFilter>("all");

  const [attendees, setAttendees] = useState<any[]>([]);
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingInUser, setCheckingInUser] = useState<{ bookingId: number; fullName: string } | null>(null);
  const [undoingUser, setUndoingUser] = useState<{ bookingId: number; fullName: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!eventId) return;
      try {
        setLoading(true);
        const [eventRes, attendeesRes] = await Promise.all([
          organizerApi.getEventDetails(Number(eventId)),
          organizerApi.getEventAttendees(Number(eventId))
        ]);
        setEventDetails(eventRes);
        setAttendees(attendeesRes || []);
      } catch (err: any) {
        toast.error("Failed to load attendees data: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  const filteredAttendees = attendees.filter(attendee => {
    const matchesSearch = 
      attendee.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCheckIn = checkInFilter === "all" || 
      (checkInFilter === "checked-in" && attendee.checkInStatus === "Attended") ||
      (checkInFilter === "not-checked-in" && attendee.checkInStatus !== "Attended");
    return matchesSearch && matchesCheckIn;
  });

  const stats = {
    expected: attendees.length,
    checkedIn: attendees.filter(a => a.checkInStatus === "Attended").length,
    notCheckedIn: attendees.filter(a => a.checkInStatus !== "Attended").length
  };

  const handleSendEmail = (attendee: any) => {
    toast.info(`Opening email client for ${attendee.email}`);
    window.location.href = `mailto:${attendee.email}`;
  };

  const handleManualCheckIn = async () => {
    if (!checkingInUser) return;
    try {
      setActionLoading(true);
      await organizerApi.manualCheckIn(checkingInUser.bookingId);
      toast.success(`${checkingInUser.fullName} has been checked in manually.`);
      setCheckingInUser(null);
      // Refresh attendees list
      if (eventId) {
        const attendeesRes = await organizerApi.getEventAttendees(Number(eventId));
        setAttendees(attendeesRes || []);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to check in manually");
    } finally {
      setActionLoading(false);
    }
  };

  const handleManualUndoCheckIn = async () => {
    if (!undoingUser) return;
    try {
      setActionLoading(true);
      await organizerApi.undoCheckIn(undoingUser.bookingId);
      toast.success(`${undoingUser.fullName}'s check-in has been reversed.`);
      setUndoingUser(null);
      // Refresh attendees list
      if (eventId) {
        const attendeesRes = await organizerApi.getEventAttendees(Number(eventId));
        setAttendees(attendeesRes || []);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to undo check-in");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
          <Activity className="w-8 h-8 text-indigo-500 animate-pulse" />
        </div>
        <p className="text-indigo-600 font-['Inter:Bold',sans-serif] mt-6 tracking-widest text-sm uppercase animate-pulse">Loading Data...</p>
      </div>
    );
  }

  if (!eventDetails) {
    return <div className="text-center py-20 text-slate-500 font-['Inter:Medium',sans-serif]">Event not found.</div>;
  }

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
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl shadow-indigo-900/10 border border-indigo-500/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-500/20 rounded-full filter blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full filter blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-['Outfit:Bold',sans-serif] font-bold mb-4 tracking-tight text-white">{eventDetails.title}</h1>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 font-['Inter:Medium',sans-serif] text-slate-300">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-violet-300" />
                </div>
                <span>{new Date(eventDetails.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-emerald-300" />
                </div>
                <span>{eventDetails.location || "Online / TBA"}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-amber-300" />
                </div>
                <span>{Math.max(0, (eventDetails?.totalTickets || 0) - (eventDetails?.remainingTickets || 0))} / {eventDetails?.totalTickets || 0} Booked</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 shrink-0">
            <Link
              to={`/organizer/events/${eventId}/scan`}
              className="px-6 py-3.5 bg-white text-indigo-950 font-['Inter:Bold',sans-serif] font-bold rounded-2xl shadow-lg shadow-white/10 hover:shadow-white/20 transition-all flex items-center justify-center gap-2 group hover:-translate-y-0.5"
            >
              <QrCode className="w-5 h-5 group-hover:scale-110 transition-transform" />
              QR Check-in Scanner
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)] flex items-center justify-between group hover:border-violet-500/30 transition-all">
          <div>
            <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500 mb-1">Total Expected</p>
            <p className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-slate-800">{stats.expected}</p>
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
          <div className="w-12 h-12 bg-emerald-50 text-emerald-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 rounded-xl flex items-center justify-center transition-colors">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)] flex items-center justify-between group hover:border-amber-500/30 transition-all">
          <div>
            <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500 mb-1">Not Checked In</p>
            <p className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-amber-600">{stats.notCheckedIn}</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-400 group-hover:bg-amber-100 group-hover:text-amber-600 rounded-xl flex items-center justify-center transition-colors">
            <UserX className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[rgba(39,55,77,0.1)] flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 font-['Inter:Medium',sans-serif] text-slate-700 transition-all"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
            {(["all", "checked-in", "not-checked-in"] as CheckInFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setCheckInFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-['Inter:Medium',sans-serif] capitalize transition-all ${
                  checkInFilter === filter 
                    ? "bg-white text-violet-600 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {filter.replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Attendees List */}
      <div className="bg-white rounded-2xl shadow-sm border border-[rgba(39,55,77,0.1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-['Inter:Bold',sans-serif] text-slate-500 uppercase tracking-wider">
                <th className="p-6 font-semibold">Attendee</th>
                <th className="p-6 font-semibold">Contact</th>
                <th className="p-6 font-semibold">Booking Details</th>
                <th className="p-6 font-semibold">Check-in Status</th>
                <th className="p-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAttendees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400 font-['Inter:Medium',sans-serif]">
                    No attendees found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredAttendees.map((attendee) => (
                  <tr key={attendee.bookingId} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-['Outfit:Bold',sans-serif] font-bold text-lg shadow-sm shadow-violet-200">
                          {attendee.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-['Inter:Bold',sans-serif] text-slate-800">{attendee.fullName}</p>
                          <p className="text-xs text-slate-400 font-['Inter:Medium',sans-serif] mt-0.5">
                            Booked: {new Date(attendee.bookingDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[200px]">{attendee.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{attendee.phoneNumber}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-['Inter:Bold',sans-serif] text-slate-700">
                          <Ticket className="w-4 h-4 text-violet-500" />
                          {attendee.numberOfTickets} Ticket{attendee.numberOfTickets > 1 ? 's' : ''}
                        </div>
                        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                          attendee.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                          attendee.paymentStatus === 'pending' ? 'bg-amber-50 text-amber-600' :
                          attendee.paymentStatus === 'cancelled' ? 'bg-slate-100 text-slate-600' :
                          'bg-rose-50 text-rose-600'
                        }`}>
                          {attendee.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      {attendee.checkInStatus === 'Attended' ? (
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-['Inter:Bold',sans-serif]">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Checked In
                          </div>
                          {attendee.checkInTime && (
                            <p className="text-[11px] text-slate-400 mt-2 font-['Inter:Medium',sans-serif]">
                              {parseBackendDate(attendee.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-['Inter:Bold',sans-serif] ${
                          attendee.checkInStatus === 'Confirmed' ? 'bg-blue-50 border-blue-200 text-blue-600' :
                          attendee.checkInStatus === 'Cancelled' ? 'bg-slate-50 border-slate-200 text-slate-500' :
                          attendee.checkInStatus === 'Rejected' ? 'bg-rose-50 border-rose-200 text-rose-600' :
                          attendee.checkInStatus === 'Pending' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                          'bg-slate-100 border-slate-200 text-slate-600'
                        }`}>
                          {attendee.checkInStatus === 'Confirmed' ? <CheckCircle className="w-3.5 h-3.5 text-blue-400" /> : <XCircle className="w-3.5 h-3.5 opacity-50" />}
                          {attendee.checkInStatus}
                        </div>
                      )}
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            toast.info(`Opening email client for ${attendee.email}`);
                            window.location.href = `mailto:${attendee.email}`;
                          }}
                          title="Send Email"
                          className="p-2 bg-slate-50 hover:bg-violet-50 text-slate-400 hover:text-violet-600 rounded-lg transition-colors border border-transparent hover:border-violet-200"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        {attendee.checkInStatus === 'Confirmed' && (
                          <button
                            onClick={() => setCheckingInUser({ bookingId: attendee.bookingId, fullName: attendee.fullName })}
                            title="Manual Check-in"
                            className="p-2 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors border border-transparent hover:border-emerald-200 cursor-pointer"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        {attendee.checkInStatus === 'Attended' && (
                          <button
                            onClick={() => setUndoingUser({ bookingId: attendee.bookingId, fullName: attendee.fullName })}
                            title="Undo Check-in"
                            className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors border border-transparent hover:border-rose-200 cursor-pointer"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Check-In Confirmation Modal */}
      <AnimatePresence>
        {checkingInUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80"
              onClick={() => !actionLoading && setCheckingInUser(null)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-md rounded-3xl bg-[#162032] border border-white/10 p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] text-white overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
              
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-['Outfit:Bold',sans-serif] text-lg font-bold">Manual Check-In</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Confirm attendance record</p>
                </div>
              </div>
              
              <p className="text-sm text-slate-300 font-['Inter:Medium',sans-serif] leading-relaxed mb-6">
                Are you sure you want to manually mark <span className="font-bold text-white">{checkingInUser.fullName}</span> as <span className="text-emerald-400 font-semibold">Checked In</span>? This will record their attendance without requiring a QR code scan.
              </p>
              
              <div className="flex items-center justify-end gap-3 font-['Inter:Bold',sans-serif] text-sm">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setCheckingInUser(null)}
                  className="px-5 py-3 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleManualCheckIn}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Checking in...
                    </>
                  ) : (
                    "Confirm Check-In"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Undo Check-In Confirmation Modal */}
      <AnimatePresence>
        {undoingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80"
              onClick={() => !actionLoading && setUndoingUser(null)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-md rounded-3xl bg-[#162032] border border-white/10 p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] text-white overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />
              
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shrink-0">
                  <UserX className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-['Outfit:Bold',sans-serif] text-lg font-bold">Reverse Check-In</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Undo check-in record</p>
                </div>
              </div>
              
              <p className="text-sm text-slate-300 font-['Inter:Medium',sans-serif] leading-relaxed mb-6">
                Are you sure you want to reverse the attendance check-in for <span className="font-bold text-white">{undoingUser.fullName}</span>? This will change their status back to <span className="text-violet-400 font-semibold">Confirmed</span>.
              </p>
              
              <div className="flex items-center justify-end gap-3 font-['Inter:Bold',sans-serif] text-sm">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setUndoingUser(null)}
                  className="px-5 py-3 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleManualUndoCheckIn}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(244,63,94,0.2)] hover:shadow-[0_0_25px_rgba(244,63,94,0.3)] flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Reversing...
                    </>
                  ) : (
                    "Reverse Check-In"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
