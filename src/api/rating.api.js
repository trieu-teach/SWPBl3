import { apiRequest } from "../lib/http.js";

/**
 * Đánh giá tin nhắn AI Chat (Thumbs Up / Down)
 * @param {string} messageId - ID tin nhắn cần đánh giá
 * @param {boolean} isHelpful - true = Thumbs Up, false = Thumbs Down
 * @returns {Promise<{ id: string, messageId: string, userId: string, isHelpful: boolean, createdAt: string }>}
 */
export function rateChatMessage(messageId, isHelpful) {
  if (!messageId) {
    throw new Error("messageId is required to rate chat message");
  }
  return apiRequest(`/chat/messages/${encodeURIComponent(messageId)}/rating`, {
    method: "POST",
    body: { isHelpful: Boolean(isHelpful) },
  });
}

/**
 * Đánh giá tài liệu công khai là hữu ích hoặc không
 * @param {string} documentId - ID của tài liệu
 * @param {boolean} isHelpful - true = Hữu ích, false = Không hữu ích
 * @returns {Promise<{ success: boolean }>}
 */
export function rateDocument(documentId, isHelpful) {
  if (!documentId) {
    throw new Error("documentId is required to rate document");
  }
  return apiRequest(`/documents/${encodeURIComponent(documentId)}/rate`, {
    method: "POST",
    body: { isHelpful: Boolean(isHelpful) },
  });
}

/**
 * Lấy danh sách Top tài liệu được đánh giá cao nhất
 * @param {object} params
 * @param {number} [params.page=1]
 * @param {number} [params.limit=20]
 * @param {'rating'|'downloadCount'} [params.sortBy='rating']
 * @returns {Promise<{ items: Array<object>, meta: object }>}
 */
export function getTopRatedDocuments({
  page = 1,
  limit = 20,
  sortBy = "rating",
} = {}) {
  const params = new URLSearchParams();
  if (page !== undefined && page !== null) {
    params.set("page", String(page));
  }
  if (limit !== undefined && limit !== null) {
    params.set("limit", String(limit));
  }
  if (sortBy) {
    params.set("sortBy", String(sortBy));
  }
  return apiRequest(`/documents/top-rated?${params.toString()}`);
}
