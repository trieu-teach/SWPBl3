import { ApiError, apiRequest } from "../lib/http.js";

const DEFAULT_LIBRARY_LIMIT = 5;
const DEFAULT_SESSIONS_LIMIT = 20;
const DEFAULT_MESSAGES_LIMIT = 50;
const MAX_SELECTED_DOCUMENTS = 10;

export { MAX_SELECTED_DOCUMENTS };

// ── Request mappers ───────────────────────────────────────────────────────────

function mapChatRequest({ question, documentIds, sessionId }) {
  const body = {
    question,
    limit: DEFAULT_LIBRARY_LIMIT,
  };

  if (sessionId) {
    body.sessionId = sessionId;
  }

  if (Array.isArray(documentIds) && documentIds.length > 0) {
    body.filters = { documentIds };
  }

  return body;
}

// ── Response mappers ──────────────────────────────────────────────────────────

function mapChatResponse(response) {
  if (!response || typeof response.answer !== "string") {
    throw new ApiError("Phản hồi từ AI không hợp lệ.", -1);
  }

  return {
    answer: response.answer,
    sessionId: response.sessionId || null,
    messageId: response.messageId || null,
    suggestedPrompts: Array.isArray(response.suggestedPrompts)
      ? response.suggestedPrompts
      : [],
    sources: Array.isArray(response.sources) ? response.sources : [],
    answerStatus: response.answerStatus || "ANSWERED",
  };
}

/**
 * Map a raw ChatMessageDto from GET /chat/messages/{sessionId}
 * to the internal UI message model used by useChat.
 */
export function mapHistoryMessage(dto) {
  const role =
    dto.sender === "USER"
      ? "user"
      : dto.sender === "AI"
        ? "assistant"
        : "system";

  return {
    id: dto.id,
    sessionId: dto.sessionId,
    role,
    content: dto.content,
    status: "complete",
    sources: Array.isArray(dto.sources) ? dto.sources : [],
    createdAt: formatHistoryTime(dto.createdAt),
    retryOf: null,
    fromHistory: true,
  };
}

function formatHistoryTime(isoString) {
  if (!isoString) return "";
  try {
    return new Date(isoString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

// ── Error message helpers ─────────────────────────────────────────────────────

export function getChatErrorMessage(error) {
  if (error?.status === -1) {
    return "Phản hồi từ AI không hợp lệ. Vui lòng thử lại.";
  }
  if (error?.status === 0) {
    return "Không thể kết nối tới AI Study Hub. Vui lòng kiểm tra mạng và thử lại.";
  }
  if (error?.status === 400) {
    return "Câu hỏi chưa hợp lệ. Vui lòng rút gọn hoặc nhập lại nội dung.";
  }
  if (error?.status === 401) {
    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.";
  }
  if (error?.status === 403) {
    return "Bạn không có quyền sử dụng phiên chat này.";
  }
  if (error?.status === 404) {
    return "Không tìm thấy phiên chat cần xử lý.";
  }
  if (error?.status === 409) {
    return "Nội dung thư viện chưa sẵn sàng để AI xử lý. Vui lòng thử lại sau.";
  }
  if (error?.status >= 500) {
    return "Máy chủ AI đang gặp sự cố. Vui lòng thử lại sau.";
  }
  return error?.message || "Đã xảy ra lỗi khi tạo phản hồi AI.";
}

export function getHistoryErrorMessage(error) {
  if (error?.status === 401) {
    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  }
  if (error?.status === 403) {
    return "Bạn không có quyền truy cập cuộc hội thoại này.";
  }
  if (error?.status === 404) {
    return "Không tìm thấy cuộc hội thoại.";
  }
  if (error?.status === 0) {
    return "Không thể kết nối. Vui lòng kiểm tra mạng và thử lại.";
  }
  if (error?.status >= 500) {
    return "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.";
  }
  return error?.message || "Không thể tải lịch sử hội thoại.";
}

// ── API functions ─────────────────────────────────────────────────────────────

/**
 * POST /chat/ask-library
 */
export async function sendChatMessage({ question, documentIds, sessionId }) {
  const response = await apiRequest("/chat/ask-library", {
    method: "POST",
    body: mapChatRequest({ question, documentIds, sessionId }),
  });

  return mapChatResponse(response);
}

/**
 * GET /chat/sessions?page=&limit=
 */
export async function getChatSessions({ page = 1, limit = DEFAULT_SESSIONS_LIMIT } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiRequest(`/chat/sessions?${params}`);
}

/**
 * GET /chat/messages/{sessionId}?page=&limit=
 */
export async function getChatMessages(sessionId, { page = 1, limit = DEFAULT_MESSAGES_LIMIT } = {}) {
  if (!sessionId) throw new Error("sessionId is required");
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiRequest(`/chat/messages/${sessionId}?${params}`);
}
