import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Save, Sparkles } from "lucide-react";

interface Interest {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const availableInterests: Interest[] = [
  { id: "business", name: "Business", icon: "💼", color: "#155dfc" },
  { id: "music", name: "Music", icon: "🎵", color: "#9810fa" },
  { id: "technology", name: "Technology", icon: "💻", color: "#0ea5e9" },
  { id: "sports", name: "Sports", icon: "⚽", color: "#16a34a" },
  { id: "art", name: "Art & Design", icon: "🎨", color: "#ec4899" },
  { id: "food", name: "Food & Drink", icon: "🍽️", color: "#f97316" },
  { id: "health", name: "Health & Wellness", icon: "🧘", color: "#8b5cf6" },
  { id: "education", name: "Education", icon: "📚", color: "#eab308" },
  { id: "travel", name: "Travel", icon: "✈️", color: "#06b6d4" },
  { id: "gaming", name: "Gaming", icon: "🎮", color: "#a855f7" },
  { id: "fashion", name: "Fashion", icon: "👗", color: "#ec4899" },
  { id: "photography", name: "Photography", icon: "📸", color: "#64748b" },
  { id: "film", name: "Film & Media", icon: "🎬", color: "#dc2626" },
  { id: "networking", name: "Networking", icon: "🤝", color: "#0891b2" },
  { id: "charity", name: "Charity & Causes", icon: "❤️", color: "#ef4444" },
  { id: "science", name: "Science", icon: "🔬", color: "#10b981" },
];

export default function InterestsPage() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "business",
    "technology",
    "music",
  ]);
  const [isModified, setIsModified] = useState(false);
  const [originalInterests, setOriginalInterests] = useState<string[]>([
    "business",
    "technology",
    "music",
  ]);

  const toggleInterest = (interestId: string) => {
    setSelectedInterests((prev) => {
      const newInterests = prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId];
      setIsModified(
        JSON.stringify(newInterests.sort()) !==
          JSON.stringify(originalInterests.sort())
      );
      return newInterests;
    });
  };

  const handleSave = () => {
    setOriginalInterests([...selectedInterests]);
    setIsModified(false);
    alert("Interests updated successfully! (This is a demo)");
  };

  const handleReset = () => {
    setSelectedInterests([...originalInterests]);
    setIsModified(false);
  };

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
                  className="bg-primary text-[#dde6ed] px-6 py-2 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] hover:bg-[#1e2936] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
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
