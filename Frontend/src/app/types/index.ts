/** Core domain types — keep in sync with future API contracts. */

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  price: number | "Free";
  category: string;
  image: string;
  organizerId: string;
  organizerName: string;
  description: string;
  isFeatured: boolean;
  capacity: number;
  tags: string[];
}

export interface Organization {
  id: string;
  name: string;
  description: string;
  logo: string;
  eventsCount: number;
  followersCount: number;
  categories: string[];
}

export interface Booking {
  id: string;
  eventId: string;
  userId: string;
  bookedAt: string;
  ticketCount: number;
  totalPrice: number;
  status: "confirmed" | "cancelled";
}

export interface Review {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Place {
  id: string;
  name: string;
  description: string;
  location: string;
  capacity: number;
  pricePerHour: number;
  imageUrl: string;
  amenities: string[];
  rating: number;
  reviewCount: number;
  ownerId: string;
}

export interface BookingRequest {
  id: string;
  placeId: string;
  placeName: string;
  organizationId: string;
  organizationName: string;
  eventName: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  attendees: number;
  status: "pending" | "approved" | "rejected";
  message?: string;
  createdAt: string;
}
