import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router";
import { ArrowLeft, Building2, Users, Calendar, Bell, BellOff } from "lucide-react";
import { apiGet, apiPost } from "../../api/api";
import { toast } from "react-toastify";

export default function OrganizationsPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const location = useLocation();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const searchParams = new URLSearchParams(location.search);
  const returnTo = searchParams.get("returnTo");

  // Helper for logo avatar colors
  const avatarColors = [
    { bg: "#EEF2FF", text: "#4F46E5" }, // Indigo
    { bg: "#F0FDF4", text: "#16A34A" }, // Emerald
    { bg: "#FFFBEB", text: "#D97706" }, // Amber
    { bg: "#FDF2F8", text: "#DB2777" }, // Pink
    { bg: "#F5F3FF", text: "#7C3AED" }, // Violet
    { bg: "#EFF6FF", text: "#2563EB" }, // Blue
  ];

  const getAvatarColors = (name: string) => {
    const i = (name.charCodeAt(0) || 0) % avatarColors.length;
    return avatarColors[i];
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (orgId) {
          // Fetch single organizer profile
          const data = await apiGet<any>(`/api/organizers/${orgId}/profile`);
          setSelectedOrganization({
            id: data.id.toString(),
            name: data.organizationName || data.fullName,
            profilePicture: data.profilePicture,
            description: `Official ForSa Partner. Dedicated to empowering the youth and tech community in Egypt with world-class events, workshops, and career accelerators.`,
            eventsCount: data.eventsCount || 0,
            followersCount: data.followersCount || 0,
            categories: (data.organizationName?.toLowerCase().includes("iti") || data.organizationName?.toLowerCase().includes("alx")) ? ["Education", "Tech"] : ["Business", "Tech"],
            isSubscribed: data.isSubscribed,
            email: data.email,
            phoneNumber: data.phoneNumber,
            location: data.location,
            representativeName: data.fullName
          });
        } else {
          // Fetch all organizers
          const data = await apiGet<any[]>("/api/organizers");
          const mapped = data.map((item: any) => ({
            id: item.id.toString(),
            name: item.organizationName || item.fullName,
            profilePicture: item.profilePicture,
            description: `Official ForSa Partner. Dedicated to empowering the youth and tech community in Egypt with world-class events, workshops, and career accelerators.`,
            eventsCount: item.eventsCount || 0,
            followersCount: item.followersCount || 0,
            categories: (item.organizationName?.toLowerCase().includes("iti") || item.organizationName?.toLowerCase().includes("alx")) ? ["Education", "Tech"] : ["Business", "Tech"],
            isSubscribed: item.isSubscribed
          }));
          setOrganizations(mapped);
        }
      } catch (error: any) {
        console.error("Error loading organizations:", error);
        toast.error("Failed to load organizations");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [orgId]);

  const toggleSubscription = async (organizationId: string) => {
    try {
      const res = await apiPost<any>(`/api/organizers/${organizationId}/subscribe`, {});
      const { isSubscribed, followersCount } = res;

      if (orgId) {
        setSelectedOrganization((prev: any) => {
          if (!prev) return null;
          return {
            ...prev,
            isSubscribed,
            followersCount
          };
        });
      } else {
        setOrganizations((prev) =>
          prev.map((org) => {
            if (org.id === organizationId) {
              return {
                ...org,
                isSubscribed,
                followersCount
              };
            }
            return org;
          })
        );
      }
      toast.success(isSubscribed ? "Subscribed successfully!" : "Unsubscribed successfully!");
    } catch (error: any) {
      console.error("Error subscribing:", error);
      toast.error("You must be logged in as an Attendee to subscribe.");
    }
  };

  const isSpecificOrg = !!orgId;

  const organizationsToRender = isSpecificOrg
    ? (selectedOrganization ? [selectedOrganization] : [])
    : organizations;

  const subscribedCount = isSpecificOrg 
    ? (selectedOrganization?.isSubscribed ? 1 : 0) 
    : organizations.filter(o => o.isSubscribed).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className={`relative bg-[var(--brand-deep-navy)] pt-36 pb-28 px-4 overflow-hidden`}>
        <div className="absolute inset-0 z-0" style={{ background: "linear-gradient(135deg, var(--brand-deep-navy) 0%, var(--brand-navy) 100%)" }} />
        <div className="absolute inset-0 z-0 overflow-hidden mix-blend-screen pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full filter blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--brand-blue-accent)]/20 rounded-full filter blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
        
        <div className="relative max-w-6xl mx-auto">
          <Link
            to={isSpecificOrg ? (returnTo || "/organizations") : "/"}
            className="inline-flex items-center gap-2 mb-6 text-white/70 hover:text-white transition-colors font-medium text-sm backdrop-blur-md bg-white/5 px-4 py-2 rounded-full border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            {isSpecificOrg
              ? returnTo
                ? returnTo.includes("/events")
                  ? "Return to Event"
                  : "Back to Owner Dashboard"
                : "Back to Organizers"
              : "Back to Home"}
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md">
              <Building2 className="w-10 h-10 text-blue-300" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              {loading ? (
                <span className="opacity-50">Loading...</span>
              ) : selectedOrganization ? (
                selectedOrganization.name
              ) : (
                <>
                  Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-emerald-300">Organizers</span>
                </>
              )}
            </h1>
          </div>
          <p className="text-lg text-white/80 max-w-2xl font-light">
            {isSpecificOrg
              ? "Organization profile and subscription details"
              : "Discover and subscribe to top event organizers. Never miss an exclusive event from your favorite creators."}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-12 relative z-10 pb-20">

        {/* Info Card */}
        <div
          className={`bg-white rounded-2xl shadow-xl shadow-[var(--brand-navy)]/5 border border-slate-100 p-6 mb-8 ${
            isSpecificOrg ? "hidden" : ""
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-foreground mb-2">
                Why subscribe to organizations?
              </h3>
              <p className="font-['Inter:Regular',sans-serif] text-[14px] text-muted-foreground">
                Get notified when your favorite organizations post new events, updates, or special offers. You're currently subscribed to {subscribedCount} organization{subscribedCount !== 1 ? "s" : ""}.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
            <p className="text-slate-500 font-medium font-['Inter:Medium',sans-serif]">Loading organizers...</p>
          </div>
        ) : organizationsToRender.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm text-center px-4">
            <Building2 className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-1">No Organizations Found</h3>
            <p className="text-slate-500 max-w-sm">There are no event organizers registered at this moment. Check back later.</p>
          </div>
        ) : (
          /* Organizations Grid */
          <div className={isSpecificOrg ? "max-w-xl mx-auto" : "grid grid-cols-1 md:grid-cols-2 gap-6"}>
            {organizationsToRender.map((org) => {
              const isSubscribed = org.isSubscribed;
              return (
                <div
                  key={org.id}
                  className="bg-white rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-4">
                    {org.profilePicture ? (
                      <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src={org.profilePicture.startsWith("http") ? org.profilePicture : `${import.meta.env.VITE_API_BASE_URL || ""}${org.profilePicture.startsWith("/") ? "" : "/"}${org.profilePicture}`}
                          alt={org.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0 font-['Inter:Bold',sans-serif] bg-[#1E3D61] text-white"
                      >
                        {org.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[18px] text-foreground mb-1 truncate">
                        {org.name}
                      </h3>
                      <p className="font-['Inter:Regular',sans-serif] text-[14px] text-muted-foreground line-clamp-2">
                        {org.description}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-[rgba(82,109,130,0.2)]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-foreground">
                          {org.eventsCount}
                        </p>
                        <p className="font-['Inter:Regular',sans-serif] text-[12px] text-muted-foreground">
                          Events
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-500" />
                      <div>
                        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-foreground">
                          {org.followersCount.toLocaleString()}
                        </p>
                        <p className="font-['Inter:Regular',sans-serif] text-[12px] text-muted-foreground">
                          Followers
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {org.categories.map((category: string) => (
                        <span
                          key={category}
                          className="px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-100 rounded-[6px] text-[12px] font-['Inter:Medium',sans-serif] font-medium"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Contact details */}
                  {isSpecificOrg && (
                    <div className="mb-6 pt-5 border-t border-[rgba(82,109,130,0.15)] space-y-3.5">
                      <h4 className="font-['Inter:Bold',sans-serif] font-bold text-slate-800 text-[13px] uppercase tracking-wider mb-2.5">
                        Contact Information
                      </h4>
                      {org.representativeName && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400 font-medium font-['Inter:Medium',sans-serif]">Representative</span>
                          <span className="text-slate-700 font-bold font-['Inter:Semi_Bold',sans-serif]">{org.representativeName}</span>
                        </div>
                      )}
                      {org.email && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400 font-medium font-['Inter:Medium',sans-serif]">Email Address</span>
                          <a href={`mailto:${org.email}`} className="text-indigo-600 font-bold hover:underline font-['Inter:Semi_Bold',sans-serif]">
                            {org.email}
                          </a>
                        </div>
                      )}
                      {org.phoneNumber && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400 font-medium font-['Inter:Medium',sans-serif]">Phone Number</span>
                          <a href={`tel:${org.phoneNumber}`} className="text-indigo-600 font-bold hover:underline font-['Inter:Semi_Bold',sans-serif]">
                            {org.phoneNumber}
                          </a>
                        </div>
                      )}
                      {org.location && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400 font-medium font-['Inter:Medium',sans-serif]">Office Location</span>
                          <span className="text-slate-700 font-bold font-['Inter:Semi_Bold',sans-serif]">{org.location}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => toggleSubscription(org.id)}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                        isSubscribed
                          ? "bg-[#1E3D61] text-white shadow-md hover:bg-[#1a365d] active:scale-95"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95"
                      }`}
                    >
                      {isSubscribed ? (
                        <>
                          <Bell className="w-4 h-4" />
                          Subscribed
                        </>
                      ) : (
                        <>
                          <BellOff className="w-4 h-4" />
                          Subscribe
                        </>
                      )}
                    </button>
                    {!isSpecificOrg && (
                      <Link
                        to={`/organizations/${org.id}`}
                        className="flex-1 bg-white border-2 border-slate-100 text-slate-700 py-2.5 rounded-xl font-bold text-sm hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-all text-center flex items-center justify-center active:scale-95"
                      >
                        View Profile
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
