import { useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Upload, Trash2, Image as ImageIcon, Star, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MediaItem {
  id: string;
  url: string;
  isPrimary: boolean;
}

const MOCK_MEDIA: MediaItem[] = [
  { id: "1", url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=1000", isPrimary: true },
  { id: "2", url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=1000", isPrimary: false },
  { id: "3", url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000", isPrimary: false },
];

export default function OwnerPlaceMediaPage() {
  const { placeId } = useParams();
  const [media, setMedia] = useState<MediaItem[]>(MOCK_MEDIA);

  const deleteMedia = (id: string) => {
    if (window.confirm("Delete this image?")) {
      setMedia(media.filter(m => m.id !== id));
    }
  };

  const setPrimary = (id: string) => {
    setMedia(media.map(m => ({
      ...m,
      isPrimary: m.id === id
    })));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto space-y-8 pb-12"
    >
      <div className="flex items-center gap-4">
        <Link 
          to="/owner/places"
          className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 rounded-xl transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 tracking-tight">Media Gallery</h1>
          <p className="text-slate-500 font-['Inter:Regular',sans-serif] mt-1">Manage photos for <span className="font-['Inter:Medium',sans-serif] text-slate-700">Grand Horizon Hall</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-[rgba(39,55,77,0.1)] p-6 sm:p-8 sticky top-28 group hover:border-amber-500/30 transition-colors">
            <h2 className="text-xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 mb-6 flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Upload className="w-5 h-5" />
              </div>
              Upload New
            </h2>
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:bg-slate-50 hover:border-amber-500/50 transition-colors cursor-pointer mb-6">
              <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-8 h-8 text-slate-400 group-hover:text-amber-500 transition-colors" />
              </div>
              <p className="font-['Inter:Bold',sans-serif] font-bold text-slate-800 text-[15px] mb-1">Click to browse</p>
              <p className="text-xs font-['Inter:Medium',sans-serif] text-slate-500">Max size 5MB per image</p>
            </div>
            <button className="w-full py-3.5 bg-gradient-to-r from-[#0B1120] to-[#1E3D61] text-white font-['Inter:Bold',sans-serif] font-bold rounded-xl hover:shadow-lg hover:shadow-[#1E3D61]/30 transition-all">
              Upload Files
            </button>

            <div className="mt-6 bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-start gap-3">
              <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
              <p className="text-[13px] font-['Inter:Regular',sans-serif] text-slate-600 leading-relaxed">
                High-quality photos increase your booking rate by up to <span className="font-['Inter:Bold',sans-serif]">40%</span>. Ensure good lighting and horizontal orientation.
              </p>
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-[rgba(39,55,77,0.1)] p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <AnimatePresence>
                {media.map((item) => (
                  <motion.div 
                    key={item.id} 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                    className="group relative rounded-2xl overflow-hidden border border-[rgba(39,55,77,0.1)] aspect-[4/3] shadow-sm hover:shadow-xl transition-all"
                  >
                    <img 
                      src={item.url} 
                      alt="Venue" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120]/90 via-[#0B1120]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-5 flex items-center justify-between transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        {item.isPrimary ? (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-[13px] font-['Inter:Bold',sans-serif] font-bold rounded-lg shadow-md">
                            <Star className="w-4 h-4 fill-white" /> Cover
                          </span>
                        ) : (
                          <button 
                            onClick={() => setPrimary(item.id)}
                            className="px-3 py-1.5 bg-white/20 hover:bg-amber-500 backdrop-blur-md text-white text-[13px] font-['Inter:Bold',sans-serif] font-bold rounded-lg transition-all"
                          >
                            Set as Cover
                          </button>
                        )}
                        <button 
                          onClick={() => deleteMedia(item.id)}
                          className="p-2 bg-white/20 hover:bg-rose-500 backdrop-blur-md text-white rounded-lg transition-all shadow-md"
                          title="Delete Image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {item.isPrimary && (
                      <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-[13px] font-['Inter:Bold',sans-serif] font-bold rounded-lg shadow-lg">
                        <Star className="w-4 h-4 fill-white" /> Cover
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {media.length === 0 && (
                <div className="col-span-1 sm:col-span-2 text-center py-20 text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <ImageIcon className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                  <p className="font-['Inter:Medium',sans-serif] text-lg">No photos uploaded yet.</p>
                  <p className="text-sm mt-1">Upload photos to showcase your venue.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </motion.div>
  );
}
