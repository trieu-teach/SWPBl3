import { useState, useEffect, useCallback, useRef } from "react";
import { getAuth } from "firebase/auth";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../../../../api/notifications.api";

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Initial load
  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      setIsLoading(true);
      setError(null);
      try {
        const [notificationsRes, countRes] = await Promise.all([
          getNotifications({ page: 1, limit: 20 }),
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

  // SSE real-time connection
  useEffect(() => {
    let cleanup = null;

    async function startStream() {
      try {
        const firebaseAuth = getAuth();
        const user = firebaseAuth.currentUser;
        if (!user) return;

        const token = await user.getIdToken(true);

        // Using EventSource as fallback since we can't set custom headers
        // For production, use @microsoft/fetch-event-source or similar
        const url = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"}/api/notifications/stream`;
        
        const es = new EventSource(url, { withCredentials: true });

        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.id) {
              // Prepend new notification to the list
              setNotifications((prev) => [data, ...prev]);
              setUnreadCount((prev) => prev + 1);
            }
          } catch (e) {
            // Ignore parse errors for heartbeat messages
          }
        };

        es.onerror = () => {
          es.close();
          // Reconnect after 5 seconds
          reconnectTimeoutRef.current = setTimeout(startStream, 5000);
        };

        es.onopen = () => {
          // Connection established
        };

        eventSourceRef.current = es;
        cleanup = () => {
          es.close();
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
        };
      } catch (err) {
        console.warn("Failed to start notification stream:", err);
      }
    }

    startStream();

    return () => {
      cleanup?.();
    };
  }, []);

  // Load more notifications
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await getNotifications({ page: nextPage, limit: 20 });
      setNotifications((prev) => [...prev, ...(res.items || res)]);
      setHasMore(res.meta?.hasNext ?? false);
      setPage(nextPage);
    } catch (err) {
      setError(err.message || "Failed to load more");
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, page]);

  // Mark single notification as read
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

  // Mark all as read
  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn("Failed to mark all as read:", err);
    }
  }, []);

  // Refresh notifications
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [notificationsRes, countRes] = await Promise.all([
        getNotifications({ page: 1, limit: 20 }),
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

  return {
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
}
