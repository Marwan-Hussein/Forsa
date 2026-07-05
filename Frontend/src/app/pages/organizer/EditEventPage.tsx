import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Link } from "react-router";
import { ArrowLeft, Calendar, Tag, FileText, Ticket, DollarSign, LayoutList, RefreshCw, Image as ImageIcon } from "lucide-react";
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
    totalTickets: ""
  });
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await organizerApi.getEventDetails(Number(eventId));
        setFormData({
          title: data.title || "",
          description: data.description || "",
          category: data.category || "",
          ticketPrice: data.ticketPrice?.toString() || "",
          totalTickets: data.totalTickets?.toString() || ""
        });
        if (data.startDate) setStartDate(new Date(data.startDate));
        if (data.endDate) setEndDate(new Date(data.endDate));
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
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

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
      const dto = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ticketPrice: parseFloat(formData.ticketPrice),
        totalTickets: parseInt(formData.totalTickets, 10)
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
              Add/Replace Cover Image
            </label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 font-['Inter:Medium',sans-serif] text-slate-700 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
            {imageFile && (
              <p className="text-sm text-green-600 font-medium">Selected: {imageFile.name}</p>
            )}
            <p className="text-xs text-slate-500 mt-1">Uploading a new image will replace the current cover image (if any).</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-['Inter:Bold',sans-serif] font-bold text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                Start Date & Time
              </label>
              <DateTimePicker date={startDate} setDate={setStartDate} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-['Inter:Bold',sans-serif] font-bold text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                End Date & Time
              </label>
              <DateTimePicker date={endDate} setDate={setEndDate} />
            </div>
          </div>

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
                placeholder="e.g. 500" 
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 font-['Inter:Medium',sans-serif] text-slate-700 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-['Inter:Bold',sans-serif] font-bold text-slate-700 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-indigo-500" />
                Ticket Price (EGP)
              </label>
              <input 
                type="number" 
                name="ticketPrice"
                required
                min="0"
                step="0.01"
                value={formData.ticketPrice}
                onChange={handleChange}
                placeholder="e.g. 250" 
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 font-['Inter:Medium',sans-serif] text-slate-700 transition-all"
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
