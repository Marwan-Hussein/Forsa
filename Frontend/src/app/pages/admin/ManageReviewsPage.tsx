import { useState } from "react";
import { Search, Star, MessageSquare, Trash2, ShieldAlert, Filter, AlertCircle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Review {
  id: string;
  author: string;
  targetName: string; // e.g., Venue or Event name
  targetType: "Venue" | "Event";
  rating: number;
  comment: string;
  date: string;
  status: "published" | "flagged";
}

const MOCK_REVIEWS: Review[] = [
  { id: "1", author: "Ahmed Ali", targetName: "Tech Conference 2026", targetType: "Event", rating: 5, comment: "Amazing experience, very well organized.", date: "2026-06-20", status: "published" },
  { id: "2", author: "Sara Sayed", targetName: "Grand Horizon Hall", targetType: "Venue", rating: 1, comment: "The AC was broken and staff was rude.", date: "2026-06-18", status: "flagged" },
  { id: "3", author: "Omar Tarek", targetName: "Summer Music Festival", targetType: "Event", rating: 4, comment: "Great bands, but food was too expensive.", date: "2026-06-15", status: "published" },
];

export default function ManageReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredReviews = reviews.filter(r => {
    const matchesSearch = r.author.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.targetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const deleteReview = (id: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      setReviews(reviews.filter(r => r.id !== id));
    }
  };

  const approveReview = (id: string) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, status: "published" } : r));
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
    ));
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
          <h1 className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 tracking-tight">Manage Reviews</h1>
          <p className="text-slate-500 font-['Inter:Regular',sans-serif] mt-1">Moderate user reviews to keep the platform safe and reliable.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search reviews..." 
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
              <option value="published">Published</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[rgba(39,55,77,0.1)] overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-[13px] font-['Inter:Medium',sans-serif] uppercase tracking-wider">
                <th className="px-6 py-4">Author & Target</th>
                <th className="px-6 py-4">Rating & Review</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {filteredReviews.map((review) => (
                  <motion.tr 
                    key={review.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center text-amber-600 shrink-0 shadow-sm border border-amber-200/50 group-hover:scale-105 transition-transform">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-['Inter:Bold',sans-serif] font-bold text-slate-800">{review.author}</p>
                          <p className="text-sm font-['Inter:Regular',sans-serif] text-slate-500 mt-0.5">
                            {review.targetType}: <span className="font-['Inter:Medium',sans-serif] text-slate-700">{review.targetName}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-[14px] font-['Inter:Regular',sans-serif] text-slate-600 max-w-sm" title={review.comment}>
                          "{review.comment}"
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {review.status === "flagged" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-['Inter:Bold',sans-serif] shadow-sm">
                          <ShieldAlert className="w-3.5 h-3.5" /> Flagged
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-xs font-['Inter:Medium',sans-serif] shadow-sm">
                          Published
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {review.status === 'flagged' && (
                          <button 
                            onClick={() => approveReview(review.id)}
                            className="p-2 text-emerald-600 bg-white hover:bg-emerald-50 border border-emerald-200 shadow-sm rounded-lg transition-colors"
                            title="Approve & Publish Review"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => deleteReview(review.id)}
                          className="p-2 text-rose-500 bg-white hover:bg-rose-50 border border-rose-200 shadow-sm rounded-lg transition-colors"
                          title="Delete Review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredReviews.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <MessageSquare className="w-8 h-8 mb-3 opacity-20" />
                      <p className="font-['Inter:Medium',sans-serif]">No reviews found matching your filters.</p>
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
