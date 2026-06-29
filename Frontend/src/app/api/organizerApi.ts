import { apiGet, apiPost } from './api';

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

export const organizerApi = {
  getDashboardStats: async (organizerId: number): Promise<OrganizerDashboardStats> => {
    return await apiGet(`/api/organizers/dashboard/stats?organizerId=${organizerId}`);
  },

  getEventsDashboard: async (organizerId: number): Promise<any[]> => {
    return await apiGet(`/api/organizers/events/dashboard?organizerId=${organizerId}`);
  },

  createEvent: async (dto: CreateEventDto): Promise<Event> => {
    return await apiPost('/api/organizers/events', dto);
  }
};
