import { apiGet, apiPost } from "./api";
import { EventDetailsDto } from "../types";

export const eventsApi = {
  getAllEvents: () => apiGet<EventDetailsDto[]>('/api/events'),
  searchEvents: (params: string) => apiGet<EventDetailsDto[]>(`/api/events/search?${params}`),
  getEventDetails: (id: number) => apiGet<EventDetailsDto>(`/api/events/${id}/details`),
};
