import { useState } from "react";
import { Link, useParams } from "react-router";
import { ImageWithFallback } from "../../components/ImageWithFallback";
import MapDisplay from "../../components/map/MapDisplay";
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
import { motion } from "motion/react";

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
  latitude: 37.7749,
  longitude: -122.4194,
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
    <div className="min-h-screen bg-background">
      {/* Dark Header Background for Navbar & Hero */}
      <div className="bg-[#0B1120] pt-32 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0" style={{ background: "linear-gradient(135deg, #0B1120 0%, #1E3D61 100%)" }} />
        <div className="absolute inset-0 z-0 overflow-hidden mix-blend-screen pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full filter blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#3b82f6]/20 rounded-full filter blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-300 mb-8">
            <Link to="/places" className="hover:text-white transition-colors">Places</Link>
            <ChevronRight className="size-4 opacity-50" />
            <span className="text-white font-medium">{mockPlace.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Title & Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-5xl font-['Inter:Bold',sans-serif] font-bold text-white leading-tight">
                {mockPlace.name}
              </h1>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin className="size-5 text-[#3b82f6]" />
                  <span>{mockPlace.address}, {mockPlace.city}</span>
                </div>
                <div className="hidden sm:block text-slate-600">•</div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                  <Star className="size-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-white">{mockPlace.rating}</span>
                  <span className="text-slate-400 text-sm">({mockPlace.reviews} reviews)</span>
                </div>
              </div>

              <p className="text-slate-300 text-lg leading-relaxed max-w-xl">
                {mockPlace.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  to={`/places/${placeId}/book`}
                  className="px-8 py-4 bg-white text-[#0B1120] font-bold rounded-xl hover:bg-slate-100 hover:scale-105 transition-all shadow-xl shadow-white/10"
                >
                  Book This Venue
                </Link>
                <div className="flex items-center gap-2 text-slate-300 px-6 py-4 rounded-xl bg-white/5 border border-white/10">
                  <DollarSign className="size-5 text-green-400" />
                  <span className="font-semibold text-white">Starts at ${mockPlace.priceRange.min}</span>
                  <span className="text-sm">/day</span>
                </div>
              </div>
            </motion.div>

            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/3] group">
                <ImageWithFallback
                  src={mockPlace.images[selectedImage]}
                  alt={mockPlace.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120]/80 via-transparent to-transparent opacity-60" />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {mockPlace.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all duration-300 aspect-[4/3] ${
                      selectedImage === index ? "border-white shadow-lg shadow-white/20" : "border-transparent hover:border-white/50 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <ImageWithFallback
                      src={image}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content (White bg) */}
      <div className="bg-background pt-12 pb-20 px-4">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-[rgba(39,55,77,0.1)]">
                <h2 className="text-2xl font-bold text-foreground mb-4">About This Venue</h2>
                <p className="text-muted-foreground leading-relaxed mb-8">{mockPlace.fullDescription}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="p-3 bg-white shadow-sm rounded-lg text-[#3b82f6]">
                      <Users className="size-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Capacity</p>
                      <p className="font-semibold text-foreground text-lg">{mockPlace.capacity.min} - {mockPlace.capacity.max} people</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="p-3 bg-white shadow-sm rounded-lg text-green-500">
                      <DollarSign className="size-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Price Range</p>
                      <p className="font-semibold text-foreground text-lg">${mockPlace.priceRange.min} - ${mockPlace.priceRange.max}/day</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-[rgba(39,55,77,0.1)]">
                <h2 className="text-2xl font-bold text-foreground mb-6">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {mockPlace.amenities.map((amenity, index) => {
                    const Icon = amenity.icon;
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
                          <Icon className="size-5" />
                        </div>
                        <span className="font-medium text-foreground">{amenity.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Venue Map Location */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-[rgba(39,55,77,0.1)]">
                <h2 className="text-2xl font-bold text-foreground mb-6">Location Map</h2>
                <MapDisplay
                  address={`${mockPlace.address}, ${mockPlace.city}`}
                  latitude={mockPlace.latitude}
                  longitude={mockPlace.longitude}
                />
              </div>

              {/* Upcoming Events */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-[rgba(39,55,77,0.1)]">
                <h2 className="text-2xl font-bold text-foreground mb-6">Upcoming Events at This Venue</h2>
                <div className="space-y-4">
                  {mockPlace.upcomingEvents.map((event) => (
                    <div key={event.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl gap-4 hover:border-slate-200 transition-colors">
                      <div>
                        <h3 className="font-bold text-foreground text-lg">{event.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="size-4" />
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className="size-4" />
                            {event.attendees} attendees
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded-lg shadow-sm">by {event.organizer}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Contact Information */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-[rgba(39,55,77,0.1)]">
                <h2 className="text-xl font-bold text-foreground mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Owner</p>
                    <p className="font-semibold text-foreground text-lg">{mockPlace.owner}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 text-[#3b82f6] rounded-xl">
                      <Phone className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-0.5">Phone</p>
                      <a href={`tel:${mockPlace.ownerPhone}`} className="font-medium text-foreground hover:text-[#3b82f6] transition-colors">
                        {mockPlace.ownerPhone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 text-[#3b82f6] rounded-xl">
                      <Mail className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-0.5">Email</p>
                      <a href={`mailto:${mockPlace.ownerEmail}`} className="font-medium text-foreground hover:text-[#3b82f6] transition-colors break-all">
                        {mockPlace.ownerEmail}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 text-[#3b82f6] rounded-xl">
                      <Globe className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-0.5">Website</p>
                      <a href={`https://${mockPlace.website}`} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground hover:text-[#3b82f6] transition-colors">
                        {mockPlace.website}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-[#0B1120] to-[#1E3D61] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Star className="size-32" />
                </div>
                <h2 className="text-xl font-bold mb-6 relative z-10">Quick Stats</h2>
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Total Events Hosted</span>
                    <span className="text-3xl font-black tracking-tight">247</span>
                  </div>
                  <div className="h-px bg-white/10 w-full" />
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Happy Clients</span>
                    <span className="text-3xl font-black tracking-tight">189</span>
                  </div>
                  <div className="h-px bg-white/10 w-full" />
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Years in Business</span>
                    <span className="text-3xl font-black tracking-tight">15</span>
                  </div>
                </div>
              </div>

              {/* Availability Calendar Preview */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-[rgba(39,55,77,0.1)]">
                <h2 className="text-xl font-bold text-foreground mb-6">Availability</h2>
                <div className="space-y-3">
                  {mockPlace.availability.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                      <span className="font-medium text-muted-foreground">{new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span
                        className={`text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider ${
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
                  className="mt-6 flex items-center justify-center w-full px-4 py-3 bg-white border-2 border-[#3b82f6] text-[#3b82f6] font-bold rounded-xl hover:bg-[#3b82f6] hover:text-white transition-all duration-300"
                >
                  Check Full Availability
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}