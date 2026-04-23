import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Bell, Check, X, Calendar, Users, Sparkles, Building2, Settings } from "lucide-react";

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

  const filteredNotifications =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

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
      case "event":
        return "#155dfc";
      case "recommendation":
        return "#EC9B3B";
      case "organization":
        return "#9810fa";
      case "reminder":
        return "#f97316";
      default:
        return "#526d82";
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 mb-4 text-muted-foreground hover:text-foreground transition-colors font-['Inter:Regular',sans-serif] text-[14px] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Bell className="w-8 h-8 text-accent" />
                <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[36px] text-foreground">
                  Notifications
                </h1>
              </div>
              <p className="font-['Inter:Regular',sans-serif] text-[16px] text-muted-foreground">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            </div>
            <Link
              to="/notifications/settings"
              className="flex items-center gap-2 px-4 py-2 bg-white border-[0.8px] border-[rgba(82,109,130,0.2)] text-foreground rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] hover:bg-[#f8f9fa] transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </div>
        </div>

        {/* Filter and Actions */}
        <div className="bg-white rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] transition-colors cursor-pointer ${
                  filter === "all"
                    ? "bg-primary text-[#dde6ed] hover:bg-[#1e2936]"
                    : "bg-background text-foreground hover:bg-[#dde6ed]"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-4 py-2 rounded-[8px] font-['Inter:Medium',sans-serif] font-medium text-[14px] transition-colors cursor-pointer ${
                  filter === "unread"
                    ? "bg-primary text-[#dde6ed] hover:bg-[#1e2936]"
                    : "bg-background text-foreground hover:bg-[#dde6ed]"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-foreground hover:text-[#1e2936] font-['Inter:Medium',sans-serif] font-medium text-[14px] cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] p-4 hover:shadow-md transition-shadow ${
                  !notification.read ? "bg-background/50" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white"
                    style={{ backgroundColor: getNotificationColor(notification.type) }}
                  >
                    {notification.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] text-foreground">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                    <p className="font-['Inter:Regular',sans-serif] text-[14px] text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="font-['Inter:Regular',sans-serif] text-[12px] text-muted-foreground">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                      {notification.link && (
                        <Link
                          to={notification.link}
                          className="font-['Inter:Medium',sans-serif] font-medium text-[12px] text-foreground hover:underline cursor-pointer"
                        >
                          View →
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-background rounded-[8px] transition-colors cursor-pointer"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4 text-[#16a34a]" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-red-50 rounded-[8px] transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-[14px] border-[0.8px] border-[rgba(82,109,130,0.2)] p-12 text-center">
              <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[18px] text-foreground mb-2">
                No notifications
              </p>
              <p className="font-['Inter:Regular',sans-serif] text-[14px] text-muted-foreground">
                {filter === "unread"
                  ? "You're all caught up!"
                  : "You'll see notifications here when you have updates"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}