import { mockAiResponses } from "../mocks/chat.mock.js";

const MOCK_RESPONSE_DELAY = 900;
const ERROR_PATTERNS = ["error", "fail", "lỗi", "loi", "thất bại", "that bai"];

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function shouldFail(message) {
  const normalized = message.toLowerCase();
  return ERROR_PATTERNS.some((pattern) => normalized.includes(pattern));
}

function pickMockResponse(message) {
  const normalized = message.toLowerCase();

  if (normalized.includes("checklist") || normalized.includes("danh sách")) {
    return mockAiResponses.checklist;
  }

  if (message.length > 120) {
    return mockAiResponses.longExplanation;
  }

  return mockAiResponses.shortAnswer;
}

export async function sendMockMessage(message) {
  await delay(MOCK_RESPONSE_DELAY);

  if (shouldFail(message)) {
    throw new Error(
      "AI Study Hub chưa thể tạo phản hồi cho tin nhắn này. Vui lòng thử lại.",
    );
  }

  return {
    content: pickMockResponse(message),
  };
}
