import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Bell, Check, Trash2, Settings, BellOff, Calendar, Sparkles, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { EASE_IN_OUT } from "../../lib/motion";

interface Notification {
  id: string;
  type: "event" | "recommendation" | "organization" | "reminder";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "event",
      title: "Tech Innovators Summit is tomorrow!",
      message: "Your gate ticket is ready. The event starts at 9:00 AM at Tech Park, Cairo.",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      link: "/dashboard?tab=tickets"
    },
    {
      id: "2",
      type: "recommendation",
      title: "New Event Recommendation",
      message: "Based on your interest in Business, we recommend the Global Business Conference.",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: false,
      link: "/dashboard?tab=recommendations"
    },
    {
      id: "3",
      type: "reminder",
      title: "Complete your profile interests",
      message: "Select your interests to help us personalize your event recommendations.",
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      read: true,
      link: "/interests"
    }
  ]);

  const [filter, setFilter] = useState<"all" | "unread">("all");
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const markAllAsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const deleteNotification = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  const filtered = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const formatTs = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const m = Math.floor(diffMs / 60000);
    const h = Math.floor(diffMs / 3600000);
    const day = Math.floor(diffMs / 86400000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (day < 7) return `${day}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const typeConfig: Record<Notification["type"], { bg: string; icon: React.ReactNode }> = {
    event: { bg: "bg-blue-600", icon: <Calendar className="w-5 h-5" /> },
    recommendation: { bg: "bg-amber-500", icon: <Sparkles className="w-5 h-5" /> },
    organization: { bg: "bg-violet-600", icon: <Building2 className="w-5 h-5" /> },
    reminder: { bg: "bg-rose-500", icon: <Bell className="w-5 h-5" /> },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0B1929] via-[#1E3D61] to-[#0F2847] pt-24 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm font-medium mb-6 group transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Dashboard
          </Link>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                <Bell className="w-8 h-8 text-blue-300" /> Notifications
              </h1>
              <p className="text-blue-100/70 mt-2">
                {unreadCount > 0 ? (
                  <><strong className="text-white">{unreadCount}</strong> unread notifications</>
                ) : "You're all caught up!"}
              </p>
            </div>
            <Link to="/profile" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all">
              <Settings className="w-4 h-4" /> Preferences
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
            {(["all", "unread"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                  filter === f
                    ? f === "unread" ? "bg-[#1E3D61] text-white shadow-sm" : "bg-slate-800 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {f === "unread" ? `Unread (${unreadCount})` : `All (${notifications.length})`}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="flex items-center gap-1.5 text-sm font-semibold text-[#1E3D61] hover:text-blue-700 transition-colors">
              <Check className="w-4 h-4" /> Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              filtered.map((n, i) => (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
                  transition={{ delay: i * 0.04, ease: EASE_IN_OUT }}
                  className={`relative bg-white rounded-2xl border overflow-hidden flex gap-0 group transition-shadow hover:shadow-md ${
                    !n.read ? "border-blue-100 shadow-sm" : "border-slate-100"
                  }`}
                >
                  {/* Unread bar */}
                  {!n.read && <div className="w-1 bg-[#1E3D61] shrink-0 rounded-l-2xl" />}

                  <div className="flex gap-4 p-4 sm:p-5 flex-1">
                    {/* Icon */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white shadow-md ${typeConfig[n.type].bg}`}>
                      {typeConfig[n.type].icon}
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className={`font-bold text-sm leading-snug ${!n.read ? "text-slate-800" : "text-slate-600"}`}>
                          {n.title}
                        </h3>
                        <span className="text-xs text-slate-400 whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded-md shrink-0">
                          {formatTs(n.timestamp)}
                        </span>
                      </div>
                      <p className="text-slate-500 text-sm mb-3 line-clamp-2">{n.message}</p>
                      <div className="flex items-center gap-3">
                        {n.link && (
                          <Link to={n.link} className="text-[#1E3D61] font-semibold text-xs hover:underline">
                            View {"->"}
                          </Link>
                        )}
                        <div className="flex items-center gap-1.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                          {!n.read && (
                            <button onClick={() => markAsRead(n.id)} className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors" title="Mark read">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button onClick={() => deleteNotification(n.id)} className="w-7 h-7 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-colors" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
                <div className="w-20 h-20 bg-[#1E3D61]/5 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <BellOff className="w-10 h-10 text-[#1E3D61]/30" />
                </div>
                <h3 className="font-bold text-slate-800 text-xl mb-2">All caught up!</h3>
                <p className="text-slate-400 text-sm max-w-xs mx-auto">
                  {filter === "unread"
                    ? "No unread notifications right now."
                    : "You'll be notified when something new happens."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}