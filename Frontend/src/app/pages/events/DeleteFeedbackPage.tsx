import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { motion } from "motion/react";
import { Trash2, ArrowLeft, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { apiDelete, getUserIdFromToken } from "../../api/api";

export default function DeleteFeedbackPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!eventId) return;

    setDeleting(true);
    try {
      const attendeeId = getUserIdFromToken();
        await apiDelete(
            `/api/attendees/${attendeeId}/events/${eventId}/feedback`
        );
      toast.success("Feedback deleted successfully");
      navigate(`/events/${eventId}/feedbacks`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete feedback");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-red-100"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-9 h-9 text-red-600" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">Delete Feedback?</h2>
          <p className="text-slate-600 mb-8">
            Are you sure you want to delete your feedback? This action cannot be undone.
          </p>

          <div className="flex gap-4">
            <Link
              to={`/events/${eventId}/feedbacks`}
              className="flex-1 py-3.5 border border-slate-300 rounded-xl font-medium hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 bg-red-600 text-white py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-red-700 disabled:opacity-70"
            >
              {deleting ? (
                "Deleting..."
              ) : (
                <>
                  <Trash2 className="w-5 h-5" /> Yes, Delete
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}