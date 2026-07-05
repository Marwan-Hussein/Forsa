/** Core domain types — keep in sync with future API contracts. */

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  startDate?: string;
  endDate?: string;
  status?: string;
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
  placeLatitude?: number | null;
  placeLongitude?: number | null;
  googlePlaceId?: string | null;
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

// Event DTOs
export interface EventDetailsDto {
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
  placeId?: number;
  placeLocation?: string;
  placeLatitude?: number;
  placeLongitude?: number;
  googlePlaceId?: string;
  availabilityStatus: string;
  imageUrl?: string;
}

// Attendee specific types

export interface UserProfileDto {
  id: number;
  fullName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  location: string;
  birthDate: string;
  profilePicture: string;
  role: string;
}

export interface AttendeeProfileDto extends UserProfileDto {
  loyaltyPoint: number;
  interests: InterestDto[];
}

export interface UpdateUserProfileDto {
  fullName?: string;
  phoneNumber?: string;
  location?: string;
  birthDate?: string;
  profilePicture?: string;
}

export interface UpdateAttendeeProfileDto extends UpdateUserProfileDto {}

export interface InterestDto {
  id: number;
  name: string;
}

export interface UpdateAttendeeInterestsDto {
  interestIds: number[];
}

export interface AttendeeBookingDto {
  bookingId: number;
  eventId: number;
  eventTitle: string;
  eventCategory: string;
  eventStartDate: string;
  eventEndDate: string;
  eventPlace: string | null;
  numberOfTickets: number;
  status: string;
  bookingDate: string;
}

export interface AttendeeCalendarEventDto {
  eventId: number;
  title: string;
  startDate: string;
  endDate: string;
  bookingStatus: string;
}

export interface AttendeeCalendarDto {
  date: string;
  events: AttendeeCalendarEventDto[];
}

export interface WishlistEventDto {
  eventId: number;
  title: string;
  category: string;
  ticketPrice: number;
  startDate: string;
  endDate: string;
  status: string;
}

export interface FeedbackDto {
  rating: number;
  comment: string;
}

export interface FeedbackResponseDto {
  feedbackId: number;
  rating: number;
  comment: string;
  eventId: number;
  attendeeId: number;
  organizerId: number | null;
  organizerName: string;
  createdAt: string;
}
