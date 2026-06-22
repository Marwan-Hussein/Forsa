import { useState } from "react";
import { Link } from "react-router";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Trash2,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const mockBookingRequests = [
  {
    id: "1",
    eventName: "Annual Tech Conference",
    placeName: "Grand Convention Center",
    placeAddress: "123 Main Street, San Francisco, CA",
    eventDate: "2026-06-15",
    startTime: "09:00",
    endTime: "17:00",
    expectedAttendees: 500,
    status: "pending",
    submittedDate: "2026-03-10",
    contactName: "John Doe",
    contactEmail: "john.doe@example.com",
    contactPhone: "+1 (555) 123-4567",
    estimatedCost: 5000,
  },
  {
    id: "2",
    eventName: "Product Launch Event",
    placeName: "Skyline Banquet Hall",
    placeAddress: "456 Market Street, San Francisco, CA",
    eventDate: "2026-05-20",
    startTime: "18:00",
    endTime: "22:00",
    expectedAttendees: 200,
    status: "approved",
    submittedDate: "2026-03-05",
    contactName: "John Doe",
    contactEmail: "john.doe@example.com",
    contactPhone: "+1 (555) 123-4567",
    estimatedCost: 3000,
    approvedDate: "2026-03-08",
  },
  {
    id: "3",
    eventName: "Team Building Workshop",
    placeName: "Riverside Meeting Center",
    placeAddress: "789 Bay Street, San Francisco, CA",
    eventDate: "2026-04-10",
    startTime: "10:00",
    endTime: "16:00",
    expectedAttendees: 50,
    status: "rejected",
    submittedDate: "2026-02-28",
    contactName: "John Doe",
    contactEmail: "john.doe@example.com",
    contactPhone: "+1 (555) 123-4567",
    estimatedCost: 1200,
    rejectedDate: "2026-03-02",
    rejectionReason: "Venue not available for the selected date",
  },
];

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function MyBookingRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<typeof mockBookingRequests[0] | null>(null);

  const filteredRequests = mockBookingRequests.filter(request => {
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesSearch = request.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.placeName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: mockBookingRequests.length,
    pending: mockBookingRequests.filter(r => r.status === "pending").length,
    approved: mockBookingRequests.filter(r => r.status === "approved").length,
    rejected: mockBookingRequests.filter(r => r.status === "rejected").length,
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 tracking-tight">Venue Requests</h1>
        <p className="text-slate-500 font-['Inter:Regular',sans-serif] mt-1">Track and manage your requests to book venues.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)] hover:border-violet-500/30 transition-all group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500 mb-1">Total Requests</p>
              <p className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-slate-800">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-slate-50 text-slate-400 group-hover:bg-violet-50 group-hover:text-violet-500 rounded-xl flex items-center justify-center transition-colors">
              <MapPin className="w-6 h-6" />
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
              placeholder="Search by event or venue name..." 
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
                className="group flex flex-col p-6 rounded-2xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-['Inter:Bold',sans-serif] font-bold text-slate-800 text-lg truncate">{request.eventName}</h3>
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-['Inter:Bold',sans-serif] font-bold uppercase tracking-wider ${
                        request.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        request.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-['Inter:Medium',sans-serif] text-slate-500">
                      <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-violet-400" /> {request.placeName}</span>
                      <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-400" /> {new Date(request.eventDate).toLocaleDateString()}</span>
                      <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400" /> {request.startTime} - {request.endTime}</span>
                      <span className="flex items-center gap-2"><Users className="w-4 h-4 text-amber-400" /> {request.expectedAttendees} expected</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => setSelectedRequest(request)}
                      className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-white hover:border-violet-300 hover:text-violet-700 transition-colors font-['Inter:Medium',sans-serif] text-sm bg-white"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    {request.status === "pending" && (
                      <button 
                        className="p-2 text-rose-500 border border-transparent hover:border-rose-200 hover:bg-rose-50 rounded-xl transition-all"
                        title="Cancel Request"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
                  <div className="text-xs font-['Inter:Medium',sans-serif] text-slate-400">
                    Submitted on {new Date(request.submittedDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm font-['Inter:Bold',sans-serif] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                    Est. Cost: ${request.estimatedCost.toLocaleString()}
                  </div>
                </div>

                {request.status === "rejected" && request.rejectionReason && (
                  <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl">
                    <p className="text-sm font-['Inter:Medium',sans-serif] text-rose-700">
                      <strong className="font-['Inter:Bold',sans-serif]">Rejection Reason:</strong> {request.rejectionReason}
                    </p>
                  </div>
                )}
                {request.status === "approved" && request.approvedDate && (
                  <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <p className="text-sm font-['Inter:Medium',sans-serif] text-emerald-700">
                      <strong className="font-['Inter:Bold',sans-serif]">Approved on:</strong> {new Date(request.approvedDate).toLocaleDateString()} - Check your email for confirmation details.
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredRequests.length === 0 && (
            <div className="text-center py-20 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-['Inter:Medium',sans-serif] text-lg mb-4">No venue booking requests found.</p>
              <Link
                to="/places"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white font-['Inter:Bold',sans-serif] font-bold rounded-xl hover:shadow-lg hover:shadow-violet-500/30 transition-all"
              >
                Browse Venues
              </Link>
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
                    selectedRequest.status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                    selectedRequest.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                    'bg-rose-100 text-rose-700 border border-rose-200'
                  }`}>
                    Status: {selectedRequest.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xs font-['Inter:Bold',sans-serif] font-bold text-slate-400 uppercase tracking-wider mb-3">Event Details</h4>
                    <div className="space-y-3 font-['Inter:Medium',sans-serif] text-sm text-slate-600">
                      <p><strong className="text-slate-800 font-bold">Name:</strong> {selectedRequest.eventName}</p>
                      <p><strong className="text-slate-800 font-bold">Date:</strong> {new Date(selectedRequest.eventDate).toLocaleDateString()}</p>
                      <p><strong className="text-slate-800 font-bold">Time:</strong> {selectedRequest.startTime} - {selectedRequest.endTime}</p>
                      <p><strong className="text-slate-800 font-bold">Attendees:</strong> {selectedRequest.expectedAttendees}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-['Inter:Bold',sans-serif] font-bold text-slate-400 uppercase tracking-wider mb-3">Venue Details</h4>
                    <div className="space-y-3 font-['Inter:Medium',sans-serif] text-sm text-slate-600">
                      <p><strong className="text-slate-800 font-bold">Venue:</strong> {selectedRequest.placeName}</p>
                      <p><strong className="text-slate-800 font-bold">Address:</strong> {selectedRequest.placeAddress}</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="text-xs font-['Inter:Bold',sans-serif] font-bold text-slate-400 uppercase tracking-wider mb-3">Submission Info</h4>
                  <div className="grid grid-cols-2 gap-4 font-['Inter:Medium',sans-serif] text-sm text-slate-600">
                    <div>
                      <p className="text-slate-400 text-xs mb-1">Submitted On</p>
                      <p className="font-bold text-slate-800">{new Date(selectedRequest.submittedDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs mb-1">Estimated Cost</p>
                      <p className="font-bold text-emerald-600">${selectedRequest.estimatedCost.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {selectedRequest.status === "rejected" && selectedRequest.rejectionReason && (
                  <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                    <h4 className="text-xs font-['Inter:Bold',sans-serif] font-bold text-rose-800 uppercase tracking-wider mb-2">Rejection Reason</h4>
                    <p className="font-['Inter:Medium',sans-serif] text-sm text-rose-700">{selectedRequest.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}