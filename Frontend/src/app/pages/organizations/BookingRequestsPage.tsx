import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Filter,
  Search,
  Mail,
  Phone,
  ArrowLeft,
} from "lucide-react";

// Mock booking requests data for an organization's events
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
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-background">
      <main className="px-6 py-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
          <h1 className="text-4xl font-bold text-foreground mb-2">Booking Requests</h1>
          <p className="text-muted-foreground">Manage attendee booking requests for your events</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Requests</p>
                <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-[#182F4D] to-[#346286] rounded-lg">
                <Calendar className="size-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertCircle className="size-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="size-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="size-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)] mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by attendee name or event..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-[rgba(39,55,77,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC9B3B] focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-primary text-white hover:brightness-95"
                    : "bg-gray-100 text-muted-foreground hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  statusFilter === "pending"
                    ? "bg-yellow-500 text-white hover:brightness-95"
                    : "bg-gray-100 text-muted-foreground hover:bg-gray-200"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setStatusFilter("approved")}
                className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  statusFilter === "approved"
                    ? "bg-green-500 text-white hover:brightness-95"
                    : "bg-gray-100 text-muted-foreground hover:bg-gray-200"
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setStatusFilter("rejected")}
                className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  statusFilter === "rejected"
                    ? "bg-red-500 text-white hover:brightness-95"
                    : "bg-gray-100 text-muted-foreground hover:bg-gray-200"
                }`}
              >
                Rejected
              </button>
            </div>
          </div>
        </div>

        {/* Booking Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-[rgba(39,55,77,0.1)] text-center">
              <Calendar className="size-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-foreground mb-2">No booking requests found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters or search query"
                  : "You haven't received any booking requests yet"}
              </p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)] hover:border-accent transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-foreground">{request.attendeeName}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          request.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : request.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4" />
                        <span>Event: {request.eventTitle}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="size-4" />
                        <span>{request.tickets} ticket(s)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="size-4" />
                        <span>{request.attendeeEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="size-4" />
                        <span>{request.attendeePhone}</span>
                      </div>
                    </div>
                    {request.specialRequests && (
                      <div className="p-3 bg-background rounded-lg mb-3">
                        <p className="text-sm text-muted-foreground">
                          <strong className="text-foreground">Special Requests:</strong> {request.specialRequests}
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Requested on {new Date(request.requestDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="px-4 py-2 border border-primary text-foreground rounded-lg hover:bg-primary hover:text-white transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Eye className="size-4" />
                      View
                    </button>
                    {request.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <CheckCircle className="size-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <XCircle className="size-4" />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {request.status === "rejected" && request.rejectionReason && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      <strong>Rejection Reason:</strong> {request.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      {/* Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50 cursor-pointer hover:bg-black/55" onClick={() => setSelectedRequest(null)}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-[rgba(39,55,77,0.1)] p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Booking Request Details</h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <XCircle className="size-6 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    selectedRequest.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : selectedRequest.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                </span>
              </div>

              {/* Attendee Info */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3">Attendee Information</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong className="text-foreground">Name:</strong> {selectedRequest.attendeeName}</p>
                  <p><strong className="text-foreground">Email:</strong> {selectedRequest.attendeeEmail}</p>
                  <p><strong className="text-foreground">Phone:</strong> {selectedRequest.attendeePhone}</p>
                </div>
              </div>

              {/* Event Info */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3">Event Information</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong className="text-foreground">Event:</strong> {selectedRequest.eventTitle}</p>
                  <p><strong className="text-foreground">Tickets Requested:</strong> {selectedRequest.tickets}</p>
                  <p><strong className="text-foreground">Request Date:</strong> {new Date(selectedRequest.requestDate).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedRequest.specialRequests && (
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-3">Special Requests</h3>
                  <p className="text-muted-foreground">{selectedRequest.specialRequests}</p>
                </div>
              )}

              {selectedRequest.status === "rejected" && selectedRequest.rejectionReason && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="text-lg font-bold text-red-700 mb-2">Rejection Reason</h3>
                  <p className="text-red-600">{selectedRequest.rejectionReason}</p>
                </div>
              )}

              {selectedRequest.status === "pending" && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      handleApprove(selectedRequest.id);
                      setSelectedRequest(null);
                    }}
                    className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle className="size-5" />
                    Approve Request
                  </button>
                  <button
                    onClick={() => {
                      handleReject(selectedRequest.id);
                      setSelectedRequest(null);
                    }}
                    className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <XCircle className="size-5" />
                    Reject Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}