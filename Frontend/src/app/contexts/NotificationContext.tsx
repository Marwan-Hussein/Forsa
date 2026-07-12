import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface NotificationMessageDto {
  title?: string;
  body?: string;
  type?: string;
  url?: string;
  sentAt?: string;
  data?: Record<string, unknown>;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  url?: string;
  sentAt: string;
  read: boolean;
  data?: Record<string, unknown>;
}

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (message: NotificationMessageDto) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);
const STORAGE_KEY = "forsa_notifications";

function normalizeNotification(message: NotificationMessageDto): NotificationItem {
  const sentAt = message.sentAt ? new Date(message.sentAt) : new Date();
  const normalizedSentAt = Number.isNaN(sentAt.getTime()) ? new Date() : sentAt;

  return {
    id:
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: message.title?.trim() || "New notification",
    body: message.body?.trim() || "You have a new notification waiting for you.",
    type: message.type?.trim().toLowerCase() || "general",
    url: message.url,
    sentAt: normalizedSentAt.toISOString(),
    read: false,
    data: message.data,
  };
}

function loadStoredNotifications(): NotificationItem[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as NotificationItem[];
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item) => ({
      ...item,
      sentAt: item.sentAt ? new Date(item.sentAt).toISOString() : new Date().toISOString(),
      read: Boolean(item.read),
    }));
  } catch {
    return [];
  }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadStoredNotifications());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (message: NotificationMessageDto) => {
    const notification = normalizeNotification(message);
    setNotifications((prev) => [notification, ...prev].slice(0, 50));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationContext must be used within a NotificationProvider");
  }
  return context;
}
