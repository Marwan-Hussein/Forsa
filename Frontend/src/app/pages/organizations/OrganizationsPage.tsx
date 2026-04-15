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
    <div className="min-h-screen bg-[#eff6ff] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {orgId && !selectedOrganization ? (
          <div className="rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] bg-white p-8 text-center">
            <h2 className="mb-2 font-['Inter:Semi_Bold',sans-serif] text-[22px] font-semibold text-[#27374d]">
              Organization Not Found
            </h2>
            <p className="mb-4 font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82]">
              The organization profile you requested does not exist.
            </p>
            <Link
              to="/organizations"
              className="inline-flex cursor-pointer items-center rounded-[8px] bg-[#27374d] px-5 py-2 font-['Inter:Medium',sans-serif] text-[14px] font-medium text-[#dde6ed] transition-colors hover:bg-[#1e2936]"
            >
              Back to Organizations
            </Link>
          </div>
        ) : null}

        {/* Header */}
        <div className={`mb-8 ${orgId && !selectedOrganization ? "hidden" : ""}`}>
          <Link
            to={selectedOrganization ? "/organizations" : "/dashboard"}
            className="inline-flex items-center gap-2 mb-4 text-[#526d82] hover:text-[#27374d] transition-colors font-['Inter:Regular',sans-serif] text-[14px] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {selectedOrganization ? "Back to Organizations" : "Back to Home"}
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-8 h-8 text-[#EC9B3B]" />
            <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[36px] text-[#27374d]">
              {selectedOrganization ? selectedOrganization.name : "Event Organizations"}
            </h1>
          </div>
          <p className="font-['Inter:Regular',sans-serif] text-[16px] text-[#526d82]">
            {selectedOrganization
              ? "Organization profile and subscription details"
              : "Subscribe to organizations to receive updates about their events"}
          </p>
        </div>

        {/* Info Card */}
        <div
          className={`bg-white rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] p-6 mb-6 ${
            orgId && !selectedOrganization ? "hidden" : ""
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-[#eff6ff] rounded-full flex items-center justify-center">
              <Bell className="w-6 h-6 text-[#EC9B3B]" />
            </div>
            <div>
              <h3 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-[#27374d] mb-2">
                Why subscribe to organizations?
              </h3>
              <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82]">
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
                  <div className="w-16 h-16 bg-[#27374d] rounded-full flex items-center justify-center text-3xl flex-shrink-0">
                    {org.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[18px] text-[#27374d] mb-1">
                      {org.name}
                    </h3>
                    <p className="font-['Inter:Regular',sans-serif] text-[14px] text-[#526d82] line-clamp-2">
                      {org.description}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-[rgba(82,109,130,0.2)]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#EC9B3B]" />
                    <div>
                      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-[#27374d]">
                        {org.eventsCount}
                      </p>
                      <p className="font-['Inter:Regular',sans-serif] text-[12px] text-[#526d82]">
                        Events
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#EC9B3B]" />
                    <div>
                      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-[#27374d]">
                        {org.followersCount.toLocaleString()}
                      </p>
                      <p className="font-['Inter:Regular',sans-serif] text-[12px] text-[#526d82]">
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
                        className="px-2 py-1 bg-[#eff6ff] text-[#27374d] rounded-[6px] text-[12px] font-['Inter:Medium',sans-serif] font-medium"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleSubscription(org.id)}
                    className={`flex-1 py-2 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] transition-colors flex items-center justify-center gap-2 ${
                      isSubscribed
                        ? "bg-[#27374d] text-[#dde6ed] hover:bg-[#1e2936]"
                        : "bg-white border-[0.8px] border-[rgba(82,109,130,0.2)] text-[#27374d] hover:bg-[#f8f9fa]"
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
                    className="flex-1 bg-white border-[0.8px] border-[rgba(82,109,130,0.2)] text-[#27374d] py-2 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] hover:bg-[#f8f9fa] transition-colors text-center"
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