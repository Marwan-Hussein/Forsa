import { useState } from "react";
import { Link } from "react-router";
import { useParams } from "react-router";
import { ArrowLeft, Building2, Users, Calendar, Bell, BellOff } from "lucide-react";
import { mockOrganizations } from "../../data/mockData";

export default function OrganizationsPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const [subscribedOrgs, setSubscribedOrgs] = useState<string[]>(["org1", "org2"]);
  const selectedOrganization = orgId
    ? mockOrganizations.find((org) => org.id === orgId)
    : null;
  const organizationsToRender = selectedOrganization
    ? [selectedOrganization]
    : mockOrganizations;

  const toggleSubscription = (orgId: string) => {
    setSubscribedOrgs((prev) =>
      prev.includes(orgId) ? prev.filter((id) => id !== orgId) : [...prev, orgId]
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className={`relative bg-[#0B1120] pt-36 pb-28 px-4 overflow-hidden ${orgId && !selectedOrganization ? "hidden" : ""}`}>
        <div className="absolute inset-0 z-0" style={{ background: "linear-gradient(135deg, #0B1120 0%, #1E3D61 100%)" }} />
        <div className="absolute inset-0 z-0 overflow-hidden mix-blend-screen pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full filter blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#3b82f6]/20 rounded-full filter blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
        
        <div className="relative max-w-6xl mx-auto">
          <Link
            to={selectedOrganization ? "/organizations" : "/"}
            className="inline-flex items-center gap-2 mb-6 text-white/70 hover:text-white transition-colors font-medium text-sm backdrop-blur-md bg-white/5 px-4 py-2 rounded-full border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            {selectedOrganization ? "Back to Organizers" : "Back to Home"}
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md">
              <Building2 className="w-10 h-10 text-blue-300" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              {selectedOrganization ? selectedOrganization.name : (
                <>
                  Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-emerald-300">Organizers</span>
                </>
              )}
            </h1>
          </div>
          <p className="text-lg text-white/80 max-w-2xl font-light">
            {selectedOrganization
              ? "Organization profile and subscription details"
              : "Discover and subscribe to top event organizers. Never miss an exclusive event from your favorite creators."}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-12 relative z-10 pb-20">

        {/* Info Card */}
        <div
          className={`bg-white rounded-2xl shadow-xl shadow-[#1E3D61]/5 border border-slate-100 p-6 mb-8 ${
            orgId && !selectedOrganization ? "hidden" : ""
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
                Get notified when your favorite organizations post new events, updates, or special offers. You're currently subscribed to {subscribedOrgs.length} organization{subscribedOrgs.length !== 1 ? "s" : ""}.
              </p>
            </div>
          </div>
        </div>

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {organizationsToRender.map((org) => {
            const isSubscribed = subscribedOrgs.includes(org.id);
            return (
              <div
                key={org.id}
                className="bg-white rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-3xl flex-shrink-0">
                    {org.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[18px] text-foreground mb-1">
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
                    <Calendar className="w-4 h-4 text-accent" />
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
                    <Users className="w-4 h-4 text-accent" />
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
                    {org.categories.map((category) => (
                      <span
                        key={category}
                        className="px-2 py-1 bg-background text-foreground rounded-[6px] text-[12px] font-['Inter:Medium',sans-serif] font-medium"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>

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
                  <Link
                    to={`/organizations/${org.id}`}
                    className="flex-1 bg-white border-2 border-slate-100 text-slate-700 py-2.5 rounded-xl font-bold text-sm hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-all text-center flex items-center justify-center active:scale-95"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}