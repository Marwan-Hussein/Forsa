import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  FileText,
  ChevronRight,
  ChevronDown,
  Building2,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getUserIdFromToken } from "../../api/api";
import { organizerApi } from "../../api/organizerApi";
import { placeApi, PlaceDetails } from "../../api/placeApi";
import { ImageWithFallback } from "../../components/ImageWithFallback";
import { toast } from "react-toastify";

export default function BookingRequestFormPage() {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [place, setPlace] = useState<PlaceDetails | null>(null);
  const [loadingPlace, setLoadingPlace] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    eventId: "",
    requestedDate: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      const organizerId = getUserIdFromToken();
      if (!organizerId) {
        toast.error("Not authenticated");
        navigate("/login");
        return;
      }
      try {
        if (placeId) {
          const placeData = await placeApi.getPlaceById(placeId);
          setPlace(placeData);
        }
        const eventData = await organizerApi.getEventsDashboard(organizerId);
        setEvents(eventData || []);
      } catch (err: any) {
        toast.error("Failed to load data: " + err.message);
      } finally {
        setLoadingPlace(false);
        setLoadingEvents(false);
      }
    };
    fetchInitialData();
  }, [navigate, placeId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectEvent = (eventId: string) => {
    setFormData(prev => ({ ...prev, eventId }));
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.eventId) {
      toast.error("Please select an event");
      return;
    }

    setIsSubmitting(true);

    try {
      const organizerId = getUserIdFromToken();
      if (!organizerId) throw new Error("Not authenticated");

      const dto = {
        organizerId: organizerId,
        requestedDate: new Date(formData.requestedDate).toISOString(),
        startTime: formData.startTime ? formData.startTime + ":00" : undefined,
        endTime: formData.endTime ? formData.endTime + ":00" : undefined
      };

      await organizerApi.submitPlaceBookingRequest(Number(formData.eventId), Number(placeId), dto);
      toast.success("Booking request submitted successfully! The owner will review it shortly.");
      navigate("/organizer/venue-requests");
    } catch (err: any) {
      toast.error("Failed to submit request: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedEvent = events.find(e => String(e.eventId) === String(formData.eventId));
  const today = new Date().toISOString().split("T")[0];

  if (loadingPlace) {
    return (
      <div className="min-h-screen bg-[#F7F7F9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Loading venue details...</p>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen bg-[#F7F7F9] flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Venue Not Found</h2>
        <p className="text-slate-500 mb-6">The venue you are looking for does not exist or has been removed.</p>
        <Link to="/organizer/places" className="px-6 py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-colors">
          Browse Places
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F9] font-sans pb-24">
      <main className="px-6 py-8 max-w-6xl mx-auto w-full relative z-10">
        {/* Breadcrumb */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-8"
        >
          <Link to="/organizer/places" className="hover:text-violet-600 transition-colors">Places</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={`/places/${placeId}`} className="hover:text-violet-600 transition-colors">{place.name}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-800 font-bold">Request Booking</span>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column: Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="w-full lg:w-2/3 space-y-8"
          >
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/40 border border-slate-100">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Request Venue Booking</h1>
              <p className="text-slate-500 mb-8">Fill in the details below to request a reservation for your event.</p>

              <form id="booking-form" onSubmit={handleSubmit} className="space-y-8">
                
                {/* Event Selection */}
                <div>
                  <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-violet-500" />
                    Event Details
                  </h2>
                  
                  <div className="relative">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Which event are you booking for? *
                    </label>
                    
                    {loadingEvents ? (
                      <div className="flex items-center gap-2 text-slate-500 text-sm py-4 px-5 border border-slate-200 rounded-2xl bg-slate-50">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-violet-600"></div>
                        Loading your events...
                      </div>
                    ) : events.length === 0 ? (
                      <div className="py-4 px-5 border border-rose-200 rounded-2xl bg-rose-50 text-rose-600 text-sm flex items-center justify-between">
                        <span>You don't have any active events. Create an event first!</span>
                        <Link to="/organizer/events/new" className="font-bold underline hover:no-underline">Create Event</Link>
                      </div>
                    ) : (
                      <>
                        <div 
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className={`w-full px-5 py-4 bg-white border-2 rounded-2xl cursor-pointer flex items-center justify-between transition-all shadow-sm ${
                            isDropdownOpen ? "border-violet-500 ring-4 ring-violet-500/10" : "border-slate-200 hover:border-violet-300"
                          }`}
                        >
                          <span className={formData.eventId ? "text-slate-900 font-bold" : "text-slate-400 font-medium"}>
                            {selectedEvent ? selectedEvent.title : "Select an event from your list"}
                          </span>
                          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-violet-500" : ""}`} />
                        </div>

                        {/* Custom Dropdown */}
                        <AnimatePresence>
                          {isDropdownOpen && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                              <motion.div 
                                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                transition={{ duration: 0.15 }}
                                className="absolute top-[85px] left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden"
                              >
                                <div className="max-h-72 overflow-y-auto p-2 custom-scrollbar">
                                  {events.map(event => (
                                    <div
                                      key={event.eventId}
                                      onClick={() => handleSelectEvent(String(event.eventId))}
                                      className={`px-4 py-3 rounded-xl cursor-pointer transition-all flex items-center justify-between mb-1 ${
                                        String(formData.eventId) === String(event.eventId) 
                                          ? "bg-violet-50 border border-violet-100" 
                                          : "hover:bg-slate-50 border border-transparent"
                                      }`}
                                    >
                                      <span className={`font-medium ${String(formData.eventId) === String(event.eventId) ? "text-violet-700 font-bold" : "text-slate-700"}`}>
                                        {event.title}
                                      </span>
                                      <span className={`text-[11px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md ${event.status === 0 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                                        {event.status === 0 ? "Pending" : "Active"}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Timing Section */}
                <div>
                  <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-violet-500" />
                    Date & Time Required
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label htmlFor="requestedDate" className="block text-sm font-bold text-slate-700 mb-2">
                        Event Date *
                      </label>
                      <input
                        type="date"
                        id="requestedDate"
                        name="requestedDate"
                        required
                        min={today}
                        value={formData.requestedDate}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 font-bold text-slate-700 transition-all shadow-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="startTime" className="block text-sm font-bold text-slate-700 mb-2">
                        Start Time <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <Clock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="time"
                          id="startTime"
                          name="startTime"
                          value={formData.startTime}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 font-bold text-slate-700 transition-all shadow-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="endTime" className="block text-sm font-bold text-slate-700 mb-2">
                        End Time <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <Clock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="time"
                          id="endTime"
                          name="endTime"
                          value={formData.endTime}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 font-bold text-slate-700 transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800 leading-relaxed font-medium">
                    Submitting this request does not confirm the booking. The owner will review your request and you will be notified once it is approved.
                  </p>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Right Column: Sticky Summary Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full lg:w-1/3"
          >
            <div className="sticky top-8 bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6 relative bg-slate-100">
                <ImageWithFallback 
                  src={place.images && place.images.length > 0 ? (place.images[0].startsWith('http') ? place.images[0] : `http://localhost:5000${place.images[0].startsWith('/') ? '' : '/'}${place.images[0]}`) : "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop"} 
                  alt={place.name} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold tracking-widest uppercase text-slate-900 shadow-sm">
                  Selected Venue
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2">{place.name}</h3>
              <div className="flex items-start gap-2 text-slate-500 text-sm mb-6">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{place.location}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl mb-8">
                <span className="font-bold text-slate-700">Price per day</span>
                <span className="text-lg font-black text-slate-900">{place.dailyPrice} EGP</span>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  form="booking-form"
                  disabled={isSubmitting || events.length === 0}
                  className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-lg rounded-2xl hover:shadow-lg hover:shadow-violet-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Submit Request
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/places/${placeId}`)}
                  className="w-full py-4 bg-white text-slate-700 border-2 border-slate-200 font-bold text-lg rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}