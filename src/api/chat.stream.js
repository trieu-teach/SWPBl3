import { getAuth } from "firebase/auth";
import {
  API_BASE_URL,
  getStoredAuthToken,
  clearStoredAuthToken,
  notifyUnauthorized,
  ApiError,
} from "../lib/http.js";
import { extractEvents, isValidDoneEvent } from "./chat.sse-parser.js";
import { requireLibrarySourceFilters } from "./chat.filters.js";
import { resolveChatRequestId } from "./chat.request-id.js";

const STREAM_FAILED_MESSAGE = "Luồng phản hồi AI gặp lỗi. Vui lòng thử lại.";
const STREAM_INCOMPLETE_MESSAGE =
  "Phản hồi AI bị gián đoạn trước khi hoàn tất. Vui lòng thử lại.";
const STREAM_INVALID_DONE_MESSAGE =
  "Phản hồi hoàn tất từ AI không hợp lệ. Vui lòng thử lại.";

export class ChatStreamError extends Error {
  constructor(message, { code, retryable, details, status } = {}) {
    super(message);
    this.name = "ChatStreamError";
    if (code !== undefined) this.code = code;
    if (retryable !== undefined) this.retryable = retryable;
    if (details !== undefined) this.details = details;
    if (status !== undefined) this.status = status;
  }
}

async function getAuthHeader() {
  try {
    const firebaseAuth = getAuth();
    const user = firebaseAuth.currentUser;
    if (user) {
      const idToken = await user.getIdToken(false);
      if (idToken) {
        return `Bearer ${idToken}`;
      }
    }
  } catch {
    // ignore
  }
  const token = getStoredAuthToken();
  if (token) {
    return `Bearer ${token}`;
  }
  return "";
}

function createAbortError(cause) {
  if (cause?.name === "AbortError") return cause;
  const error = new Error("The operation was aborted.");
  error.name = "AbortError";
  if (cause) error.cause = cause;
  return error;
}

function createServerStreamError(data) {
  const payload = data && typeof data === "object" ? data : null;
  const message =
    typeof payload?.message === "string" && payload.message.trim()
      ? payload.message
      : typeof data === "string" && data.trim()
        ? data
        : STREAM_FAILED_MESSAGE;

  return new ChatStreamError(message, {
    code: payload?.code,
    details: payload?.details,
    retryable:
      typeof payload?.retryable === "boolean" ? payload.retryable : undefined,
  });
}

/**
 * Parses a chat SSE response and enforces exactly one valid terminal done event.
 * The done event is yielded only after the connection closes cleanly, so EOF,
 * malformed terminals, and duplicate terminals cannot be mistaken for success.
 */
async function* readChatStream(response, signal) {
  if (!response.body) {
    throw new ChatStreamError(STREAM_INCOMPLETE_MESSAGE);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let terminalData = null;
  let reachedEof = false;

  try {
    while (true) {
      if (signal?.aborted) throw createAbortError();

      const { done, value } = await reader.read();
      if (done) {
        buffer += decoder.decode(undefined, { stream: false });
        reachedEof = true;
      } else {
        buffer += decoder.decode(value, { stream: true });
      }

      const extracted = extractEvents(buffer);
      buffer = extracted.remaining;

      for (const event of extracted.events) {
        if (signal?.aborted) throw createAbortError();

        if (terminalData !== null) {
          const message =
            event.type === "done"
              ? "Luồng phản hồi AI chứa nhiều sự kiện hoàn tất."
              : "Luồng phản hồi AI chứa dữ liệu sau sự kiện hoàn tất.";
          throw new ChatStreamError(message);
        }

        if (event.type === "error") {
          throw createServerStreamError(event.data);
        }

        if (event.type === "done") {
          if (!isValidDoneEvent(event.data)) {
            throw new ChatStreamError(STREAM_INVALID_DONE_MESSAGE);
          }
          terminalData = event.data;
          continue;
        }

        yield event;
      }

      if (reachedEof) break;
    }
  } catch (error) {
    if (signal?.aborted) throw createAbortError(error);
    throw error;
  } finally {
    if (!reachedEof) {
      try {
        await reader.cancel();
      } catch {
        // The signal may already have cancelled the reader.
      }
    }
    reader.releaseLock();
  }

  if (signal?.aborted) throw createAbortError();
  if (terminalData === null) {
    throw new ChatStreamError(STREAM_INCOMPLETE_MESSAGE);
  }
  if (buffer.trim()) {
    throw new ChatStreamError(
      "Luồng phản hồi AI kết thúc với dữ liệu không hoàn chỉnh.",
    );
  }

  yield { type: "done", data: terminalData };
}

async function* requestChatStream(path, body, signal) {
  const baseUrl = API_BASE_URL.endsWith("/api")
    ? API_BASE_URL
    : API_BASE_URL + "/api";
  const authHeader = await getAuthHeader();

  let response;
  try {
    response = await fetch(baseUrl + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw createAbortError(error);
    throw error;
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredAuthToken();
      notifyUnauthorized();
    }
    let message = "Request failed";
    let code;
    let details;
    let retryable;
    try {
      const errData = await response.json();
      message = errData.error?.message || errData.message || message;
      code = errData.error?.code || errData.code;
      details = errData.error?.details || errData.details;
      retryable = errData.error?.retryable ?? errData.retryable;
    } catch {
      // ignore
    }
    const requestError = new ApiError(message, response.status, code, details);
    if (typeof retryable === "boolean") requestError.retryable = retryable;
    throw requestError;
  }

  yield* readChatStream(response, signal);
}

export async function* askDocumentStream({
  documentId,
  question,
  sessionId,
  requestId,
  signal,
}) {
  const body = {
    documentId,
    question,
    requestId: resolveChatRequestId(requestId),
  };
  if (sessionId) body.sessionId = sessionId;
  yield* requestChatStream("/chat/ask-document/stream", body, signal);
}

export async function* askLibraryStream({
  question,
  sessionId,
  requestId,
  limit = 5,
  filters,
  signal,
}) {
  const body = {
    question,
    limit,
    requestId: resolveChatRequestId(requestId),
  };
  if (sessionId) body.sessionId = sessionId;

  const cleanedFilters = requireLibrarySourceFilters(filters);
  if (cleanedFilters) body.filters = cleanedFilters;

  yield* requestChatStream("/chat/ask-library/stream", body, signal);
}
