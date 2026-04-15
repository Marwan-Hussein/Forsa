import { useState } from "react";
import { Link } from "react-router";
import { User, Mail, Phone, MapPin, Calendar, Save, ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "Mohamed Kotb",
    username: "mohamedkotb",
    email: "mohamedkotb@email.com",
    phone: "+20 1000000000",
    location: "Cairo, Egypt",
    birthdate: "2004-06-29",
  });

  const [originalData, setOriginalData] = useState({ ...formData });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.birthdate) {
      newErrors.birthdate = "Birthdate is required";
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

  const handleSave = () => {
    if (validateForm()) {
      setIsEditing(false);
      setOriginalData({ ...formData });
      alert("Profile updated successfully! (This is a demo)");
    }
  };

  return (
    <div className="min-h-screen bg-[#eff6ff] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-4 text-[#526d82] hover:text-[#27374d] transition-colors font-['Inter:Regular',sans-serif] text-[14px] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[36px] text-[#27374d] mb-2">
                My Profile
              </h1>
              <p className="font-['Inter:Regular',sans-serif] text-[16px] text-[#526d82]">
                View and update your account information
              </p>
            </div>
            <Link
              to="/interests"
              className="bg-white border-[0.8px] border-[rgba(82,109,130,0.2)] text-[#27374d] px-6 py-3 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] hover:bg-[#f8f9fa] transition-colors cursor-pointer"
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
                <div className="w-24 h-24 rounded-full bg-[#27374d] flex items-center justify-center mb-4">
                  <span className="font-['Inter:Bold',sans-serif] font-bold text-[32px] text-[#dde6ed]">
                    {formData.fullName.charAt(0)}
                  </span>
                </div>
                <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[20px] text-[#27374d] mb-1">
                  {formData.fullName}
                </h2>
                <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82] mb-4">
                  @{formData.username}
                </p>
                <div className="w-full pt-4 border-t border-[rgba(82,109,130,0.2)]">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82]">
                      Events Attended
                    </span>
                    <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-[#27374d]">
                      12
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82]">
                      Upcoming Events
                    </span>
                    <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-[#27374d]">
                      5
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82]">
                      Member Since
                    </span>
                    <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-[#27374d]">
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
                <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[20px] text-[#27374d]">
                  Profile Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="bg-[#27374d] text-[#dde6ed] px-6 py-2 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] hover:bg-[#1e2936] transition-colors cursor-pointer"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="bg-white border-[0.8px] border-[rgba(82,109,130,0.2)] text-[#27374d] px-6 py-2 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] hover:bg-[#f8f9fa] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="bg-[#27374d] text-[#dde6ed] px-6 py-2 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] hover:bg-[#1e2936] transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[#27374d] mb-2"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#526d82]" />
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 rounded-[8px] border-[0.8px] border-[rgba(82,109,130,0.2)] font-['Inter:Regular',sans-serif] text-[14px] text-[#27374d] ${
                        isEditing
                          ? "focus:outline-none focus:border-[#27374d] bg-white"
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
                    className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[#27374d] mb-2"
                  >
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#526d82]" />
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 rounded-[8px] border-[0.8px] border-[rgba(82,109,130,0.2)] font-['Inter:Regular',sans-serif] text-[14px] text-[#27374d] ${
                        isEditing
                          ? "focus:outline-none focus:border-[#27374d] bg-white"
                          : "bg-[#f8f9fa] cursor-not-allowed"
                      }`}
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-1 text-[12px] text-red-500">{errors.username}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[#27374d] mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#526d82]" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 rounded-[8px] border-[0.8px] border-[rgba(82,109,130,0.2)] font-['Inter:Regular',sans-serif] text-[14px] text-[#27374d] ${
                        isEditing
                          ? "focus:outline-none focus:border-[#27374d] bg-white"
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
                    className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[#27374d] mb-2"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#526d82]" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 rounded-[8px] border-[0.8px] border-[rgba(82,109,130,0.2)] font-['Inter:Regular',sans-serif] text-[14px] text-[#27374d] ${
                        isEditing
                          ? "focus:outline-none focus:border-[#27374d] bg-white"
                          : "bg-[#f8f9fa] cursor-not-allowed"
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-[12px] text-red-500">{errors.phone}</p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label
                    htmlFor="location"
                    className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[#27374d] mb-2"
                  >
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#526d82]" />
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 rounded-[8px] border-[0.8px] border-[rgba(82,109,130,0.2)] font-['Inter:Regular',sans-serif] text-[14px] text-[#27374d] ${
                        isEditing
                          ? "focus:outline-none focus:border-[#27374d] bg-white"
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
                    className="block font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[#27374d] mb-2"
                  >
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#526d82]" />
                    <input
                      type="date"
                      id="birthdate"
                      name="birthdate"
                      value={formData.birthdate}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 rounded-[8px] border-[0.8px] border-[rgba(82,109,130,0.2)] font-['Inter:Regular',sans-serif] text-[14px] text-[#27374d] ${
                        isEditing
                          ? "focus:outline-none focus:border-[#27374d] bg-white"
                          : "bg-[#f8f9fa] cursor-not-allowed"
                      }`}
                    />
                  </div>
                  {errors.birthdate && (
                    <p className="mt-1 text-[12px] text-red-500">{errors.birthdate}</p>
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
