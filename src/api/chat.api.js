import { ApiError, apiRequest } from "../lib/http.js";

const DEFAULT_LIBRARY_LIMIT = 5;
const MAX_SELECTED_DOCUMENTS = 10;

export { MAX_SELECTED_DOCUMENTS };

function mapChatRequest({ question, documentIds }) {
  const body = {
    question,
    limit: DEFAULT_LIBRARY_LIMIT,
  };

  if (Array.isArray(documentIds) && documentIds.length > 0) {
    body.filters = { documentIds };
  }

  return body;
}

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

export async function sendChatMessage({ question, documentIds }) {
  const response = await apiRequest("/chat/ask-library", {
    method: "POST",
    body: mapChatRequest({ question, documentIds }),
  });

  return mapChatResponse(response);
}
