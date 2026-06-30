import { apiGet, apiPost, apiPut, apiDelete } from './api';

export interface OrganizerDashboardStats {
  totalEvents: number;
  completedEvents: number;
  pendingEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  totalPlacesBooked: number;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  ticketPrice: number;
  totalTickets: number;
  remainingTickets: number;
  status: number;
}

export interface CreateEventDto {
  organizerId: number;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  ticketPrice: number;
  totalTickets: number;
}

export interface UpdateEventDto {
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  ticketPrice: number;
  totalTickets: number;
}

export interface BookingRequestDto {
  organizerId: number;
  requestedDate: string;
  startTime?: string;
  endTime?: string;
}

export const organizerApi = {
  getDashboardStats: async (organizerId: number): Promise<OrganizerDashboardStats> => {
    return await apiGet(`/api/organizers/dashboard/stats?organizerId=${organizerId}`);
  },

  getEventsDashboard: async (organizerId: number): Promise<any[]> => {
    return await apiGet(`/api/organizers/events/dashboard?organizerId=${organizerId}`);
  },

  createEvent: async (dto: CreateEventDto): Promise<Event> => {
    return await apiPost('/api/organizers/events', dto);
  },

  updateEventDetails: async (eventId: number, dto: UpdateEventDto): Promise<Event> => {
    return await apiPut(`/api/organizers/events/${eventId}`, dto);
  },

  cancelEvent: async (eventId: number): Promise<void> => {
    return await apiDelete(`/api/organizers/events/${eventId}`);
  },

  submitPlaceBookingRequest: async (eventId: number, placeId: number, dto: BookingRequestDto): Promise<any> => {
    return await apiPost(`/api/organizers/events/${eventId}/booking-requests/places/${placeId}`, dto);
  },

  getOrganizerBookingRequests: async (organizerId: number): Promise<any[]> => {
    return await apiGet(`/api/organizers/booking-requests?organizerId=${organizerId}`);
  },

  cancelPendingBookingRequest: async (requestId: number): Promise<void> => {
    return await apiDelete(`/api/organizers/booking-requests/${requestId}`);
  },

  getEventDetails: async (eventId: number): Promise<any> => {
    return await apiGet(`/api/events/${eventId}/details`);
  },

  getEventAttendees: async (eventId: number): Promise<any[]> => {
    return await apiGet(`/api/organizers/events/${eventId}/attendees`);
  },

  getTicketRequests: async (organizerId: number): Promise<any[]> => {
    return await apiGet(`/api/organizers/ticket-requests?organizerId=${organizerId}`);
  },

  approveTicketRequest: async (bookingId: number): Promise<void> => {
    return await apiPost(`/api/bookings/${bookingId}/approve`, {});
  },

  rejectTicketRequest: async (bookingId: number, reason: string): Promise<void> => {
    return await apiPost(`/api/bookings/${bookingId}/reject`, { reason });
  },

  verifyAttendance: async (eventId: number, qrCode: string): Promise<void> => {
    return await apiPost(`/api/bookings/verify-attendance?eventId=${eventId}&qrCode=${encodeURIComponent(qrCode)}`, {});
  },

  manualCheckIn: async (bookingId: number): Promise<void> => {
    return await apiPost(`/api/organizers/bookings/${bookingId}/check-in`, {});
  }
};
