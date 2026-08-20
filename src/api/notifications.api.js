import { API_BASE_URL, apiClient } from "../lib/http";

/**
 * @typedef {Object} NotificationDto
 * @property {string} id
 * @property {'PAYMENT_SUCCESS'|'PAYMENT_REFUNDED'|'SUBSCRIPTION_EXPIRED'|'SUBSCRIPTION_EXPIRING_SOON'|'ACCOUNT_STATUS_CHANGED'|'ACCOUNT_ROLE_CHANGED'|'REPORT_RESOLVED'} type
 * @property {string} title
 * @property {string} body
 * @property {Record<string, unknown>|null} metadata
 * @property {string|null} referenceId
 * @property {boolean} isRead
 * @property {string} createdAt
 */

/**
 * Get paginated list of notifications
 * @param {{ isRead?: boolean, page?: number, limit?: number }} params
 * @returns {Promise<{ items: NotificationDto[], meta: { page: number, limit: number, totalItems: number, totalPages: number, hasNext: boolean, hasPrevious: boolean } }>}
 */
export async function getNotifications({ isRead, page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams();
  if (isRead !== undefined) params.set("isRead", String(isRead));
  if (page > 1) params.set("page", String(page));
  if (limit !== 20) params.set("limit", String(limit));
  const query = params.toString();
  return apiClient.get(`/notifications${query ? `?${query}` : ""}`);
}

/**
 * Get unread notification count
 * @returns {Promise<{ count: number }>}
 */
export async function getUnreadCount() {
  return apiClient.get("/notifications/unread-count");
}

/**
 * Mark a single notification as read
 * @param {string} id
 */
export async function markAsRead(id) {
  return apiClient.patch(`/notifications/${id}/read`);
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead() {
  return apiClient.patch("/notifications/read-all");
}

/**
 * Create SSE connection for real-time notifications
 * Requires Firebase ID token in Authorization header
 *
 * @param {() => Promise<string|undefined>} getToken - Returns a current Firebase ID token
 * @param {(notification: NotificationDto) => void} onNotification
 * @param {() => void} [onError]
 * @param {() => void} [onConnect]
 * @returns {() => void} cleanup function
 */
export function createNotificationStream(getToken, onNotification, onError, onConnect) {
  let aborted = false;
  let retryTimeout;
  let controller;

  async function connect() {
    if (aborted) return;

    try {
      const token = await getToken();
      if (!token || aborted) return;

      const apiBase = API_BASE_URL.endsWith("/api")
        ? API_BASE_URL
        : `${API_BASE_URL}/api`;
      controller = new AbortController();
      const response = await fetch(`${apiBase}/notifications/stream`, {
        headers: {
          Accept: "text/event-stream",
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error("Stream connection failed");
      }

      onConnect?.();
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (!aborted) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            onNotification(JSON.parse(line.slice(6)));
          } catch {
            // Ignore malformed events and keep the stream alive.
          }
        }
      }

      if (!aborted) {
        retryTimeout = setTimeout(connect, 5000);
      }
    } catch {
      if (!aborted) {
        onError?.();
        retryTimeout = setTimeout(connect, 5000);
      }
    }
  }

  connect();

  return () => {
    aborted = true;
    controller?.abort();
    if (retryTimeout) clearTimeout(retryTimeout);
  };
}
