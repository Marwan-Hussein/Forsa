import { Event, EventDetailsDto, AttendeeBookingDto, WishlistEventDto } from "../types";

export function mapEventDetailsDtoToEvent(dto: EventDetailsDto): Event {
  return {
    id: dto.eventId.toString(),
    title: dto.title || "Untitled Event",
    date: dto.startDate || new Date().toISOString(),
    time: dto.startDate 
      ? new Date(dto.startDate).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      : "TBD",
    startDate: dto.startDate,
    endDate: dto.endDate,
    status: dto.status,
    location: dto.placeLocation || dto.place || "TBD",
    attendees: (dto.totalTickets || 0) - (dto.remainingTickets || 0),
    price: dto.ticketPrice === 0 ? "Free" : (dto.ticketPrice || "Free"),
    category: dto.category || "General",
    image: dto.imageUrl || "",
    organizerId: "",
    organizerName: "Organizer",
    description: dto.description || "",
    isFeatured: dto.status === "Featured",
    capacity: dto.totalTickets || 0,
    tags: [],
    placeLatitude: dto.placeLatitude ?? null,
    placeLongitude: dto.placeLongitude ?? null,
    googlePlaceId: dto.googlePlaceId ?? null,
  };
}

export function mapBookingDtoToEvent(dto: AttendeeBookingDto): Event {
  return {
    id: dto.eventId.toString(),
    title: dto.eventTitle || "Untitled Booking",
    date: dto.eventStartDate || new Date().toISOString(),
    time: dto.eventStartDate 
      ? new Date(dto.eventStartDate).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      : "TBD",
    location: dto.eventPlace || "TBD",
    attendees: 0,
    price: "Booked",
    category: dto.eventCategory || "General",
    image: "",
    organizerId: "",
    organizerName: "Organizer",
    description: "",
    isFeatured: false,
    capacity: 0,
    tags: []
  };
}

export function mapWishlistEventDtoToEvent(dto: WishlistEventDto): Event {
  return {
    id: dto.eventId.toString(),
    title: dto.title || "Untitled Saved Event",
    date: dto.startDate || new Date().toISOString(),
    time: dto.startDate 
      ? new Date(dto.startDate).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      : "TBD",
    location: "TBD",
    attendees: 0,
    price: dto.ticketPrice === 0 ? "Free" : (dto.ticketPrice || "Free"),
    category: dto.category || "General",
    image: "",
    organizerId: "",
    organizerName: "Organizer",
    description: "",
    isFeatured: false,
    capacity: 0,
    tags: []
  };
}
