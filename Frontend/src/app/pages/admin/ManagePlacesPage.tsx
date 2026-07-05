import { useState, useEffect } from "react";
import { Search, MapPin, Users, DollarSign, CheckCircle, XCircle, Loader2, Sparkles, AlertCircle, Trash2, List } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { adminApi, PlaceDetailsDTO } from "../../api/adminApi";

type TabView = "pending" | "all";

export default function ManagePlacesPage() {
  const [places, setPlaces] = useState<PlaceDetailsDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabView>("pending");

  const [rejectingPlace, setRejectingPlace] = useState<PlaceDetailsDTO | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [deletingPlace, setDeletingPlace] = useState<PlaceDetailsDTO | null>(null);

  async function fetchPlaces() {
    setLoading(true);
    try {
      const data = activeTab === "pending" 
        ? await adminApi.getPendingPlaces()
        : await adminApi.getAllPlaces();
      setPlaces(data ?? []);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to load places");
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPlaces();
  }, [activeTab]);

  const filtered = places.filter(p => {
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.location?.toLowerCase().includes(q) ||
      p.facilityName?.toLowerCase().includes(q)
    );
  });

  async function handleApprove(place: PlaceDetailsDTO) {
    try {
      await adminApi.updatePlaceStatus(place.placeId, 2); // 2 = Approved
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <span><strong className="text-slate-800">{place.name}</strong> has been approved.</span>
        </div>
      );
      if (activeTab === "pending") {
        setPlaces(prev => prev.filter(p => p.placeId !== place.placeId));
      } else {
        fetchPlaces(); // Refresh status if we are in "all"
      }
    } catch (e: any) {
      toast.error(`Approval failed: ${e.message}`);
    }
  }

  async function handleReject() {
    if (!rejectingPlace) return;
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }

    setSubmitting(true);
    try {
      await adminApi.updatePlaceStatus(rejectingPlace.placeId, 3, rejectReason); // 3 = Rejected
      toast.success(
        <div className="flex items-center gap-2">
          <XCircle className="w-5 h-5 text-rose-500" />
          <span><strong className="text-slate-800">{rejectingPlace.name}</strong> was rejected.</span>
        </div>
      );
      if (activeTab === "pending") {
        setPlaces(prev => prev.filter(p => p.placeId !== rejectingPlace.placeId));
      } else {
        fetchPlaces(); // Refresh status
      }
      setRejectingPlace(null);
      setRejectReason("");
    } catch (e: any) {
      toast.error(`Rejection failed: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deletingPlace) return;
    setSubmitting(true);
    try {
      await adminApi.deletePlace(deletingPlace.placeId);
      toast.success(
        <div className="flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-500" />
          <span><strong className="text-slate-800">{deletingPlace.name}</strong> has been deleted.</span>
        </div>
      );
      setPlaces(prev => prev.filter(p => p.placeId !== deletingPlace.placeId));
      setDeletingPlace(null);
    } catch (e: any) {
      toast.error(`Deletion failed: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  const renderStatusBadge = (status: string | number) => {
    const statusStr = String(status).toLowerCase();
    
    if (statusStr === "pending" || statusStr === "1") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200/50 text-[12px] font-['Inter:Bold',sans-serif] shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Pending
        </span>
      );
    }
    if (statusStr === "approved" || statusStr === "available" || statusStr === "2") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/50 text-[12px] font-['Inter:Bold',sans-serif] shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Approved
        </span>
      );
    }
    if (statusStr === "rejected" || statusStr === "3") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200/50 text-[12px] font-['Inter:Bold',sans-serif] shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Rejected
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200/50 text-[12px] font-['Inter:Bold',sans-serif] shadow-sm">
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto pb-12 relative z-0">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
      >
        <div className="relative">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-4">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-blue-700 text-sm font-['Inter:SemiBold',sans-serif]">Venue Moderation</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-['Inter:Bold',sans-serif] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
            {activeTab === "pending" ? "Pending Venues" : "All Venues"}
          </h1>
          <p className="text-slate-500 font-['Inter:Medium',sans-serif] mt-3 text-[16px] max-w-xl">
            {activeTab === "pending" 
              ? "Review and approve new places submitted by owners before they go live on the platform." 
              : "View all active and inactive venues across the platform."}
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-4 w-full lg:w-auto">
          {/* Tabs */}
          <div className="relative flex bg-slate-100/80 p-1.5 rounded-xl backdrop-blur-md border border-slate-200">
            {activeTab === "pending" && (
              <motion.div 
                layoutId="activeTabBg" 
                className="absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-0.375rem)] bg-white rounded-lg shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {activeTab === "all" && (
              <motion.div 
                layoutId="activeTabBg" 
                className="absolute top-1.5 bottom-1.5 right-1.5 w-[calc(50%-0.375rem)] bg-white rounded-lg shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            
            <button
              onClick={() => setActiveTab("pending")}
              className={`relative z-10 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-['Inter:SemiBold',sans-serif] w-40 transition-colors ${
                activeTab === "pending" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <AlertCircle className="w-4 h-4" /> Pending
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`relative z-10 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-['Inter:SemiBold',sans-serif] w-40 transition-colors ${
                activeTab === "all" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <List className="w-4 h-4" /> All Venues
            </button>
          </div>

          <div className="relative w-full lg:w-[360px] group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
            <div className="relative flex items-center bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-300 transition-all">
              <Search className="w-5 h-5 ml-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search venues by name or location..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-3 pr-4 py-3.5 bg-transparent border-none focus:outline-none font-['Inter:Medium',sans-serif] text-[14px] text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white/50 backdrop-blur-xl rounded-[2rem] border border-white shadow-sm">
          <div className="w-16 h-16 relative flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
          </div>
          <p className="text-slate-600 font-['Inter:Bold',sans-serif] mt-4 tracking-wide text-sm">FETCHING VENUES</p>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-32 bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white shadow-sm"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-200/50">
            <MapPin className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-slate-900 font-['Inter:Bold',sans-serif] text-[20px] mb-2 tracking-tight">Queue is Empty</h3>
          <p className="text-slate-500 font-['Inter:Medium',sans-serif] text-[15px] max-w-md text-center">
            {search 
              ? "No venues match your search." 
              : activeTab === "pending" 
                ? "Awesome! You've reviewed all pending venues. Take a coffee break ☕"
                : "There are no venues available on the platform yet."}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map((place, i) => (
              <motion.div
                layout
                key={place.placeId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ delay: i * 0.05, duration: 0.4, type: "spring", bounce: 0.3 }}
                className="group relative bg-white rounded-[2rem] p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-1 border border-slate-100 transition-all duration-300 flex flex-col"
              >
                {/* Status Badge */}
                <div className="absolute top-6 right-6 z-10">
                  {renderStatusBadge(place.status)}
                </div>

                <div className="flex items-start gap-4 mb-5 pr-24">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border border-blue-200/50 shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform mt-1">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[17px] leading-tight font-['Inter:Bold',sans-serif] text-slate-900 line-clamp-2 mb-1">{place.name}</h3>
                    <p className="text-[13px] font-['Inter:Medium',sans-serif] text-slate-500 line-clamp-1 flex items-center gap-1.5">
                      {place.facilityName}
                    </p>
                  </div>
                </div>

                <p className="text-slate-600 font-['Inter:Regular',sans-serif] text-[14px] leading-relaxed line-clamp-3 mb-6 flex-1">
                  {place.description}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <Users className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[11px] font-['Inter:SemiBold',sans-serif] text-slate-400 uppercase tracking-wider">Capacity</p>
                      <p className="text-[13px] font-['Inter:Bold',sans-serif] text-slate-700">{place.capacity} pax</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <DollarSign className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[11px] font-['Inter:SemiBold',sans-serif] text-slate-400 uppercase tracking-wider">Hourly</p>
                      <p className="text-[13px] font-['Inter:Bold',sans-serif] text-slate-700">{place.hourlyPrice} EGP</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 col-span-2">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <MapPin className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-['Inter:SemiBold',sans-serif] text-slate-400 uppercase tracking-wider">Location</p>
                      <p className="text-[13px] font-['Inter:Bold',sans-serif] text-slate-700 truncate">{place.location}</p>
                    </div>
                  </div>
                </div>

                {/* Actions depending on Tab & Status */}
                <div className="grid grid-cols-2 gap-3 mt-auto">
                  {String(place.status).toLowerCase() === "pending" || String(place.status) === "1" ? (
                    <>
                      <button 
                        onClick={() => setRejectingPlace(place)}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white border-2 border-rose-100 text-rose-600 font-['Inter:Bold',sans-serif] text-[14px] hover:bg-rose-50 hover:border-rose-200 transition-all hover:-translate-y-0.5 shadow-sm"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                      <button 
                        onClick={() => handleApprove(place)}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 text-white font-['Inter:Bold',sans-serif] text-[14px] hover:bg-emerald-600 shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_20px_rgba(16,185,129,0.4)] transition-all hover:-translate-y-0.5"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => setDeletingPlace(place)}
                      className="col-span-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-white border-2 border-red-100 text-red-600 font-['Inter:Bold',sans-serif] text-[14px] hover:bg-red-50 hover:border-red-200 transition-all hover:-translate-y-0.5 shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Place
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectingPlace && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !submitting && setRejectingPlace(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-400 to-rose-600" />
              
              <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mb-6">
                <AlertCircle className="w-7 h-7 text-rose-500" />
              </div>

              <h2 className="text-2xl font-['Inter:Bold',sans-serif] text-slate-900 mb-2">Reject Venue</h2>
              <p className="text-slate-500 font-['Inter:Medium',sans-serif] text-[15px] mb-6">
                You are about to reject <strong>{rejectingPlace.name}</strong>. Please provide a reason to notify the owner.
              </p>

              <textarea 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., The provided photos are unclear, or the description is incomplete..."
                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl resize-none focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 font-['Inter:Medium',sans-serif] text-[14px] text-slate-700 placeholder:text-slate-400 transition-all mb-8"
              />

              <div className="flex justify-end gap-3">
                <button 
                  disabled={submitting}
                  onClick={() => {
                    setRejectingPlace(null);
                    setRejectReason("");
                  }}
                  className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-['Inter:Bold',sans-serif] text-[14px] hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  disabled={submitting}
                  onClick={handleReject}
                  className="px-6 py-3 rounded-xl bg-rose-500 text-white font-['Inter:Bold',sans-serif] text-[14px] hover:bg-rose-600 shadow-[0_4px_15px_rgba(225,29,72,0.3)] hover:shadow-[0_8px_20px_rgba(225,29,72,0.4)] hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:translate-y-0"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Rejection"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingPlace && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !submitting && setDeletingPlace(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 to-red-600" />
              
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>

              <h2 className="text-2xl font-['Inter:Bold',sans-serif] text-slate-900 mb-3">Delete Venue</h2>
              <p className="text-slate-500 font-['Inter:Medium',sans-serif] text-[15px] mb-8 leading-relaxed">
                Are you sure you want to permanently delete <strong>{deletingPlace.name}</strong>? This action cannot be undone and the venue will be removed from the platform.
              </p>

              <div className="flex flex-col gap-3">
                <button 
                  disabled={submitting}
                  onClick={handleDelete}
                  className="w-full py-3.5 rounded-xl bg-red-500 text-white font-['Inter:Bold',sans-serif] text-[15px] hover:bg-red-600 shadow-[0_4px_15px_rgba(239,68,68,0.3)] hover:shadow-[0_8px_20px_rgba(239,68,68,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Yes, delete venue"}
                </button>
                <button 
                  disabled={submitting}
                  onClick={() => setDeletingPlace(null)}
                  className="w-full py-3.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-['Inter:Bold',sans-serif] text-[15px] hover:bg-slate-50 transition-colors disabled:opacity-50"
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
