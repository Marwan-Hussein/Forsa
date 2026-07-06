import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { ImageWithFallback } from "../../components/ImageWithFallback";
import MapDisplay from "../../components/map/MapDisplay";
import { placeApi, PlaceDetails } from "../../api/placeApi";
import { organizerApi } from "../../api/organizerApi";
import { getUserIdFromToken } from "../../api/api";
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

export default function PlaceDetailsPage() {
  const { placeId } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [place, setPlace] = useState<PlaceDetails | null>(null);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paidRequests = JSON.parse(localStorage.getItem("paid_booking_requests") || "[]");
  const isPaid = existingRequest && paidRequests.includes(String(existingRequest.id || existingRequest.requestId));

  useEffect(() => {
    const fetchPlaceAndRequests = async () => {
      try {
        setIsLoading(true);
        if (placeId) {
          const data = await placeApi.getPlaceById(placeId);
          setPlace(data);

          const organizerId = getUserIdFromToken();
          if (organizerId) {
            try {
              const requests = await organizerApi.getOrganizerBookingRequests(organizerId);
              const requestsForPlace = requests.filter((r: any) => String(r.placeId) === String(placeId));
              if (requestsForPlace.length > 0) {
                 const activeRequest = requestsForPlace.find((r: any) => r.status === "Pending" || r.status === "Accepted");
                 setExistingRequest(activeRequest || requestsForPlace[0]);
              }
            } catch (err) {
              console.error("Failed to fetch requests", err);
            }
          }
        }
      } catch (err) {
        setError("Failed to fetch place details.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlaceAndRequests();
  }, [placeId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--brand-deep-navy)] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white/70 font-medium">Loading venue details...</p>
        </div>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="min-h-screen bg-[var(--brand-deep-navy)] flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur border border-white/10 rounded-3xl p-8 max-w-md text-center">
          <div className="h-16 w-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Venue Not Found</h2>
          <p className="text-white/70 mb-6">{error || "The venue you are looking for does not exist or has been removed."}</p>
          <Link to="/organizer/places" className="inline-block px-6 py-3 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-100 transition-colors">
            Back to Venues
          </Link>
        </div>
      </div>
    );
  }

  // Determine standard amenities based on facility type or mock for now
  const amenities = [
    { icon: Wifi, name: "High-Speed WiFi" },
    { icon: Car, name: "Parking Available" },
    { icon: Coffee, name: "Catering Options" },
    { icon: Shield, name: "Security" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Compact Navbar Spacing */}
      <div className="pt-6" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-3">
            <Link to="/organizer/places" className="hover:text-blue-600 transition-colors">Places</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900">{place.name}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
            {place.name}
          </h1>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-slate-600 text-sm font-medium">
              <div className="flex items-center gap-1.5">
                <Star className="size-4 fill-slate-900 text-slate-900" />
                <span className="font-bold text-slate-900">{place.rating > 0 ? place.rating.toFixed(1) : "New"}</span>
                <span className="underline cursor-pointer hover:text-slate-900 transition-colors">
                  {place.reviewCount} reviews
                </span>
              </div>
              <div className="hidden sm:block">•</div>
              <div className="flex items-center gap-1.5 underline cursor-pointer hover:text-slate-900 transition-colors">
                <MapPin className="size-4" />
                {place.location}
              </div>
              <div className="hidden sm:block">•</div>
              <div className="flex items-center gap-1.5">
                <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                  {place.facilityName}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 px-4 py-2 rounded-xl transition-colors"
              >
                <ImageIcon className="size-4" />
                View all photos
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Premium Image Gallery with Blurred Background Trick */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="relative h-[250px] sm:h-[350px] md:h-[420px] w-full rounded-3xl overflow-hidden border border-slate-150 bg-slate-950 shadow-md flex items-center justify-center">
            {/* Background Blur */}
            {place.images && place.images.length > 0 && (
              <img 
                src={place.images[selectedImage].startsWith('http') ? place.images[selectedImage] : `http://localhost:5000${place.images[selectedImage].startsWith('/') ? '' : '/'}${place.images[selectedImage]}`}
                alt="blur background" 
                className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-40 scale-110 pointer-events-none select-none"
              />
            )}
            
            {/* Crisp Centered Active Image */}
            <div className="relative w-full h-full flex items-center justify-center z-10 p-4">
              <ImageWithFallback
                src={place.images && place.images.length > selectedImage ? (place.images[selectedImage].startsWith('http') ? place.images[selectedImage] : `http://localhost:5000${place.images[selectedImage].startsWith('/') ? '' : '/'}${place.images[selectedImage]}`) : "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop"}
                alt={place.name}
                className="max-h-full max-w-full object-contain rounded-2xl shadow-lg transition-all duration-300"
              />
            </div>
          </div>

          {/* Thumbnails list */}
          {place.images && place.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto py-2.5 px-1 scrollbar-none">
              {place.images.map((img: string, idx: number) => {
                const imgUrl = img.startsWith('http') ? img : `http://localhost:5000${img.startsWith('/') ? '' : '/'}${img}`;
                return (
                  <button 
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 active:scale-95 ${selectedImage === idx ? 'border-violet-600 ring-2 ring-violet-500/20 scale-95 shadow-md' : 'border-slate-200 hover:border-slate-450 bg-slate-50'}`}
                  >
                    <img src={imgUrl} className="w-full h-full object-cover" alt={`thumbnail-${idx}`} />
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Content Section */}
        <div className="flex flex-col lg:flex-row gap-8 pb-16">
          
          {/* Left Main Content */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="w-full lg:w-2/3 space-y-8"
          >
            
            {/* Host / Capacity Info */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Hosted by {place.ownerName || "Venue Manager"}</h2>
                <div className="flex items-center gap-4 text-slate-500">
                  <span className="flex items-center gap-1.5 font-medium"><Users className="size-4" /> Up to {place.capacity} guests</span>
                  <span>•</span>
                  <span className="font-medium">Premium Venue</span>
                </div>
              </div>
              <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold text-2xl uppercase shadow-lg shadow-indigo-500/20 overflow-hidden">
                {place.ownerName ? place.ownerName.charAt(0) : "O"}
              </div>
            </div>

            {/* Description */}
            <div className="pb-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">About this space</h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                {place.description || "Welcome to our beautiful venue. This space is perfectly designed to host a variety of events, offering top-tier amenities and a comfortable environment for all your guests. Reach out for more details or book directly!"}
              </p>
            </div>

            {/* Amenities */}
            <div className="pb-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6">What this place offers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {amenities.map((amenity, index) => {
                  const Icon = amenity.icon;
                  return (
                    <motion.div 
                      key={index} 
                      whileHover={{ scale: 1.01, y: -2 }}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/10 transition-all cursor-default group"
                    >
                      <div className="p-3 bg-white rounded-xl shadow-sm text-slate-500 group-hover:text-indigo-600 transition-colors">
                        <Icon className="size-5 shrink-0" />
                      </div>
                      <span className="text-base font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">{amenity.name}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Operating Days */}
            <div className="pb-6 border-b border-slate-200">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-900 mb-1">Operating Days</h2>
                <p className="text-slate-500 text-sm">
                  This venue is open and accepts bookings on the following weekdays:
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {place.availableDays ? (
                  place.availableDays.split(",").map(day => (
                    <span 
                      key={day} 
                      className="px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl text-sm font-bold shadow-sm"
                    >
                      {day}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 text-sm font-medium bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl">
                    Every day (No weekday restrictions)
                  </span>
                )}
              </div>
            </div>

            {/* Availability */}
            <div className="pb-6 border-b border-slate-200">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-1">Availability Calendar</h2>
                <p className="text-slate-500 text-sm">
                  This calendar shows dates that have already been reserved. If a date is <span className="font-bold text-rose-600">BOOKED</span>, it is unavailable.
                </p>
              </div>
              <div className="bg-slate-50/30 p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="space-y-4">
                  {place.availabilities && place.availabilities.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {place.availabilities.slice(0, 6).map((day, index) => (
                        <motion.div 
                          key={index} 
                          whileHover={{ y: -1 }}
                          className={`flex items-center justify-between p-4 rounded-2xl bg-white border shadow-sm transition-all ${
                            day.status === "Available" 
                              ? "border-emerald-100 hover:border-emerald-250 hover:shadow-emerald-500/5" 
                              : "border-rose-100 hover:border-rose-250 hover:shadow-rose-500/5"
                          }`}
                        >
                          <span className="font-bold text-slate-800">{new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          <span
                            className={`text-[10px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest ${
                              day.status === "Available"
                                ? "text-emerald-700 bg-emerald-50 border border-emerald-100"
                                : "text-rose-600 bg-rose-50 border border-rose-100"
                            }`}
                          >
                            {day.status}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500 font-medium">
                      No specific availability restrictions published.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="pb-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Contact the Host</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {place.ownerPhone && (
                  <motion.div 
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group" 
                    onClick={() => window.location.href = `tel:${place.ownerPhone}`}
                  >
                    <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-all duration-300">
                      <Phone className="size-6 text-indigo-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Phone Number</p>
                      <p className="text-slate-700 font-extrabold text-base tracking-wide">{place.ownerPhone}</p>
                    </div>
                  </motion.div>
                )}
                {place.ownerEmail && (
                  <motion.div 
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group" 
                    onClick={() => window.location.href = `mailto:${place.ownerEmail}`}
                  >
                    <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-all duration-300">
                      <Mail className="size-6 text-indigo-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email Address</p>
                      <p className="text-slate-700 font-extrabold text-base truncate">{place.ownerEmail}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Where you'll be</h2>
              <p className="text-slate-600 mb-6">{place.location}</p>
              <div className="h-[250px] rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 relative group">
                <MapDisplay
                  address={place.location}
                  latitude={place.latitude || 30.0444}
                  longitude={place.longitude || 31.2357}
                />
              </div>
            </div>

          </motion.div>

          {/* Right Sticky Sidebar (Booking Card) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="w-full lg:w-1/3"
          >
            <div className="sticky top-32">
              <motion.div 
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200/50"
              >
                
                {/* Price Header */}
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <span className="text-3xl font-black text-slate-900">{place.dailyPrice.toLocaleString()} EGP</span>
                    <span className="text-slate-500 font-semibold ml-1">night</span>
                  </div>
                </div>

                {/* Status Alert */}
                <div className={`mb-6 p-4 rounded-2xl border flex items-start gap-3 ${place.status === "Available" ? "bg-emerald-50/50 border-emerald-100" : "bg-amber-50/50 border-amber-100"}`}>
                  {place.status === "Available" ? (
                    <>
                      <CheckCircle className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-emerald-950">Available to Book</h4>
                        <p className="text-emerald-700 text-sm mt-0.5">This venue is ready for your dates.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Clock className="size-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-amber-950">Check Dates</h4>
                        <p className="text-amber-700 text-sm mt-0.5">Please review the calendar for availability.</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Call to Action */}
                {existingRequest?.status === "Pending" ? (
                  <button disabled className="w-full flex items-center justify-center py-4 bg-amber-50/80 text-amber-800 border border-amber-200/60 font-bold text-lg rounded-2xl mb-4 cursor-not-allowed">
                    <Clock className="w-5 h-5 mr-2" /> Request Pending
                  </button>
                ) : existingRequest?.status === "Accepted" && !isPaid ? (
                  <button 
                    onClick={async () => {
                      try {
                        const res = await organizerApi.processPlaceCheckout(existingRequest.id || existingRequest.requestId);
                        if (res && res.clientSecret) {
                          localStorage.setItem("pending_payment_request_id", String(existingRequest.id || existingRequest.requestId));
                          if (res.clientSecret.startsWith("mock_")) {
                            const paidList = JSON.parse(localStorage.getItem("paid_booking_requests") || "[]");
                            const reqId = String(existingRequest.id || existingRequest.requestId);
                            if (!paidList.includes(reqId)) {
                              paidList.push(reqId);
                              localStorage.setItem("paid_booking_requests", JSON.stringify(paidList));
                            }
                            localStorage.removeItem("pending_payment_request_id");
                            toast.success("Mock Payment Success", { description: "Simulated payment for testing." });
                            // Force refresh state
                            setExistingRequest((prev: any) => prev ? { ...prev } : null);
                          } else if (res.clientSecret.startsWith("http")) {
                            window.location.href = res.clientSecret;
                          } else {
                            const pubKey = res.publicKey || "pk_test_placeholder";
                            window.location.href = `https://accept.paymob.com/unifiedcheckout/?publicKey=${pubKey}&clientSecret=${res.clientSecret}`;
                          }
                        } else {
                          toast.error("Could not initiate payment.");
                        }
                      } catch (err: any) {
                        toast.error("Payment initiation failed", { description: err.message });
                      }
                    }}
                    className="w-full flex items-center justify-center py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-lg rounded-2xl transition-all shadow-md hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98] mb-4"
                  >
                    <DollarSign className="w-5 h-5 mr-2" /> Pay Now
                  </button>
                ) : existingRequest?.status === "Accepted" && isPaid ? (
                  <button disabled className="w-full flex items-center justify-center py-4 bg-emerald-50/80 text-emerald-800 border border-emerald-250/60 font-bold text-lg rounded-2xl mb-4 cursor-not-allowed">
                    <CheckCircle className="w-5 h-5 mr-2 text-emerald-600" /> Booking Confirmed
                  </button>
                ) : (
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Link
                      to={`/organizer/places/${placeId}/book`}
                      className="w-full flex items-center justify-center py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-lg rounded-2xl transition-all shadow-md hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] mb-4"
                    >
                      Reserve Now
                    </Link>
                  </motion.div>
                )}

                <p className="text-center text-slate-400 text-sm mb-6 font-medium">You won't be charged yet</p>

                {/* Pricing Breakdown */}
                <div className="space-y-4 text-slate-600 pb-6 border-b border-slate-200/80">
                  <div className="flex justify-between">
                    <span className="underline cursor-pointer hover:text-slate-900 font-medium">{place.dailyPrice.toLocaleString()} EGP x 1 night</span>
                    <span className="font-bold text-slate-800">{place.dailyPrice.toLocaleString()} EGP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="underline cursor-pointer hover:text-slate-900 font-medium">Forsa service fee</span>
                    <span className="font-bold text-slate-800">0 EGP</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 font-extrabold text-lg text-slate-900">
                  <span>Total before taxes</span>
                  <span className="text-indigo-600">{place.dailyPrice.toLocaleString()} EGP</span>
                </div>
              </motion.div>

              {/* Report Venue */}
              <div className="mt-8 flex justify-center">
                <button className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors font-semibold text-xs tracking-wider uppercase underline">
                  <Shield className="size-4" />
                  Report this listing
                </button>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
