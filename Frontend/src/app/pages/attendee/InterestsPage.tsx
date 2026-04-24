import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "../../api/api";
import {
  getAllInterests,
  getAttendeeInterests,
  getCurrentAttendeeId,
  updateAttendeeInterests,
  type InterestDto,
} from "../../lib/attendee-api";

interface Interest extends InterestDto {
  icon: string;
  color: string;
}

const interestStyles: Record<string, { icon: string; color: string }> = {
  business: { icon: "💼", color: "#155dfc" },
  music: { icon: "🎵", color: "#9810fa" },
  technology: { icon: "💻", color: "#0ea5e9" },
  sports: { icon: "⚽", color: "#16a34a" },
  art: { icon: "🎨", color: "#ec4899" },
  health: { icon: "🧘", color: "#8b5cf6" },
  education: { icon: "📚", color: "#eab308" },
  travel: { icon: "✈️", color: "#06b6d4" },
};

function mapInterest(interest: InterestDto): Interest {
  const style = interestStyles[interest.name.toLowerCase()] ?? {
    icon: "✨",
    color: "#526d82",
  };

  return {
    ...interest,
    icon: style.icon,
    color: style.color,
  };
}

function haveSameInterests(first: number[], second: number[]) {
  if (first.length !== second.length) {
    return false;
  }

  const sortedFirst = [...first].sort((a, b) => a - b);
  const sortedSecond = [...second].sort((a, b) => a - b);

  return sortedFirst.every((value, index) => value === sortedSecond[index]);
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (typeof error.data === "object" && error.data !== null && "errors" in error.data) {
      const errors = (error.data as { errors?: Record<string, string[]> }).errors;
      const firstMessage = errors && Object.values(errors)[0]?.[0];
      if (firstMessage) {
        return firstMessage;
      }
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

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

        if (!isActive) {
          return;
        }

        const nextSelectedInterests = attendeeInterests.map((interest) => interest.id);
        setAvailableInterests(allInterests.map(mapInterest));
        setSelectedInterests(nextSelectedInterests);
        setOriginalInterests(nextSelectedInterests);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setLoadError(getErrorMessage(error, "Failed to load interests."));
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadInterests();

    return () => {
      isActive = false;
    };
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
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] p-8 text-center">
            <h1 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[20px] text-foreground mb-2">
              Loading interests...
            </h1>
            <p className="font-['Inter:Regular',sans-serif] text-[14px] text-muted-foreground">
              Fetching your saved interests from the API.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] p-8 text-center">
            <h1 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[20px] text-foreground mb-2">
              Could not load interests
            </h1>
            <p className="font-['Inter:Regular',sans-serif] text-[14px] text-muted-foreground mb-4">
              {loadError}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-[#dde6ed] px-6 py-2 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] hover:bg-[#1e2936] transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/profile"
            className="inline-flex cursor-pointer items-center gap-2 mb-4 text-muted-foreground hover:text-foreground transition-colors font-['Inter:Regular',sans-serif] text-[14px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-accent" />
            <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[36px] text-foreground">
              Manage Your Interests
            </h1>
          </div>
          <p className="font-['Inter:Regular',sans-serif] text-[16px] text-muted-foreground">
            Select your interests to receive personalized event recommendations
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-background rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h3 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-foreground mb-2">
                Why select interests?
              </h3>
              <p className="font-['Inter:Regular',sans-serif] text-[14px] text-muted-foreground mb-2">
                We use your interests to:
              </p>
              <ul className="font-['Inter:Regular',sans-serif] text-[14px] text-muted-foreground space-y-1 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Recommend events you'll love</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Send you personalized notifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  <span>Help you discover new experiences</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Interests Selection */}
        <div className="bg-white rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[20px] text-foreground mb-1">
                Select Your Interests
              </h2>
              <p className="font-['Inter:Regular',sans-serif] text-[14px] text-muted-foreground">
                {selectedInterests.length} interest
                {selectedInterests.length !== 1 ? "s" : ""} selected
              </p>
            </div>
            {isModified && (
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="bg-white border-[0.8px] border-[rgba(82,109,130,0.2)] text-foreground px-6 py-2 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] hover:bg-[#f8f9fa] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-primary text-[#dde6ed] px-6 py-2 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] hover:bg-[#1e2936] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          {/* Interest Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {availableInterests.map((interest) => {
              const isSelected = selectedInterests.includes(interest.id);
              return (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`relative p-4 rounded-[12px] border-[0.8px] transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary shadow-md hover:brightness-110"
                      : "border-[rgba(82,109,130,0.2)] bg-white hover:border-muted hover:shadow-sm"
                  }`}
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                        isSelected ? "bg-white/10" : "bg-background"
                      }`}
                    >
                      {interest.icon}
                    </div>
                    <span
                      className={`font-['Inter:Medium',sans-serif] font-medium text-[14px] ${
                        isSelected ? "text-[#dde6ed]" : "text-foreground"
                      }`}
                    >
                      {interest.name}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Interests Summary */}
          {selectedInterests.length > 0 && (
            <div className="mt-8 pt-6 border-t border-[rgba(82,109,130,0.2)]">
              <h3 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-foreground mb-3">
                Your Selected Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedInterests.map((id) => {
                  const interest = availableInterests.find((i) => i.id === id);
                  if (!interest) return null;
                  return (
                    <div
                      key={id}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-background rounded-[8px] border-[0.8px] border-[rgba(82,109,130,0.2)]"
                    >
                      <span>{interest.icon}</span>
                      <span className="font-['Inter:Medium',sans-serif] font-medium text-[14px] text-foreground">
                        {interest.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
