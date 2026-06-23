import { useState } from "react";
import { Link } from "react-router";
import { Plus, MapPin, Search, Edit2, Image as ImageIcon, Trash2, ShieldAlert, CheckCircle, Info, Building2, TrendingUp, CalendarCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface OwnerPlace {
  id: string;
  name: string;
  location: string;
  status: "approved" | "pending" | "rejected";
  bookingsCount: number;
  revenue: string;
}

const MOCK_PLACES: OwnerPlace[] = [
  { id: "1", name: "Grand Horizon Hall", location: "Cairo, Egypt", status: "approved", bookingsCount: 45, revenue: "$12,500" },
  { id: "2", name: "Downtown Meeting Room", location: "Giza, Egypt", status: "pending", bookingsCount: 0, revenue: "$0" },
  { id: "3", name: "Sunset Beach Venue", location: "Alexandria, Egypt", status: "rejected", bookingsCount: 0, revenue: "$0" },
];

export default function OwnerPlacesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPlaces = MOCK_PLACES.filter(place => 
    place.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    place.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: OwnerPlace["status"]) => {
    switch (status) {
      case "approved": return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-['Inter:Bold',sans-serif] shadow-sm"><CheckCircle className="w-3.5 h-3.5"/> Active</span>;
      case "pending": return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-['Inter:Bold',sans-serif] shadow-sm"><Info className="w-3.5 h-3.5"/> Pending</span>;
      case "rejected": return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-['Inter:Bold',sans-serif] shadow-sm"><ShieldAlert className="w-3.5 h-3.5"/> Rejected</span>;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 tracking-tight">My Venues</h1>
          <p className="text-slate-500 font-['Inter:Regular',sans-serif] mt-1">Manage your properties, bookings, and revenue.</p>
        </div>
        <Link 
          to="/owner/places/new"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-['Inter:Bold',sans-serif] font-bold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-md hover:shadow-lg hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Add New Venue
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[rgba(39,55,77,0.1)] p-6">
        <div className="relative max-w-lg mb-8">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search your venues..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 w-full font-['Inter:Medium',sans-serif] text-slate-700 transition-all shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredPlaces.map((place, index) => (
              <motion.div 
                key={place.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group bg-white border border-[rgba(39,55,77,0.1)] rounded-2xl overflow-hidden hover:shadow-xl hover:border-amber-500/30 transition-all duration-300 flex flex-col"
              >
                {/* Image Placeholder */}
                <div className="h-48 bg-slate-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-slate-300" />
                  </div>
                  <div className="absolute top-4 right-4 z-20">
                    {getStatusBadge(place.status)}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 z-20">
                    <h3 className="font-['Inter:Bold',sans-serif] font-bold text-xl text-white truncate">{place.name}</h3>
                    <div className="flex items-center gap-1.5 text-slate-300 text-sm mt-1">
                      <MapPin className="w-4 h-4" />
                      {place.location}
                    </div>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="p-5 flex-1">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <CalendarCheck className="w-4 h-4" />
                        <p className="text-xs font-['Inter:Medium',sans-serif] uppercase tracking-wider">Bookings</p>
                      </div>
                      <p className="font-['Inter:Bold',sans-serif] font-bold text-slate-800 text-xl">{place.bookingsCount}</p>
                    </div>
                    <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/50">
                      <div className="flex items-center gap-2 text-emerald-600 mb-1">
                        <TrendingUp className="w-4 h-4" />
                        <p className="text-xs font-['Inter:Medium',sans-serif] uppercase tracking-wider">Revenue</p>
                      </div>
                      <p className="font-['Inter:Bold',sans-serif] font-bold text-emerald-700 text-xl">{place.revenue}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors font-['Inter:Medium',sans-serif] text-[14px]">
                      <Edit2 className="w-4 h-4" />
                      Edit Info
                    </button>
                    <Link 
                      to={`/owner/places/${place.id}/media`}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors font-['Inter:Medium',sans-serif] text-[14px]"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Media
                    </Link>
                    <button className="col-span-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 border border-transparent hover:border-rose-200 rounded-xl transition-colors font-['Inter:Medium',sans-serif] text-[14px]">
                      <Trash2 className="w-4 h-4" />
                      Remove Venue
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {filteredPlaces.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Building2 className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-['Inter:Medium',sans-serif] text-lg">No venues found matching your search.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
