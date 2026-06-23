import { useEffect, useState } from "react";
import { Link } from "react-router";
import { User, Mail, Phone, MapPin, Calendar, Save, ArrowLeft, Camera, Shield, Bell } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "../../api/api";
import {
  getAttendeeProfile,
  getCurrentAttendeeId,
  updateAttendeeProfile,
  type AttendeeProfileDto,
  type UpdateAttendeeProfileRequest,
} from "../../lib/attendee-api";
import { motion } from "motion/react";

const emptyFormData: UpdateAttendeeProfileRequest = {
  fullName: "",
  userName: "",
  email: "",
  phoneNumber: "",
  location: "",
  birthDate: "",
};

const validationFieldMap: Record<string, keyof UpdateAttendeeProfileRequest> = {
  FullName: "fullName",
  UserName: "userName",
  Email: "email",
  PhoneNumber: "phoneNumber",
  Location: "location",
  BirthDate: "birthDate",
};

function mapProfileToForm(profile: AttendeeProfileDto): UpdateAttendeeProfileRequest {
  return {
    fullName: profile.fullName ?? "",
    userName: profile.userName ?? "",
    email: profile.email ?? "",
    phoneNumber: profile.phoneNumber ?? "",
    location: profile.location ?? "",
    birthDate: profile.birthDate ? profile.birthDate.slice(0, 10) : "",
  };
}

