import { createChatRequestId } from "../../../api/chat.request-id.js";
import {
  CHAT_MODE_DOCUMENT,
  CHAT_MODE_LIBRARY,
} from "./chatContext.js";

export const PENDING_CONTENT = "Đang suy nghĩ...";
export const CANCELLED_CONTENT =
  "Đã dừng hiển thị phản hồi. AI có thể vẫn hoàn tất và lưu câu trả lời.";
export const RETRY_REQUEST_ID_REUSE = "reuse";
export const RETRY_REQUEST_ID_RENEW = "renew";
export const RETRY_DISABLED = "disabled";

const INVALID_DONE_ERROR =
  "Phản hồi hoàn tất từ AI không hợp lệ. Vui lòng thử lại.";

export function normalizeId(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized || null;
}

export function snapshotLibraryFilters(filters) {
  if (filters === null || filters === undefined) return null;
  if (typeof filters !== "object" || Array.isArray(filters)) return null;

  const snapshot = {};
  if (typeof filters.subjectId === "string" && filters.subjectId.trim()) {
    snapshot.subjectId = filters.subjectId;
  }
  if (Array.isArray(filters.subjectIds) && filters.subjectIds.length > 0) {
    snapshot.subjectIds = [...filters.subjectIds];
  }
  if (typeof filters.categoryId === "string" && filters.categoryId.trim()) {
    snapshot.categoryId = filters.categoryId;
  }
  if (typeof filters.fileType === "string" && filters.fileType.trim()) {
    snapshot.fileType = filters.fileType;
  }
  if (Array.isArray(filters.documentIds) && filters.documentIds.length > 0) {
    snapshot.documentIds = [...filters.documentIds];
  }

  return Object.keys(snapshot).length > 0 ? snapshot : null;
}

export function createConversationScope(context, enabled) {
  if (!enabled) return null;

  if (context?.mode === CHAT_MODE_DOCUMENT) {
    const documentId = normalizeId(context.documentId);
    if (!documentId) return null;

    const contextSnapshot = {
      mode: CHAT_MODE_DOCUMENT,
      documentId,
    };
    return {
      key: JSON.stringify([CHAT_MODE_DOCUMENT, documentId]),
      context: contextSnapshot,
    };
  }

  if (context?.mode === CHAT_MODE_LIBRARY) {
    if (
      context.libraryFilters !== null &&
      context.libraryFilters !== undefined &&
      (typeof context.libraryFilters !== "object" ||
        Array.isArray(context.libraryFilters))
    ) {
      return null;
    }

    const libraryFilters = snapshotLibraryFilters(context.libraryFilters);
    const contextSnapshot = {
      mode: CHAT_MODE_LIBRARY,
      libraryFilters,
    };
    return {
      key: JSON.stringify([CHAT_MODE_LIBRARY]),
      context: contextSnapshot,
    };
  }

  return null;
}

export function cloneContextSnapshot(context) {
  if (context.mode === CHAT_MODE_DOCUMENT) {
    return { mode: CHAT_MODE_DOCUMENT, documentId: context.documentId };
  }

  return {
    mode: CHAT_MODE_LIBRARY,
    libraryFilters: snapshotLibraryFilters(context.libraryFilters),
  };
}

export function createRequestSnapshot(
  question,
  context,
  sessionId,
  requestId = createChatRequestId(),
) {
  return {
    question,
    context: cloneContextSnapshot(context),
    sessionId: normalizeId(sessionId),
    requestId,
  };
}

function isLikelyNetworkError(error) {
  if (error?.status === 0) return true;
  if (error?.name !== "TypeError") return false;
  return /fetch|network|load failed/i.test(error?.message ?? "");
}

export function getChatRetryPolicy(error, errorPresentation = {}) {
  if (error?.code === "REQUEST_IN_PROGRESS") {
    return {
      retryable: false,
      requestIdStrategy: RETRY_DISABLED,
    };
  }

  if (
    error?.code === "STREAM_REQUEST_FAILED" ||
    Number(error?.status) >= 500
  ) {
    return {
      retryable: true,
      requestIdStrategy: RETRY_REQUEST_ID_RENEW,
    };
  }

  if (
    isLikelyNetworkError(error) ||
    (error?.name === "ChatStreamError" && !error?.code)
  ) {
    return {
      retryable: true,
      requestIdStrategy: RETRY_REQUEST_ID_REUSE,
    };
  }

  if (errorPresentation.retryable === true || error?.retryable === true) {
    return {
      retryable: true,
      requestIdStrategy: RETRY_REQUEST_ID_RENEW,
    };
  }

  return {
    retryable: false,
    requestIdStrategy: RETRY_DISABLED,
  };
}

