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

  // Bookings & Calendar
  getBookings: (id: number) => apiGet<AttendeeBookingDto[]>(`/api/attendees/${id}/bookings`),
  getAttendedEvents: (id: number) => apiGet<AttendeeBookingDto[]>(`/api/attendees/${id}/bookings/attended`),
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
