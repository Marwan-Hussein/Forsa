import React, { useEffect, useState } from "react";
import GoogleCalendarLogo from "../../assets/google-calendar.svg";
import { apiGet } from "../api/api";

interface GoogleCalendarConnectProps {
  /**
   * Backend endpoint that starts the OAuth process.
   * Defaults to the API path that calls `GenerateAuthorizationUrl`.
   */
  endpoint?: string;

  /**
   * Optional return URL that will be persisted in the OAuth state.
   * If omitted, current browser location is used.
   */
  returnUrl?: string;
}

const GoogleCalendarConnect: React.FC<GoogleCalendarConnectProps> = ({
  endpoint = "/api/calendar/connect",
  returnUrl,
}) => {
  const [loading, setLoading] = useState(false);
  const [showConnectButton, setShowConnectButton] = useState(false);
  const [statusLoaded, setStatusLoaded] = useState(false);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const data = await apiGet<{ hasRefreshToken: boolean }>("/api/calendar/status");
        setShowConnectButton(!data.hasRefreshToken);
      } catch (err) {
        console.error("Failed to load Google Calendar status", err);
        setShowConnectButton(false);
      } finally {
        setStatusLoaded(true);
      }
    };

    loadStatus();
  }, []);

  const connectGoogleCalendar = async () => {
    const finalReturnUrl = returnUrl ?? window.location.href;
    const requestPath = `${endpoint}${endpoint.includes("?") ? "&" : "?"}returnUrl=${encodeURIComponent(
      finalReturnUrl,
    )}`;

    try {
      setLoading(true);

      const data = await apiGet<{ authorizationUrl?: string; url?: string; redirectUrl?: string }>(
        requestPath,
      );

      const redirectUrl = data.authorizationUrl ?? data.url ?? data.redirectUrl;
      if (!redirectUrl) {
        throw new Error("Authentication URL was not returned.");
      }

      window.location.href = redirectUrl;
    } catch (err) {
      console.error(err);
      alert("Unable to connect to Google Calendar.");
    } finally {
      setLoading(false);
    }
  };

  if (!statusLoaded || !showConnectButton) {
    return null;
  }

  return (
    <>
      return (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={connectGoogleCalendar}
            disabled={loading}
            className="
              group
              flex
              h-14
              w-14
              hover:w-72
              items-center
              justify-center
              hover:justify-start
              rounded-full
              bg-[#4285F4]/40
              hover:bg-[#4285F4]
              backdrop-blur-sm
              shadow-2xl
              hover:shadow-[0_8px_24px_rgba(66,133,244,0.35)]
              transition-all
              duration-300
              ease-in-out
              overflow-hidden
              px-4
              disabled:opacity-80
              disabled:cursor-not-allowed
            "
          >
            <img
              src={GoogleCalendarLogo}
              alt="Google Calendar"
              className="
                w-10
                h-10
                min-w-10
                object-contain
                transition-transform
                duration-300
                ease-in-out
                group-hover:scale-125
                group-hover:rotate-12
              "
            />

            <span
              className="
                opacity-0
                max-w-0
                group-hover:opacity-100
                group-hover:max-w-xs
                group-hover:ml-3
                transition-all
                duration-300
                ease-in-out
                whitespace-nowrap
                text-white
                font-semibold
                text-sm
              "
            >
              {loading ? "Connecting..." : "Connect Google Calendar"}
            </span>
          </button>
        </div>
      );
    </>
  );
};

export default GoogleCalendarConnect;
