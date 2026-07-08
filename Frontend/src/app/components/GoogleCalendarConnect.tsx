import React, { useEffect, useState } from "react";
import { ArrowRight, CalendarCheck, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
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

  /**
   * The styling variant of the calendar connection control.
   * Defaults to "card".
   */
  variant?: "card" | "button";
}

const GoogleCalendarConnect: React.FC<GoogleCalendarConnectProps> = ({
  endpoint = "/api/calendar/connect",
  returnUrl,
  variant = "card",
}) => {
  const [loading, setLoading] = useState(false);
  const [showConnectButton, setShowConnectButton] = useState(false);
  const [statusLoaded, setStatusLoaded] = useState(false);
  const [statusError, setStatusError] = useState(false);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        setStatusError(false);
        const data = await apiGet<{ hasRefreshToken: boolean }>("/api/calendar/status");
        setShowConnectButton(!data.hasRefreshToken);
      } catch (err) {
        console.error("Failed to load Google Calendar status", err);
        setStatusError(true);
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
      toast.error("Unable to connect to Google Calendar.");
    } finally {
      setLoading(false);
    }
  };

  const isConnected = statusLoaded && !statusError && !showConnectButton;

  if (variant === "button") {
    if (!statusLoaded) {
      return (
        <button
          disabled
          type="button"
          className="flex items-center gap-2 bg-white/10 border border-white/10 text-white/50 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-not-allowed select-none"
        >
          <Loader2 className="w-4 h-4 animate-spin text-white/60" />
          <span>Sync Status</span>
        </button>
      );
    }

    if (isConnected) {
      return (
        <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm select-none">
          <img src={GoogleCalendarLogo} alt="" className="w-6 h-6 object-contain" />
          <span>Google Calendar Connected</span>
        </div>
      );
    }

    return (
      <button
        onClick={connectGoogleCalendar}
        disabled={loading}
        type="button"
        className="flex items-center gap-2.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
      >
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <img src={GoogleCalendarLogo} alt="" className="w-6 h-6 object-contain" />
        )}
        <span>{loading ? "Connecting..." : "Sync Google Calendar"}</span>
      </button>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl shadow-[var(--brand-navy)]/5">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#4285f4] via-[#34a853] via-[#fbbc05] to-[#ea4335]" />
      <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-[#4285f4]/10 blur-2xl transition-transform duration-500 group-hover:scale-125" />

      <div className="relative p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 shadow-inner">
            <img src={GoogleCalendarLogo} alt="Google Calendar" className="h-8 w-8 object-contain" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800">Google Calendar</h3>
              {statusLoaded && !statusError && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    isConnected
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {isConnected ? <CheckCircle2 className="h-3 w-3" /> : <CalendarCheck className="h-3 w-3" />}
                  {isConnected ? "Connected" : "Available"}
                </span>
              )}
              {statusError && (
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-600">
                  Unavailable
                </span>
              )}
            </div>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Sync event plans and bookings with your personal calendar.
            </p>
          </div>
        </div>

        <div className="mt-4">
          {!statusLoaded ? (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking calendar status
            </div>
          ) : isConnected ? (
            <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">
              <div>
                <p className="text-sm font-bold text-emerald-800">Ready to sync</p>
                <p className="text-xs text-emerald-700/80">Your Google Calendar is linked.</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
          ) : statusError ? (
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
              Calendar status could not be loaded.
            </div>
          ) : (
            <button
              onClick={connectGoogleCalendar}
              disabled={loading}
              className="flex w-full items-center justify-between rounded-xl bg-[var(--brand-navy)] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[var(--brand-navy)]/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--brand-navy-hover)] disabled:translate-y-0 disabled:opacity-70"
            >
              <span className="inline-flex items-center gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Connecting..." : "Connect account"}
              </span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleCalendarConnect;
