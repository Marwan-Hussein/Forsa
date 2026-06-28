import { createBrowserRouter } from "react-router";
import Layout from "./pages/layout/Layout";
import GuestHomePage from "./pages/home/GuestHomePage";
import AttendeeDashboard from "./pages/attendee/AttendeeDashboard";
import LoginPage from "./pages/auth/LoginPage";
import RegistrationPage from "./pages/auth/RegistrationPage";
import OTPPage from "./pages/auth/OTPPage";
import ProfilePage from "./pages/attendee/ProfilePage";
import InterestsPage from "./pages/attendee/InterestsPage";
import EventsPage from "./pages/events/EventsPage";
import EventDetailsPage from "./pages/events/EventDetailsPage";
import MyEventsPage from "./pages/attendee/MyEventsPage";
import WishlistPage from "./pages/attendee/WishlistPage";
import RecommendationsPage from "./pages/attendee/RecommendationsPage";
import CalendarPage from "./pages/attendee/CalendarPage";
import OrganizationsPage from "./pages/organizations/OrganizationsPage";
import NotificationsPage from "./pages/attendee/NotificationsPage";
import FeedbackPage from "./pages/events/FeedbackPage";
import PlaceDetailsPage from "./pages/places/PlaceDetailsPage";
import PlacesPage from "./pages/places/PlacesPage";
import BookingRequestFormPage from "./pages/places/BookingRequestFormPage";
import MyBookingRequestsPage from "./pages/places/MyBookingRequestsPage";
import SubmitOrgToOwnerFeedbackPage from "./pages/places/SubmitOrgToOwnerFeedbackPage";
import ViewFeedbackRatingPage from "./pages/places/ViewFeedbackRatingPage";

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
import OwnerPlaceMediaPage from "./pages/owner/OwnerPlaceMediaPage";
import OwnerBookingsPage from "./pages/owner/OwnerBookingsPage";

// Organizer Portal Imports
import OrganizerLayout from "./pages/layout/OrganizerLayout";
import OrganizationDashboard from "./pages/organizations/OrganizationDashboard";
import OrganizerEventsPage from "./pages/organizer/OrganizerEventsPage";
import BookingRequestsPage from "./pages/organizations/BookingRequestsPage";
import ManageAttendeesPage from "./pages/organizations/ManageAttendeesPage";
import QRCodeScannerPage from "./pages/organizations/QRCodeScannerPage";

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
        path: "my-events",
        Component: MyEventsPage,
      },
      {
        path: "wishlist",
        Component: WishlistPage,
      },
      {
        path: "recommendations",
        Component: RecommendationsPage,
      },
      {
        path: "calendar",
        Component: CalendarPage,
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
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
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
    Component: OwnerLayout,
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
        path: "places/:placeId/media",
        Component: OwnerPlaceMediaPage,
      },
      {
        path: "bookings",
        Component: OwnerBookingsPage,
      },
    ],
  },
  {
    path: "/organizer",
    Component: OrganizerLayout,
    children: [
      {
        index: true,
        Component: OrganizationDashboard,
      },
      {
        path: "events",
        Component: OrganizerEventsPage,
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
    ],
  },
]);
