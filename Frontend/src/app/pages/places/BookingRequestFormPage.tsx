import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  Calendar,
  Users,
  Clock,
  DollarSign,
  MapPin,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
  ArrowLeft,
  FileText,
  Building,
  ChevronRight,
} from "lucide-react";

export default function BookingRequestFormPage() {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    eventName: "",
    eventType: "",
    organizationName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    expectedAttendees: "",
    setupRequirements: "",
    cateringNeeded: false,
    avEquipmentNeeded: false,
    parkingNeeded: false,
    additionalNotes: "",
  });

  const mockPlace = {
    id: placeId || "1",
    name: "Grand Convention Center",
    address: "123 Main Street, Downtown, San Francisco, CA 94102",
    pricePerDay: 2500,
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    
    // Show success message and redirect
    alert("Booking request submitted successfully! You will receive a confirmation email shortly.");
    navigate("/my-booking-requests");
  };

  const eventTypes = [
    "Conference",
    "Wedding",
    "Corporate Event",
    "Workshop",
    "Seminar",
    "Trade Show",
    "Networking Event",
    "Party/Celebration",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-[#eff6ff]">
      <main className="px-6 py-8 max-w-4xl mx-auto w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#526d82] mb-6">
          <Link to="/places" className="hover:text-[#EC9B3B] cursor-pointer">Places</Link>
          <ChevronRight className="size-4" />
          <Link to={`/places/${placeId}`} className="hover:text-[#EC9B3B] cursor-pointer">{mockPlace.name}</Link>
          <ChevronRight className="size-4" />
          <span className="text-[#27374d]">Book Venue</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#27374d] mb-2">Booking Request</h1>
          <p className="text-[#526d82]">Fill out the form below to request a booking for {mockPlace.name}</p>
        </div>

        {/* Venue Info Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)] mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#27374d] mb-2">{mockPlace.name}</h2>
              <div className="flex items-center gap-2 text-[#526d82] mb-3">
                <MapPin className="size-5" />
                <span>{mockPlace.address}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#526d82]">Starting from</p>
              <p className="text-2xl font-bold text-[#27374d]">${mockPlace.pricePerDay}</p>
              <p className="text-sm text-[#526d82]">per day</p>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Information Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)]">
            <h2 className="text-xl font-bold text-[#27374d] mb-6 flex items-center gap-2">
              <FileText className="size-6 text-[#EC9B3B]" />
              Event Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="eventName" className="block text-sm font-medium text-[#27374d] mb-2">
                  Event Name *
                </label>
                <input
                  type="text"
                  id="eventName"
                  name="eventName"
                  required
                  value={formData.eventName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[rgba(39,55,77,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC9B3B] focus:border-transparent"
                  placeholder="Enter event name"
                />
              </div>

              <div>
                <label htmlFor="eventType" className="block text-sm font-medium text-[#27374d] mb-2">
                  Event Type *
                </label>
                <select
                  id="eventType"
                  name="eventType"
                  required
                  value={formData.eventType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[rgba(39,55,77,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC9B3B] focus:border-transparent"
                >
                  <option value="">Select event type</option>
                  {eventTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="organizationName" className="block text-sm font-medium text-[#27374d] mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  id="organizationName"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[rgba(39,55,77,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC9B3B] focus:border-transparent"
                  placeholder="Your organization (optional)"
                />
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)]">
            <h2 className="text-xl font-bold text-[#27374d] mb-6 flex items-center gap-2">
              <Mail className="size-6 text-[#EC9B3B]" />
              Contact Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contactName" className="block text-sm font-medium text-[#27374d] mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="contactName"
                  name="contactName"
                  required
                  value={formData.contactName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[rgba(39,55,77,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC9B3B] focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-[#27374d] mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  required
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[rgba(39,55,77,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC9B3B] focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-[#27374d] mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  required
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[rgba(39,55,77,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC9B3B] focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* Event Details Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)]">
            <h2 className="text-xl font-bold text-[#27374d] mb-6 flex items-center gap-2">
              <Calendar className="size-6 text-[#EC9B3B]" />
              Event Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="eventDate" className="block text-sm font-medium text-[#27374d] mb-2">
                  Event Date *
                </label>
                <input
                  type="date"
                  id="eventDate"
                  name="eventDate"
                  required
                  value={formData.eventDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-[rgba(39,55,77,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC9B3B] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="expectedAttendees" className="block text-sm font-medium text-[#27374d] mb-2">
                  Expected Attendees *
                </label>
                <input
                  type="number"
                  id="expectedAttendees"
                  name="expectedAttendees"
                  required
                  min="1"
                  value={formData.expectedAttendees}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[rgba(39,55,77,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC9B3B] focus:border-transparent"
                  placeholder="Number of attendees"
                />
              </div>

              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-[#27374d] mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  required
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[rgba(39,55,77,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC9B3B] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-[#27374d] mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  required
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[rgba(39,55,77,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC9B3B] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Requirements Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)]">
            <h2 className="text-xl font-bold text-[#27374d] mb-6 flex items-center gap-2">
              <Building className="size-6 text-[#EC9B3B]" />
              Requirements & Services
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="cateringNeeded"
                  name="cateringNeeded"
                  checked={formData.cateringNeeded}
                  onChange={handleChange}
                  className="size-5 rounded border-[rgba(39,55,77,0.2)] text-[#EC9B3B] focus:ring-[#EC9B3B] cursor-pointer"
                />
                <label htmlFor="cateringNeeded" className="text-[#27374d] cursor-pointer">
                  Catering services required
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="avEquipmentNeeded"
                  name="avEquipmentNeeded"
                  checked={formData.avEquipmentNeeded}
                  onChange={handleChange}
                  className="size-5 rounded border-[rgba(39,55,77,0.2)] text-[#EC9B3B] focus:ring-[#EC9B3B] cursor-pointer"
                />
                <label htmlFor="avEquipmentNeeded" className="text-[#27374d] cursor-pointer">
                  AV equipment needed (projector, microphones, etc.)
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="parkingNeeded"
                  name="parkingNeeded"
                  checked={formData.parkingNeeded}
                  onChange={handleChange}
                  className="size-5 rounded border-[rgba(39,55,77,0.2)] text-[#EC9B3B] focus:ring-[#EC9B3B] cursor-pointer"
                />
                <label htmlFor="parkingNeeded" className="text-[#27374d] cursor-pointer">
                  Parking required for attendees
                </label>
              </div>

              <div className="mt-6">
                <label htmlFor="setupRequirements" className="block text-sm font-medium text-[#27374d] mb-2">
                  Setup Requirements
                </label>
                <textarea
                  id="setupRequirements"
                  name="setupRequirements"
                  rows={3}
                  value={formData.setupRequirements}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[rgba(39,55,77,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC9B3B] focus:border-transparent"
                  placeholder="Describe your setup requirements (e.g., theater style, round tables, stage setup)"
                />
              </div>

              <div>
                <label htmlFor="additionalNotes" className="block text-sm font-medium text-[#27374d] mb-2">
                  Additional Notes
                </label>
                <textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  rows={4}
                  value={formData.additionalNotes}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-[rgba(39,55,77,0.2)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EC9B3B] focus:border-transparent"
                  placeholder="Any additional information or special requests"
                />
              </div>
            </div>
          </div>

          {/* Submit Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(39,55,77,0.1)]">
            <div className="flex items-start gap-3 mb-6">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 size-5 rounded border-[rgba(39,55,77,0.2)] text-[#EC9B3B] focus:ring-[#EC9B3B] cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-[#526d82] cursor-pointer">
                I agree to the terms and conditions and understand that this is a booking request. 
                Final confirmation will be sent via email after the venue owner reviews my request.
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 border border-[#27374d] text-[#27374d] rounded-lg hover:bg-[#27374d] hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#EC9B3B] to-[#f4b860] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="size-5" />
                    Submit Booking Request
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}