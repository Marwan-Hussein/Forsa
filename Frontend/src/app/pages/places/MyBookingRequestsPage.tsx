import { useState } from "react";
import { Link, useNavigate } from "react-router";
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
  Filter,
  Search,
  ArrowLeft,
} from "lucide-react";

// Mock booking requests data
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
  {
    id: "4",
    eventName: "Networking Mixer",
    placeName: "Downtown Loft",
    placeAddress: "321 Pine Street, San Francisco, CA",
    eventDate: "2026-07-08",
    startTime: "17:00",
    endTime: "21:00",
    expectedAttendees: 100,
    status: "pending",
    submittedDate: "2026-03-12",
    contactName: "John Doe",
    contactEmail: "john.doe@example.com",
    contactPhone: "+1 (555) 123-4567",
    estimatedCost: 1800,
  },
];

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function MyBookingRequestsPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<typeof mockBookingRequests[0] | null>(null);

  const filteredRequests = mockBookingRequests.filter(request => {
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesSearch = request.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.placeName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="size-5" />;
      case "approved":
        return <CheckCircle className="size-5" />;
      case "rejected":
        return <XCircle className="size-5" />;
      default:
        return null;
    }
  };

  const stats = {
    total: mockBookingRequests.length,
    pending: mockBookingRequests.filter(r => r.status === "pending").length,
    approved: mockBookingRequests.filter(r => r.status === "approved").length,
    rejected: mockBookingRequests.filter(r => r.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
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
          <h1 className="text-4xl font-bold text-foreground mb-2">My Booking Requests</h1>
          <p className="text-muted-foreground">Track and manage your venue booking requests</p>
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
                placeholder="Search by event or venue name..."
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
              <p className="text-muted-foreground mb-6">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters or search query"
                  : "You haven't submitted any booking requests yet"}
              </p>
              <Link
                to="/places"
                className="inline-block px-6 py-3 bg-gradient-to-r from-[#EC9B3B] to-[#f4b860] text-white rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
              >
                Browse Venues
              </Link>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)] hover:border-accent transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-foreground">{request.eventName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)} flex items-center gap-1`}>
                        {getStatusIcon(request.status)}
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4" />
                        <span>{request.placeName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4" />
                        <span>{new Date(request.eventDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="size-4" />
                        <span>{request.startTime} - {request.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="size-4" />
                        <span>{request.expectedAttendees} attendees</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="px-4 py-2 border border-primary text-foreground rounded-lg hover:bg-primary hover:text-white transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Eye className="size-4" />
                      View Details
                    </button>
                    {request.status === "pending" && (
                      <button className="p-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all cursor-pointer">
                        <Trash2 className="size-5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[rgba(39,55,77,0.1)]">
                  <div className="text-sm text-muted-foreground">
                    Submitted on {new Date(request.submittedDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    Estimated Cost: ${request.estimatedCost.toLocaleString()}
                  </div>
                </div>

                {request.status === "rejected" && request.rejectionReason && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      <strong>Rejection Reason:</strong> {request.rejectionReason}
                    </p>
                  </div>
                )}

                {request.status === "approved" && request.approvedDate && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      <strong>Approved on:</strong> {new Date(request.approvedDate).toLocaleDateString()} - Check your email for confirmation details
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
                <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(selectedRequest.status)} inline-flex items-center gap-2`}>
                  {getStatusIcon(selectedRequest.status)}
                  {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                </span>
              </div>

              {/* Event Info */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3">Event Information</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong className="text-foreground">Event Name:</strong> {selectedRequest.eventName}</p>
                  <p><strong className="text-foreground">Date:</strong> {new Date(selectedRequest.eventDate).toLocaleDateString()}</p>
                  <p><strong className="text-foreground">Time:</strong> {selectedRequest.startTime} - {selectedRequest.endTime}</p>
                  <p><strong className="text-foreground">Expected Attendees:</strong> {selectedRequest.expectedAttendees}</p>
                </div>
              </div>

              {/* Venue Info */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3">Venue Information</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong className="text-foreground">Venue:</strong> {selectedRequest.placeName}</p>
                  <p><strong className="text-foreground">Address:</strong> {selectedRequest.placeAddress}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3">Contact Information</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong className="text-foreground">Name:</strong> {selectedRequest.contactName}</p>
                  <p><strong className="text-foreground">Email:</strong> {selectedRequest.contactEmail}</p>
                  <p><strong className="text-foreground">Phone:</strong> {selectedRequest.contactPhone}</p>
                </div>
              </div>

              {/* Submission Info */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3">Request Details</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong className="text-foreground">Submitted on:</strong> {new Date(selectedRequest.submittedDate).toLocaleDateString()}</p>
                  <p><strong className="text-foreground">Estimated Cost:</strong> ${selectedRequest.estimatedCost.toLocaleString()}</p>
                </div>
              </div>

              {selectedRequest.status === "rejected" && selectedRequest.rejectionReason && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="text-lg font-bold text-red-700 mb-2">Rejection Reason</h3>
                  <p className="text-red-600">{selectedRequest.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}