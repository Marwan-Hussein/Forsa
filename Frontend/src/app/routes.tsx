import { createBrowserRouter, Outlet } from "react-router-dom";
import Layout from "./pages/layout/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import GuestHomePage from "./pages/home/GuestHomePage";
import AttendeeDashboard from "./pages/attendee/AttendeeDashboard";
import LoginPage from "./pages/auth/LoginPage";
import RegistrationPage from "./pages/auth/RegistrationPage";
import OTPPage from "./pages/auth/OTPPage";
import ProfilePage from "./pages/attendee/ProfilePage";
import InterestsPage from "./pages/attendee/InterestsPage";
import EventsPage from "./pages/events/EventsPage";
import EventDetailsPage from "./pages/events/EventDetailsPage";

import OrganizationsPage from "./pages/organizations/OrganizationsPage";
import NotificationsPage from "./pages/attendee/NotificationsPage";
import CalendarPage from "./pages/attendee/CalendarPage";
import FeedbackPage from "./pages/events/FeedbackPage";
import PlaceDetailsPage from "./pages/places/PlaceDetailsPage";
import PlacesPage from "./pages/places/PlacesPage";
import BookingRequestFormPage from "./pages/places/BookingRequestFormPage";
import MyBookingRequestsPage from "./pages/places/MyBookingRequestsPage";
import SubmitOrgToOwnerFeedbackPage from "./pages/places/SubmitOrgToOwnerFeedbackPage";
import ViewFeedbackRatingPage from "./pages/places/ViewFeedbackRatingPage";
import AboutPage from "./pages/home/AboutPage";
import ContactUsPage from "./pages/home/ContactUsPage";
import PaymentResultPage from "./pages/payment/PaymentResultPage";

import AdminLoginPage from "./pages/auth/AdminLoginPage";

// Admin Portal Imports
import AdminLayout from "./pages/layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsersPage from "./pages/admin/ManageUsersPage";
import ManagePlacesPage from "./pages/admin/ManagePlacesPage";
import ManageEventsPage from "./pages/admin/ManageEventsPage";
import ManageReviewsPage from "./pages/admin/ManageReviewsPage";

// Owner Portal Imports
import OwnerLayout from "./pages/layout/OwnerLayout";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerPlacesPage from "./pages/owner/OwnerPlacesPage";
import OwnerAddPlacePage from "./pages/owner/OwnerAddPlacePage";
import OwnerEditPlacePage from "./pages/owner/OwnerEditPlacePage";
import OwnerPlaceMediaPage from "./pages/owner/OwnerPlaceMediaPage";
import OwnerBookingsPage from "./pages/owner/OwnerBookingsPage";
import OwnerProfilePage from "./pages/owner/OwnerProfilePage";
import OwnerPlaceCalendarPage from "./pages/owner/OwnerPlaceCalendarPage";

// Organizer Portal Imports
import OrganizerLayout from "./pages/layout/OrganizerLayout";
import OrganizerDashboard from "./pages/organizer/OrganizerDashboard";
import OrganizerEventsPage from "./pages/organizer/OrganizerEventsPage";
import CreateEventPage from "./pages/organizer/CreateEventPage";
import EditEventPage from "./pages/organizer/EditEventPage";
import BookingRequestsPage from "./pages/organizations/BookingRequestsPage";
import ManageAttendeesPage from "./pages/organizations/ManageAttendeesPage";
import QRCodeScannerPage from "./pages/organizations/QRCodeScannerPage";
import OrganizerProfilePage from "./pages/organizations/OrganizerProfilePage";
import NotFoundPage from "./pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/admin/login",
    Component: AdminLoginPage,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        Component: GuestHomePage,
      },
      {
        path: "dashboard",
        Component: AttendeeDashboard,
      },
      {
        path: "login",
        Component: LoginPage,
      },
      {
        path: "register",
        Component: RegistrationPage,
      },
      {
        path: "verify-otp",
        Component: OTPPage,
      },
      {
        path: "profile",
        Component: ProfilePage,
      },
      {
        path: "interests",
        Component: InterestsPage,
      },
      {
        path: "events",
        Component: EventsPage,
      },
      {
        path: "events/:eventId",
        Component: EventDetailsPage,
      },
      {
        path: "events/:eventId/feedback",
        Component: FeedbackPage,
      },

      {
        path: "organizations",
        Component: OrganizationsPage,
      },
      {
        path: "organizations/:orgId",
        Component: OrganizationsPage,
      },
      {
        path: "notifications",
        Component: NotificationsPage,
      },
      {
        path: "calendar",
        Component: CalendarPage,
      },
      {
        path: "about",
        Component: AboutPage,
      },
      {
        path: "contact",
        Component: ContactUsPage,
      },
      {
        path: "payment-result",
        Component: PaymentResultPage,
      },
    ],
  },
  {
    path: "*",
    Component: NotFoundPage,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["Admin"]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        Component: AdminDashboard,
      },
      {
        path: "users",
        Component: ManageUsersPage,
      },
      {
        path: "places",
        Component: ManagePlacesPage,
      },
      {
        path: "events",
        Component: ManageEventsPage,
      },
      {
        path: "reviews",
        Component: ManageReviewsPage,
      },
    ],
  },
  {
    path: "/owner",
    element: (
      <ProtectedRoute allowedRoles={["Owner", "PlaceOwner"]}>
        <OwnerLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        Component: OwnerDashboard,
      },
      {
        path: "places",
        Component: OwnerPlacesPage,
      },
      {
        path: "places/new",
        Component: OwnerAddPlacePage,
      },
      {
        path: "places/:placeId/edit",
        Component: OwnerEditPlacePage,
      },
      {
        path: "places/:placeId/media",
        Component: OwnerPlaceMediaPage,
      },
      {
        path: "places/:placeId/calendar",
        Component: OwnerPlaceCalendarPage,
      },
      {
        path: "bookings",
        Component: OwnerBookingsPage,
      },
      {
        path: "profile",
        Component: OwnerProfilePage,
      },
    ],
  },
  {
    path: "/organizer",
    element: (
      <ProtectedRoute allowedRoles={["Organizer"]}>
        <OrganizerLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        Component: OrganizerDashboard,
      },
      {
        path: "events",
        Component: OrganizerEventsPage,
      },
      {
        path: "events/new",
        Component: CreateEventPage,
      },
      {
        path: "events/:eventId/edit",
        Component: EditEventPage,
      },
      {
        path: "venue-requests",
        Component: MyBookingRequestsPage,
      },
      {
        path: "ticket-requests",
        Component: BookingRequestsPage,
      },
      {
        path: "events/:eventId/attendees",
        Component: ManageAttendeesPage,
      },
      {
        path: "events/:eventId/scan",
        Component: QRCodeScannerPage,
      },
      {
        path: "places",
        Component: PlacesPage,
      },
      {
        path: "places/:placeId",
        Component: PlaceDetailsPage,
      },
      {
        path: "places/:placeId/book",
        Component: BookingRequestFormPage,
      },
      {
        path: "places/:placeId/feedback",
        Component: SubmitOrgToOwnerFeedbackPage,
      },
      {
        path: "places/:placeId/reviews",
        Component: ViewFeedbackRatingPage,
      },
      {
        path: "profile",
        Component: OrganizerProfilePage,
      },
    ],
  },
]);
