import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  createNotificationStream,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../../../../api/notifications.api";
import { auth } from "../../../../lib/firebase.js";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const refreshRef = useRef(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [notificationsRes, countRes] = await Promise.all([
        getNotifications({ isRead: undefined, page: 1, limit: 20 }),
        getUnreadCount(),
      ]);
      setNotifications(notificationsRes.items || notificationsRes);
      setUnreadCount(countRes?.count ?? 0);
      setHasMore(notificationsRes.meta?.hasNext ?? false);
      setPage(1);
    } catch (err) {
      setError(err.message || "Failed to refresh");
    } finally {
      setIsLoading(false);
    }
  }, []);

  refreshRef.current = refresh;

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      setIsLoading(true);
      setError(null);
      try {
        const [notificationsRes, countRes] = await Promise.all([
          getNotifications({ isRead: undefined, page: 1, limit: 20 }),
          getUnreadCount(),
        ]);
        if (!cancelled) {
          setNotifications(notificationsRes.items || notificationsRes);
          setUnreadCount(countRes?.count ?? 0);
          setHasMore(notificationsRes.meta?.hasNext ?? false);
          setPage(1);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load notifications");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadInitial();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let stopStream = () => {};

    async function startStream() {
      try {
        await auth.authStateReady();
        if (cancelled || !auth.currentUser) return;

        stopStream = createNotificationStream(
          async () => auth.currentUser?.getIdToken(false),
          (notification) => {
            if (!notification?.id) return;
            setNotifications((current) => {
              if (current.some((item) => item.id === notification.id)) {
                return current;
              }
              if (!notification.isRead) {
                setUnreadCount((count) => count + 1);
              }
              return [notification, ...current];
            });
          },
          undefined,
          () => refreshRef.current?.(),
        );
      } catch {
        // The REST list remains available if the live stream cannot start.
      }
    }

    startStream();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, []);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await getNotifications({ isRead: undefined, page: nextPage, limit: 20 });
      setNotifications((current) => {
        const existingIds = new Set(current.map((item) => item.id));
        const newItems = (res.items || res).filter(
          (item) => !existingIds.has(item.id),
        );
        return [...current, ...newItems];
      });
      setHasMore(res.meta?.hasNext ?? false);
      setPage(nextPage);
    } catch (err) {
      setError(err.message || "Failed to load more");
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, page]);

  const markNotificationAsRead = useCallback(async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn("Failed to mark notification as read:", err);
    }
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn("Failed to mark all as read:", err);
    }
  }, []);

  const value = {
    notifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    refresh,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}
