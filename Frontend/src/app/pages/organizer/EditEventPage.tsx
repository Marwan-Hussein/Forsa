import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Link } from "react-router";
import { ArrowLeft, Calendar, Tag, FileText, Ticket, DollarSign, LayoutList, RefreshCw, Image as ImageIcon, MapPin, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { organizerApi } from "../../api/organizerApi";
import { getUserIdFromToken } from "../../api/api";
import { toast } from "react-toastify";
import { DateTimePicker } from "../../components/ui/date-time-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import MapPicker from "../../components/map/MapPicker";
import { cn } from "../../components/ui/utils";
import { parseBackendDate } from "../../utils/mappers";

export default function EditEventPage() {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    ticketPrice: "",
    totalTickets: "",
    customLocation: ""
  });
  const [hasOwnPlace, setHasOwnPlace] = useState(false);
  const [mapLatitude, setMapLatitude] = useState<number | null>(null);
  const [mapLongitude, setMapLongitude] = useState<number | null>(null);
  const [hasPlaceId, setHasPlaceId] = useState(false);
  const [eventPlaceName, setEventPlaceName] = useState("");
  const [eventPlaceLocation, setEventPlaceLocation] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [originalStartDate, setOriginalStartDate] = useState<Date | undefined>(undefined); // saved event start — used for lock logic
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [eventStatus, setEventStatus] = useState("");
  const [bookedTicketsCount, setBookedTicketsCount] = useState(0);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await organizerApi.getEventDetails(Number(eventId));
        setFormData({
          title: data.title || "",
          description: data.description || "",
          category: data.category || "",
          ticketPrice: data.ticketPrice?.toString() || "",
          totalTickets: data.totalTickets?.toString() || "",
          customLocation: data.customLocation || ""
        });
        setEventStatus(data.status || "");
        
        const booked = data.bookedTickets ?? ((data.totalTickets || 0) - (data.remainingTickets || 0));
        setBookedTicketsCount(booked);

        if (data.startDate) {
          const parsed = parseBackendDate(data.startDate);
          setStartDate(parsed);
          setOriginalStartDate(parsed);
        }
        if (data.endDate) setEndDate(parseBackendDate(data.endDate));
        if (data.imageUrl) setExistingImageUrl(data.imageUrl);
        if (data.placeId) {
          setHasPlaceId(true);
          setEventPlaceName(data.place || "Booked Venue");
          setEventPlaceLocation(data.placeLocation || "");
        } else {
          setHasPlaceId(false);
          setHasOwnPlace(!!data.customLocation);
        }
      } catch (err: any) {
        toast.error("Failed to load event details: " + err.message);
        navigate("/organizer/events");
      } finally {
        setIsLoading(false);
      }
    };
    if (eventId) fetchEvent();
  }, [eventId, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let cleanedValue = value;
    if (name === "ticketPrice" || name === "totalTickets") {
      if (value.startsWith("0") && value.length > 1 && value[1] !== ".") {
        cleanedValue = value.replace(/^0+/, "");
      }
    }
    setFormData(prev => ({
      ...prev,
      [name]: cleanedValue
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  // Lock is based on the ORIGINAL saved event start date — not the form's current value.
  // This prevents a form entry mistake from immediately locking all fields.
  const isWithin24HoursOrDone = eventStatus.toLowerCase() === "completed" ||
    (originalStartDate && (originalStartDate.getTime() - new Date().getTime()) < 24 * 60 * 60 * 1000);
  const isTicketPriceDisabled = isWithin24HoursOrDone || bookedTicketsCount > 0;
  const isLocationDisabled = !!isWithin24HoursOrDone;
  const isStartedOrCompleted = isWithin24HoursOrDone; // kept for date pickers

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (endDate <= startDate) {
      toast.error("End date must be after start date");
      return;
    }

    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }

    setIsSubmitting(true);

    try {
      // Serialize as local datetime (no UTC conversion) so the server stores the time the user actually intended.
      const toLocalISOString = (d: Date) => {
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      };

      const dto = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        startDate: toLocalISOString(startDate),
        endDate: toLocalISOString(endDate),
        ticketPrice: parseFloat(formData.ticketPrice),
        totalTickets: parseInt(formData.totalTickets, 10),
        customLocation: hasPlaceId ? undefined : (hasOwnPlace ? formData.customLocation : undefined)
      };

      await organizerApi.updateEventDetails(Number(eventId), dto);
      
      const organizerId = getUserIdFromToken();
      if (imageFile && organizerId) {
        await organizerApi.uploadEventMedia(Number(eventId), organizerId, imageFile);
      }

      toast.success("Event updated successfully!");
      navigate("/organizer/events");
    } catch (err: any) {
      toast.error(err.message || "Failed to update event");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-8 pb-16 relative"
    >
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-indigo-400/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex items-center gap-4 mb-8">
        <Link 
          to="/organizer/events"
          className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-['Outfit:Bold',sans-serif] font-bold text-slate-800 tracking-tight">Edit Event</h1>
          <p className="text-slate-500 font-['Inter:Medium',sans-serif] mt-1">Update the details of your event.</p>
        </div>
      </div>

      {eventStatus.toLowerCase() === "draft" && !hasPlaceId && !formData.customLocation && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-2xl flex items-start gap-3.5 shadow-sm mb-6">
          <AlertCircle className="w-5.5 h-5.5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800 font-['Inter:Bold',sans-serif]">
              Action Required: Missing Event Location
            </p>
            <p className="text-xs text-amber-700 font-['Inter:Medium',sans-serif] mt-1 leading-relaxed">
              This event cannot be submitted for approval yet. Please reserve a venue or provide a custom location before submitting it for admin approval and publishing.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] shadow-xl shadow-slate-200/40 border border-white p-6 md:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-500 opacity-[0.03] blur-3xl rounded-full pointer-events-none" />
        
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-['Inter:Bold',sans-serif] font-bold text-slate-700 flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-500" />
                Event Title
              </label>
              <input 
                type="text" 
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Summer Music Festival" 
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 font-['Inter:Medium',sans-serif] text-slate-700 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-['Inter:Bold',sans-serif] font-bold text-slate-700 flex items-center gap-2">
                <LayoutList className="w-4 h-4 text-indigo-500" />
                Category
              </label>
              <Select value={formData.category} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full px-4 h-[54px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 font-['Inter:Medium',sans-serif] text-slate-700 transition-all text-base shadow-none">
                  <SelectValue placeholder="Select Category..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 rounded-xl shadow-xl">
                  <SelectItem value="Music" className="font-['Inter:Medium',sans-serif] py-2.5 cursor-pointer">Music</SelectItem>
                  <SelectItem value="Technology" className="font-['Inter:Medium',sans-serif] py-2.5 cursor-pointer">Technology</SelectItem>
                  <SelectItem value="Business" className="font-['Inter:Medium',sans-serif] py-2.5 cursor-pointer">Business</SelectItem>
                  <SelectItem value="Education" className="font-['Inter:Medium',sans-serif] py-2.5 cursor-pointer">Education</SelectItem>
                  <SelectItem value="Arts" className="font-['Inter:Medium',sans-serif] py-2.5 cursor-pointer">Arts</SelectItem>
                  <SelectItem value="Sports" className="font-['Inter:Medium',sans-serif] py-2.5 cursor-pointer">Sports</SelectItem>
                  <SelectItem value="Other" className="font-['Inter:Medium',sans-serif] py-2.5 cursor-pointer">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-['Inter:Bold',sans-serif] font-bold text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              Description
            </label>
            <textarea 
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what your event is about, what attendees can expect, etc." 
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 font-['Inter:Medium',sans-serif] text-slate-700 transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-['Inter:Bold',sans-serif] font-bold text-slate-700 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-500" />
              Event Cover Image
            </label>
            
            {(imagePreviewUrl || existingImageUrl) ? (
              <div className="relative w-full max-w-md h-52 rounded-2xl overflow-hidden border border-slate-200 group shadow-sm bg-slate-50 mb-3">
                <img 
                  src={imagePreviewUrl || existingImageUrl || ""} 
                  alt="Event Cover" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent flex items-end p-4">
                  <span className="bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-sm border border-white/20">
                    {imagePreviewUrl ? "New Preview" : "Current Cover Image"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50 text-slate-400 mb-3">
                <ImageIcon className="w-10 h-10 mb-2 stroke-[1.5]" />
                <span className="text-xs font-semibold">No cover image uploaded yet</span>
              </div>
            )}

            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 font-['Inter:Medium',sans-serif] text-slate-700 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
            {imageFile && (
              <p className="text-sm text-green-600 font-medium">Selected: {imageFile.name}</p>
            )}
            <p className="text-xs text-slate-500 mt-1">Uploading a new image will replace the current cover image.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-['Inter:Bold',sans-serif] font-bold text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                Start Date & Time
              </label>
              <DateTimePicker date={startDate} setDate={setStartDate} disabled={isStartedOrCompleted} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-['Inter:Bold',sans-serif] font-bold text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                End Date & Time
              </label>
              <DateTimePicker date={endDate} setDate={setEndDate} disabled={isStartedOrCompleted} />
            </div>
          </div>

          {/* Location / Venue Section */}
          {hasPlaceId ? (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1 font-['Inter:Bold',sans-serif]">Booked ForSa Venue</span>
              <p className="font-bold text-slate-800 text-base font-['Inter:Bold',sans-serif]">{eventPlaceName}</p>
              <p className="text-xs text-slate-500 mt-1 font-['Inter:Regular',sans-serif] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {eventPlaceLocation}
              </p>
              {isLocationDisabled && (
                <p className="text-xs text-rose-500 font-semibold mt-2 flex items-center gap-1 font-['Inter:Bold',sans-serif]">
                  ⚠️ Location is locked because the event starts in less than 24 hours.
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-['Inter:Bold',sans-serif] font-bold text-slate-700">
                    Event Venue / Location
                  </label>
                  {isLocationDisabled && (
                    <span className="text-xs text-rose-500 font-bold flex items-center gap-1 font-['Inter:Bold',sans-serif]">
                      {"⚠️ Location locked (< 24h to start)"}
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    disabled={isLocationDisabled}
                    onClick={() => setHasOwnPlace(false)}
                    className={`flex-1 p-5 rounded-2xl border-2 text-left flex flex-col gap-2 transition-all ${!hasOwnPlace ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-200 hover:border-slate-300'} ${isLocationDisabled ? 'opacity-65 cursor-not-allowed bg-slate-50' : ''}`}
                  >
                    <span className="font-bold text-slate-800 text-sm font-['Inter:Bold',sans-serif]">Book a Registered ForSa Venue</span>
                    <span className="text-xs text-slate-500 leading-relaxed font-['Inter:Regular',sans-serif]">Submit a booking request to one of our premium venue owners. The event will remain a draft until booking is paid.</span>
                  </button>
                  <button
                    type="button"
                    disabled={isLocationDisabled}
                    onClick={() => setHasOwnPlace(true)}
                    className={`flex-1 p-5 rounded-2xl border-2 text-left flex flex-col gap-2 transition-all ${hasOwnPlace ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-200 hover:border-slate-300'} ${isLocationDisabled ? 'opacity-65 cursor-not-allowed bg-slate-50' : ''}`}
                  >
                    <span className="font-bold text-slate-800 text-sm font-['Inter:Bold',sans-serif]">Use My Own Venue / Location</span>
                    <span className="text-xs text-slate-500 leading-relaxed font-['Inter:Regular',sans-serif]">Specify your own address directly. The event will be published immediately on creation.</span>
                  </button>
                </div>
              </div>

              {hasOwnPlace && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-['Inter:Bold',sans-serif] font-bold text-slate-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-indigo-500" />
                      Custom Location Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="text" 
                        name="customLocation"
                        required
                        value={formData.customLocation}
                        onChange={handleChange}
                        disabled={isLocationDisabled}
                        placeholder="e.g. 28 Falaki St, Bab Al Louq, Cairo" 
                        className={cn(
                          "w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 shadow-sm rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 font-['Inter:Medium',sans-serif] text-slate-700 transition-all",
                          isLocationDisabled && "opacity-60 cursor-not-allowed bg-slate-100"
                        )}
                      />
                    </div>
                  </div>

                  <div className={isLocationDisabled ? "pointer-events-none opacity-60 bg-slate-50 rounded-2xl p-1" : ""}>
                    <p className="text-xs text-slate-500 mb-2 font-['Inter:Medium',sans-serif]">Pinpoint exact location on map</p>
                    <MapPicker
                      address={formData.customLocation}
                      latitude={mapLatitude}
                      longitude={mapLongitude}
                      googlePlaceId={null}
                      onChange={(data) => {
                        setFormData(prev => ({
                          ...prev,
                          customLocation: data.address
                        }));
                        setMapLatitude(data.latitude);
                        setMapLongitude(data.longitude);
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-['Inter:Bold',sans-serif] font-bold text-slate-700 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-indigo-500" />
                Total Tickets
              </label>
              <input 
                type="number" 
                name="totalTickets"
                required
                min="1"
                value={formData.totalTickets}
                onChange={handleChange}
                disabled={isStartedOrCompleted}
                placeholder="e.g. 500" 
                className={cn(
                  "w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 font-['Inter:Medium',sans-serif] text-slate-700 transition-all",
                  isStartedOrCompleted && "opacity-60 cursor-not-allowed bg-slate-100"
                )}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-['Inter:Bold',sans-serif] font-bold text-slate-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-indigo-500" />
                  Ticket Price (EGP)
                </label>
                {bookedTicketsCount > 0 && (
                  <span className="text-[11px] text-amber-600 font-bold font-['Inter:Bold',sans-serif]">
                    Locked (Tickets Booked)
                  </span>
                )}
              </div>
              <input 
                type="number" 
                name="ticketPrice"
                required
                min="0"
                step="0.01"
                value={formData.ticketPrice}
                onChange={handleChange}
                disabled={isTicketPriceDisabled}
                placeholder="e.g. 250" 
                className={cn(
                  "w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 font-['Inter:Medium',sans-serif] text-slate-700 transition-all",
                  isTicketPriceDisabled && "opacity-60 cursor-not-allowed bg-slate-100"
                )}
              />
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex justify-end gap-4 mt-8">
            <Link 
              to="/organizer/events"
              className="px-6 py-3.5 bg-white text-slate-700 border border-slate-200 font-['Inter:Bold',sans-serif] rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              Cancel
            </Link>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 bg-indigo-600 text-white font-['Inter:Bold',sans-serif] rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