export function prepareRetryRequestSnapshot(
  requestSnapshot,
  requestIdStrategy,
  renewedRequestId,
) {
  return {
    ...requestSnapshot,
    context: cloneContextSnapshot(requestSnapshot.context),
    requestId:
      requestIdStrategy === RETRY_REQUEST_ID_RENEW
        ? renewedRequestId ?? createChatRequestId()
        : requestSnapshot.requestId,
  };
}

function createMessageId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function formatTime(date) {
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function createMessage({
  role,
  content,
  status = "sent",
  retryOf = null,
  id = createMessageId(),
  createdAt = formatTime(new Date()),
}) {
  return {
    id,
    role,
    content,
    status,
    retryOf,
    createdAt,
  };
}

export function cancelAssistantMessage(
  message,
  { createdAt = formatTime(new Date()) } = {},
) {
  const hasPartial = message.content && message.content !== PENDING_CONTENT;
  return {
    ...message,
    content: hasPartial
      ? `${message.content}\n\n_${CANCELLED_CONTENT}_`
      : CANCELLED_CONTENT,
    status: "cancelled",
    streamPhase: "CANCELLED",
    streamRetryable: false,
    retryRequestIdStrategy: RETRY_DISABLED,
    errorDetail: undefined,
    createdAt,
  };
}

export function prependUniqueMessages(olderMessages, currentMessages) {
  const seenIds = new Set(currentMessages.map((message) => message.id));
  const uniqueOlderMessages = olderMessages.filter((message) => {
    if (seenIds.has(message.id)) return false;
    seenIds.add(message.id);
    return true;
  });

  return [...uniqueOlderMessages, ...currentMessages];
}

export function parseChatDoneEvent(data, expectedSessionId) {
  const sessionId = normalizeId(data?.sessionId);
  const messageId = normalizeId(data?.messageId);
  if (
    typeof data?.answer !== "string" ||
    !sessionId ||
    !messageId ||
    (expectedSessionId && sessionId !== expectedSessionId)
  ) {
    throw new Error(INVALID_DONE_ERROR);
  }

  return {
    answer: data.answer,
    sessionId,
    messageId,
    sources: data.sources,
    suggestedPrompts: data.suggestedPrompts,
    answerStatus: data.answerStatus,
    usage: data.usage ?? null,
  };
}

export function completeAssistantMessage(
  message,
  doneEvent,
  { receivedDelta = false, createdAt = formatTime(new Date()) } = {},
) {
  return {
    ...message,
    content: receivedDelta ? message.content : doneEvent.answer,
    status: "complete",
    streamPhase: "COMPLETED",
    backendMessageId: doneEvent.messageId,
    sessionId: doneEvent.sessionId,
    ...(Array.isArray(doneEvent.sources)
      ? { sources: doneEvent.sources }
      : {}),
    ...(Array.isArray(doneEvent.suggestedPrompts)
      ? { suggestedPrompts: doneEvent.suggestedPrompts }
      : {}),
    ...(typeof doneEvent.answerStatus === "string"
      ? { answerStatus: doneEvent.answerStatus }
      : {}),
    createdAt,
  };
}

export function validateChatProgressEvent(type, data) {
  if (type === "sources" && !Array.isArray(data)) {
    throw new Error("Danh sách nguồn từ AI không hợp lệ.");
  }
  if (type === "delta" && typeof data?.text !== "string") {
    throw new Error("Dữ liệu phản hồi AI không hợp lệ.");
  }
  return { type, data };
}

export function applyChatProgressEvent(message, { type, data }) {
  const nextMessage = { ...message };
  if (type === "status") {
    nextMessage.status = "streaming";
    nextMessage.streamPhase = data.phase;
    if (
      data.phase === "generating" &&
      nextMessage.content === PENDING_CONTENT
    ) {
      nextMessage.content = "";
    }
  } else if (type === "sources") {
    nextMessage.status = "streaming";
    nextMessage.sources = data;
    if (nextMessage.content === PENDING_CONTENT) {
      nextMessage.content = "";
    }
  } else if (type === "delta") {
    nextMessage.status = "streaming";
    if (nextMessage.content === PENDING_CONTENT) {
      nextMessage.content = "";
    }
    nextMessage.content += data.text;
  }

  return nextMessage;
}