function getValidationErrors(error: unknown) {
  if (!(error instanceof ApiError) || typeof error.data !== "object" || error.data === null) {
    return {} as Partial<Record<keyof UpdateAttendeeProfileRequest, string>>;
  }

  const rawErrors = (error.data as { errors?: Record<string, string[]> }).errors;
  if (!rawErrors) {
    return {} as Partial<Record<keyof UpdateAttendeeProfileRequest, string>>;
  }

  const nextErrors: Partial<Record<keyof UpdateAttendeeProfileRequest, string>> = {};

  for (const [field, messages] of Object.entries(rawErrors)) {
    const mappedField = validationFieldMap[field];
    if (mappedField && Array.isArray(messages) && typeof messages[0] === "string") {
      nextErrors[mappedField] = messages[0];
    }
  }

  return nextErrors;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export default function ProfilePage() {
  const attendeeId = getCurrentAttendeeId();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateAttendeeProfileRequest>(emptyFormData);
  const [originalData, setOriginalData] = useState<UpdateAttendeeProfileRequest>(emptyFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof UpdateAttendeeProfileRequest, string>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      try {
        setIsLoading(true);
        setLoadError(null);

        const profile = await getAttendeeProfile(attendeeId);
        if (!isActive) return;

        const mappedProfile = mapProfileToForm(profile);
        setFormData(mappedProfile);
        setOriginalData(mappedProfile);
      } catch (error) {
        if (!isActive) return;
        setLoadError(getErrorMessage(error, "Failed to load profile."));
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadProfile();
    return () => { isActive = false; };
  }, [attendeeId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof UpdateAttendeeProfileRequest;

    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof UpdateAttendeeProfileRequest, string>> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.userName.trim()) newErrors.userName = "Username is required";
    else if (formData.userName.length < 3) newErrors.userName = "Username must be at least 3 characters";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Please enter a valid email";
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.birthDate) newErrors.birthDate = "Birthdate is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setOriginalData({ ...formData });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ ...originalData });
    setErrors({});
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      const updatedProfile = await updateAttendeeProfile(attendeeId, formData);
      const mappedProfile = mapProfileToForm(updatedProfile);
      setFormData(mappedProfile);
      setOriginalData(mappedProfile);
      setErrors({});
      setIsEditing(false);
      toast.success("Profile updated successfully.");
    } catch (error) {
      const serverErrors = getValidationErrors(error);
      if (Object.keys(serverErrors).length > 0) setErrors(serverErrors);
      toast.error(getErrorMessage(error, "Failed to update profile."));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-12 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-500 font-['Inter:Medium',sans-serif]">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-xl shadow-slate-200/50">
          <Shield className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h1 className="font-['Inter:Bold',sans-serif] text-2xl text-slate-800 mb-2">Could not load profile</h1>
          <p className="font-['Inter:Medium',sans-serif] text-slate-500 mb-8">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-['Inter:Bold',sans-serif] hover:bg-blue-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-10">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 mb-6 text-slate-500 hover:text-blue-600 transition-colors font-['Inter:Medium',sans-serif] text-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-['Inter:Bold',sans-serif] text-4xl text-slate-800 mb-2 tracking-tight">
                Account Settings
              </h1>
              <p className="font-['Inter:Medium',sans-serif] text-slate-500">
                Manage your profile, preferences, and account security
              </p>
            </div>
            <Link
              to="/interests"
              className="inline-flex items-center justify-center bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-['Inter:Bold',sans-serif] text-sm hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
            >
              Manage Interests
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Avatar & Summary */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
              
              <div className="relative mb-6 inline-block">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center border-4 border-white shadow-lg mx-auto relative z-10">
                  <span className="font-['Inter:Bold',sans-serif] text-5xl text-white">
                    {formData.fullName.charAt(0) || "U"}
                  </span>
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 shadow-sm transition-all z-20">
                    <Camera className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              <h2 className="font-['Inter:Bold',sans-serif] text-2xl text-slate-800 mb-1">
                {formData.fullName || "User Name"}
              </h2>
              <p className="font-['Inter:Medium',sans-serif] text-slate-500 mb-6">
                @{formData.userName || "username"}
              </p>
              
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                <div>
                  <p className="font-['Inter:Medium',sans-serif] text-slate-500 text-sm mb-1">Events</p>
                  <p className="font-['Inter:Bold',sans-serif] text-2xl text-slate-800">12</p>
                </div>
                <div>
                  <p className="font-['Inter:Medium',sans-serif] text-slate-500 text-sm mb-1">Upcoming</p>
                  <p className="font-['Inter:Bold',sans-serif] text-2xl text-blue-600">5</p>
                </div>
              </div>
            </motion.div>

            {/* Quick Settings Links */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors border-b border-slate-100 group">
                <div className="flex items-center gap-3 text-slate-700 font-['Inter:Bold',sans-serif]">
                  <Shield className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                  Security
                </div>
              </button>
              <button className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-3 text-slate-700 font-['Inter:Bold',sans-serif]">
                  <Bell className="w-5 h-5 text-slate-400 group-hover:text-rose-500" />
                  Notifications
                </div>
              </button>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-8 sm:p-10"
            >
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                <h2 className="font-['Inter:Bold',sans-serif] text-2xl text-slate-800">
                  Personal Details
                </h2>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="bg-blue-50 text-blue-600 px-5 py-2.5 rounded-xl font-['Inter:Bold',sans-serif] text-sm hover:bg-blue-100 transition-colors"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCancel}
                      className="text-slate-500 hover:text-slate-700 font-['Inter:Bold',sans-serif] text-sm px-4 py-2 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-['Inter:Bold',sans-serif] text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-70 shadow-sm"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label htmlFor="fullName" className="block font-['Inter:Medium',sans-serif] text-sm text-slate-700">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isEditing ? 'text-blue-500 group-focus-within:text-blue-600' : 'text-slate-400'}`} />
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl border ${
                        isEditing
                          ? "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white"
                          : "border-transparent bg-slate-50 text-slate-500 cursor-not-allowed"
                      } font-['Inter:Medium',sans-serif] text-slate-800 transition-all outline-none`}
                    />
                  </div>
                  {errors.fullName && <p className="text-sm font-['Inter:Medium',sans-serif] text-rose-500 mt-1">{errors.fullName}</p>}
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <label htmlFor="userName" className="block font-['Inter:Medium',sans-serif] text-sm text-slate-700">
                    Username
                  </label>
                  <div className="relative group">
                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-['Inter:Bold',sans-serif] transition-colors ${isEditing ? 'text-blue-500 group-focus-within:text-blue-600' : 'text-slate-400'}`}>@</span>
                    <input
                      type="text"
                      id="userName"
                      name="userName"
                      value={formData.userName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3.5 rounded-xl border ${
                        isEditing
                          ? "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white"
                          : "border-transparent bg-slate-50 text-slate-500 cursor-not-allowed"
                      } font-['Inter:Medium',sans-serif] text-slate-800 transition-all outline-none`}
                    />
                  </div>
                  {errors.userName && <p className="text-sm font-['Inter:Medium',sans-serif] text-rose-500 mt-1">{errors.userName}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="email" className="block font-['Inter:Medium',sans-serif] text-sm text-slate-700">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isEditing ? 'text-blue-500 group-focus-within:text-blue-600' : 'text-slate-400'}`} />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl border ${
                        isEditing
                          ? "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white"
                          : "border-transparent bg-slate-50 text-slate-500 cursor-not-allowed"
                      } font-['Inter:Medium',sans-serif] text-slate-800 transition-all outline-none`}
                    />
                  </div>
                  {errors.email && <p className="text-sm font-['Inter:Medium',sans-serif] text-rose-500 mt-1">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label htmlFor="phoneNumber" className="block font-['Inter:Medium',sans-serif] text-sm text-slate-700">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isEditing ? 'text-blue-500 group-focus-within:text-blue-600' : 'text-slate-400'}`} />
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl border ${
                        isEditing
                          ? "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white"
                          : "border-transparent bg-slate-50 text-slate-500 cursor-not-allowed"
                      } font-['Inter:Medium',sans-serif] text-slate-800 transition-all outline-none`}
                    />
                  </div>
                  {errors.phoneNumber && <p className="text-sm font-['Inter:Medium',sans-serif] text-rose-500 mt-1">{errors.phoneNumber}</p>}
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label htmlFor="location" className="block font-['Inter:Medium',sans-serif] text-sm text-slate-700">
                    Location
                  </label>
                  <div className="relative group">
                    <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isEditing ? 'text-blue-500 group-focus-within:text-blue-600' : 'text-slate-400'}`} />
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl border ${
                        isEditing
                          ? "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white"
                          : "border-transparent bg-slate-50 text-slate-500 cursor-not-allowed"
                      } font-['Inter:Medium',sans-serif] text-slate-800 transition-all outline-none`}
                    />
                  </div>
                  {errors.location && <p className="text-sm font-['Inter:Medium',sans-serif] text-rose-500 mt-1">{errors.location}</p>}
                </div>

                {/* Birthdate */}
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="birthDate" className="block font-['Inter:Medium',sans-serif] text-sm text-slate-700">
                    Date of Birth
                  </label>
                  <div className="relative group">
                    <Calendar className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isEditing ? 'text-blue-500 group-focus-within:text-blue-600' : 'text-slate-400'}`} />
                    <input
                      type="date"
                      id="birthDate"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl border ${
                        isEditing
                          ? "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-white"
                          : "border-transparent bg-slate-50 text-slate-500 cursor-not-allowed"
                      } font-['Inter:Medium',sans-serif] text-slate-800 transition-all outline-none`}
                    />
                  </div>
                  {errors.birthDate && <p className="text-sm font-['Inter:Medium',sans-serif] text-rose-500 mt-1">{errors.birthDate}</p>}
                </div>

              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
