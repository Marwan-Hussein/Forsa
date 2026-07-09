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
  const [reservedSlots, setReservedSlots] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);

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
        const activeAndUnbookedEvents = (eventData || []).filter((e: any) => {
          const statusLower = String(e.status || "").toLowerCase();
          const isCompleted = statusLower === "completed";
          const isCancelled = statusLower === "cancelled";
          const isBooked = e.placeId !== null && e.placeId !== undefined && Number(e.placeId) > 0;
          return !isCompleted && !isCancelled && !isBooked;
        });
        setEvents(activeAndUnbookedEvents);
      } catch (err: any) {
        toast.error("Failed to load data: " + err.message);
      } finally {
        setLoadingPlace(false);
        setLoadingEvents(false);
      }
    };
    fetchInitialData();
  }, [navigate, placeId]);

  const parseTimeToMinutes = (timeStr: string | null): number | null => {
    if (!timeStr) return null;
    const parts = timeStr.split(":");
    if (parts.length < 2) return null;
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  };

  const validateBookingTimes = (date: string, startTime: string, endTime: string): { isValid: boolean; message: string } => {
    if (!place?.availabilities) return { isValid: true, message: "" };
    const chosenDateStr = date.split("T")[0];
    const slots = place.availabilities.filter(slot => {
      const slotDateStr = slot.date.split("T")[0];
      return slotDateStr === chosenDateStr;
    });

    if (slots.length === 0) {
      return { isValid: false, message: "This venue has no published availability for this date." };
    }

    const availables = slots.filter(s => s.status.toLowerCase() === "available");
    if (availables.length === 0) {
      return { isValid: false, message: "This date is fully booked or blocked." };
    }

    if (startTime && endTime) {
      const userStart = parseTimeToMinutes(startTime);
      const userEnd = parseTimeToMinutes(endTime);
      if (userStart === null || userEnd === null) return { isValid: true, message: "" };

      // 1. Must fall within at least one Available slot
      const isCovered = availables.some(slot => {
        if (!slot.startTime && !slot.endTime) return true; // whole day available
        const slotStart = parseTimeToMinutes(slot.startTime);
        const slotEnd = parseTimeToMinutes(slot.endTime);
        if (slotStart === null || slotEnd === null) return false;
        return userStart >= slotStart && userEnd <= slotEnd;
      });

      if (!isCovered) {
        const ranges = availables.map(s => (s.startTime && s.endTime) ? `${s.startTime.substring(0, 5)} - ${s.endTime.substring(0, 5)}` : "Whole Day").join(", ");
        return { isValid: false, message: `Requested time is outside the venue's available hours on this date (${ranges}).` };
      }

      // 2. Must not overlap with any Booked or Blocked slot
      const unavailables = slots.filter(s => s.status.toLowerCase() === "booked" || s.status.toLowerCase() === "blocked");
      for (const slot of unavailables) {
        if (!slot.startTime && !slot.endTime) {
          return { isValid: false, message: `This date is fully ${slot.status.toLowerCase()}.` };
        }
        const slotStart = parseTimeToMinutes(slot.startTime);
        const slotEnd = parseTimeToMinutes(slot.endTime);
        if (slotStart !== null && slotEnd !== null) {
          if (userStart < slotEnd && userEnd > slotStart) {
            return { isValid: false, message: `Selected time overlaps with a ${slot.status.toLowerCase()} slot: ${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)}.` };
          }
        }
      }
    }
    return { isValid: true, message: "" };
  };

  const loadDateAvailability = (dateVal: string): boolean => {
    if (!dateVal) {
      setAvailableSlots([]);
      setReservedSlots([]);
      return true;
    }
    const chosenDateStr = dateVal.split("T")[0];
    if (place?.availabilities) {
      const slotsForDate = place.availabilities.filter(slot => {
        const slotDateStr = slot.date.split("T")[0];
        return slotDateStr === chosenDateStr;
      });

      if (slotsForDate.length === 0) {
        toast.error("This venue has no published availability for this date. Please select another date.");
        setAvailableSlots([]);
        setReservedSlots([]);
        return false;
      }

      const availables = slotsForDate.filter(s => s.status.toLowerCase() === "available");
      if (availables.length === 0) {
        toast.error("This date is fully booked or blocked by the host. Please select another date.");
        setAvailableSlots([]);
        setReservedSlots([]);
        return false;
      }

      setAvailableSlots(availables);
      setReservedSlots(slotsForDate.filter(s => s.status.toLowerCase() === "booked" || s.status.toLowerCase() === "blocked"));
    }
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "requestedDate") {
      const isOK = loadDateAvailability(value);
      if (!isOK) {
        setFormData(prev => ({ ...prev, requestedDate: "", startTime: "", endTime: "" }));
        return;
      }
    }

    if (name === "startTime" || name === "endTime" || name === "requestedDate") {
      const dateToCheck = name === "requestedDate" ? value : formData.requestedDate;
      const startToCheck = name === "startTime" ? value : formData.startTime;
      const endToCheck = name === "endTime" ? value : formData.endTime;

      if (startToCheck && endToCheck) {
        const startMin = parseTimeToMinutes(startToCheck);
        const endMin = parseTimeToMinutes(endToCheck);
        if (startMin !== null && endMin !== null && startMin >= endMin) {
          toast.error("Start time must be before end time.");
          setFormData(prev => ({ ...prev, [name]: "" }));
          return;
        }
      }

      if (dateToCheck && startToCheck && endToCheck) {
        const check = validateBookingTimes(dateToCheck, startToCheck, endToCheck);
        if (!check.isValid) {
          toast.error(check.message);
          setFormData(prev => ({ ...prev, startTime: "", endTime: "" }));
          return;
        }
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectEvent = (eventId: string) => {
    const selectedEvent = events.find(e => String(e.eventId) === String(eventId));
    let nextDate = "";
    let nextStart = "";
    let nextEnd = "";
    
    if (selectedEvent && selectedEvent.startDate) {
      const startStr = selectedEvent.startDate.endsWith("Z") ? selectedEvent.startDate : selectedEvent.startDate + "Z";
      const startDate = new Date(startStr);
      if (!isNaN(startDate.getTime())) {
        const year = startDate.getFullYear();
        const month = String(startDate.getMonth() + 1).padStart(2, '0');
        const day = String(startDate.getDate()).padStart(2, '0');
        nextDate = `${year}-${month}-${day}`;
        
        const hours = String(startDate.getHours()).padStart(2, '0');
        const minutes = String(startDate.getMinutes()).padStart(2, '0');
        nextStart = `${hours}:${minutes}`;
      }

      if (selectedEvent.endDate) {
        const endStr = selectedEvent.endDate.endsWith("Z") ? selectedEvent.endDate : selectedEvent.endDate + "Z";
        const endDate = new Date(endStr);
        if (!isNaN(endDate.getTime())) {
          const endHours = String(endDate.getHours()).padStart(2, '0');
          const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
          nextEnd = `${endHours}:${endMinutes}`;
        }
      }
    }

    if (nextDate) {
      const isOK = loadDateAvailability(nextDate);
      if (!isOK) {
        nextDate = "";
        nextStart = "";
        nextEnd = "";
      } else {
        if (nextStart && nextEnd) {
          const check = validateBookingTimes(nextDate, nextStart, nextEnd);
          if (!check.isValid) {
            toast.error(`Event hours conflict: ${check.message}`);
            nextStart = "";
            nextEnd = "";
          }
        }
      }
    }
    
    setFormData(prev => ({ 
      ...prev, 
      eventId,
      requestedDate: nextDate,
      startTime: nextStart,
      endTime: nextEnd
    }));
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.eventId) {
      toast.error("Please select an event");
      return;
    }

    if (!formData.requestedDate) {
      toast.error("Please select a date");
      return;
    }

    const check = validateBookingTimes(formData.requestedDate, formData.startTime, formData.endTime);
    if (!check.isValid) {
      toast.error(`Submission blocked: ${check.message}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const organizerId = getUserIdFromToken();
      if (!organizerId) throw new Error("Not authenticated");

      const dto = {
        organizerId: organizerId,
        requestedDate: `${formData.requestedDate}T00:00:00.000Z`,
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
          <Link to={`/organizer/places/${placeId}`} className="hover:text-violet-600 transition-colors">{place.name}</Link>
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
                                      <div className="flex flex-col min-w-0">
                                        <span className={`font-medium truncate ${String(formData.eventId) === String(event.eventId) ? "text-violet-700 font-bold" : "text-slate-700"}`}>
                                          {event.title}
                                        </span>
                                        {event.startDate && (
                                          <span className="text-[11px] text-slate-400 font-normal mt-0.5">
                                            {(() => {
                                              const dateStr = event.startDate.endsWith("Z") ? event.startDate : event.startDate + "Z";
                                              const d = new Date(dateStr);
                                              return `${d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })}`;
                                            })()}
                                          </span>
                                        )}
                                      </div>
                                      <span className={`text-[11px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md shrink-0 ${event.status === 0 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
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
                      {availableSlots.length > 0 && (
                        <div className="mt-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                          <p className="text-sm font-bold text-emerald-800 mb-2">Available Hours for this date:</p>
                          <div className="flex flex-wrap gap-2">
                            {availableSlots.map((slot, index) => {
                              const isFullDay = !slot.startTime && !slot.endTime;
                              return (
                                <span key={index} className="px-3 py-1 bg-emerald-100 border border-emerald-250 text-emerald-800 font-semibold rounded-lg text-xs">
                                  {isFullDay ? "Whole Day" : `${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)}`}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {reservedSlots.length > 0 && (
                        <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                          <p className="text-sm font-bold text-amber-800 mb-2">Reserved/Unavailable Times for this date:</p>
                          <div className="flex flex-wrap gap-2">
                            {reservedSlots.map((slot, index) => {
                              const isFullDay = !slot.startTime && !slot.endTime;
                              return (
                                <span key={index} className="px-3 py-1 bg-amber-100 border border-amber-300 text-amber-800 font-semibold rounded-lg text-xs">
                                  {isFullDay ? "Whole Day" : `${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)}`} ({slot.status})
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
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
                  src={place.images && place.images.length > 0 ? (place.images[0].startsWith('http') ? place.images[0] : `https://forsa-app.runasp.net${place.images[0].startsWith('/') ? '' : '/'}${place.images[0]}`) : "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop"} 
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

              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl mb-8">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600 text-sm">Price per day</span>
                  <span className="text-base font-bold text-slate-900">{place.dailyPrice} EGP</span>
                </div>
                <div className="h-px bg-slate-200/60" />
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600 text-sm">Price per hour</span>
                  <span className="text-base font-bold text-slate-900">{place.hourlyPrice} EGP</span>
                </div>
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
                  onClick={() => navigate(`/organizer/places/${placeId}`)}
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
