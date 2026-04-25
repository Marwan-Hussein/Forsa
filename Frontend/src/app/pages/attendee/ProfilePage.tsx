import { useEffect, useState } from "react";
import { Link } from "react-router";
import { User, Mail, Phone, MapPin, Calendar, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "../../api/api";
import {
  getAttendeeProfile,
  getCurrentAttendeeId,
  updateAttendeeProfile,
  type AttendeeProfileDto,
  type UpdateAttendeeProfileRequest,
} from "../../lib/attendee-api";

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
        if (!isActive) {
          return;
        }

        const mappedProfile = mapProfileToForm(profile);
        setFormData(mappedProfile);
        setOriginalData(mappedProfile);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setLoadError(getErrorMessage(error, "Failed to load profile."));
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isActive = false;
    };
  }, [attendeeId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof UpdateAttendeeProfileRequest;

    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    // Clear error when user starts typing
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

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.userName.trim()) {
      newErrors.userName = "Username is required";
    } else if (formData.userName.length < 3) {
      newErrors.userName = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.birthDate) {
      newErrors.birthDate = "Birthdate is required";
    }

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
    if (!validateForm()) {
      return;
    }

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
      if (Object.keys(serverErrors).length > 0) {
        setErrors(serverErrors);
      }

      toast.error(getErrorMessage(error, "Failed to update profile."));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] p-8 text-center">
            <h1 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[20px] text-foreground mb-2">
              Loading profile...
            </h1>
            <p className="font-['Inter:Regular',sans-serif] text-[14px] text-muted-foreground">
              Fetching your attendee data from the API.
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
              Could not load profile
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
            to="/"
            className="inline-flex items-center gap-2 mb-4 text-muted-foreground hover:text-foreground transition-colors font-['Inter:Regular',sans-serif] text-[14px] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[36px] text-foreground mb-2">
                My Profile
              </h1>
              <p className="font-['Inter:Regular',sans-serif] text-[16px] text-muted-foreground">
                View and update your account information
              </p>
            </div>
            <Link
              to="/interests"
              className="bg-white border-[0.8px] border-[rgba(82,109,130,0.2)] text-foreground px-6 py-3 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] hover:bg-[#f8f9fa] transition-colors cursor-pointer"
            >
              Manage Interests
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mb-4">
                  <span className="font-['Inter:Bold',sans-serif] font-bold text-[32px] text-[#dde6ed]">
                    {formData.fullName.charAt(0)}
                  </span>
                </div>
                <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[20px] text-foreground mb-1">
                  {formData.fullName}
                </h2>
                <p className="font-['Inter:Regular',sans-serif] text-[14px] text-muted-foreground mb-4">
                  @{formData.userName}
                </p>
                <div className="w-full pt-4 border-t border-[rgba(82,109,130,0.2)]">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-['Inter:Regular',sans-serif] text-[14px] text-muted-foreground">
                      Events Attended
                    </span>
                    <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-foreground">
                      12
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-['Inter:Regular',sans-serif] text-[14px] text-muted-foreground">
                      Upcoming Events
                    </span>
                    <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-foreground">
                      5
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-['Inter:Regular',sans-serif] text-[14px] text-muted-foreground">
                      Member Since
                    </span>
                    <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-foreground">
                      Jan 2026
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[20px] text-foreground">
                  Profile Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="bg-primary text-[#dde6ed] px-6 py-2 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] hover:bg-[#1e2936] transition-colors cursor-pointer"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
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

              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-foreground mb-2"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 rounded-[8px] border-[0.8px] border-[rgba(82,109,130,0.2)] font-['Inter:Regular',sans-serif] text-[14px] text-foreground ${
                        isEditing
                          ? "focus:outline-none focus:border-primary bg-white"
                          : "bg-[#f8f9fa] cursor-not-allowed"
                      }`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-[12px] text-red-500">{errors.fullName}</p>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label
                    htmlFor="username"
                    className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-foreground mb-2"
                  >
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      id="userName"
                      name="userName"
                      value={formData.userName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 rounded-[8px] border-[0.8px] border-[rgba(82,109,130,0.2)] font-['Inter:Regular',sans-serif] text-[14px] text-foreground ${
                        isEditing
                          ? "focus:outline-none focus:border-primary bg-white"
                          : "bg-[#f8f9fa] cursor-not-allowed"
                      }`}
                    />
                  </div>
                  {errors.userName && (
                    <p className="mt-1 text-[12px] text-red-500">{errors.userName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-foreground mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 rounded-[8px] border-[0.8px] border-[rgba(82,109,130,0.2)] font-['Inter:Regular',sans-serif] text-[14px] text-foreground ${
                        isEditing
                          ? "focus:outline-none focus:border-primary bg-white"
                          : "bg-[#f8f9fa] cursor-not-allowed"
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-[12px] text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-foreground mb-2"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 rounded-[8px] border-[0.8px] border-[rgba(82,109,130,0.2)] font-['Inter:Regular',sans-serif] text-[14px] text-foreground ${
                        isEditing
                          ? "focus:outline-none focus:border-primary bg-white"
                          : "bg-[#f8f9fa] cursor-not-allowed"
                      }`}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="mt-1 text-[12px] text-red-500">{errors.phoneNumber}</p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label
                    htmlFor="location"
                    className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-foreground mb-2"
                  >
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 rounded-[8px] border-[0.8px] border-[rgba(82,109,130,0.2)] font-['Inter:Regular',sans-serif] text-[14px] text-foreground ${
                        isEditing
                          ? "focus:outline-none focus:border-primary bg-white"
                          : "bg-[#f8f9fa] cursor-not-allowed"
                      }`}
                    />
                  </div>
                  {errors.location && (
                    <p className="mt-1 text-[12px] text-red-500">{errors.location}</p>
                  )}
                </div>

                {/* Birthdate */}
                <div>
                  <label
                    htmlFor="birthdate"
                    className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-foreground mb-2"
                  >
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="date"
                      id="birthDate"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 rounded-[8px] border-[0.8px] border-[rgba(82,109,130,0.2)] font-['Inter:Regular',sans-serif] text-[14px] text-foreground ${
                        isEditing
                          ? "focus:outline-none focus:border-primary bg-white"
                          : "bg-[#f8f9fa] cursor-not-allowed"
                      }`}
                    />
                  </div>
                  {errors.birthDate && (
                    <p className="mt-1 text-[12px] text-red-500">{errors.birthDate}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
