import { useState } from "react";
import { Link } from "react-router";
import {
  Calendar,
  Users,
  MapPin,
  TrendingUp,
  DollarSign,
  Star,
  Eye,
  Settings,
  Plus,
  ChevronRight,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

// Mock data for organization events
const mockOrganizationEvents = [
  {
    id: "1",
    title: "Tech Summit 2026",
    date: "2026-04-15",
    status: "upcoming",
    attendees: 234,
    capacity: 500,
    revenue: 23400,
    rating: 4.5,
    reviews: 12,
  },
  {
    id: "2",
    title: "Design Workshop",
    date: "2026-03-20",
    status: "upcoming",
    attendees: 45,
    capacity: 50,
    revenue: 2250,
    rating: 4.8,
    reviews: 8,
  },
  {
    id: "3",
    title: "Startup Pitch Night",
    date: "2026-02-10",
    status: "completed",
    attendees: 120,
    capacity: 150,
    revenue: 6000,
    rating: 4.3,
    reviews: 45,
  },
];

const mockBookingRequests = [
  {
    id: "1",
    eventTitle: "Tech Summit 2026",
    attendeeName: "John Doe",
    requestDate: "2026-03-10",
    status: "pending",
    tickets: 2,
  },
  {
    id: "2",
    eventTitle: "Design Workshop",
    attendeeName: "Sarah Smith",
    requestDate: "2026-03-12",
    status: "pending",
    tickets: 1,
  },
  {
    id: "3",
    eventTitle: "Tech Summit 2026",
    attendeeName: "Mike Johnson",
    requestDate: "2026-03-11",
    status: "approved",
    tickets: 3,
  },
];

export default function OrganizationDashboard() {
  const [selectedTab, setSelectedTab] = useState<"overview" | "events" | "bookings">("overview");

  const stats = {
    totalEvents: 12,
    upcomingEvents: 5,
    totalAttendees: 1254,
    totalRevenue: 125430,
    avgRating: 4.6,
    pendingRequests: 8,
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="px-6 py-8 max-w-7xl mx-auto w-full">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Organization Dashboard</h1>
          <p className="text-muted-foreground">Manage your events and track performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-border/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-[#182F4D] to-[#346286] rounded-lg">
                <Calendar className="size-6 text-white" />
              </div>
              <TrendingUp className="size-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{stats.totalEvents}</h3>
            <p className="text-sm text-muted-foreground">Total Events</p>
            <p className="text-xs text-green-600 mt-2">{stats.upcomingEvents} upcoming</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-border/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-[#346286] to-[#76C2F1] rounded-lg">
                <Users className="size-6 text-white" />
              </div>
              <TrendingUp className="size-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{stats.totalAttendees.toLocaleString()}</h3>
            <p className="text-sm text-muted-foreground">Total Attendees</p>
            <p className="text-xs text-muted-foreground mt-2">Across all events</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-border/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-accent to-accent/80 rounded-lg">
                <DollarSign className="size-6 text-white" />
              </div>
              <TrendingUp className="size-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">${stats.totalRevenue.toLocaleString()}</h3>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-xs text-green-600 mt-2">+12% this month</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-border/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-muted-foreground/80 to-muted-foreground/60 rounded-lg">
                <Star className="size-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{stats.avgRating.toFixed(1)}</h3>
            <p className="text-sm text-muted-foreground">Average Rating</p>
            <div className="flex items-center mt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`size-4 ${i < Math.floor(stats.avgRating) ? "fill-accent text-accent" : "text-gray-300"}`}
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-border/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-accent to-accent/80 rounded-lg">
                <AlertCircle className="size-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{stats.pendingRequests}</h3>
            <p className="text-sm text-muted-foreground">Pending Requests</p>
            <Link to="/booking-requests" className="text-xs text-accent mt-2 inline-flex items-center hover:underline cursor-pointer">
              Review requests <ChevronRight className="size-3 ml-1" />
            </Link>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-border/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-[#182F4D] to-[#346286] rounded-lg">
                <BarChart3 className="size-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">89%</h3>
            <p className="text-sm text-muted-foreground">Booking Rate</p>
            <p className="text-xs text-green-600 mt-2">+5% from last month</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-border/10">
          <button
            onClick={() => setSelectedTab("overview")}
            className={`px-6 py-3 font-semibold transition-colors relative cursor-pointer ${
              selectedTab === "overview"
                ? "text-foreground border-b-2 border-accent hover:opacity-90"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedTab("events")}
            className={`px-6 py-3 font-semibold transition-colors relative cursor-pointer ${
              selectedTab === "events"
                ? "text-foreground border-b-2 border-accent hover:opacity-90"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Events
          </button>
          <button
            onClick={() => setSelectedTab("bookings")}
            className={`px-6 py-3 font-semibold transition-colors relative cursor-pointer ${
              selectedTab === "bookings"
                ? "text-foreground border-b-2 border-accent hover:opacity-90"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Booking Requests
          </button>
        </div>

        {/* Tab Content */}
        {selectedTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-border/10">
              <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/create-event"
                  className="flex items-center gap-4 p-4 rounded-lg border border-border/10 hover:border-accent hover:bg-accent/5 transition-all group cursor-pointer"
                >
                  <div className="p-3 bg-gradient-to-br from-accent to-accent/80 rounded-lg">
                    <Plus className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-accent">Create Event</h3>
                    <p className="text-sm text-muted-foreground">Start a new event</p>
                  </div>
                </Link>

                <Link
                  to="/booking-requests"
                  className="flex items-center gap-4 p-4 rounded-lg border border-border/10 hover:border-accent hover:bg-accent/5 transition-all group cursor-pointer"
                >
                  <div className="p-3 bg-gradient-to-br from-primary/80 to-primary/60 rounded-lg">
                    <CheckCircle className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-accent">Review Requests</h3>
                    <p className="text-sm text-muted-foreground">{stats.pendingRequests} pending</p>
                  </div>
                </Link>

                <Link
                  to="/manage-attendees"
                  className="flex items-center gap-4 p-4 rounded-lg border border-border/10 hover:border-accent hover:bg-accent/5 transition-all group cursor-pointer"
                >
                  <div className="p-3 bg-gradient-to-br from-foreground/80 to-muted-foreground/80 rounded-lg">
                    <Users className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-accent">Manage Attendees</h3>
                    <p className="text-sm text-muted-foreground">View & manage</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-border/10">
              <h2 className="text-xl font-bold text-foreground mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-background rounded-lg">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="size-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground font-medium">New booking approved</p>
                    <p className="text-sm text-muted-foreground">Mike Johnson booked 3 tickets for Tech Summit 2026</p>
                    <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-background rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Star className="size-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground font-medium">New review received</p>
                    <p className="text-sm text-muted-foreground">Sarah gave 5 stars to Design Workshop</p>
                    <p className="text-xs text-muted-foreground mt-1">5 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-background rounded-lg">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <AlertCircle className="size-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground font-medium">Pending booking request</p>
                    <p className="text-sm text-muted-foreground">Sarah Smith requested 1 ticket for Design Workshop</p>
                    <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === "events" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-foreground">My Events</h2>
              <Link
                to="/create-event"
                className="px-6 py-3 bg-gradient-to-r from-accent to-accent/80 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer"
              >
                <Plus className="size-5" />
                Create Event
              </Link>
            </div>

            {mockOrganizationEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-xl p-6 shadow-sm border border-border/10 hover:border-accent hover:bg-accent/5 transition-all group cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-foreground">{event.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          event.status === "upcoming"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Calendar className="size-4" />
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-2">
                        <Users className="size-4" />
                        {event.attendees}/{event.capacity} attendees
                      </span>
                      <span className="flex items-center gap-2">
                        <DollarSign className="size-4" />
                        ${event.revenue.toLocaleString()} revenue
                      </span>
                      <span className="flex items-center gap-2">
                        <Star className="size-4 fill-accent text-accent" />
                        {event.rating} ({event.reviews} reviews)
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/manage-attendees/${event.id}`}
                    className="px-4 py-2 border border-primary text-foreground rounded-lg hover:bg-primary hover:text-white transition-all cursor-pointer"
                  >
                    Manage
                  </Link>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Capacity</span>
                    <span>{Math.round((event.attendees / event.capacity) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-accent to-accent/80 h-2 rounded-full transition-all"
                      style={{ width: `${(event.attendees / event.capacity) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTab === "bookings" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">Booking Requests</h2>
              <Link
                to="/booking-requests"
                className="text-sm text-accent hover:underline flex items-center gap-1 cursor-pointer"
              >
                View All
                <ChevronRight className="size-4" />
              </Link>
            </div>

            {mockBookingRequests.map((request) => (
              <Link
                key={request.id}
                to="/booking-requests"
                className="block bg-white rounded-xl p-6 shadow-sm border border-border/10 hover:border-accent hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                      {request.eventTitle}
                    </h3>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Users className="size-4" />
                        {request.attendeeName}
                      </span>
                      <span className="flex items-center gap-2">
                        <Calendar className="size-4" />
                        Requested: {new Date(request.requestDate).toLocaleDateString()}
                      </span>
                      <span>{request.tickets} ticket(s)</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          request.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : request.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {request.status}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="size-6 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
              </Link>
            ))}

            {mockBookingRequests.length === 0 && (
              <div className="bg-white rounded-xl p-12 shadow-sm border border-border/10 text-center">
                <AlertCircle className="size-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-foreground mb-2">No booking requests</h3>
                <p className="text-muted-foreground">You don't have any booking requests yet</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}