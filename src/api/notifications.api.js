import { apiClient } from "../lib/http";

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
 * @param {string} token - Firebase ID token
 * @param {(notification: NotificationDto) => void} onNotification
 * @param {() => void} [onError]
 * @param {() => void} [onConnect]
 * @returns {() => void} cleanup function
 */
export function createNotificationStream(token, onNotification, onError, onConnect) {
  let aborted = false;
  let retryTimeout;

  function connect() {
    if (aborted) return;

    const es = new EventSource(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"}/api/notifications/stream`, {
      withCredentials: true,
    });

    // Use fetch-based approach for custom headers
    // EventSource doesn't support custom headers, so we use a workaround
    // The token is passed via query param for SSE (exception to the rule for SSE)
    const streamUrl = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"}/api/notifications/stream`;
    
    fetch(streamUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Stream connection failed");
        onConnect?.();
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        function read() {
          reader.read().then(({ done, value }) => {
            if (done || aborted) return;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith(":")) continue; // heartbeat
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));
                  onNotification(data);
                } catch (e) {
                  console.warn("Failed to parse SSE data:", line);
                }
              }
            }

            read();
          });
        }

        read();
      })
      .catch((err) => {
        if (!aborted) {
          onError?.();
          // Reconnect after 5 seconds
          retryTimeout = setTimeout(connect, 5000);
        }
      });
  }

  connect();

  return () => {
    aborted = true;
    if (retryTimeout) clearTimeout(retryTimeout);
  };
}
