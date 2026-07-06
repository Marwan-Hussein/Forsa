import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus, MapPin, Search, Edit2, Image as ImageIcon, Trash2,
  ShieldAlert, CheckCircle, Building2, TrendingUp, CalendarCheck,
  Loader2, Info, AlertCircle, X, Sparkles, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ownerApi, Place } from "../../api/ownerApi";
import { toast } from "sonner";

export default function OwnerPlacesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [placeMedia, setPlaceMedia] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "";

  const getImageUrl = (url: string) => {
    if (url.startsWith("http")) return url;
    return `${baseUrl}${url}`;
  };

  useEffect(() => { fetchPlaces(); }, []);

  const fetchPlaces = async () => {
    try {
      setIsLoading(true);
      const data = await ownerApi.getPlaces();
      setPlaces(data);
      const mediaMap: Record<number, string> = {};
      await Promise.all(
        data.map(async (place) => {
          try {
            const media = await ownerApi.getPlaceMedia(place.id);
            if (media && media.length > 0) mediaMap[place.id] = media[0].mediaUrl;
          } catch { /* ignore */ }
        })
      );
      setPlaceMedia(mediaMap);
    } catch {
      toast.error("Failed to load your venues.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await ownerApi.deletePlace(id);
      toast.success("Venue removed successfully.");
      setPlaces(places.filter(p => p.id !== id));
      setDeletingId(null);
    } catch (e: any) {
      toast.error(e.message || "Failed to remove venue.");
    }
  };

  const filteredPlaces = places.filter(place =>
    place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusConfig = (status: number | string) => {
    const s = String(status).toLowerCase();
    if (s === "2" || s === "approved") return {
      label: "Active", icon: CheckCircle,
      className: "text-emerald-700 bg-emerald-50 border-emerald-200",
      dot: "bg-emerald-500",
    };
    if (s === "1" || s === "pending") return {
      label: "Pending", icon: Info,
      className: "text-amber-700 bg-amber-50 border-amber-200",
      dot: "bg-amber-500 animate-pulse",
    };
    if (s === "3" || s === "rejected") return {
      label: "Rejected", icon: ShieldAlert,
      className: "text-rose-700 bg-rose-50 border-rose-200",
      dot: "bg-rose-500",
    };
    return { label: String(status), icon: Info, className: "text-slate-500 bg-slate-50 border-slate-200", dot: "bg-slate-400" };
  };

  return (
    <div className="space-y-8 pb-12">
      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-700 font-['Inter:SemiBold',sans-serif] text-xs uppercase tracking-wider">All Systems Operational</span>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-5xl font-['Inter:Black',sans-serif] tracking-tight text-slate-900">
              My Venues
            </h1>
            <p className="text-slate-400 font-['Inter:Medium',sans-serif] mt-2 text-base">
              Manage, update and track all your listed venues.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/owner/places/new"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-lg shadow-blue-500/25 bg-gradient-to-r from-[var(--brand-blue-accent)] to-[var(--brand-navy)]"
            >
              <Plus className="w-4 h-4" />
              Add New Venue
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── SEARCH ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search venues by name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-14 pr-12 py-4 rounded-2xl text-base text-slate-700 placeholder:text-slate-400 bg-white border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 focus:outline-none transition-all shadow-sm"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        )}
      </motion.div>

      {/* ── CONTENT ── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-violet-100" />
            <div className="absolute inset-0 rounded-full border-4 border-violet-600 border-t-transparent animate-spin" />
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mt-2">Loading Venues</p>
        </div>
      ) : filteredPlaces.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-32 gap-6 bg-white rounded-3xl border border-slate-100 shadow-sm"
        >
          <div className="w-24 h-24 rounded-full flex items-center justify-center bg-slate-50 border border-slate-100 shadow-inner">
            <Building2 className="w-10 h-10 text-slate-300" />
          </div>
          <div className="text-center max-w-sm">
            <p className="text-slate-800 text-xl font-bold mb-2">{searchTerm ? "No venues match your search" : "No venues yet"}</p>
            <p className="text-slate-500 font-medium">{searchTerm ? "Try a different search term" : "Add your first venue to get started and accept bookings"}</p>
          </div>
          {!searchTerm && (
            <Link to="/owner/places/new" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white mt-4 bg-gradient-to-r from-violet-600 to-purple-600 shadow-lg shadow-violet-500/25 hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" /> Add Venue
            </Link>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredPlaces.map((place, index) => {
              const statusConfig = getStatusConfig(place.status);
              const isRejected = String(place.status).toLowerCase() === "3" || String(place.status).toLowerCase() === "rejected";
              const isPending = String(place.status).toLowerCase() === "1" || String(place.status).toLowerCase() === "pending";

              return (
                <motion.div
                  key={place.id}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: index * 0.06 }}
                  className="group bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Cover image */}
                  <div className="relative h-56 overflow-hidden flex-shrink-0">
                    {placeMedia[place.id] ? (
                      <img
                        src={getImageUrl(placeMedia[place.id])}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-50">
                        <Building2 className="w-16 h-16 text-violet-200" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

                    {/* Status badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border ${statusConfig.className} shadow-sm backdrop-blur-md`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Place name overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-white font-extrabold text-xl truncate">{place.name}</h3>
                      <div className="flex items-center gap-2 text-white/80 text-sm mt-1.5 font-medium">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{place.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Rejection reason */}
                    {isRejected && place.reason && (
                      <div className="mb-5 rounded-2xl p-4 bg-rose-50 border border-rose-100">
                        <div className="flex items-center gap-2 text-rose-700 text-sm font-bold mb-1.5">
                          <AlertCircle className="w-4 h-4" /> Rejection Reason
                        </div>
                        <p className="text-rose-600 text-xs leading-relaxed font-medium">{place.reason}</p>
                      </div>
                    )}

                    {/* Pending notice */}
                    {isPending && (
                      <div className="mb-5 rounded-2xl p-4 bg-amber-50 border border-amber-100">
                        <div className="flex items-center gap-2 text-amber-700 text-sm font-bold mb-1">
                          <Info className="w-4 h-4" /> Awaiting Admin Approval
                        </div>
                        <p className="text-amber-600/80 text-[12px] mt-1 font-medium">Your venue is under review and will be live soon.</p>
                      </div>
                    )}

                    {/* Pricing */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="rounded-2xl p-4 bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
                        <div className="flex items-center gap-2 text-slate-500 mb-1.5">
                          <CalendarCheck className="w-4 h-4" />
                          <span className="text-[11px] font-bold uppercase tracking-wider">Hourly</span>
                        </div>
                        <p className="text-slate-900 font-['Inter:Black',sans-serif] text-xl">
                          <span className="text-sm text-slate-500 font-medium mr-1">EGP</span>
                          {place.hourlyPrice}
                        </p>
                      </div>
                      <div className="rounded-2xl p-4 bg-emerald-50/50 border border-emerald-100 hover:border-emerald-200 transition-colors">
                        <div className="flex items-center gap-2 text-emerald-600 mb-1.5">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-[11px] font-bold uppercase tracking-wider">Daily</span>
                        </div>
                        <p className="text-emerald-700 font-['Inter:Black',sans-serif] text-xl">
                          <span className="text-sm text-emerald-600/70 font-medium mr-1">EGP</span>
                          {place.dailyPrice}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 mt-auto">
                      <Link
                        to={`/owner/places/${place.id}/edit`}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-800 bg-white border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
                      >
                        <Edit2 className="w-4 h-4" /> Edit Info
                      </Link>
                      <Link
                        to={`/owner/places/${place.id}/media`}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-800 bg-white border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
                      >
                        <ImageIcon className="w-4 h-4" /> Media
                      </Link>
                      <Link
                        to={`/owner/places/${place.id}/calendar`}
                        className="col-span-2 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50/50 border-2 border-indigo-100 hover:border-indigo-250 hover:bg-indigo-50 transition-all shadow-sm cursor-pointer"
                      >
                        <Calendar className="w-4 h-4" /> Manage Availability
                      </Link>
                      <button
                        onClick={() => setDeletingId(place.id)}
                        className="col-span-2 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-rose-600 hover:text-rose-700 bg-white border-2 border-rose-100 hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" /> Remove Venue
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      <AnimatePresence>
        {deletingId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/75"
              onClick={() => setDeletingId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              className="relative rounded-3xl w-full max-w-sm p-8 bg-white shadow-2xl border border-slate-100 text-center overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-rose-400 to-rose-600" />
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-rose-50 border-8 border-white shadow-sm mt-2">
                <Trash2 className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-slate-800 font-extrabold text-2xl mb-3">Remove Venue?</h3>
              <p className="text-slate-500 text-[15px] font-medium leading-relaxed mb-8">
                This venue will be permanently removed from the platform. This action cannot be undone.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleDelete(deletingId!)}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 bg-rose-500 shadow-[0_8px_20px_rgba(244,63,94,0.3)]"
                >
                  Yes, Remove Venue
                </button>
                <button
                  onClick={() => setDeletingId(null)}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
