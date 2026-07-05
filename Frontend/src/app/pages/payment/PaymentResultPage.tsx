import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, Wallet, Receipt } from "lucide-react";
import { motion } from "framer-motion";

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [userRole, setUserRole] = useState<string>("Attendee");

  const success = searchParams.get("success") === "true";
  const pending = searchParams.get("pending") === "true";
  const transactionId = searchParams.get("id");
  const amountCents = searchParams.get("amount_cents");
  const amount = amountCents ? (parseFloat(amountCents) / 100).toFixed(2) : null;
  const currency = searchParams.get("currency") || "EGP";

  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    // Determine user role to route back to appropriate page
    const token = localStorage.getItem("forsa_token");
    if (token) {
      const decoded = parseJwt(token);
      if (decoded) {
        const roleClaim =
          decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
          decoded.role ||
          decoded.Role;
        const role = Array.isArray(roleClaim) ? roleClaim[0] : (roleClaim || "Attendee");
        setUserRole(role);
      }
    }
  }, []);

  useEffect(() => {
    if (success && !pending) {
      const pendingId = localStorage.getItem("pending_payment_request_id");
      if (pendingId) {
        const paidList = JSON.parse(localStorage.getItem("paid_booking_requests") || "[]");
        if (!paidList.includes(pendingId)) {
          paidList.push(pendingId);
          localStorage.setItem("paid_booking_requests", JSON.stringify(paidList));
        }
        localStorage.removeItem("pending_payment_request_id");
      }
    }
  }, [success, pending]);

  const getTargetRoute = () => {
    if (userRole === "Organizer") {
      return "/organizer/venue-requests";
    }
    return "/dashboard";
  };

  const getTargetLabel = () => {
    if (userRole === "Organizer") {
      return "Go to Venue Requests";
    }
    return "Go to My Dashboard";
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(getTargetRoute());
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [userRole, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50/50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
      >
        <div className="p-8 flex flex-col items-center text-center">
          {/* Animated Header Status Icon */}
          {success && !pending ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-6"
            >
              <CheckCircle2 className="w-12 h-12" />
            </motion.div>
          ) : pending ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-6"
            >
              <AlertCircle className="w-12 h-12" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-6"
            >
              <XCircle className="w-12 h-12" />
            </motion.div>
          )}

          {/* Heading */}
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {success && !pending
              ? "Payment Successful!"
              : pending
              ? "Payment Pending"
              : "Payment Failed"}
          </h2>

          <p className="text-slate-500 mt-2 text-sm max-w-xs">
            {success && !pending
              ? "Thank you! Your transaction completed successfully and your booking has been processed."
              : pending
              ? "Your payment is currently processing. You will receive an update once the system confirms it."
              : "We could not process your transaction. Please try checking out again or contact support."}
          </p>

          {/* Transaction Metadata Card */}
          {(transactionId || amount) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full mt-6 bg-slate-50 rounded-2xl p-5 border border-slate-100/80 text-left space-y-3"
            >
              {transactionId && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-slate-400" />
                    Transaction ID
                  </span>
                  <span className="font-mono font-bold text-slate-700">{transactionId}</span>
                </div>
              )}
              {amount && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-slate-400" />
                    Amount Paid
                  </span>
                  <span className="font-extrabold text-slate-800">
                    {amount} {currency}
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* Call to Actions */}
          <div className="w-full mt-8 space-y-3">
            <button
              onClick={() => navigate(getTargetRoute())}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-md shadow-indigo-600/10 active:scale-[0.98]"
            >
              {getTargetLabel()}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Automatic Redirection Countdown */}
          <p className="text-xs text-slate-400 mt-6 flex items-center gap-1.5 justify-center">
            <span>Redirecting automatically in <strong className="text-slate-600 font-semibold">{countdown}</strong> seconds...</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
