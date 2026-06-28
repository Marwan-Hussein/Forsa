import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Upload, Trash2, Image as ImageIcon, Info, Loader2, Edit2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ownerApi, PlaceMediaDto } from "../../api/ownerApi";
import { toast } from "sonner";

export default function OwnerPlaceMediaPage() {
  const { placeId } = useParams();
  const [media, setMedia] = useState<PlaceMediaDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  // States for upload
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // States for editing a single image
  const [isReplacing, setIsReplacing] = useState<number | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const [targetEditId, setTargetEditId] = useState<number | null>(null);

  // States for delete modal
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    fetchMedia();
  }, [placeId]);

  const fetchMedia = async () => {
    try {
      setIsLoading(true);
      const data = await ownerApi.getPlaceMedia(Number(placeId));
      setMedia(data);
    } catch (error) {
      toast.error("Failed to load media gallery.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const validFiles = filesArray.filter(file => file.size <= 5 * 1024 * 1024);
      if (validFiles.length !== filesArray.length) {
        toast.error("Some files were too large and were ignored. Max size is 5MB.");
      }
      setSelectedFiles(validFiles);
    }
  };

  const handleEditSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && targetEditId !== null) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File is too large. Max size is 5MB.");
        return;
      }
      
      const oldId = targetEditId;
      setTargetEditId(null);
      
      try {
        setIsReplacing(oldId);
        
        // 1. Upload new image
        const formData = new FormData();
        formData.append(`mediaFiles[0].File`, file);
        formData.append(`mediaFiles[0].MediaType`, "1");
        
        const newMedia = await ownerApi.uploadPlaceMedia(Number(placeId), formData);
        
        // 2. Delete old image (silently ignore if it fails to delete)
        try {
          await ownerApi.deletePlaceMedia(Number(placeId), oldId);
        } catch (err) {
          console.warn("Could not delete old image after replacing");
        }

        // 3. Update state
        setMedia(prev => {
          const filtered = prev.filter(m => m.id !== oldId);
          return [...filtered, ...newMedia];
        });
        
        toast.success("Image replaced successfully!");
      } catch (error) {
        toast.error("Failed to replace image.");
      } finally {
        setIsReplacing(null);
        if (editInputRef.current) editInputRef.current.value = "";
      }
    }
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      setIsUploading(true);
      const formData = new FormData();
      selectedFiles.forEach((file, index) => {
        formData.append(`mediaFiles[${index}].File`, file);
        formData.append(`mediaFiles[${index}].MediaType`, "1");
      });

      const newMedia = await ownerApi.uploadPlaceMedia(Number(placeId), formData);
      setMedia([...media, ...newMedia]);
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Photos uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload photos. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirmId === null) return;
    
    const id = deleteConfirmId;
    setDeleteConfirmId(null);
    
    try {
      await ownerApi.deletePlaceMedia(Number(placeId), id);
      setMedia(media.filter(m => m.id !== id));
      toast.success("Image deleted successfully.");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete image.");
    }
  };

  const getImageUrl = (url: string) => {
    if (url.startsWith("http")) return url;
    return `${baseUrl}${url}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto space-y-8 pb-12"
      >
        <div className="flex items-center gap-4">
          <Link 
            to="/owner/places"
            className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 rounded-xl transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 tracking-tight">Media Gallery</h1>
            <p className="text-slate-500 font-['Inter:Regular',sans-serif] mt-1">Manage photos for this venue</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-[rgba(39,55,77,0.1)] p-6 sm:p-8 sticky top-28 group hover:border-blue-500/30 transition-colors">
              <h2 className="text-xl font-['Inter:Bold',sans-serif] font-bold text-slate-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Upload className="w-5 h-5" />
                </div>
                Upload New
              </h2>
              
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
              
              {/* Hidden input specifically for replacing a single image */}
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={editInputRef}
                onChange={handleEditSelect}
              />

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:bg-slate-50 hover:border-blue-500/50 transition-colors cursor-pointer mb-6"
              >
                <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <p className="font-['Inter:Bold',sans-serif] font-bold text-slate-800 text-[15px] mb-1">
                  {selectedFiles.length > 0 ? `${selectedFiles.length} files selected` : "Click to browse"}
                </p>
                <p className="text-xs font-['Inter:Medium',sans-serif] text-slate-500">Max size 5MB per image</p>
              </div>
              
              <button 
                onClick={uploadFiles}
                disabled={selectedFiles.length === 0 || isUploading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-['Inter:Bold',sans-serif] font-bold rounded-xl hover:shadow-lg hover:shadow-blue-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</>
                ) : (
                  "Upload Files"
                )}
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
                        src={getImageUrl(item.mediaUrl)} 
                        alt="Venue" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      
                      {isReplacing === item.id && (
                        <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
                          <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                          <span className="text-white font-['Inter:Medium',sans-serif] text-sm">Replacing...</span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120]/90 via-[#0B1120]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-5 flex items-center justify-end gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <button 
                            onClick={() => {
                              setTargetEditId(item.id);
                              editInputRef.current?.click();
                            }}
                            disabled={isReplacing === item.id}
                            className="p-2 bg-white/20 hover:bg-blue-500 backdrop-blur-md text-white rounded-lg transition-all shadow-md"
                            title="Replace Image"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirmId(item.id)}
                            disabled={isReplacing === item.id}
                            className="p-2 bg-white/20 hover:bg-rose-500 backdrop-blur-md text-white rounded-lg transition-all shadow-md"
                            title="Delete Image"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
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

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setDeleteConfirmId(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden p-6"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-['Inter:Bold',sans-serif] text-slate-800 mb-2">Delete Image?</h3>
                <p className="text-slate-500 font-['Inter:Regular',sans-serif] text-[15px] mb-6">
                  Are you sure you want to permanently delete this photo? This action cannot be undone.
                </p>
                <div className="flex w-full gap-3">
                  <button 
                    onClick={() => setDeleteConfirmId(null)}
                    className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 font-['Inter:Medium',sans-serif] rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="flex-1 py-3 px-4 bg-rose-500 text-white font-['Inter:Medium',sans-serif] rounded-xl hover:bg-rose-600 transition-colors shadow-sm"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
