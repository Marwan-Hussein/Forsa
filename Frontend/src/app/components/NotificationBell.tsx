import { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { Bell, Check, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";
import * as signalR from "@microsoft/signalr";
import { useNotificationContext, type NotificationMessageDto } from "../contexts/NotificationContext";

const API_BASE_URL = import.meta.env.VITE_USE_API_PROXY === "true"
  ? ""
  : (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

const hubUrl = `${API_BASE_URL}/hubs/notifications`;

export function NotificationBell() {
  const { notifications, unreadCount, addNotification, markAsRead, removeNotification } = useNotificationContext();
  const [open, setOpen] = useState(false);
  const addNotificationRef = useRef(addNotification);

  useEffect(() => {
    addNotificationRef.current = addNotification;
  }, [addNotification]);

  const recentNotifications = useMemo(() => notifications.slice(0, 4), [notifications]);

  useEffect(() => {
    const token = localStorage.getItem("forsa_token");
    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    connection.on("receiveNotification", (message: NotificationMessageDto) => {
      console.log("Notification received via SignalR:", message);
      addNotificationRef.current(message);
      toast.success(message.title || "New notification", {
        description: message.body,
      });
    });

    connection.onreconnecting((error) => console.warn("SignalR reconnecting:", error));
    connection.onreconnected(() => console.log("SignalR reconnected"));

    connection.onclose((error) => {
      if (error) {
        console.error("SignalR connection closed with error:", error);
      } else {
        console.log("SignalR connection closed gracefully");
      }
    });

    connection
      .start()
      .then(() => console.log("SignalR connected"))
      .catch((error) => console.error("Failed to connect to notifications hub", error));

    return () => {
      connection.stop().catch((err) => console.error("Error stopping SignalR connection:", err));
    };
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="group relative inline-flex items-center justify-center h-11 w-11 rounded-2xl border border-slate-200/80 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 z-50 mt-3 w-[340px] rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/10"
          >
            <div className="flex items-center justify-between gap-3 px-2 pb-3 border-b border-slate-200">
              <div>
                <p className="text-sm font-semibold text-slate-900">Notifications</p>
                <p className="text-xs text-slate-500">Latest updates from the system</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                aria-label="Close notifications"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto py-3">
              {recentNotifications.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  No notifications yet. New alerts appear here.
                </div>
              ) : (
                recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="group mb-3 rounded-3xl border border-slate-200 bg-slate-50 p-3 transition hover:border-slate-300 hover:bg-white"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                        <Check className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{notification.title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500 line-clamp-2">{notification.body}</p>
                        <div className="mt-3 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.08em] text-slate-400">
                          <span>{new Date(notification.sentAt).toLocaleString()}</span>
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <button
                                type="button"
                                onClick={() => markAsRead(notification.id)}
                                className="rounded-full bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-300"
                              >
                                Mark read
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeNotification(notification.id)}
                              className="rounded-full bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-300"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-2 border-t border-slate-200 pt-3 text-right">
              <Link
                to="/notifications"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                View all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
