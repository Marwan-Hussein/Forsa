import { useState } from "react";
import { Search, MapPin, CheckCircle, XCircle, Info, Filter, MoreHorizontal, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Place {
  id: string;
  name: string;
  ownerName: string;
  location: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

const MOCK_PLACES: Place[] = [
  { id: "1", name: "Grand Horizon Hall", ownerName: "Ahmed Ali", location: "Cairo, Egypt", status: "pending", submittedAt: "2026-06-20" },
  { id: "2", name: "Tech Hub Coworking", ownerName: "Tech Corp", location: "Alexandria, Egypt", status: "approved", submittedAt: "2026-06-15" },
  { id: "3", name: "Sunset Beach Resort", ownerName: "Sara Sayed", location: "Hurghada, Egypt", status: "rejected", submittedAt: "2026-06-10" },
];

export default function ManagePlacesPage() {
  const [places, setPlaces] = useState<Place[]>(MOCK_PLACES);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredPlaces = places.filter(place => {
    const matchesSearch = place.name.toLowerCase().includes(searchTerm.toLowerCase()) || place.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || place.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = (id: string, newStatus: Place["status"]) => {
    setPlaces(places.map(p => {
      if (p.id === id) {
        return { ...p, status: newStatus };
      }
      return p;
    }));
  };

  const getStatusBadge = (status: Place["status"]) => {
    switch (status) {
      case "pending": return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-['Inter:Bold',sans-serif] shadow-sm"><Info className="w-3.5 h-3.5"/> Pending</span>;
      case "approved": return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-['Inter:Bold',sans-serif] shadow-sm"><CheckCircle className="w-3.5 h-3.5"/> Approved</span>;
      case "rejected": return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-['Inter:Bold',sans-serif] shadow-sm"><XCircle className="w-3.5 h-3.5"/> Rejected</span>;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 tracking-tight">Manage Venues</h1>
          <p className="text-slate-500 font-['Inter:Regular',sans-serif] mt-1">Review and approve new venue submissions.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search venues..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-[rgba(39,55,77,0.1)] rounded-xl focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/50 shadow-sm transition-all w-full sm:w-64 font-['Inter:Regular',sans-serif] text-[14px]"
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-white border border-[rgba(39,55,77,0.1)] rounded-xl focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/50 shadow-sm transition-all w-full appearance-none cursor-pointer font-['Inter:Medium',sans-serif] text-[14px] text-slate-700"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[rgba(39,55,77,0.1)] overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-[13px] font-['Inter:Medium',sans-serif] uppercase tracking-wider">
                <th className="px-6 py-4">Venue Details</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {filteredPlaces.map((place) => (
                  <motion.tr 
                    key={place.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm border border-indigo-200/50 group-hover:scale-105 transition-transform">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-['Inter:Bold',sans-serif] font-bold text-slate-800">{place.name}</p>
                          <p className="text-sm font-['Inter:Regular',sans-serif] text-slate-500 mt-0.5">By {place.ownerName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-[14px] font-['Inter:Medium',sans-serif] text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {place.location}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(place.status)}
                    </td>
                    <td className="px-6 py-5 text-[14px] font-['Inter:Medium',sans-serif] text-slate-600">
                      {place.submittedAt}
                    </td>
                    <td className="px-6 py-5 text-right">
                      {place.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => updateStatus(place.id, "approved")}
                            className="p-2 text-emerald-600 bg-white hover:bg-emerald-50 border border-emerald-200 shadow-sm rounded-lg transition-colors"
                            title="Approve Venue"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => updateStatus(place.id, "rejected")}
                            className="p-2 text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 shadow-sm rounded-lg transition-colors"
                            title="Reject Venue"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button className="text-[#3b82f6] hover:text-[#2563eb] font-['Inter:Medium',sans-serif] text-[14px] transition-colors">
                          View Details
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredPlaces.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Search className="w-8 h-8 mb-3 opacity-20" />
                      <p className="font-['Inter:Medium',sans-serif]">No venues found matching your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
