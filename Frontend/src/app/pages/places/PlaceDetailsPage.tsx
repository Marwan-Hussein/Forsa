import { useState } from "react";
import { Link, useParams } from "react-router";
import { ImageWithFallback } from "../../components/ImageWithFallback";
import {
  MapPin,
  Users,
  Calendar,
  Clock,
  DollarSign,
  Star,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  Wifi,
  Car,
  Coffee,
  Utensils,
  Shield,
  Accessibility,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";

// Mock place data
const mockPlace = {
  id: "1",
  name: "Grand Convention Center",
  description: "A premier event venue in the heart of downtown, offering state-of-the-art facilities and exceptional service for events of all sizes.",
  fullDescription: "Our Grand Convention Center stands as a beacon of excellence in event hosting. With over 50,000 square feet of versatile space, we can accommodate everything from intimate gatherings of 50 to large-scale conferences of 2,000 attendees. Our dedicated team ensures every detail is perfect, from audiovisual setup to catering arrangements.",
  address: "123 Main Street, Downtown",
  city: "San Francisco",
  state: "CA",
  zipCode: "94102",
  country: "USA",
  owner: "Michael Chen",
  ownerEmail: "michael.chen@grandconvention.com",
  ownerPhone: "+1 (555) 123-4567",
  website: "www.grandconvention.com",
  capacity: {
    min: 50,
    max: 2000,
  },
  priceRange: {
    min: 500,
    max: 5000,
  },
  rating: 4.7,
  reviews: 128,
  images: [
    "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&q=80",
    "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80",
    "https://images.unsplash.com/photo-1519167758481-83f29da8c562?w=800&q=80",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
  ],
  amenities: [
    { icon: Wifi, name: "High-Speed WiFi" },
    { icon: Car, name: "Parking Available" },
    { icon: Coffee, name: "Catering Services" },
    { icon: Utensils, name: "Full Kitchen" },
    { icon: Shield, name: "Security" },
    { icon: Accessibility, name: "Wheelchair Accessible" },
  ],
  upcomingEvents: [
    {
      id: "1",
      title: "Tech Summit 2026",
      date: "2026-04-15",
      attendees: 500,
      organizer: "Tech Events Inc.",
    },
    {
      id: "2",
      title: "Wedding Reception",
      date: "2026-04-22",
      attendees: 150,
      organizer: "Smith Family",
    },
    {
      id: "3",
      title: "Business Conference",
      date: "2026-05-10",
      attendees: 300,
      organizer: "Corporate Solutions",
    },
  ],
  availability: [
    { date: "2026-04-15", status: "booked" },
    { date: "2026-04-16", status: "available" },
    { date: "2026-04-17", status: "available" },
    { date: "2026-04-22", status: "booked" },
    { date: "2026-04-23", status: "available" },
  ],
};

export default function PlaceDetailsPage() {
  const { placeId } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="min-h-screen bg-[#eff6ff]">
      <main className="px-6 py-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#526d82] mb-6">
          <Link to="/places" className="hover:text-[#EC9B3B]">Places</Link>
          <ChevronRight className="size-4" />
          <span className="text-[#27374d]">{mockPlace.name}</span>
        </div>

        {/* Image Gallery */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-[rgba(39,55,77,0.1)] mb-6">
          <div className="grid grid-cols-4 gap-2 p-2">
            <div className="col-span-3 row-span-2">
              <ImageWithFallback
                src={mockPlace.images[selectedImage]}
                alt={mockPlace.name}
                className="w-full h-[400px] object-cover rounded-lg"
              />
            </div>
            {mockPlace.images.slice(1, 4).map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index + 1)}
                className={`relative overflow-hidden rounded-lg transition-all duration-300 ease-in-out hover:ring-2 hover:ring-[#EC9B3B]/50 ${
                  selectedImage === index + 1 ? "ring-2 ring-[#EC9B3B]" : ""
                }`}
              >
                <ImageWithFallback
                  src={image}
                  alt={`Gallery ${index + 2}`}
                  className="w-full h-[130px] object-cover hover:opacity-80 transition-opacity"
                />
              </button>
            ))}
            <button
              onClick={() => setSelectedImage(0)}
              className={`relative overflow-hidden rounded-lg transition-all duration-300 ease-in-out hover:ring-2 hover:ring-[#EC9B3B]/50 ${
                selectedImage === 0 ? "ring-2 ring-[#EC9B3B]" : ""
              }`}
            >
              <ImageWithFallback
                src={mockPlace.images[0]}
                alt="Gallery 1"
                className="w-full h-[130px] object-cover hover:opacity-80 transition-opacity"
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-[#27374d] mb-2">{mockPlace.name}</h1>
                  <div className="flex items-center gap-2 text-[#526d82] mb-3">
                    <MapPin className="size-5" />
                    <span>{mockPlace.address}, {mockPlace.city}, {mockPlace.state} {mockPlace.zipCode}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="size-5 fill-[#EC9B3B] text-[#EC9B3B]" />
                      <span className="font-semibold text-[#27374d]">{mockPlace.rating}</span>
                      <span className="text-sm text-[#526d82]">({mockPlace.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                <Link
                  to={`/places/${placeId}/book`}
                  className="px-6 py-3 bg-gradient-to-r from-[#EC9B3B] to-[#f4b860] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Book This Venue
                </Link>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)]">
              <h2 className="text-xl font-bold text-[#27374d] mb-4">About This Venue</h2>
              <p className="text-[#526d82] leading-relaxed mb-4">{mockPlace.fullDescription}</p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-[#182F4D] to-[#346286] rounded-lg">
                    <Users className="size-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-[#526d82]">Capacity</p>
                    <p className="font-semibold text-[#27374d]">{mockPlace.capacity.min} - {mockPlace.capacity.max} people</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-[#EC9B3B] to-[#f4b860] rounded-lg">
                    <DollarSign className="size-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-[#526d82]">Price Range</p>
                    <p className="font-semibold text-[#27374d]">${mockPlace.priceRange.min} - ${mockPlace.priceRange.max}/day</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)]">
              <h2 className="text-xl font-bold text-[#27374d] mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mockPlace.amenities.map((amenity, index) => {
                  const Icon = amenity.icon;
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 bg-[#eff6ff] rounded-lg">
                      <Icon className="size-5 text-[#27374d]" />
                      <span className="text-sm text-[#27374d]">{amenity.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)]">
              <h2 className="text-xl font-bold text-[#27374d] mb-4">Upcoming Events at This Venue</h2>
              <div className="space-y-3">
                {mockPlace.upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-[#eff6ff] rounded-lg">
                    <div>
                      <h3 className="font-semibold text-[#27374d]">{event.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-[#526d82] mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-4" />
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="size-4" />
                          {event.attendees} attendees
                        </span>
                      </div>
                    </div>
                    <span className="text-sm text-[#526d82]">by {event.organizer}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)]">
              <h2 className="text-xl font-bold text-[#27374d] mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[#526d82] mb-1">Owner</p>
                  <p className="font-semibold text-[#27374d]">{mockPlace.owner}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="size-5 text-[#EC9B3B]" />
                  <div>
                    <p className="text-sm text-[#526d82]">Phone</p>
                    <a href={`tel:${mockPlace.ownerPhone}`} className="text-[#27374d] hover:text-[#EC9B3B]">
                      {mockPlace.ownerPhone}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="size-5 text-[#EC9B3B]" />
                  <div>
                    <p className="text-sm text-[#526d82]">Email</p>
                    <a href={`mailto:${mockPlace.ownerEmail}`} className="text-[#27374d] hover:text-[#EC9B3B] break-all">
                      {mockPlace.ownerEmail}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="size-5 text-[#EC9B3B]" />
                  <div>
                    <p className="text-sm text-[#526d82]">Website</p>
                    <a href={`https://${mockPlace.website}`} target="_blank" rel="noopener noreferrer" className="text-[#27374d] hover:text-[#EC9B3B]">
                      {mockPlace.website}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-[#182F4D] to-[#346286] rounded-xl p-6 text-white">
              <h2 className="text-xl font-bold mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Total Events Hosted</span>
                  <span className="text-2xl font-bold">247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Happy Clients</span>
                  <span className="text-2xl font-bold">189</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Years in Business</span>
                  <span className="text-2xl font-bold">15</span>
                </div>
              </div>
            </div>

            {/* Availability Calendar Preview */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)]">
              <h2 className="text-xl font-bold text-[#27374d] mb-4">Availability</h2>
              <div className="space-y-2">
                {mockPlace.availability.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded">
                    <span className="text-sm text-[#526d82]">{new Date(day.date).toLocaleDateString()}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        day.status === "available"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {day.status}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                to={`/places/${placeId}/book`}
                className="mt-4 block text-center px-4 py-2 border border-[#27374d] text-[#27374d] rounded-lg hover:bg-[#27374d] hover:text-white transition-all"
              >
                Check Full Availability
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}