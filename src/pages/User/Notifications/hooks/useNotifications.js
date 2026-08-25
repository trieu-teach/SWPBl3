import { useState, useEffect, useCallback, useRef } from "react";
import {
  createNotificationStream,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../../../../api/notifications.api";
import { auth } from "../../../../lib/firebase.js";

/**
 * useNotifications - Hook quản lý notifications với real-time SSE
 * 
 * Tính năng:
 * - Tải danh sách notifications (phân trang, lọc read/unread)
 * - Real-time update qua Server-Sent Events (SSE)
 * - Đếm số thông báo chưa đọc
 * - Đánh dấu đã đọc (từng cái hoặc tất cả)
 * - Load more (infinite scroll)
 */
export function useNotifications({ isRead } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // Còn thông báo để load nữa không
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  // Ref lưu hàm refresh để SSE effect có thể gọi
  const refreshRef = useRef(null);

  // Reset state khi filter thay đổi
  useEffect(() => {
    setNotifications([]);
    setPage(1);
    setHasMore(false);
  }, [isRead]);

  // Refresh notifications - gọi API lấy page 1
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Gọi song song: lấy danh sách notifications và số chưa đọc
      const [notificationsRes, countRes] = await Promise.all([
        getNotifications({ isRead, page: 1, limit: 20 }),
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
  }, [isRead]);

  // Giữ ref đồng bộ với hàm refresh
  refreshRef.current = refresh;

  // Initial load - chạy 1 lần khi mount hoặc isRead thay đổi
  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      setIsLoading(true);
      setError(null);
      try {
        const [notificationsRes, countRes] = await Promise.all([
          getNotifications({ isRead, page: 1, limit: 20 }),
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
  }, [isRead]);

  // SSE real-time connection - lắng nghe notifications mới từ server
  useEffect(() => {
    let cancelled = false;
    let stopStream = () => {};

    async function startStream() {
      try {
        // Đợi Firebase auth sẵn sàng
        await auth.authStateReady();
        if (cancelled || !auth.currentUser) return;

        // Tạo SSE stream với Firebase token
        stopStream = createNotificationStream(
          async () => auth.currentUser?.getIdToken(false),
          // Callback khi nhận được notification mới
          (notification) => {
            if (!notification?.id) return;
            setNotifications((current) => {
              // Tránh duplicate
              if (current.some((item) => item.id === notification.id)) {
                return current;
              }
              // Tăng unread count nếu notification chưa đọc
              if (!notification.isRead) {
                setUnreadCount((count) => count + 1);
              }
              // Thêm vào đầu danh sách
              return [notification, ...current];
            });
          },
          undefined,
          // Callback khi có lỗi -> refresh toàn bộ
          () => refreshRef.current?.(),
        );
      } catch {
        // REST list vẫn hoạt động nếu SSE không khởi tạo được
      }
    }

    startStream();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, []);

  // Load more - gọi khi scroll tới cuối danh sách
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await getNotifications({ isRead, page: nextPage, limit: 20 });
      setNotifications((current) => {
        const existingIds = new Set(current.map((item) => item.id));
        // Lọc bỏ duplicates nếu có
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
  }, [isLoadingMore, hasMore, page, isRead]);

  // Đánh dấu 1 notification là đã đọc
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

  // Đánh dấu tất cả notifications là đã đọc
  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn("Failed to mark all as read:", err);
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
