import { apiGet, apiPut, apiPost, apiDelete } from "./api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function authFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("forsa_token");
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type") && options.method && options.method !== "GET" && options.method !== "DELETE") {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    const textData = await response.text();
    try {
      errorData = JSON.parse(textData);
    } catch {
      errorData = textData;
    }
    throw new Error(typeof errorData === "object" && errorData?.message ? errorData.message : `HTTP Error ${response.status}`);
  }

  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

export interface ApplicationUserDTO {
  id: number;
  fullName: string | null;
  userName: string | null;
  email: string | null;
  location: string | null;
  birthDate: string;
  createdAt: string;
  lastModifiedAt: string | null;
  deletedAt: string | null;
  createdBy: string | null;
  modifiedBy: string | null;
  deletedBy: string | null;
  isBlocked: boolean | null;
  role: string | null;
}

export const adminApi = {
  // --- USERS ---
  getAllUsers: (pageNum = 1, size = 50) => 
    authFetch(`/api/admin/users?pageNum=${pageNum}&size=${size}`) as Promise<ApplicationUserDTO[]>,

  getUsersByRole: (role: string, pageNum = 1, size = 50) => 
    authFetch(`/api/admin/users/role/${role}?pageNum=${pageNum}&size=${size}`) as Promise<ApplicationUserDTO[]>,

  getBlockedUsers: (pageNum = 1, size = 50) => 
    authFetch(`/api/admin/users/blocked?pageNum=${pageNum}&size=${size}`) as Promise<ApplicationUserDTO[]>,

  blockUser: (id: number) => 
    authFetch(`/api/admin/users/${id}/block`, { method: "PATCH" }),

  unblockUser: (id: number) => 
    authFetch(`/api/admin/users/${id}/unblock`, { method: "PATCH" }),

  // --- PLACES (VENUES) ---
  getAllPlaces: (search?: string, location?: string) => {
    const params = new URLSearchParams();
    if (search) params.append("Name", search);
    if (location) params.append("Location", location);
    const qs = params.toString();
    return authFetch(`/api/admin/places${qs ? "?" + qs : ""}`) as Promise<PlaceDetailsDTO[]>;
  },

  getPendingPlaces: (search?: string, location?: string) => {
    const params = new URLSearchParams();
    if (search) params.append("Name", search);
    if (location) params.append("Location", location);
    const qs = params.toString();
    return authFetch(`/api/admin/places/pending${qs ? "?" + qs : ""}`) as Promise<PlaceDetailsDTO[]>;
  },

  updatePlaceStatus: (id: number, status: number, reason?: string) =>
    authFetch(`/api/admin/places/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, reason }),
    }),

  deletePlace: (id: number) =>
    authFetch(`/api/admin/places/${id}`, { method: "DELETE" }),

  // --- EVENTS ---
  getAllEvents: (search?: string, category?: string) => {
    const params = new URLSearchParams();
    if (search) params.append("Title", search);
    if (category) params.append("Category", category);
    const qs = params.toString();
    return authFetch(`/api/admin/events${qs ? "?" + qs : ""}`) as Promise<EventDetailsDTO[]>;
  },

  updateEventStatus: (id: number, status: number) =>
    authFetch(`/api/admin/events/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  deleteEvent: (id: number) =>
    authFetch(`/api/admin/events/${id}`, { method: "DELETE" }),
  // --- REVIEWS ---
  getAllReviews: (targetType?: string) => {
    const params = new URLSearchParams();
    if (targetType) params.append("targetType", targetType);
    const qs = params.toString();
    return authFetch(`/api/admin/reviews${qs ? "?" + qs : ""}`) as Promise<AdminReviewDTO[]>;
  },

  deleteReview: (id: number) =>
    authFetch(`/api/admin/reviews/${id}`, { method: "DELETE" }),

  // --- DASHBOARD ---
  getDashboardStats: () => authFetch("/api/admin/dashboard/stats") as Promise<DashboardStatsDTO>,
};

export interface DashboardStatsDTO {
  totalUsers: number;
  totalAttendees: number;
  totalOrganizers: number;
  totalOwners: number;
  totalPlaces: number;
  pendingPlaces: number;
  totalEvents: number;
  pendingEvents: number;
  completedEvents: number;
  totalReviews: number;
  averageRating: number;
  totalEarnings: number;
  totalBookings: number;
}

export interface AdminReviewDTO {
  id: number;
  rating: number;
  comment: string;
  reviewerName: string;
  reviewerType: string;
  targetName: string;
  targetType: string;
  createdAt: string;
  isDeleted: boolean;
}

export interface EventDetailsDTO {
  eventId: number;
  title: string;
  description: string;
  category: string;
  ticketPrice: number;
  totalTickets: number;
  remainingTickets: number;
  status: string;
  startDate: string;
  endDate: string;
  place: string;
  placeId: number | null;
  placeLocation: string | null;
  placeLatitude: number | null;
  placeLongitude: number | null;
  googlePlaceId: string | null;
  availabilityStatus: string;
  imageUrl?: string;
  customLocation?: string;
}

export interface PlaceDetailsDTO {
  placeId: number;
  name: string;
  location: string;
  capacity: number;
  description: string;
  hourlyPrice: number;
  dailyPrice: number;
  status: string; // e.g., "Pending", "Approved", "Rejected"
  facilityName: string;
  isLocked: boolean;
  reason: string | null;
  ownerId: number | null;
  createdAt: string;
  latitude: number | null;
  longitude: number | null;
  googlePlaceId: string | null;
  images?: string[];
}
