import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Building2, Info, MapPin, DollarSign, Loader2, Users } from "lucide-react";
import { ownerApi, UpdatePlaceDto } from "../../api/ownerApi";
import { toast } from "sonner";
import MapPicker from "../../components/map/MapPicker";

export default function OwnerEditPlacePage() {
  const navigate = useNavigate();
  const { placeId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState<UpdatePlaceDto>({
    name: "",
    location: "",
    description: "",
    capacity: 100,
    dailyPrice: 0,
    hourlyPrice: 0,
  });

  useEffect(() => {
    const fetchPlace = async () => {
      if (!placeId) return;
      try {
        setIsLoading(true);
        const place = await ownerApi.getPlaceById(Number(placeId));
        setFormData({
          name: place.name || "",
          location: place.location || "",
          description: place.description || "",
          capacity: place.capacity || 100,
          dailyPrice: place.dailyPrice || 0,
          hourlyPrice: place.hourlyPrice || 0,
          latitude: place.latitude,
          longitude: place.longitude,
        });
      } catch (error) {
        toast.error("Failed to load venue details.");
        navigate("/owner/places");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlace();
  }, [placeId, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes("Price") || name === "capacity" ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeId) return;
    try {
      setIsSubmitting(true);
      const submissionData = {
        ...formData,
        latitude: formData.latitude ?? 30.0444,
        longitude: formData.longitude ?? 31.2357,
      };

      await ownerApi.updatePlace(Number(placeId), submissionData);
      toast.success("Venue updated successfully!");
      navigate(`/owner/places`); 
    } catch (error) {
      toast.error("Failed to update venue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-4">
        <Link 
          to="/owner/places"
          className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 rounded-xl transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 tracking-tight">Edit Venue</h1>
          <p className="text-slate-500 font-['Inter:Regular',sans-serif] mt-1">Update the details of your property.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-[rgba(39,55,77,0.1)] p-6 sm:p-8 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Building2 className="w-32 h-32" />
          </div>
          
          <h2 className="text-xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 mb-8 flex items-center gap-3 relative z-10">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Info className="w-5 h-5" />
            </div>
            Basic Information
          </h2>

          <div className="space-y-6 relative z-10">
            <div>
              <label className="block text-sm font-['Inter:Medium',sans-serif] text-slate-700 mb-2">Venue Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g. Grand Horizon Hall"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all font-['Inter:Medium',sans-serif] text-slate-800"
              />
            </div>
            
            <div>
              <label className="block text-sm font-['Inter:Medium',sans-serif] text-slate-700 mb-2">Description <span className="text-red-500">*</span></label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Describe your venue, its atmosphere, and what makes it special..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all resize-none font-['Inter:Medium',sans-serif] text-slate-800"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-['Inter:Medium',sans-serif] text-slate-700 mb-2">Location / Address <span className="text-red-500">*</span></label>
                
                {/* Fallback standard input in case Google Maps breaks the MapPicker input */}
                <div className="relative mb-4">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="Type address manually here (if map below is broken)..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-blue-200 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-['Inter:Medium',sans-serif] text-slate-800"
                  />
                </div>

                <div className="opacity-70">
                  <p className="text-xs text-slate-500 mb-2 font-['Inter:Medium',sans-serif]">Optional: Pinpoint exact location on map</p>
                  <MapPicker
                    address={formData.location}
                    latitude={formData.latitude ?? null}
                    longitude={formData.longitude ?? null}
                    googlePlaceId={null}
                    onChange={(data) => {
                      setFormData(prev => ({
                        ...prev,
                        location: data.address,
                        latitude: data.latitude,
                        longitude: data.longitude
                      }));
                    }}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-['Inter:Medium',sans-serif] text-slate-700 mb-2">Capacity (Persons) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  <input 
                    type="number" 
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    required
                    min="1"
                    placeholder="e.g. 500"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all font-['Inter:Medium',sans-serif] text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl shadow-sm border border-[rgba(39,55,77,0.1)] p-6 sm:p-8 group hover:border-blue-500/30 transition-colors">
          <h2 className="text-xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 mb-8 flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            Pricing Configuration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-['Inter:Medium',sans-serif] text-slate-700 mb-2">Hourly Price (EGP) <span className="text-red-500">*</span></label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-['Inter:Bold',sans-serif] text-slate-400 group-hover:text-emerald-500 transition-colors">EGP</span>
                <input 
                  type="number" 
                  name="hourlyPrice"
                  value={formData.hourlyPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="0.00"
                  className="w-full pl-14 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white transition-all font-['Inter:Medium',sans-serif] text-slate-800"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-['Inter:Medium',sans-serif] text-slate-700 mb-2">Daily Price (EGP) <span className="text-red-500">*</span></label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-['Inter:Bold',sans-serif] text-slate-400 group-hover:text-emerald-500 transition-colors">EGP</span>
                <input 
                  type="number" 
                  name="dailyPrice"
                  value={formData.dailyPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="0.00"
                  className="w-full pl-14 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white transition-all font-['Inter:Medium',sans-serif] text-slate-800"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2 font-['Inter:Regular',sans-serif]">Daily rate is usually cheaper than booking by the hour.</p>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 pt-4">
          <Link 
            to="/owner/places"
            className="w-full sm:w-auto px-8 py-3.5 bg-white border border-slate-200 text-slate-600 font-['Inter:Bold',sans-serif] font-bold rounded-xl hover:bg-slate-50 transition-colors text-center"
          >
            Cancel
          </Link>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-10 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-['Inter:Bold',sans-serif] font-bold rounded-xl hover:shadow-lg hover:shadow-blue-600/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Updating Venue...
              </>
            ) : (
              "Update Venue"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
