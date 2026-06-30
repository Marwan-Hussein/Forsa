import React, { useState } from "react";
import GoogleCalendarLogo from "../../assets/google-calendar.svg";
import { apiGet } from "../api/api";

interface GoogleCalendarConnectProps {
  /**
   * Backend endpoint that starts the OAuth process.
   *
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

  return (
    <>
      <style>{`
        .gc-container{
            position:fixed;
            right:24px;
            bottom:24px;
            z-index:9999;
        }

        .gc-button{
            display:flex;
            align-items:center;
            justify-content:center;

            width:64px;
            height:64px;

            border:none;
            outline:none;

            border-radius:999px;

            background:#ffffff;

            box-shadow:
                0 6px 20px rgba(0,0,0,.2);

            cursor:pointer;

            overflow:hidden;

            transition:all .35s ease;
        }

        .gc-button:hover{
            width:270px;
            justify-content:flex-start;
            padding-left:18px;
        }

        .gc-text{
            margin-left:14px;
            white-space:nowrap;

            opacity:0;
            width:0;

            overflow:hidden;

            transition:all .3s ease;

            font-family:Arial, Helvetica, sans-serif;
            font-size:15px;
            font-weight:600;
            color:#333;
        }

        .gc-button:hover .gc-text{
            opacity:1;
            width:190px;
        }

        .gc-button:disabled{
            cursor:not-allowed;
            opacity:.8;
        }

        .gc-icon{
            flex-shrink:0;
        }
      `}</style>

      <div className="gc-container">
        <button
          className="gc-button"
          onClick={connectGoogleCalendar}
          disabled={loading}
        >
          {/* Google Calendar SVG */}
          <img
              src={GoogleCalendarLogo}
              alt="Google Calendar"
              className="gc-icon"
            />
          <span className="gc-text">
            {loading
              ? "Connecting..."
              : "Connect Google Calendar"}
          </span>
        </button>
      </div>
    </>
  );
};

export default GoogleCalendarConnect;