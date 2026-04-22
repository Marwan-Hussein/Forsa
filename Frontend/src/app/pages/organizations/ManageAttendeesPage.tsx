import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  Users,
  Search,
  Filter,
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
} from "lucide-react";

// Mock attendees data
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
  const [selectedAttendee, setSelectedAttendee] = useState<typeof mockAttendees[0] | null>(null);

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
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/organization-dashboard" className="hover:text-accent cursor-pointer">Dashboard</Link>
          <ChevronRight className="size-4" />
          <Link to="/organization-dashboard" className="hover:text-accent cursor-pointer">My Events</Link>
          <ChevronRight className="size-4" />
          <span className="text-foreground">Manage Attendees</span>
        </div>

        {/* Event Header */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-6 text-white mb-8">
          <h1 className="text-3xl font-bold mb-4">{mockEvent.title}</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="size-5" />
              <span>{new Date(mockEvent.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-5" />
              <span>{mockEvent.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="size-5" />
              <span>{mockEvent.totalBookings} / {mockEvent.totalCapacity} attendees</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-border/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Attendees</p>
                <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-lg">
                <Users className="size-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-border/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Checked In</p>
                <p className="text-3xl font-bold text-green-600">{stats.checkedIn}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <UserCheck className="size-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-border/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Not Checked In</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.notCheckedIn}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <UserX className="size-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-border/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">VIP Tickets</p>
                <p className="text-3xl font-bold text-accent">{stats.vipTickets}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-accent to-accent/80 rounded-lg">
                <CheckCircle className="size-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-border/10 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link
                to={`/qr-scanner/${eventId}`}
                className="px-4 py-3 bg-gradient-to-r from-accent to-accent/80 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer"
              >
                <QrCode className="size-5" />
                QR Scanner
              </Link>
              <button
                onClick={handleExportCSV}
                className="px-4 py-3 border border-primary text-foreground rounded-lg hover:bg-primary hover:text-white transition-all flex items-center gap-2 cursor-pointer"
              >
                <Download className="size-5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mt-4 flex-wrap">
            <div className="flex gap-2">
              <span className="text-sm text-muted-foreground self-center">Check-in:</span>
              <button
                onClick={() => setCheckInFilter("all")}
                className={`px-3 py-1 text-sm rounded-lg transition-all cursor-pointer ${
                  checkInFilter === "all"
                    ? "bg-primary text-white hover:brightness-95"
                    : "bg-gray-100 text-muted-foreground hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setCheckInFilter("checked-in")}
                className={`px-3 py-1 text-sm rounded-lg transition-all cursor-pointer ${
                  checkInFilter === "checked-in"
                    ? "bg-green-500 text-white hover:brightness-95"
                    : "bg-gray-100 text-muted-foreground hover:bg-gray-200"
                }`}
              >
                Checked In
              </button>
              <button
                onClick={() => setCheckInFilter("not-checked-in")}
                className={`px-3 py-1 text-sm rounded-lg transition-all cursor-pointer ${
                  checkInFilter === "not-checked-in"
                    ? "bg-yellow-500 text-white hover:brightness-95"
                    : "bg-gray-100 text-muted-foreground hover:bg-gray-200"
                }`}
              >
                Not Checked In
              </button>
            </div>

            <div className="flex gap-2">
              <span className="text-sm text-muted-foreground self-center">Ticket:</span>
              <button
                onClick={() => setTicketFilter("all")}
                className={`px-3 py-1 text-sm rounded-lg transition-all cursor-pointer ${
                  ticketFilter === "all"
                    ? "bg-primary text-white hover:brightness-95"
                    : "bg-gray-100 text-muted-foreground hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTicketFilter("VIP")}
                className={`px-3 py-1 text-sm rounded-lg transition-all cursor-pointer ${
                  ticketFilter === "VIP"
                    ? "bg-accent text-white hover:brightness-95"
                    : "bg-gray-100 text-muted-foreground hover:bg-gray-200"
                }`}
              >
                VIP
              </button>
              <button
                onClick={() => setTicketFilter("General")}
                className={`px-3 py-1 text-sm rounded-lg transition-all cursor-pointer ${
                  ticketFilter === "General"
                    ? "bg-blue-500 text-white hover:brightness-95"
                    : "bg-gray-100 text-muted-foreground hover:bg-gray-200"
                }`}
              >
                General
              </button>
            </div>
          </div>
        </div>

        {/* Attendees Table */}
        <div className="bg-white rounded-xl shadow-sm border border-border/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-border/10">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Attendee</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Contact</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Ticket</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Check-in</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendees.map((attendee, index) => (
                  <tr
                    key={attendee.id}
                    className={`border-b border-border/10 hover:bg-background transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-foreground">{attendee.name}</p>
                        <p className="text-sm text-muted-foreground">Booked: {new Date(attendee.bookingDate).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-muted-foreground">
                        <p className="flex items-center gap-1">
                          <Mail className="size-3" />
                          {attendee.email}
                        </p>
                        <p className="flex items-center gap-1">
                          <Phone className="size-3" />
                          {attendee.phone}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-medium ${
                            attendee.ticketType === "VIP"
                              ? "bg-accent/20 text-accent"
                              : attendee.ticketType === "Early Bird"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {attendee.ticketType}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">{attendee.ticketCount} ticket(s)</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          attendee.paymentStatus === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {attendee.paymentStatus === "paid" ? "Paid" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-medium inline-flex items-center gap-1 ${
                            attendee.checkInStatus === "checked-in"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {attendee.checkInStatus === "checked-in" ? (
                            <>
                              <CheckCircle className="size-3" />
                              Checked In
                            </>
                          ) : (
                            <>
                              <XCircle className="size-3" />
                              Not Checked In
                            </>
                          )}
                        </span>
                        {attendee.checkInTime && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(attendee.checkInTime).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {attendee.checkInStatus === "not-checked-in" && (
                          <button
                            onClick={() => handleCheckIn(attendee)}
                            className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors cursor-pointer"
                          >
                            Check In
                          </button>
                        )}
                        <button
                          onClick={() => handleSendEmail(attendee)}
                          className="p-1 border border-primary text-foreground rounded hover:bg-primary hover:text-white transition-all cursor-pointer"
                        >
                          <Mail className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAttendees.length === 0 && (
            <div className="text-center py-12">
              <Users className="size-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-foreground mb-2">No attendees found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
