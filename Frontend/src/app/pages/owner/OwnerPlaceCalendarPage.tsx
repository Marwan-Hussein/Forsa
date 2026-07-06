import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Plus, Trash2, CheckCircle, Ban, CalendarCheck, Loader2 } from "lucide-react";
import { ownerApi } from "../../api/ownerApi";
import { toast } from "sonner";

interface AvailabilitySlot {
  id: number;
  date: string;
  startTime: string | null;
  endTime: string | null;
  status: string; // "Available" | "Blocked" | "Booked"
}

export default function OwnerPlaceCalendarPage() {
  const { placeId } = useParams();
  const navigate = useNavigate();
  
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [placeName, setPlaceName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState("Available"); // "Available" or "Blocked"

  useEffect(() => {
    fetchCalendarData();
  }, [placeId]);

  const fetchCalendarData = async () => {
    if (!placeId) return;
    try {
      setIsLoading(true);
      
      // Load place details to get the name
      const place = await ownerApi.getPlaceById(Number(placeId));
      setPlaceName(place.name);

      // Load availability calendar slots
      const data = await ownerApi.getPlaceCalendar(Number(placeId));
      setSlots(data || []);
    } catch (err: any) {
      toast.error("Failed to load availability calendar: " + (err.message || ""));
      navigate("/owner/places");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeId || !date) return;

    try {
      setIsSubmitting(true);
      
      // Map string status to enum int: Available = 4, Blocked = 6
      const statusInt = status === "Available" ? 4 : 6;
      
      const payload = {
        date: new Date(date).toISOString(),
        startTime: startTime ? startTime + ":00" : undefined,
        endTime: endTime ? endTime + ":00" : undefined,
        status: statusInt
      };

      await ownerApi.setPlaceAvailability(Number(placeId), payload);
      toast.success("Availability slot configured successfully!");
      
      // Clear form
      setDate("");
      setStartTime("");
      setEndTime("");
      setStatus("Available");

      // Reload slots
      const updatedSlots = await ownerApi.getPlaceCalendar(Number(placeId));
      setSlots(updatedSlots || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to add availability slot.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveSlot = async (slotId: number) => {
    if (!placeId) return;
    try {
      await ownerApi.removePlaceAvailability(Number(placeId), slotId);
      toast.success("Availability slot removed.");
      setSlots(slots.filter(s => s.id !== slotId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to remove slot.");
    }
  };

  const getStatusBadge = (statusStr: string) => {
    const st = statusStr.toLowerCase();
    if (st === "available") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 border border-emerald-100 text-emerald-700">
          <CheckCircle className="w-3.5 h-3.5" /> Available
        </span>
      );
    }
    if (st === "blocked") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 border border-slate-200 text-slate-700">
          <Ban className="w-3.5 h-3.5" /> Blocked
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 border border-indigo-100 text-indigo-700">
        <CalendarCheck className="w-3.5 h-3.5" /> Booked
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-slate-400 font-semibold text-sm">Loading Calendar...</p>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          to="/owner/places"
          className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 tracking-tight">Venue Availability Calendar</h1>
          <p className="text-slate-500 font-['Inter:Regular',sans-serif] mt-1">Manage open/blocked slots for <span className="font-bold text-slate-700">{placeName}</span>.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Add slot form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/50 shadow-sm h-fit">
          <h2 className="text-xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 mb-6 flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Plus className="w-5 h-5" />
            </div>
            Add Available Date
          </h2>
          
          <form onSubmit={handleAddSlot} className="space-y-5">
            <div>
              <label className="block text-sm font-['Inter:Medium',sans-serif] text-slate-700 mb-2">Select Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                required
                min={today}
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all font-['Inter:Medium',sans-serif] text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-['Inter:Medium',sans-serif] text-slate-700 mb-2">Start Time (Opt)</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all font-['Inter:Medium',sans-serif] text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-['Inter:Medium',sans-serif] text-slate-700 mb-2">End Time (Opt)</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all font-['Inter:Medium',sans-serif] text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-['Inter:Medium',sans-serif] text-slate-700 mb-2">Availability State</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStatus("Available")}
                  className={`py-3 rounded-xl border text-sm font-bold text-center transition-all cursor-pointer ${
                    status === "Available"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Available
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("Blocked")}
                  className={`py-3 rounded-xl border text-sm font-bold text-center transition-all cursor-pointer ${
                    status === "Blocked"
                      ? "bg-slate-200 border-slate-400 text-slate-800 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Blocked
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !date}
              className="w-full mt-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Adding Slot...
                </>
              ) : (
                "Save Availability Slot"
              )}
            </button>
          </form>
        </div>

        {/* Right Side: List of slots */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/50 shadow-sm">
          <h2 className="text-xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 mb-6 flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            Configured Availability Calendar
          </h2>

          {slots.length === 0 ? (
            <div className="text-center py-20 text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-25" />
              <p className="font-['Inter:Medium',sans-serif] text-base">No availability constraints configured yet.</p>
              <p className="text-sm mt-1 text-slate-500 font-['Inter:Regular',sans-serif]">By default, the venue can be requested on any date.</p>
            </div>
          ) : (
            <div className="overflow-hidden border border-slate-150 rounded-2xl">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-left">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Time Range</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {slots.map(slot => (
                    <tr key={slot.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800">
                          {new Date(slot.date).toLocaleDateString("en-EG", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {slot.startTime && slot.endTime 
                            ? `${slot.startTime.slice(0, 5)} - ${slot.endTime.slice(0, 5)}`
                            : "Full Day"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(slot.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {slot.status.toLowerCase() !== "booked" ? (
                          <button
                            onClick={() => handleRemoveSlot(slot.id)}
                            title="Remove Slot"
                            className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors border border-transparent hover:border-rose-150 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic pr-2">Linked to booking</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
