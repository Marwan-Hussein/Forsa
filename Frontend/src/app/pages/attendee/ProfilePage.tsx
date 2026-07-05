import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { User, Mail, Phone, MapPin, Calendar, Save, ArrowLeft, Camera, Shield, Bell, Star } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "../../api/api";
import { attendeeApi } from "../../api/attendeeApi";
import { AttendeeProfileDto, UpdateAttendeeProfileDto } from "../../types";
import { getUserIdFromToken } from "../../api/api";
import { motion } from "motion/react";

type ProfileFormData = UpdateAttendeeProfileDto & { userName: string; email: string };

const emptyFormData: ProfileFormData = {
  fullName: "",
  userName: "",
  email: "",
  phoneNumber: "",
  location: "",
  birthDate: "",
};

const validationFieldMap: Record<string, keyof ProfileFormData> = {
  FullName: "fullName",
  PhoneNumber: "phoneNumber",
  Location: "location",
  BirthDate: "birthDate",
};

function mapProfileToForm(profile: AttendeeProfileDto): ProfileFormData {
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
    return {} as Partial<Record<keyof ProfileFormData, string>>;
  }

  const rawErrors = (error.data as { errors?: Record<string, string[]> }).errors;
  if (!rawErrors) return {} as Partial<Record<keyof ProfileFormData, string>>;

  const nextErrors: Partial<Record<keyof ProfileFormData, string>> = {};

  for (const [field, messages] of Object.entries(rawErrors)) {
    const mappedField = validationFieldMap[field] as keyof ProfileFormData;
    if (mappedField) {
      nextErrors[mappedField] = messages[0];
    } else {
      nextErrors[field as keyof ProfileFormData] = messages[0];
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
  const attendeeId = getUserIdFromToken();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>(emptyFormData);
  const [originalData, setOriginalData] = useState<ProfileFormData>(emptyFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!attendeeId) {
      navigate("/login");
      return;
    }
    let isActive = true;

    async function loadProfile() {
      try {
        setIsLoading(true);
        setLoadError(null);

        const profile = await attendeeApi.getProfile(attendeeId!);
        if (!isActive) return;

        const mappedProfile = mapProfileToForm(profile);
        setFormData(mappedProfile);
        setOriginalData(mappedProfile);
        setProfilePictureUrl(profile.profilePicture || null);
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
    const fieldName = name as keyof ProfileFormData;

    setFormData((prev: any) => ({ ...prev, [fieldName]: value }));
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof ProfileFormData, string>> = {};
    if (!formData.fullName?.trim()) newErrors.fullName = "Full name is required";
    if (!formData.phoneNumber?.trim()) newErrors.phoneNumber = "Phone number is required";
    if (!formData.location?.trim()) newErrors.location = "Location is required";
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
      const { userName, email, ...updateDto } = formData;
      const updatedProfile = await attendeeApi.updateProfile(attendeeId!, updateDto);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    try {
      const url = await attendeeApi.uploadProfilePicture(attendeeId!, file);
      setProfilePictureUrl(url);
      toast.success("Profile picture updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
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
    <div className="min-h-screen bg-[var(--brand-page-background)]">
      {/* Cover Hero */}
      <div className="bg-gradient-to-br from-[var(--brand-hero-deep)] via-[var(--brand-navy)] to-[var(--brand-hero-dark)] pt-24 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm font-medium mb-6 group transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Dashboard
          </Link>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">My Profile</h1>
              <p className="text-blue-100/70 mt-1">Manage your account and preferences</p>
            </div>
            <Link to="/interests" className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all">
              <Bell className="w-4 h-4" /> Manage Interests
            </Link>
          </div>
        </div>
      </div>

      {/* Content pulled up over hero */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14">
        
        {/* Header */}
        <div className="mb-6">
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Avatar Card */}
          <div className="lg:col-span-4 space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-[var(--brand-navy)]/5 overflow-hidden text-center"
            >
              <div className="relative pt-8 pb-6 px-8">
                <div className="relative mb-4 inline-block">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[var(--brand-navy)] to-[var(--brand-hero-dark)] flex items-center justify-center border-4 border-white shadow-lg mx-auto overflow-hidden">
                    {profilePictureUrl ? (
                      <img src={`${import.meta.env.VITE_API_BASE_URL || ""}${profilePictureUrl}`} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-bold text-slate-400">
                        {formData.fullName?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-[var(--brand-navy)] rounded-xl flex items-center justify-center text-white shadow-md hover:bg-[var(--brand-navy-hover)] transition-colors cursor-pointer">

                      <Camera className="w-4 h-4" />
                      <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
                <h2 className="font-bold text-xl text-slate-800 mb-0.5">
                  {formData.fullName || "User Name"}
                </h2>
                <p className="text-slate-500 text-sm">@{formData.userName || "username"}</p>
                {formData.location && (
                  <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mt-2">
                    <MapPin className="w-3.5 h-3.5" />{formData.location}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100">
                <div className="py-4">
                  <p className="font-bold text-xl text-slate-800">-</p>
                  <p className="text-slate-500 text-xs mt-0.5">Attended</p>
                </div>
                <div className="py-4">
                  <p className="font-bold text-xl text-[var(--brand-navy)]">-</p>
                  <p className="text-slate-500 text-xs mt-0.5">Upcoming</p>
                </div>
              </div>
            </motion.div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <Link to="/interests" className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 group text-left">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Star className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-700 text-sm">My Interests</p>
                  <p className="text-slate-400 text-xs">Personalize recommendations</p>
                </div>
                <ArrowLeft className="w-4 h-4 text-slate-300 rotate-180" />
              </Link>
              <Link to="/notifications" className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 group text-left">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-700 text-sm">Notifications</p>
                  <p className="text-slate-400 text-xs">Manage alerts</p>
                </div>
                <ArrowLeft className="w-4 h-4 text-slate-300 rotate-180" />
              </Link>
              <button className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left">
                <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-rose-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-700 text-sm">Security</p>
                  <p className="text-slate-400 text-xs">Password & privacy</p>
                </div>
                <ArrowLeft className="w-4 h-4 text-slate-300 rotate-180" />
              </button>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-[var(--brand-navy)]/5 overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div>
                  <h2 className="font-bold text-slate-800 text-lg">Personal Details</h2>
                  <p className="text-slate-400 text-xs mt-0.5">Update your personal information</p>
                </div>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="bg-[var(--brand-navy)]/5 text-[var(--brand-navy)] px-5 py-2 rounded-xl font-semibold text-sm hover:bg-[var(--brand-navy)]/10 transition-colors"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={handleCancel} className="text-slate-500 hover:text-slate-700 font-semibold text-sm px-3 py-2 transition-colors">
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-[var(--brand-navy)] text-white px-5 py-2 rounded-xl font-semibold text-sm hover:bg-[var(--brand-navy-hover)] transition-colors flex items-center gap-2 disabled:opacity-70 shadow-sm"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Full Name</label>
                    <div className="relative">
                      <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isEditing ? 'text-[var(--brand-navy)]' : 'text-slate-300'}`} />
                      <input
                        type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all outline-none ${
                          isEditing ? "border-slate-200 focus:border-[var(--brand-navy)] focus:ring-2 focus:ring-[var(--brand-navy)]/10 bg-white text-slate-800" : "border-transparent bg-slate-50 text-slate-500 cursor-not-allowed"
                        }`}
                      />
                    </div>
                    {errors.fullName && <p className="text-xs text-rose-500 mt-1">{errors.fullName}</p>}
                  </div>

                  {/* Username */}
                  <div>
                    <label htmlFor="userName" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Username</label>
                    <div className="relative">
                      <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm ${isEditing ? 'text-[var(--brand-navy)]' : 'text-slate-300'}`}>@</span>
                      <input
                        type="text" id="userName" name="userName" value={formData.userName} onChange={handleChange} disabled={true}
                        className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm transition-all outline-none border-transparent bg-slate-50 text-slate-500 cursor-not-allowed`}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isEditing ? 'text-[var(--brand-navy)]' : 'text-slate-300'}`} />
                      <input
                        type="email" id="email" name="email" value={formData.email} onChange={handleChange} disabled={true}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all outline-none border-transparent bg-slate-50 text-slate-500 cursor-not-allowed`}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phoneNumber" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isEditing ? 'text-[var(--brand-navy)]' : 'text-slate-300'}`} />
                      <input
                        type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all outline-none ${
                          isEditing ? "border-slate-200 focus:border-[var(--brand-navy)] focus:ring-2 focus:ring-[var(--brand-navy)]/10 bg-white text-slate-800" : "border-transparent bg-slate-50 text-slate-500 cursor-not-allowed"
                        }`}
                      />
                    </div>
                    {errors.phoneNumber && <p className="text-xs text-rose-500 mt-1">{errors.phoneNumber}</p>}
                  </div>

                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Location</label>
                    <div className="relative">
                      <MapPin className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isEditing ? 'text-[var(--brand-navy)]' : 'text-slate-300'}`} />
                      <input
                        type="text" id="location" name="location" value={formData.location} onChange={handleChange} disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all outline-none ${
                          isEditing ? "border-slate-200 focus:border-[var(--brand-navy)] focus:ring-2 focus:ring-[var(--brand-navy)]/10 bg-white text-slate-800" : "border-transparent bg-slate-50 text-slate-500 cursor-not-allowed"
                        }`}
                      />
                    </div>
                    {errors.location && <p className="text-xs text-rose-500 mt-1">{errors.location}</p>}
                  </div>

                  {/* Birthdate */}
                  <div className="md:col-span-2">
                    <label htmlFor="birthDate" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Date of Birth</label>
                    <div className="relative">
                      <Calendar className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isEditing ? 'text-[var(--brand-navy)]' : 'text-slate-300'}`} />
                      <input
                        type="date" id="birthDate" name="birthDate" value={formData.birthDate} onChange={handleChange} disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all outline-none ${
                          isEditing ? "border-slate-200 focus:border-[var(--brand-navy)] focus:ring-2 focus:ring-[var(--brand-navy)]/10 bg-white text-slate-800" : "border-transparent bg-slate-50 text-slate-500 cursor-not-allowed"
                        }`}
                      />
                    </div>
                    {errors.birthDate && <p className="text-xs text-rose-500 mt-1">{errors.birthDate}</p>}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
