import { createBrowserRouter } from "react-router";
import Layout from "./pages/layout/Layout";
import GuestHomePage from "./pages/home/GuestHomePage";
import AttendeeDashboard from "./pages/attendee/AttendeeDashboard";
import LoginPage from "./pages/auth/LoginPage";
import RegistrationPage from "./pages/auth/RegistrationPage";
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
import OrganizationDashboard from "./pages/organizations/OrganizationDashboard";
import PlaceDetailsPage from "./pages/places/PlaceDetailsPage";
import PlacesPage from "./pages/places/PlacesPage";
import BookingRequestFormPage from "./pages/places/BookingRequestFormPage";
import MyBookingRequestsPage from "./pages/places/MyBookingRequestsPage";
import ManageAttendeesPage from "./pages/organizations/ManageAttendeesPage";
import QRCodeScannerPage from "./pages/organizations/QRCodeScannerPage";
import SubmitOrgToOwnerFeedbackPage from "./pages/places/SubmitOrgToOwnerFeedbackPage";
import ViewFeedbackRatingPage from "./pages/places/ViewFeedbackRatingPage";
import BookingRequestsPage from "./pages/organizations/BookingRequestsPage";

export const router = createBrowserRouter([
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
        path: "organization-dashboard",
        Component: OrganizationDashboard,
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
        path: "my-booking-requests",
        Component: MyBookingRequestsPage,
      },
      {
        path: "booking-requests",
        Component: BookingRequestsPage,
      },
      {
        path: "manage-attendees/:eventId",
        Component: ManageAttendeesPage,
      },
      {
        path: "qr-scanner/:eventId",
        Component: QRCodeScannerPage,
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
]);
