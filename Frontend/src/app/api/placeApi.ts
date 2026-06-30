import { apiGet } from "./api";

export interface PlaceSummary {
  id: string;
  name: string;
  location: string;
  capacity: number;
  dailyPrice: number;
  images: string[];
  facilityName: string;
  rating: number;
  reviewCount: number;
  availabilities: {
    id: number;
    date: string;
    startTime: string | null;
    endTime: string | null;
    status: string;
  }[];
}

export interface PlaceDetails extends PlaceSummary {
  description: string;
  hourlyPrice: number;
  status: string;
  isLocked: boolean;
  reason: string | null;
  ownerId: number | null;
  ownerName: string | null;
  ownerEmail: string | null;
  ownerPhone: string | null;
  createdAt: string;
  latitude: number | null;
  longitude: number | null;
  googlePlaceId: string | null;
}

export const placeApi = {
  getAvailablePlaces: async (): Promise<PlaceSummary[]> => {
    return await apiGet("/api/places");
  },
  getPlaceById: async (id: string): Promise<PlaceDetails> => {
    return await apiGet(`/api/places/${id}`);
  }
};
