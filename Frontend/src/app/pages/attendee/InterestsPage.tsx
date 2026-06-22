import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Save, Sparkles, Check, Flame } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "../../api/api";
import {
  getAllInterests,
  getAttendeeInterests,
  getCurrentAttendeeId,
  updateAttendeeInterests,
  type InterestDto,
} from "../../lib/attendee-api";
import { motion, AnimatePresence } from "motion/react";

interface Interest extends InterestDto {
  icon: string;
  color: string;
  bgGrad: string;
}

const interestStyles: Record<string, { icon: string; color: string; bgGrad: string }> = {
  business: { icon: "💼", color: "text-blue-600", bgGrad: "from-blue-500 to-indigo-600" },
  music: { icon: "🎵", color: "text-violet-600", bgGrad: "from-violet-500 to-purple-600" },
  technology: { icon: "💻", color: "text-cyan-600", bgGrad: "from-cyan-500 to-blue-600" },
  sports: { icon: "⚽", color: "text-emerald-600", bgGrad: "from-emerald-500 to-teal-600" },
  art: { icon: "🎨", color: "text-rose-600", bgGrad: "from-rose-400 to-pink-600" },
  health: { icon: "🧘", color: "text-fuchsia-600", bgGrad: "from-fuchsia-500 to-rose-600" },
  education: { icon: "📚", color: "text-amber-600", bgGrad: "from-amber-400 to-orange-500" },
  travel: { icon: "✈️", color: "text-sky-600", bgGrad: "from-sky-400 to-blue-500" },
};

function mapInterest(interest: InterestDto): Interest {
  const style = interestStyles[interest.name.toLowerCase()] ?? {
    icon: "✨",
    color: "text-slate-600",
    bgGrad: "from-slate-500 to-slate-700"
  };

  return {
    ...interest,
    icon: style.icon,
    color: style.color,
    bgGrad: style.bgGrad,
  };
}

function haveSameInterests(first: number[], second: number[]) {
  if (first.length !== second.length) return false;
  const sortedFirst = [...first].sort((a, b) => a - b);
  const sortedSecond = [...second].sort((a, b) => a - b);
  return sortedFirst.every((value, index) => value === sortedSecond[index]);
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (typeof error.data === "object" && error.data !== null && "errors" in error.data) {
      const errors = (error.data as { errors?: Record<string, string[]> }).errors;
      const firstMessage = errors && Object.values(errors)[0]?.[0];
      if (firstMessage) return firstMessage;
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export default function InterestsPage() {
  const attendeeId = getCurrentAttendeeId();
  const [availableInterests, setAvailableInterests] = useState<Interest[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const [originalInterests, setOriginalInterests] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isModified = !haveSameInterests(selectedInterests, originalInterests);

  useEffect(() => {
    let isActive = true;

    async function loadInterests() {
      try {
        setIsLoading(true);
        setLoadError(null);

        const [allInterests, attendeeInterests] = await Promise.all([
          getAllInterests(),
          getAttendeeInterests(attendeeId),
        ]);

        if (!isActive) return;

        const nextSelectedInterests = attendeeInterests.map((interest) => interest.id);
        setAvailableInterests(allInterests.map(mapInterest));
        setSelectedInterests(nextSelectedInterests);
        setOriginalInterests(nextSelectedInterests);
      } catch (error) {
        if (!isActive) return;
        setLoadError(getErrorMessage(error, "Failed to load interests."));
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadInterests();
    return () => { isActive = false; };
  }, [attendeeId]);

  const toggleInterest = (interestId: number) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updatedProfile = await updateAttendeeInterests(attendeeId, selectedInterests);
      const nextSelectedInterests = updatedProfile.interests.map((interest) => interest.id);

      setSelectedInterests(nextSelectedInterests);
      setOriginalInterests(nextSelectedInterests);
      toast.success("Interests updated successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update interests."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedInterests([...originalInterests]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-12 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-500 font-['Inter:Medium',sans-serif]">Curating your interests...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-xl shadow-slate-200/50">
          <Flame className="w-16 h-16 text-rose-500 mx-auto mb-4 opacity-50" />
          <h1 className="font-['Inter:Bold',sans-serif] text-2xl text-slate-800 mb-2">Oops! Couldn't load interests</h1>
          <p className="font-['Inter:Medium',sans-serif] text-slate-500 mb-8">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-['Inter:Bold',sans-serif] hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 mb-6 text-slate-500 hover:text-blue-600 transition-colors font-['Inter:Medium',sans-serif] text-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Profile
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <h1 className="font-['Inter:Bold',sans-serif] text-4xl text-slate-800 mb-3 tracking-tight flex items-center justify-center sm:justify-start gap-3">
                <Sparkles className="w-8 h-8 text-amber-500" />
                Personalize Your Feed
              </h1>
              <p className="font-['Inter:Medium',sans-serif] text-slate-500 text-lg max-w-xl">
                Tell us what you love, and we'll curate the best events and experiences specifically for you.
              </p>
            </div>
            
            <AnimatePresence>
              {isModified && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-3 justify-center sm:justify-end"
                >
                  <button
                    onClick={handleReset}
                    className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-['Inter:Bold',sans-serif] text-sm hover:bg-slate-50 transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-['Inter:Bold',sans-serif] text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/30 disabled:opacity-70"
                  >
                    {isSaving ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Save Changes
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Selected Counter */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
          <h2 className="font-['Inter:Bold',sans-serif] text-xl text-slate-800">
            Select Interests
          </h2>
          <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full font-['Inter:Bold',sans-serif] text-sm border border-blue-100">
            {selectedInterests.length} Selected
          </span>
        </div>

        {/* Interest Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {availableInterests.map((interest) => {
            const isSelected = selectedInterests.includes(interest.id);
            return (
              <motion.button
                key={interest.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleInterest(interest.id)}
                className={`relative overflow-hidden p-6 rounded-3xl border-2 transition-all cursor-pointer text-left h-40 flex flex-col justify-end group ${
                  isSelected
                    ? "border-transparent shadow-xl shadow-blue-500/20"
                    : "border-slate-200 bg-white hover:border-blue-200 hover:shadow-md"
                }`}
              >
                {/* Background Gradient for Selected */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${interest.bgGrad} transition-opacity duration-300 ${
                    isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-5"
                  }`} 
                />
                
                <div className="relative z-10">
                  <div className={`text-4xl mb-3 transition-transform duration-300 ${isSelected ? "scale-110" : ""}`}>
                    {interest.icon}
                  </div>
                  <span className={`font-['Inter:Bold',sans-serif] text-lg transition-colors ${
                    isSelected ? "text-white" : "text-slate-800"
                  }`}>
                    {interest.name}
                  </span>
                </div>

                {/* Checkmark Badge */}
                <div className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isSelected ? "bg-white scale-100" : "bg-slate-100 scale-0"
                }`}>
                  <Check className={`w-3.5 h-3.5 ${interest.color}`} />
                </div>
              </motion.button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
