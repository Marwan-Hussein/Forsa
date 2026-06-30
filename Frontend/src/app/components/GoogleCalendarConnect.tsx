import React, { useState } from "react";

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
    const requestUrl = `${endpoint}${endpoint.includes("?") ? "&" : "?"}returnUrl=${encodeURIComponent(
      finalReturnUrl,
    )}`;

    try {
      setLoading(true);

      const response = await fetch(requestUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to start Google authentication.");
      }

      if (response.redirected) {
        window.location.href = response.url;
        return;
      }

      const data = await response.json();
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
          <svg
            className="gc-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="34"
            height="34"
            viewBox="0 0 48 48"
          >
            <path fill="#4285F4" d="M34 6H14a4 4 0 0 0-4 4v28a4 4 0 0 0 4 4h20a4 4 0 0 0 4-4V10a4 4 0 0 0-4-4z"/>
            <path fill="#FFF" d="M14 14h20v20H14z"/>
            <path fill="#EA4335" d="M34 6H14v8h20z"/>
            <path fill="#34A853" d="M18 22h12v12H18z"/>
            <circle fill="#FBBC05" cx="20" cy="12" r="2"/>
            <circle fill="#FBBC05" cx="28" cy="12" r="2"/>
          </svg>

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