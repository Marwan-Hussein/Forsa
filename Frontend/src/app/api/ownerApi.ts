import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from './api';

export interface OwnerDashboardStats {
  totalPlaces: number;
  activePlaces: number;
  pendingPlaces: number;
  totalBookingRequests: number;
  pendingRequests: number;
  confirmedRequests: number;
  totalEarnings: number;
  availableBalance: number;
  averageRating: number;
}

export interface Place {
  id: number;
  name: string;
  location: string;
  description: string;
  dailyPrice: number;
  hourlyPrice: number;
  status: number | string;
  facilityName: string;
  reason?: string;
  availableDays?: string;
}

export interface AddPlaceDto {
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
  description: string;
  capacity: number;
  dailyPrice: number;
  hourlyPrice: number;
  availableDays?: string;
}

export type UpdatePlaceDto = AddPlaceDto;

export interface BookingRequest {
  id: number;
  eventId: number;
  placeId: number;
  organizerId: number;
  startTime?: string;
  endTime?: string;
  status: number;
  requestedDate: string;
  createdAt: string;
  organizerName: string;
  placeName: string;
}

export interface PlaceMediaDto {
  id: number;
  placeId: number;
  mediaUrl: string;
  isPrimary: boolean;
}

export const ownerApi = {
  getDashboardStats: async (): Promise<OwnerDashboardStats> => {
    return await apiGet('/api/owner/dashboard/stats');
  },

  getPlaces: async (): Promise<Place[]> => {
    const data = await apiGet<any[]>('/api/owner/places');
    return data.map((p: any) => ({ ...p, id: p.placeId || p.id }));
  },

  addPlace: async (dto: AddPlaceDto): Promise<Place> => {
    const p = await apiPost<any>('/api/owner/places', dto);
    return { ...p, id: p.placeId || p.id };
  },

  getPlaceById: async (id: number): Promise<Place & AddPlaceDto> => {
    const p = await apiGet<any>(`/api/owner/places/${id}`);
    return { ...p, id: p.placeId || p.id };
  },

  updatePlace: async (id: number, dto: UpdatePlaceDto): Promise<Place> => {
    const p = await apiPut<any>(`/api/owner/places/${id}`, dto);
    return { ...p, id: p.placeId || p.id };
  },

  getPlaceCalendar: async (placeId: number, fromDate?: string, toDate?: string): Promise<any[]> => {
    let url = `/api/owner/places/${placeId}/calendar`;
    const params = [];
    if (fromDate) params.push(`fromDate=${fromDate}`);
    if (toDate) params.push(`toDate=${toDate}`);
    if (params.length > 0) url += `?${params.join("&")}`;
    return await apiGet(url);
  },

  setPlaceAvailability: async (placeId: number, dto: { date: string; startTime?: string; endTime?: string; status: number }): Promise<any> => {
    return await apiPost(`/api/owner/places/${placeId}/calendar`, dto);
  },

  removePlaceAvailability: async (placeId: number, slotId: number): Promise<boolean> => {
    await apiDelete(`/api/owner/places/${placeId}/calendar/${slotId}`);
    return true;
  },

  getBookingRequests: async (): Promise<BookingRequest[]> => {
    const data = await apiGet<any[]>('/api/owner/booking-requests');
    return data.map((b: any) => ({ ...b, id: b.requestId ?? b.id }));
  },

  processBookingRequest: async (requestId: number, accept: boolean, rejectionReason?: string): Promise<BookingRequest> => {
    const b = await apiPatch<any>(`/api/owner/booking-requests/${requestId}`, { acceptRequest: accept, rejectionReason });
    return { ...b, id: b.requestId ?? b.id };
  },

  getPlaceMedia: async (placeId: number): Promise<PlaceMediaDto[]> => {
    const data = await apiGet<any[]>(`/api/owner/places/${placeId}/media`);
    return data.map(item => ({
      ...item,
      id: item.mediaId || item.id,
      mediaUrl: item.mediaURL || item.mediaUrl
    }));
  },

  uploadPlaceMedia: async (placeId: number, formData: FormData): Promise<PlaceMediaDto[]> => {
    // We don't use apiPost because we need to send FormData and not JSON. 
    // We'll write a custom fetch here or adjust apiPost to handle FormData.
    const token = localStorage.getItem("forsa_token");
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
    const response = await fetch(`${baseUrl}/api/owner/places/${placeId}/media`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error("Failed to upload media");
    }
    const data = await response.json();
    return data.map((item: any) => ({
      ...item,
      id: item.mediaId || item.id,
      mediaUrl: item.mediaURL || item.mediaUrl
    }));
  },

  deletePlaceMedia: async (placeId: number, mediaId: number): Promise<void> => {
    const token = localStorage.getItem("forsa_token");
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
    const response = await fetch(`${baseUrl}/api/owner/places/${placeId}/media/${mediaId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error("Failed to delete media");
    }
  },

  deletePlace: async (placeId: number): Promise<void> => {
    await apiDelete(`/api/owner/places/${placeId}`);
  },

  getProfile: async (id: number): Promise<any> => {
    return await apiGet(`/api/owner/${id}/profile`);
  },

  updateProfile: async (id: number, data: any): Promise<any> => {
    return await apiPut(`/api/owner/${id}/profile`, data);
  },

  uploadProfilePicture: async (id: number, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
    const token = localStorage.getItem("forsa_token");
    const response = await fetch(`${baseUrl}/api/owner/${id}/profile-picture`, {
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

  submitOrganizerFeedback: async (bookingRequestId: number, data: { rating: number; comment: string }): Promise<any> => {
    return await apiPost(`/api/owner/booking-requests/${bookingRequestId}/feedback`, data);
  }
};
