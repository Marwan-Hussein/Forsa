import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Upload, MapPin, DollarSign, Users, Wifi, Coffee, Music, Info, Building2 } from "lucide-react";
import { motion } from "motion/react";

export default function OwnerAddPlacePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      navigate("/owner/places");
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-8 pb-12"
    >
      <div className="flex items-center gap-4">
        <Link 
          to="/owner/places"
          className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 rounded-xl transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 tracking-tight">Add New Venue</h1>
          <p className="text-slate-500 font-['Inter:Regular',sans-serif] mt-1">Submit a new venue for admin approval to start receiving bookings.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-[rgba(39,55,77,0.1)] p-6 sm:p-8 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Building2 className="w-32 h-32" />
          </div>
          
          <h2 className="text-xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 mb-8 flex items-center gap-3 relative z-10">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Info className="w-5 h-5" />
            </div>
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="md:col-span-2">
              <label className="block text-sm font-['Inter:Bold',sans-serif] font-bold text-slate-700 mb-2">Venue Name <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                required
                placeholder="e.g. Grand Horizon Hall"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all font-['Inter:Medium',sans-serif] text-slate-800"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-['Inter:Bold',sans-serif] font-bold text-slate-700 mb-2">Description <span className="text-rose-500">*</span></label>
              <textarea 
                required
                rows={4}
                placeholder="Describe your venue, its atmosphere, and what makes it special..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all resize-none font-['Inter:Medium',sans-serif] text-slate-800"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-['Inter:Bold',sans-serif] font-bold text-slate-700 mb-2">Location / Address <span className="text-rose-500">*</span></label>
              <div className="relative">
                <MapPin className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 123 Main St, Cairo"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all font-['Inter:Medium',sans-serif] text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-['Inter:Bold',sans-serif] font-bold text-slate-700 mb-2">Capacity (Max Persons) <span className="text-rose-500">*</span></label>
              <div className="relative">
                <Users className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="number" 
                  required
                  min="1"
                  placeholder="e.g. 500"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-white transition-all font-['Inter:Medium',sans-serif] text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Amenities */}
        <div className="bg-white rounded-2xl shadow-sm border border-[rgba(39,55,77,0.1)] p-6 sm:p-8 group hover:border-amber-500/30 transition-colors">
          <h2 className="text-xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 mb-8 flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            Pricing & Amenities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div>
              <label className="block text-sm font-['Inter:Bold',sans-serif] font-bold text-slate-700 mb-2">Price Per Hour ($) <span className="text-rose-500">*</span></label>
              <div className="relative">
                <DollarSign className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="number" 
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white transition-all font-['Inter:Medium',sans-serif] text-slate-800"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-['Inter:Bold',sans-serif] font-bold text-slate-700 mb-2">Price Per Day ($) <span className="text-rose-500">*</span></label>
              <div className="relative">
                <DollarSign className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="number" 
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white transition-all font-['Inter:Medium',sans-serif] text-slate-800"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-['Inter:Bold',sans-serif] font-bold text-slate-700 mb-4">Select Amenities Provided</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: "Free WiFi", icon: Wifi },
                { name: "Catering", icon: Coffee },
                { name: "Sound System", icon: Music },
                { name: "Parking", icon: MapPin },
              ].map((amenity) => (
                <label key={amenity.name} className="flex flex-col items-center justify-center gap-3 p-5 border-2 border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-amber-500/30 transition-all has-[:checked]:bg-amber-50/50 has-[:checked]:border-amber-500">
                  <input type="checkbox" className="sr-only" />
                  <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                    <amenity.icon className="w-6 h-6 text-slate-600" />
                  </div>
                  <span className="text-[14px] font-['Inter:Bold',sans-serif] font-bold text-slate-700">{amenity.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Primary Image Upload */}
        <div className="bg-white rounded-2xl shadow-sm border border-[rgba(39,55,77,0.1)] p-6 sm:p-8 group hover:border-amber-500/30 transition-colors">
          <h2 className="text-xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 mb-6 flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Upload className="w-5 h-5" />
            </div>
            Primary Cover Image
          </h2>
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center hover:bg-slate-50 hover:border-amber-500/50 transition-colors cursor-pointer">
            <div className="w-20 h-20 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-amber-500 transition-colors" />
            </div>
            <p className="font-['Inter:Bold',sans-serif] font-bold text-slate-800 text-lg mb-2">Click to upload or drag and drop</p>
            <p className="text-sm font-['Inter:Medium',sans-serif] text-slate-500 mb-6">SVG, PNG, JPG or GIF (max. 5MB)</p>
            <button type="button" className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] font-['Inter:Bold',sans-serif] font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
              Browse Files
            </button>
          </div>
          <div className="mt-6 bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[14px] font-['Inter:Medium',sans-serif] text-blue-800">
              Note: This is just the main cover image. You can add more photos to build a complete gallery in the "Media Gallery" section after the venue is created.
            </p>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 pt-4">
          <Link 
            to="/owner/places"
            className="w-full sm:w-auto px-8 py-3.5 text-slate-600 font-['Inter:Bold',sans-serif] font-bold hover:bg-slate-100 rounded-xl transition-colors text-center"
          >
            Cancel
          </Link>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-10 py-3.5 bg-gradient-to-r from-[#0B1120] to-[#1E3D61] text-white font-['Inter:Bold',sans-serif] font-bold rounded-xl hover:shadow-lg hover:shadow-[#1E3D61]/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit Venue for Approval
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
