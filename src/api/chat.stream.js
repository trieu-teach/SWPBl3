import { getAuth } from "firebase/auth";
import {
  API_BASE_URL,
  getStoredAuthToken,
  clearStoredAuthToken,
  notifyUnauthorized,
  ApiError,
} from "../lib/http.js";

const STREAM_FAILED_MESSAGE = "Luồng phản hồi AI gặp lỗi. Vui lòng thử lại.";
const STREAM_INCOMPLETE_MESSAGE =
  "Phản hồi AI bị gián đoạn trước khi hoàn tất. Vui lòng thử lại.";
const STREAM_INVALID_DONE_MESSAGE =
  "Phản hồi hoàn tất từ AI không hợp lệ. Vui lòng thử lại.";

export class ChatStreamError extends Error {
  constructor(message, { code, retryable } = {}) {
    super(message);
    this.name = "ChatStreamError";
    if (code !== undefined) this.code = code;
    if (retryable !== undefined) this.retryable = retryable;
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

function parseEventChunk(eventChunk) {
  const lines = eventChunk.split(/\r?\n/);
  let eventType = "message";
  const dataLines = [];

  for (const line of lines) {
    if (line.startsWith("event:")) {
      eventType = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).replace(/^ /, ""));
    }
  }

  if (dataLines.length === 0) return null;

  const eventData = dataLines.join("\n");
  try {
    return { type: eventType, data: JSON.parse(eventData) };
  } catch {
    return { type: eventType, data: eventData };
  }
}

function extractEvents(buffer) {
  const events = [];
  let remaining = buffer;
  let boundary = remaining.match(/\r?\n\r?\n/);

  while (boundary?.index !== undefined) {
    const eventChunk = remaining.slice(0, boundary.index);
    remaining = remaining.slice(boundary.index + boundary[0].length);
    const event = parseEventChunk(eventChunk);
    if (event) events.push(event);
    boundary = remaining.match(/\r?\n\r?\n/);
  }

  return { events, remaining };
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
    retryable:
      typeof payload?.retryable === "boolean" ? payload.retryable : undefined,
  });
}

function validateDone(data) {
  return (
    data !== null &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    typeof data.answer === "string" &&
    typeof data.sessionId === "string" &&
    data.sessionId.trim().length > 0 &&
    typeof data.messageId === "string" &&
    data.messageId.trim().length > 0
  );
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
          if (!validateDone(event.data)) {
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
    try {
      const errData = await response.json();
      message = errData.error?.message || errData.message || message;
    } catch {
      // ignore
    }
    throw new ApiError(message, response.status);
  }

  yield* readChatStream(response, signal);
}

export async function* askDocumentStream({
  documentId,
  question,
  sessionId,
  signal,
}) {
  const body = { documentId, question };
  if (sessionId) body.sessionId = sessionId;
  yield* requestChatStream("/chat/ask-document/stream", body, signal);
}

export async function* askLibraryStream({
  question,
  sessionId,
  limit = 5,
  filters,
  signal,
}) {
  const body = { question, limit };
  if (sessionId) body.sessionId = sessionId;

  if (filters) {
    const cleanedFilters = {};
    if (filters.subjectId) cleanedFilters.subjectId = filters.subjectId;
    if (filters.subjectIds?.length > 0) {
      cleanedFilters.subjectIds = filters.subjectIds;
    }
    if (filters.categoryId) cleanedFilters.categoryId = filters.categoryId;
    if (filters.fileType) cleanedFilters.fileType = filters.fileType;
    if (filters.documentIds?.length > 0) {
      cleanedFilters.documentIds = filters.documentIds;
    }

    if (Object.keys(cleanedFilters).length > 0) {
      body.filters = cleanedFilters;
    }
  }

  yield* requestChatStream("/chat/ask-library/stream", body, signal);
}
