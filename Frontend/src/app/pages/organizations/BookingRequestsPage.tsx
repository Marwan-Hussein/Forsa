import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
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
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { organizerApi } from "../../api/organizerApi";
import { getUserIdFromToken } from "../../api/api";
import { toast } from "react-toastify";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function BookingRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [rejectingRequestId, setRejectingRequestId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchRequests = async () => {
    try {
      const organizerId = getUserIdFromToken();
      if (!organizerId) {
        toast.error("Not authenticated");
        navigate("/login");
        return;
      }
      const data = await organizerApi.getTicketRequests(organizerId);
      setRequests(data || []);
    } catch (err: any) {
      toast.error("Failed to load ticket requests: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [navigate]);

  const handleApprove = async (requestId: number) => {
    try {
      await organizerApi.approveTicketRequest(requestId);
      toast.success("Ticket request approved successfully");
      fetchRequests();
    } catch (err: any) {
      toast.error("Failed to approve request: " + err.message);
    }
  };

  const handleReject = (requestId: number) => {
    setRejectingRequestId(requestId);
    setRejectionReason("");
  };

  const submitReject = async () => {
    if (!rejectingRequestId) return;
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    
    try {
      await organizerApi.rejectTicketRequest(rejectingRequestId, rejectionReason);
      toast.success("Ticket request rejected successfully");
      setRejectingRequestId(null);
      fetchRequests();
    } catch (err: any) {
      toast.error("Failed to reject request: " + err.message);
    }
  };

  const getStatusString = (status: any) => {
    if (typeof status === "string") return status.toLowerCase();
    return "pending"; // fallback
  };

  const filteredRequests = requests.filter(request => {
    const statusStr = getStatusString(request.status);
    const matchesStatus = statusFilter === "all" || 
                          statusStr === statusFilter || 
                          (statusFilter === "approved" && statusStr === "confirmed"); // handle confirmed as approved
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (request.attendeeName && request.attendeeName.toLowerCase().includes(searchLower)) ||
      (request.eventTitle && request.eventTitle.toLowerCase().includes(searchLower));
    
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => getStatusString(r.status) === "pending").length,
    approved: requests.filter(r => getStatusString(r.status) === "confirmed" || getStatusString(r.status) === "approved").length,
    rejected: requests.filter(r => getStatusString(r.status) === "rejected" || getStatusString(r.status) === "cancelled").length,
  };

  // UI mapping for statuses
  const mapStatusForDisplay = (status: string) => {
    const s = getStatusString(status);
    if (s === 'confirmed') return 'approved';
    if (s === 'cancelled') return 'rejected';
    return s;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Header Section */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white shadow-xl shadow-indigo-100/30">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-indigo-700 font-['Inter:Bold',sans-serif] text-xs uppercase tracking-wider">Organizer Portal</span>
              </div>
            </div>
            <h1 className="text-4xl font-['Outfit:Bold',sans-serif] font-bold text-slate-800 tracking-tight">
              Ticket Requests
            </h1>
            <p className="text-slate-500 font-['Inter:Medium',sans-serif] mt-2 text-base">
              Manage attendee ticket requests for your upcoming events.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/60 hover:border-indigo-500/30 hover:-translate-y-1 transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500 mb-1">Total Requests</p>
              <p className="text-3xl font-['Outfit:Bold',sans-serif] font-bold text-slate-800">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/60 hover:border-amber-500/30 hover:-translate-y-1 transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500 mb-1">Pending</p>
              <p className="text-3xl font-['Outfit:Bold',sans-serif] font-bold text-slate-800">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-500 group-hover:bg-amber-500 group-hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/60 hover:border-emerald-500/30 hover:-translate-y-1 transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500 mb-1">Approved</p>
              <p className="text-3xl font-['Outfit:Bold',sans-serif] font-bold text-slate-800">{stats.approved}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/60 hover:border-rose-500/30 hover:-translate-y-1 transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500 mb-1">Rejected</p>
              <p className="text-3xl font-['Outfit:Bold',sans-serif] font-bold text-slate-800">{stats.rejected}</p>
            </div>
            <div className="w-12 h-12 bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-white p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400" />
            <input 
              type="text" 
              placeholder="Search by attendee name or event..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 pr-4 py-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 w-full font-['Inter:Medium',sans-serif] text-slate-700 transition-all shadow-inner"
            />
          </div>
          <div className="flex gap-2 bg-indigo-50/50 p-1.5 rounded-2xl border border-indigo-100/50">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as StatusFilter)}
                className={`px-6 py-3 rounded-xl font-['Inter:Bold',sans-serif] text-sm transition-all capitalize ${
                  statusFilter === status
                    ? "bg-white text-indigo-600 shadow-sm border border-indigo-100/50"
                    : "text-slate-500 hover:text-indigo-600 hover:bg-white/50"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {filteredRequests.map((request, index) => {
              const displayStatus = mapStatusForDisplay(request.status);
              return (
                <motion.div 
                  key={request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="group flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-100/40 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-['Inter:Bold',sans-serif] font-bold text-slate-800 text-lg truncate">{request.attendeeName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-['Inter:Bold',sans-serif] font-bold uppercase tracking-wider ${
                        displayStatus === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                        displayStatus === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        'bg-rose-50 text-rose-600 border border-rose-200'
                      }`}>
                        {displayStatus}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-['Inter:Medium',sans-serif] text-slate-500 mb-3">
                      <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-indigo-400" /> {request.eventTitle}</span>
                      <span className="flex items-center gap-2"><Users className="w-4 h-4 text-emerald-400" /> {request.tickets} ticket(s)</span>
                      <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-blue-400" /> {request.attendeeEmail}</span>
                    </div>
                    {request.specialRequests && (
                      <p className="text-xs font-['Inter:Medium',sans-serif] text-amber-600 bg-amber-50 px-3 py-2 rounded-xl inline-block border border-amber-100/50">
                        <strong className="font-bold">Note:</strong> {request.specialRequests}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {displayStatus === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleApprove(request.id)}
                          className="p-3 text-emerald-600 bg-emerald-50 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-sm tooltip-trigger"
                          title="Approve"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleReject(request.id)}
                          className="p-3 text-rose-600 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm tooltip-trigger"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => setSelectedRequest(request)}
                      className="p-3 text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm tooltip-trigger"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredRequests.length === 0 && (
            <div className="text-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-20 text-indigo-900" />
              <p className="font-['Inter:Medium',sans-serif] text-lg">No ticket requests found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center p-6 z-[60] cursor-pointer" onClick={() => setSelectedRequest(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-[2rem] max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl cursor-default flex flex-col border border-white/50" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 py-6 flex items-center justify-between shrink-0 bg-gradient-to-r from-indigo-50 to-white border-b border-indigo-100/50">
              <h2 className="text-2xl font-['Outfit:Bold',sans-serif] font-bold text-slate-800">Request Details</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar">
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/30">
                    {selectedRequest.attendeeName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-['Inter:Bold',sans-serif] font-bold text-slate-800">{selectedRequest.attendeeName}</h3>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-[11px] font-['Inter:Bold',sans-serif] font-bold uppercase tracking-wider ${
                      mapStatusForDisplay(selectedRequest.status) === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                      mapStatusForDisplay(selectedRequest.status) === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                      'bg-rose-50 text-rose-600 border border-rose-200'
                    }`}>
                      {mapStatusForDisplay(selectedRequest.status)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="text-xs font-['Inter:Bold',sans-serif] font-bold text-indigo-400 uppercase tracking-wider mb-3">Contact Info</h4>
                    <div className="space-y-3 font-['Inter:Medium',sans-serif] text-sm text-slate-600">
                      <p className="flex items-center gap-3"><Mail className="w-4 h-4 text-indigo-400" /> {selectedRequest.attendeeEmail}</p>
                      <p className="flex items-center gap-3"><Phone className="w-4 h-4 text-indigo-400" /> {selectedRequest.attendeePhone || 'No Phone'}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="text-xs font-['Inter:Bold',sans-serif] font-bold text-indigo-400 uppercase tracking-wider mb-3">Event Details</h4>
                    <div className="space-y-3 font-['Inter:Medium',sans-serif] text-sm text-slate-600">
                      <p className="flex items-center gap-3"><Calendar className="w-4 h-4 text-indigo-400" /> {selectedRequest.eventTitle}</p>
                      <p className="flex items-center gap-3"><Users className="w-4 h-4 text-indigo-400" /> {selectedRequest.tickets} ticket(s)</p>
                      <p className="flex items-center gap-3"><span className="w-4 h-4 text-indigo-400 font-bold flex items-center justify-center text-[10px]">#</span> Requested: {new Date(selectedRequest.requestDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {selectedRequest.specialRequests && (
                  <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                    <h4 className="text-xs font-['Inter:Bold',sans-serif] font-bold text-amber-600 uppercase tracking-wider mb-2">Special Requests</h4>
                    <p className="font-['Inter:Medium',sans-serif] text-sm text-amber-700">{selectedRequest.specialRequests}</p>
                  </div>
                )}

                {mapStatusForDisplay(selectedRequest.status) === "rejected" && selectedRequest.rejectionReason && (
                  <div className="p-5 bg-rose-50/50 rounded-2xl border border-rose-100/50">
                    <h4 className="text-xs font-['Inter:Bold',sans-serif] font-bold text-rose-600 uppercase tracking-wider mb-2">Rejection Reason</h4>
                    <p className="font-['Inter:Medium',sans-serif] text-sm text-rose-700">{selectedRequest.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>

            {mapStatusForDisplay(selectedRequest.status) === "pending" && (
              <div className="p-6 border-t border-slate-100 flex gap-4 shrink-0 bg-slate-50/50">
                <button
                  onClick={() => {
                    handleApprove(selectedRequest.id);
                    setSelectedRequest(null);
                  }}
                  className="flex-1 px-6 py-3.5 bg-emerald-500 text-white font-['Inter:Bold',sans-serif] font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-md hover:shadow-emerald-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve Request
                </button>
                <button
                  onClick={() => {
                    handleReject(selectedRequest.id);
                    setSelectedRequest(null);
                  }}
                  className="flex-1 px-6 py-3.5 bg-rose-500 text-white font-['Inter:Bold',sans-serif] font-bold rounded-xl hover:bg-rose-600 transition-all shadow-md hover:shadow-rose-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Reject Request
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
      {/* Rejection Modal */}
      <AnimatePresence>
        {rejectingRequestId !== null && (
          <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center p-6 z-[70]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-['Outfit:Bold',sans-serif] font-bold text-slate-800 flex items-center gap-2">
                  <XCircle className="w-6 h-6 text-rose-500" />
                  Reject Request
                </h3>
                <button
                  onClick={() => setRejectingRequestId(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-slate-500 font-['Inter:Medium',sans-serif] text-sm mb-4">
                Please provide a reason for rejecting this ticket request. This will be sent to the attendee.
              </p>

              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="E.g., Event is fully booked, Invalid criteria..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-500/20 focus:border-rose-400 font-['Inter:Medium',sans-serif] text-slate-700 resize-none h-32 mb-6"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setRejectingRequestId(null)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-['Inter:Bold',sans-serif] font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReject}
                  className="flex-1 px-4 py-3 bg-rose-500 text-white font-['Inter:Bold',sans-serif] font-bold rounded-xl hover:bg-rose-600 transition-colors shadow-md hover:shadow-rose-500/30"
                >
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}