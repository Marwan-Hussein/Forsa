import { Link, useNavigate } from "react-router";

export default function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-12 text-white"
      style={{
        background: "linear-gradient(to bottom, #1b324d 0%, #000000 80%, #000000 100%)",
      }}
    >
      <div className="max-w-6xl w-full text-center space-y-10">
          <div className="flex flex-col items-center gap-8">
            <img
              src="/NotFound.png"
              alt="404 Not Found illustration"
              className="w-full max-w-xl rounded-3xl border p-4 shadow-xl"
              loading="eager"
            />

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={handleGoBack}
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-200"
              >
                Go Back
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
              >
                Home
              </a>
            </div>
          </div>
      </div>
    </div>
  );
}
