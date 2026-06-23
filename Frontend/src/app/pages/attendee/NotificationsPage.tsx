import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Bell, Check, X, Calendar, Users, Sparkles, Building2, Settings, Trash2 } from "lucide-react";
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
  icon: React.ReactNode;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "reminder",
      title: "Event Starting Soon",
      message: "Tech Conference 2026: Future of AI starts in 2 days",
      timestamp: "2026-03-23T10:00:00",
      read: false,
      link: "/events/1",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      id: "2",
      type: "recommendation",
      title: "New Event Recommendation",
      message: "Based on your interests, you might like 'Digital Marketing Masterclass'",
      timestamp: "2026-03-22T15:30:00",
      read: false,
      link: "/recommendations",
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      id: "3",
      type: "organization",
      title: "Tech Innovators Inc",
      message: "Posted a new event: 'Startup Networking Mixer'",
      timestamp: "2026-03-21T09:00:00",
      read: false,
      link: "/organizations/org1",
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      id: "4",
      type: "event",
      title: "Booking Confirmed",
      message: "Your booking for Summer Music Festival 2026 has been confirmed",
      timestamp: "2026-03-20T14:20:00",
      read: true,
      link: "/my-events",
      icon: <Check className="w-5 h-5" />,
    },
    {
      id: "5",
      type: "event",
      title: "Event Capacity Alert",
      message: "Food & Wine Tasting Experience is filling up fast! Only 20 spots left",
      timestamp: "2026-03-19T11:45:00",
      read: true,
      link: "/events/6",
      icon: <Users className="w-5 h-5" />,
    },
  ]);

  const [filter, setFilter] = useState<"all" | "unread">("all");
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "event": return "bg-blue-500 text-white shadow-blue-500/20";
      case "recommendation": return "bg-amber-500 text-white shadow-amber-500/20";
      case "organization": return "bg-violet-500 text-white shadow-violet-500/20";
      case "reminder": return "bg-rose-500 text-white shadow-rose-500/20";
      default: return "bg-slate-500 text-white shadow-slate-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 mb-4 text-slate-500 hover:text-blue-600 transition-colors font-['Inter:Medium',sans-serif] text-sm group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <Bell className="w-8 h-8 text-blue-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 border-2 border-slate-50 rounded-full" />
                )}
              </div>
              <h1 className="font-['Inter:Bold',sans-serif] text-4xl text-slate-800 tracking-tight">
                Notifications
              </h1>
            </div>
            <p className="font-['Inter:Medium',sans-serif] text-slate-500 text-lg">
              You have <strong className="text-slate-800">{unreadCount}</strong> unread notifications
            </p>
          </div>

          <Link
            to="/settings"
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-['Inter:Bold',sans-serif] text-sm hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm group"
          >
            <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
            Preferences
          </Link>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilter("all")}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-['Inter:Bold',sans-serif] text-sm transition-all ${
                filter === "all"
                  ? "bg-slate-800 text-white shadow-md"
                  : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-['Inter:Bold',sans-serif] text-sm transition-all ${
                filter === "unread"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-transparent text-slate-500 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              Unread
            </button>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center justify-center gap-2 px-5 py-2.5 text-blue-600 hover:bg-blue-50 rounded-xl font-['Inter:Bold',sans-serif] text-sm transition-colors w-full sm:w-auto"
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3, delay: index * 0.05, ease: EASE_IN_OUT }}
                  key={notification.id}
                  className={`relative bg-white rounded-3xl border transition-all duration-300 group ${
                    !notification.read
                      ? "border-blue-100 shadow-md shadow-blue-500/5"
                      : "border-slate-100 shadow-sm hover:border-slate-200"
                  }`}
                >
                  {/* Unread indicator bar */}
                  {!notification.read && (
                    <div className="absolute left-0 top-6 bottom-6 w-1 bg-blue-500 rounded-r-full" />
                  )}

                  <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5">
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${getNotificationColor(notification.type)}`}
                    >
                      {notification.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                        <h3 className={`font-['Inter:Bold',sans-serif] text-lg ${!notification.read ? "text-slate-800" : "text-slate-600"}`}>
                          {notification.title}
                        </h3>
                        <span className="font-['Inter:Medium',sans-serif] text-xs text-slate-400 whitespace-nowrap bg-slate-50 px-2.5 py-1 rounded-md w-fit">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>
                      
                      <p className={`font-['Inter:Medium',sans-serif] mb-4 ${!notification.read ? "text-slate-600" : "text-slate-500"}`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        {notification.link ? (
                          <Link
                            to={notification.link}
                            className="text-blue-600 font-['Inter:Bold',sans-serif] text-sm hover:text-blue-700 hover:underline"
                          >
                            View Details
                          </Link>
                        ) : <div />}

                        {/* Actions */}
                        <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="w-8 h-8 flex items-center justify-center bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-full transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm"
              >
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bell className="w-12 h-12 text-slate-300" />
                </div>
                <p className="font-['Inter:Bold',sans-serif] text-2xl text-slate-800 mb-2">
                  All caught up!
                </p>
                <p className="font-['Inter:Medium',sans-serif] text-slate-500 max-w-sm mx-auto">
                  {filter === "unread"
                    ? "You don't have any unread notifications right now."
                    : "You don't have any notifications yet. We'll alert you when something happens."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}