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

  uploadEventMedia: async (eventId: number, organizerId: number, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('organizerId', organizerId.toString());
    formData.append('files', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`/api/organizers/events/${eventId}/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || 'Failed to upload event media');
    }

    return await response.json();
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

  verifyAttendance: async (eventId: number, qrCode: string): Promise<any> => {
    return await apiPost(`/api/bookings/verify-attendance`, { eventId, qrCode });
  },

  manualCheckIn: async (bookingId: number): Promise<void> => {
    return await apiPost(`/api/organizers/bookings/${bookingId}/check-in`, {});
  },

  getProfile: async (id: number): Promise<any> => {
    return await apiGet(`/api/organizers/${id}/profile`);
  },

  updateProfile: async (id: number, data: any): Promise<any> => {
    return await apiPut(`/api/organizers/${id}/profile`, data);
  },

  uploadProfilePicture: async (id: number, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
    const token = localStorage.getItem("forsa_token");
    const response = await fetch(`${baseUrl}/api/organizers/${id}/profile-picture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    if (!response.ok) throw new Error("Failed to upload image");
    const data = await response.json();
    return data.url;
  }
};
