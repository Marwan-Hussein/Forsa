import { apiGet, apiPost, apiPut, apiDelete } from "./api";
import {
  AttendeeProfileDto,
  UpdateAttendeeProfileDto,
  InterestDto,
  UpdateAttendeeInterestsDto,
  AttendeeBookingDto,
  AttendeeCalendarDto,
  WishlistEventDto,
  FeedbackDto,
  FeedbackResponseDto,
} from "../types";

export const attendeeApi = {
  // Profiles & Interests
  getProfile: (id: number) => apiGet<AttendeeProfileDto>(`/api/attendees/${id}/profile`),
  updateProfile: (id: number, data: UpdateAttendeeProfileDto) => apiPut<AttendeeProfileDto>(`/api/attendees/${id}/profile`, data),
  getInterests: (id: number) => apiGet<InterestDto[]>(`/api/attendees/${id}/interests`),
  getAllInterests: () => apiGet<InterestDto[]>(`/api/interests`),
  updateInterests: (id: number, data: UpdateAttendeeInterestsDto) => apiPut<AttendeeProfileDto>(`/api/attendees/${id}/interests`, data),
  uploadProfilePicture: async (id: number, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
    const token = localStorage.getItem("forsa_token");
    const response = await fetch(`${baseUrl}/api/attendees/${id}/profile-picture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    if (!response.ok) throw new Error("Failed to upload image");
    const data = await response.json();
    return data.url;
  },
  deleteProfilePicture: async (id: number): Promise<void> => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
    const token = localStorage.getItem("forsa_token");
    const response = await fetch(`${baseUrl}/api/attendees/${id}/profile-picture`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Failed to remove profile picture");
  },

  // Bookings & Calendar
  getBookings: (id: number) => apiGet<AttendeeBookingDto[]>(`/api/attendees/${id}/bookings`),
  getAttendedEvents: (id: number) => apiGet<AttendeeBookingDto[]>(`/api/attendees/${id}/bookings/attended`),
  cancelBooking: (bookingId: number) => apiDelete(`/api/bookings/${bookingId}`),
  getTicketQr: async (bookingId: number) => {
    const response = await fetch(`/api/bookings/${bookingId}/ticket`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('forsa_token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to load ticket QR');
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },
  getCalendar: (id: number, from?: string, to?: string) => {
    let url = `/api/attendees/${id}/calendar`;
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    if (params.toString()) url += `?${params.toString()}`;
    return apiGet<AttendeeCalendarDto[]>(url);
  },

  // Feedback
  submitFeedback: (attendeeId: number, eventId: number, data: FeedbackDto) => 
    apiPost<FeedbackResponseDto>(`/api/attendees/${attendeeId}/events/${eventId}/feedback`, data),

  // Wishlist
  getWishlist: (id: number) => apiGet<WishlistEventDto[]>(`/api/attendees/${id}/wishlist`),
  addToWishlist: (attendeeId: number, eventId: number) => apiPost<{ message: string }>(`/api/attendees/${attendeeId}/wishlist/${eventId}`, {}),
  removeFromWishlist: (attendeeId: number, eventId: number) => apiDelete<{ message: string }>(`/api/attendees/${attendeeId}/wishlist/${eventId}`),
};
