import { useNotifications as useNotificationsContext } from "../context/NotificationContext.jsx";

export function useNotifications({ isRead } = {}) {
  const {
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
  } = useNotificationsContext();

  const filteredNotifications = isRead !== undefined
    ? notifications.filter(n => n.isRead === isRead)
    : notifications;

  return {
    notifications: filteredNotifications,
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
