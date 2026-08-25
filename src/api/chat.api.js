import { ApiError, apiRequest } from "../lib/http.js";
import {
  buildChatSessionPayload,
  requireLibrarySourceFilters,
} from "./chat.filters.js";
import {
  LIBRARY_DOCUMENT_LIMIT_MESSAGE,
  MAX_LIBRARY_DOCUMENTS,
} from "./chat.constants.js";
import { resolveChatRequestId } from "./chat.request-id.js";
export {
  getChatErrorMessage,
  getHistoryErrorMessage,
} from "./chat.errors.js";

const DEFAULT_LIBRARY_LIMIT = 5;
const DEFAULT_SESSIONS_LIMIT = 20;
const DEFAULT_MESSAGES_LIMIT = 50;
// ── Request mappers ───────────────────────────────────────────────────────────

function mapChatRequest({
  question,
  filters,
  subjectId,
  subjectIds,
  documentIds,
  sessionId,
  requestId,
}) {
  const body = {
    question,
    limit: DEFAULT_LIBRARY_LIMIT,
    requestId: resolveChatRequestId(requestId),
  };

  if (sessionId) {
    body.sessionId = sessionId;
  }

  const cleanedFilters = requireLibrarySourceFilters(
    filters ?? { subjectId, subjectIds, documentIds },
  );
  if (cleanedFilters) body.filters = cleanedFilters;

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
    errorCode: response.errorCode ?? null,
    usage: response.usage ?? null,
  };
}

/**
 * Map a raw ChatMessageDto from GET /chat/sessions/{sessionId}/messages
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

// ── API functions ─────────────────────────────────────────────────────────────

/**
 * POST /chat/ask-library
 */
export async function sendChatMessage({
  question,
  filters,
  subjectId,
  subjectIds,
  documentIds,
  sessionId,
  requestId,
}) {
  const response = await apiRequest("/chat/ask-library", {
    method: "POST",
    body: mapChatRequest({
      question,
      filters,
      subjectId,
      subjectIds,
      documentIds,
      sessionId,
      requestId,
    }),
  });

  return mapChatResponse(response);
}

export function createChatSession({
  mode,
  documentId,
  documentIds,
  signal,
} = {}) {
  const body = buildChatSessionPayload({ mode, documentId, documentIds });
  return apiRequest("/chat/sessions", { method: "POST", body, signal });
}

export function renameChatSession(sessionId, title) {
  if (!sessionId) throw new Error("sessionId is required");
  return apiRequest(`/chat/sessions/${sessionId}`, {
    method: "PATCH",
    body: { title: title.trim() },
  });
}

export function deleteChatSession(sessionId) {
  if (!sessionId) throw new Error("sessionId is required");
  return apiRequest(`/chat/sessions/${sessionId}`, { method: "DELETE" });
}

export function addChatSessionDocuments(sessionId, documentIds) {
  if (!sessionId) throw new Error("sessionId is required");
  const normalizedDocumentIds = Array.isArray(documentIds)
    ? [
        ...new Set(
          documentIds
            .map((id) => (typeof id === "string" ? id.trim() : ""))
            .filter(Boolean),
        ),
      ]
    : [];
  if (normalizedDocumentIds.length === 0) {
    throw new Error("documentIds is required");
  }
  if (normalizedDocumentIds.length > MAX_LIBRARY_DOCUMENTS) {
    throw new RangeError(LIBRARY_DOCUMENT_LIMIT_MESSAGE);
  }

  return apiRequest(`/chat/sessions/${sessionId}/documents`, {
    method: "POST",
    body: { documentIds: normalizedDocumentIds },
  });
}

export function removeChatSessionDocument(sessionId, documentId) {
  if (!sessionId) throw new Error("sessionId is required");
  const normalizedDocumentId =
    typeof documentId === "string" ? documentId.trim() : "";
  if (!normalizedDocumentId) throw new Error("documentId is required");

  return apiRequest(
    `/chat/sessions/${sessionId}/documents/${encodeURIComponent(normalizedDocumentId)}`,
    { method: "DELETE" },
  );
}

export function getAiChatDocuments({
  source = "all",
  search,
  page = 1,
  limit = 20,
} = {}) {
  const params = new URLSearchParams({
    source,
    page: String(page),
    limit: String(limit),
  });
  if (search) params.set("search", search);
  return apiRequest(`/chat/documents?${params}`);
}

/**
 * GET /chat/sessions?mode=&documentId=&page=&limit=
 */
export async function getChatSessions({
  mode,
  documentId,
  page = 1,
  limit = DEFAULT_SESSIONS_LIMIT,
} = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (mode) params.set("mode", mode);
  if (documentId) params.set("documentId", documentId);
  return apiRequest(`/chat/sessions?${params}`);
}

/**
 * GET /chat/sessions/{sessionId}
 */
export async function getChatSession(sessionId) {
  if (!sessionId) throw new Error("sessionId is required");
  return apiRequest(`/chat/sessions/${sessionId}`);
}

/**
 * GET /chat/sessions/{sessionId}/messages?page=&limit=
 */
export async function getChatMessages(sessionId, { page = 1, limit = DEFAULT_MESSAGES_LIMIT } = {}) {
  if (!sessionId) throw new Error("sessionId is required");
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return apiRequest(`/chat/sessions/${sessionId}/messages?${params}`);
}
