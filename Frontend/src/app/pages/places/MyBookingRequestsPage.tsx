import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Trash2,
  Search,
  Building,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { organizerApi } from "../../api/organizerApi";
import { getUserIdFromToken } from "../../api/api";
import { toast } from "react-toastify";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function MyBookingRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [requestToCancel, setRequestToCancel] = useState<number | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchRequests = async () => {
    try {
      const organizerId = getUserIdFromToken();
      if (!organizerId) {
        toast.error("Not authenticated");
        navigate("/login");
        return;
      }
      const data = await organizerApi.getOrganizerBookingRequests(organizerId);
      setRequests(data || []);
    } catch (err: any) {
      toast.error("Failed to load booking requests: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [navigate]);

  const confirmCancelRequest = async () => {
    if (!requestToCancel) return;
    try {
      setIsCancelling(true);
      await organizerApi.cancelPendingBookingRequest(requestToCancel);
      toast.success("Booking request cancelled successfully", {
        position: "top-right",
        autoClose: 3500,
        theme: "colored"
      });
      setRequestToCancel(null);
      fetchRequests();
    } catch (err: any) {
      toast.error("Failed to cancel request: " + err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusString = (statusNumber: any) => {
    if (typeof statusNumber === "string") {
      const lower = statusNumber.toLowerCase();
      if (lower === "accepted" || lower === "approved") return "approved";
      return lower;
    }
    switch (statusNumber) {
      case 0: return "pending";
      case 1: return "approved";
      case 2: return "rejected";
      case 3: return "cancelled";
      default: return "pending";
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.startsWith("0001") || new Date(dateStr).getFullYear() < 1970) {
      return "Recently";
    }
    return new Date(dateStr).toLocaleDateString();
  };

  const filteredRequests = requests.filter(request => {
    const statusStr = getStatusString(request.status);
    const matchesStatus = statusFilter === "all" || statusStr === statusFilter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (request.placeName && request.placeName.toLowerCase().includes(searchLower)) ||
      (request.eventName && request.eventName.toLowerCase().includes(searchLower)) ||
      (request.eventId && request.eventId.toString().includes(searchLower));
    
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => getStatusString(r.status) === "pending").length,
    approved: requests.filter(r => getStatusString(r.status) === "approved").length,
    rejected: requests.filter(r => getStatusString(r.status) === "rejected").length,
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
              Venue Requests
            </h1>
            <p className="text-slate-500 font-['Inter:Medium',sans-serif] mt-2 text-base">
              Track and manage your requests to book venues.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/60 hover:border-indigo-500/30 hover:-translate-y-1 transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500 mb-1">Total Requests</p>
              <p className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-slate-800">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 rounded-xl flex items-center justify-center transition-colors">
              <MapPin className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/60 hover:border-amber-500/30 transition-all group">
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

        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/60 hover:border-emerald-500/30 transition-all group">
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

        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-slate-200/60 hover:border-rose-500/30 transition-all group">
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

      <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/60 p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by venue or event ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 w-full font-['Inter:Medium',sans-serif] text-slate-700 transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-2 bg-slate-100/55 p-1 rounded-xl border border-slate-200/50">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as StatusFilter)}
                className={`px-4 py-2 rounded-lg font-['Inter:SemiBold',sans-serif] text-sm transition-all capitalize ${
                  statusFilter === status
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
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
            {filteredRequests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-['Inter:Bold',sans-serif] font-bold text-slate-800 mb-1">No requests found</h3>
                <p className="text-slate-500 font-['Inter:Regular',sans-serif]">We couldn't find any booking requests matching your filters.</p>
              </motion.div>
            ) : (
              filteredRequests.map((request, index) => {
                const status = getStatusString(request.status);
                const paidRequests = JSON.parse(localStorage.getItem("paid_booking_requests") || "[]");
                const isPaid = paidRequests.includes(String(request.requestId));
                return (
                  <motion.div 
                    key={request.requestId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="group flex flex-col p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/5 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-['Inter:Bold',sans-serif] font-bold text-slate-800 text-lg truncate flex items-center gap-2">
                            <Building className="w-5 h-5 text-indigo-500" />
                            {request.placeName || `Place ID: ${request.placeId}`}
                          </h3>
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-['Inter:Bold',sans-serif] font-bold uppercase tracking-wider ${
                            status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-250/30' :
                            isPaid ? 'bg-emerald-600 text-white shadow-sm' :
                            status === 'approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-250/30' :
                            'bg-rose-100 text-rose-700 border border-rose-250/30'
                          }`}>
                            {isPaid ? 'Paid' : status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-['Inter:Medium',sans-serif] text-slate-500">
                          <span className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-indigo-400" />
                            Event ID: {request.eventId}
                          </span>
                          <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-emerald-400" /> 
                            {formatDate(request.requestedDate)}
                          </span>
                          {(request.startTime || request.endTime) && (
                            <span className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-400" /> 
                              {request.startTime ? request.startTime.slice(0, 5) : "--:--"} - {request.endTime ? request.endTime.slice(0, 5) : "--:--"}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          onClick={() => setSelectedRequest(request)}
                          className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:text-indigo-700 transition-colors font-['Inter:Medium',sans-serif] text-sm bg-white"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        {status === "pending" && (
                          <button 
                            onClick={() => setRequestToCancel(request.requestId)}
                            className="p-2 text-rose-500 border border-transparent hover:border-rose-250/30 hover:bg-rose-50 rounded-xl transition-all"
                            title="Cancel Request"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                        {(status === "approved" || isPaid) && (
                          <button 
                            onClick={async () => {
                              if (window.confirm("Are you sure you want to release this venue booking request? This will make the date available to others again.")) {
                                try {
                                  await organizerApi.releasePlaceBookingSlot(request.requestId);
                                  toast.success("Venue slot released successfully!");
                                  fetchRequests();
                                } catch (err: any) {
                                  toast.error("Failed to release venue: " + err.message);
                                }
                              }
                            }}
                            className="flex items-center gap-2 px-3 py-2 border border-rose-200 text-rose-600 rounded-xl hover:bg-rose-50 transition-colors font-['Inter:Medium',sans-serif] text-sm bg-white"
                          >
                            Release Venue
                          </button>
                        )}
                        {status === "approved" && !isPaid && (
                          <button 
                            onClick={async () => {
                              try {
                                const res = await organizerApi.processPlaceCheckout(request.requestId);
                                if (res && res.clientSecret) {
                                  localStorage.setItem("pending_payment_request_id", String(request.requestId));
                                  if (res.clientSecret.startsWith("mock_")) {
                                    const paidList = JSON.parse(localStorage.getItem("paid_booking_requests") || "[]");
                                    if (!paidList.includes(String(request.requestId))) {
                                      paidList.push(String(request.requestId));
                                      localStorage.setItem("paid_booking_requests", JSON.stringify(paidList));
                                    }
                                    localStorage.removeItem("pending_payment_request_id");
                                    toast.success("Mock Payment Success: Simulated payment for testing.");
                                    fetchRequests();
                                  } else if (res.clientSecret.startsWith("http")) {
                                    window.location.href = res.clientSecret;
                                  } else {
                                    const pubKey = res.publicKey || "pk_test_placeholder";
                                    window.location.href = `https://accept.paymob.com/unifiedcheckout/?publicKey=${pubKey}&clientSecret=${res.clientSecret}`;
                                  }
                                } else {
                                  toast.error("Could not initiate payment.");
                                }
                              } catch (err: any) {
                                toast.error("Payment initiation failed: " + err.message);
                              }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-['Inter:Medium',sans-serif] text-sm"
                          >
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
                      <div className="text-xs font-['Inter:Medium',sans-serif] text-slate-400">
                        Submitted {formatDate(request.createdAt) === "Recently" ? "recently" : `on ${formatDate(request.createdAt)}`}
                      </div>
                    </div>

                    {status === "rejected" && request.rejectionReason && (
                      <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl">
                        <p className="text-sm font-['Inter:Medium',sans-serif] text-rose-700">
                          <strong className="font-['Inter:Bold',sans-serif]">Rejection Reason:</strong> {request.rejectionReason}
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center p-6 z-[60] cursor-pointer" onClick={() => setSelectedRequest(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl cursor-default flex flex-col" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <h2 className="text-2xl font-['Inter:Bold',sans-serif] font-bold text-slate-800">Booking Request Details</h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar">
                <div className="space-y-8">
                  <div>
                    <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-['Inter:Bold',sans-serif] font-bold uppercase tracking-wider ${
                      getStatusString(selectedRequest.status) === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      getStatusString(selectedRequest.status) === 'approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                      'bg-rose-100 text-rose-700 border border-rose-200'
                    }`}>
                      Status: {getStatusString(selectedRequest.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-xs font-['Inter:Bold',sans-serif] font-bold text-slate-400 uppercase tracking-wider mb-3">Event Details</h4>
                      <div className="space-y-3 font-['Inter:Medium',sans-serif] text-sm text-slate-600">
                        <p><strong className="text-slate-800 font-bold">Event ID:</strong> {selectedRequest.eventId}</p>
                        <p><strong className="text-slate-800 font-bold">Date:</strong> {formatDate(selectedRequest.requestedDate)}</p>
                        {(selectedRequest.startTime || selectedRequest.endTime) && (
                          <p><strong className="text-slate-800 font-bold">Time:</strong> {selectedRequest.startTime?.slice(0,5)} - {selectedRequest.endTime?.slice(0,5)}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-['Inter:Bold',sans-serif] font-bold text-slate-400 uppercase tracking-wider mb-3">Venue Details</h4>
                      <div className="space-y-3 font-['Inter:Medium',sans-serif] text-sm text-slate-600">
                        <p><strong className="text-slate-800 font-bold">Venue:</strong> {selectedRequest.placeName}</p>
                        <p><strong className="text-slate-800 font-bold">Place ID:</strong> {selectedRequest.placeId}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <h4 className="text-xs font-['Inter:Bold',sans-serif] font-bold text-slate-400 uppercase tracking-wider mb-3">Submission Info</h4>
                    <div className="grid grid-cols-2 gap-4 font-['Inter:Medium',sans-serif] text-sm text-slate-600">
                      <div>
                        <p className="text-slate-400 text-xs mb-1">Submitted On</p>
                        <p className="font-bold text-slate-800">{formatDate(selectedRequest.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {requestToCancel !== null && (
          <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center p-6 z-[70] cursor-pointer" onClick={() => setRequestToCancel(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl cursor-default border border-slate-100" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
                  <AlertCircle className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 mb-2">Cancel Booking Request</h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  Are you sure you want to cancel this booking request? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setRequestToCancel(null)}
                    className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-['Inter:SemiBold',sans-serif] text-sm transition-colors"
                    disabled={isCancelling}
                  >
                    No, Keep
                  </button>
                  <button
                    onClick={confirmCancelRequest}
                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-['Inter:SemiBold',sans-serif] text-sm rounded-xl transition-all shadow-md shadow-rose-500/20 active:scale-95 flex items-center justify-center gap-2"
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Yes, Cancel"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
