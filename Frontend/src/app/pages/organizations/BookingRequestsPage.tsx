import { useState } from "react";
import {
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Search,
  Mail,
  Phone,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const mockBookingRequests = [
  {
    id: "1",
    eventTitle: "Tech Summit 2026",
    eventId: "1",
    attendeeName: "John Doe",
    attendeeEmail: "john.doe@example.com",
    attendeePhone: "+1 (555) 123-4567",
    requestDate: "2026-03-10",
    status: "pending",
    tickets: 2,
    specialRequests: "Wheelchair accessible seating please",
  },
  {
    id: "2",
    eventTitle: "Design Workshop",
    eventId: "2",
    attendeeName: "Sarah Smith",
    attendeeEmail: "sarah.smith@example.com",
    attendeePhone: "+1 (555) 234-5678",
    requestDate: "2026-03-12",
    status: "pending",
    tickets: 1,
    specialRequests: null,
  },
  {
    id: "3",
    eventTitle: "Tech Summit 2026",
    eventId: "1",
    attendeeName: "Mike Johnson",
    attendeeEmail: "mike.johnson@example.com",
    attendeePhone: "+1 (555) 345-6789",
    requestDate: "2026-03-11",
    status: "approved",
    tickets: 3,
    specialRequests: null,
  },
  {
    id: "4",
    eventTitle: "Design Workshop",
    eventId: "2",
    attendeeName: "Emily Rodriguez",
    attendeeEmail: "emily.r@example.com",
    attendeePhone: "+1 (555) 456-7890",
    requestDate: "2026-03-09",
    status: "rejected",
    tickets: 2,
    rejectionReason: "Event is fully booked",
    specialRequests: null,
  },
];

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function BookingRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<typeof mockBookingRequests[0] | null>(null);

  const filteredRequests = mockBookingRequests.filter(request => {
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesSearch = request.attendeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.eventTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: mockBookingRequests.length,
    pending: mockBookingRequests.filter(r => r.status === "pending").length,
    approved: mockBookingRequests.filter(r => r.status === "approved").length,
    rejected: mockBookingRequests.filter(r => r.status === "rejected").length,
  };

  const handleApprove = (requestId: string) => {
    alert(`Approving booking request ${requestId}`);
  };

  const handleReject = (requestId: string) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (reason) {
      alert(`Rejecting booking request ${requestId} with reason: ${reason}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 tracking-tight">Ticket Requests</h1>
        <p className="text-slate-500 font-['Inter:Regular',sans-serif] mt-1">Manage attendee ticket requests for your upcoming events.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)] hover:border-violet-500/30 transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500 mb-1">Total</p>
              <p className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-slate-800">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-slate-50 text-slate-400 group-hover:bg-violet-50 group-hover:text-violet-500 rounded-xl flex items-center justify-center transition-colors">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)] hover:border-amber-500/30 transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500 mb-1">Pending</p>
              <p className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-slate-800">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)] hover:border-emerald-500/30 transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500 mb-1">Approved</p>
              <p className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-slate-800">{stats.approved}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)] hover:border-rose-500/30 transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500 mb-1">Rejected</p>
              <p className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-slate-800">{stats.rejected}</p>
            </div>
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[rgba(39,55,77,0.1)] p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by attendee name or event..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 w-full font-['Inter:Medium',sans-serif] text-slate-700 transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as StatusFilter)}
                className={`px-4 py-2 rounded-lg font-['Inter:Medium',sans-serif] text-sm transition-all capitalize ${
                  statusFilter === status
                    ? "bg-white text-violet-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {filteredRequests.map((request, index) => (
              <motion.div 
                key={request.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="group flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50/30 hover:shadow-sm transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-['Inter:Bold',sans-serif] font-bold text-slate-800 text-lg truncate">{request.attendeeName}</h3>
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-['Inter:Bold',sans-serif] font-bold uppercase tracking-wider ${
                      request.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      request.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-['Inter:Medium',sans-serif] text-slate-500 mb-3">
                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-violet-400" /> {request.eventTitle}</span>
                    <span className="flex items-center gap-2"><Users className="w-4 h-4 text-emerald-400" /> {request.tickets} ticket(s)</span>
                    <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-blue-400" /> {request.attendeeEmail}</span>
                  </div>
                  {request.specialRequests && (
                    <p className="text-xs font-['Inter:Medium',sans-serif] text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg inline-block">
                      <strong className="font-bold">Note:</strong> {request.specialRequests}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {request.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleApprove(request.id)}
                        className="p-2.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors tooltip-trigger"
                        title="Approve"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleReject(request.id)}
                        className="p-2.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors tooltip-trigger"
                        title="Reject"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => setSelectedRequest(request)}
                    className="p-2.5 text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-xl transition-colors tooltip-trigger"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredRequests.length === 0 && (
            <div className="text-center py-20 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-['Inter:Medium',sans-serif] text-lg">No ticket requests found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-6 z-[60] cursor-pointer" onClick={() => setSelectedRequest(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl cursor-default flex flex-col" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <h2 className="text-2xl font-['Inter:Bold',sans-serif] font-bold text-slate-800">Request Details</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar">
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white text-2xl font-bold">
                    {selectedRequest.attendeeName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-['Inter:Bold',sans-serif] font-bold text-slate-800">{selectedRequest.attendeeName}</h3>
                    <span className={`inline-block mt-1 px-2.5 py-1 rounded-md text-[11px] font-['Inter:Bold',sans-serif] font-bold uppercase tracking-wider ${
                      selectedRequest.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      selectedRequest.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xs font-['Inter:Bold',sans-serif] font-bold text-slate-400 uppercase tracking-wider mb-3">Contact Info</h4>
                    <div className="space-y-3 font-['Inter:Medium',sans-serif] text-sm text-slate-600">
                      <p className="flex items-center gap-3"><Mail className="w-4 h-4 text-slate-400" /> {selectedRequest.attendeeEmail}</p>
                      <p className="flex items-center gap-3"><Phone className="w-4 h-4 text-slate-400" /> {selectedRequest.attendeePhone}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-['Inter:Bold',sans-serif] font-bold text-slate-400 uppercase tracking-wider mb-3">Event Details</h4>
                    <div className="space-y-3 font-['Inter:Medium',sans-serif] text-sm text-slate-600">
                      <p className="flex items-center gap-3"><Calendar className="w-4 h-4 text-slate-400" /> {selectedRequest.eventTitle}</p>
                      <p className="flex items-center gap-3"><Users className="w-4 h-4 text-slate-400" /> {selectedRequest.tickets} ticket(s)</p>
                      <p className="flex items-center gap-3"><span className="w-4 h-4 text-slate-400 font-bold flex items-center justify-center text-[10px]">#</span> Requested: {new Date(selectedRequest.requestDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {selectedRequest.specialRequests && (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <h4 className="text-xs font-['Inter:Bold',sans-serif] font-bold text-amber-800 uppercase tracking-wider mb-2">Special Requests</h4>
                    <p className="font-['Inter:Medium',sans-serif] text-sm text-amber-700">{selectedRequest.specialRequests}</p>
                  </div>
                )}

                {selectedRequest.status === "rejected" && selectedRequest.rejectionReason && (
                  <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                    <h4 className="text-xs font-['Inter:Bold',sans-serif] font-bold text-rose-800 uppercase tracking-wider mb-2">Rejection Reason</h4>
                    <p className="font-['Inter:Medium',sans-serif] text-sm text-rose-700">{selectedRequest.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>

            {selectedRequest.status === "pending" && (
              <div className="p-6 border-t border-slate-100 flex gap-4 shrink-0 bg-slate-50/50">
                <button
                  onClick={() => {
                    handleApprove(selectedRequest.id);
                    setSelectedRequest(null);
                  }}
                  className="flex-1 px-6 py-3 bg-emerald-500 text-white font-['Inter:Bold',sans-serif] font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-sm hover:shadow-emerald-500/30 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve Request
                </button>
                <button
                  onClick={() => {
                    handleReject(selectedRequest.id);
                    setSelectedRequest(null);
                  }}
                  className="flex-1 px-6 py-3 bg-rose-500 text-white font-['Inter:Bold',sans-serif] font-bold rounded-xl hover:bg-rose-600 transition-colors shadow-sm hover:shadow-rose-500/30 flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Reject Request
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}