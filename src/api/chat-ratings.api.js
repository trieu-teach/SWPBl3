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
