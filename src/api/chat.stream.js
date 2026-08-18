import { getAuth } from "firebase/auth";
import {
  API_BASE_URL,
  getStoredAuthToken,
  clearStoredAuthToken,
  notifyUnauthorized,
  ApiError,
} from "../lib/http.js";

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

/**
 * Handles SSE streams robustly. 
 * Yields `{ type: "status" | "sources" | "delta" | "done" | "error", data: any }`
 */
export async function* askDocumentStream({ documentId, question, sessionId, signal }) {
  const baseUrl = API_BASE_URL.endsWith("/api") ? API_BASE_URL : API_BASE_URL + "/api";
  const url = baseUrl + "/chat/ask-document/stream";
  const authHeader = await getAuthHeader();
  
  const body = { documentId, question };
  if (sessionId) {
    body.sessionId = sessionId;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
    body: JSON.stringify(body),
    signal,
  });

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

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      // Decode any remaining bytes
      buffer += decoder.decode(undefined, { stream: false });
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    
    // Parse SSE lines
    let lineEndIndex;
    while ((lineEndIndex = buffer.indexOf("\n\n")) !== -1) {
      const eventChunk = buffer.slice(0, lineEndIndex);
      buffer = buffer.slice(lineEndIndex + 2);
      
      const lines = eventChunk.split("\n");
      let eventType = "message";
      let eventData = "";

      for (const line of lines) {
        if (line.startsWith("event:")) {
          eventType = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          // SSE format allows multiple data lines, they are concatenated with newlines
          // In practice, this API sends a single JSON string per event
          eventData += (eventData ? "\n" : "") + line.slice(5).trim();
        }
      }

      if (eventData) {
        try {
          const parsedData = JSON.parse(eventData);
          yield { type: eventType, data: parsedData };
        } catch {
          // Some events might just be strings or empty, but contract says JSON
          yield { type: eventType, data: eventData };
        }
      } else if (eventType) {
         yield { type: eventType, data: null };
      }
    }
  }
}

export async function* askLibraryStream({ question, sessionId, limit = 5, filters, signal }) {
  const baseUrl = API_BASE_URL.endsWith("/api") ? API_BASE_URL : API_BASE_URL + "/api";
  const url = baseUrl + "/chat/ask-library/stream";
  const authHeader = await getAuthHeader();
  
  const body = { question, limit };
  if (sessionId) {
    body.sessionId = sessionId;
  }

  if (filters) {
    const cleanedFilters = {};
    if (filters.subjectId) cleanedFilters.subjectId = filters.subjectId;
    if (filters.subjectIds?.length > 0) cleanedFilters.subjectIds = filters.subjectIds;
    if (filters.categoryId) cleanedFilters.categoryId = filters.categoryId;
    if (filters.fileType) cleanedFilters.fileType = filters.fileType;
    if (filters.documentIds?.length > 0) cleanedFilters.documentIds = filters.documentIds;

    if (Object.keys(cleanedFilters).length > 0) {
      body.filters = cleanedFilters;
    }
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
      ...(authHeader ? { Authorization: authHeader } : {}),
    },
    body: JSON.stringify(body),
    signal,
  });

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

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      buffer += decoder.decode(undefined, { stream: false });
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    
    let lineEndIndex;
    while ((lineEndIndex = buffer.indexOf("\n\n")) !== -1) {
      const eventChunk = buffer.slice(0, lineEndIndex);
      buffer = buffer.slice(lineEndIndex + 2);
      
      const lines = eventChunk.split("\n");
      let eventType = "message";
      let eventData = "";

      for (const line of lines) {
        if (line.startsWith("event:")) {
          eventType = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          eventData += (eventData ? "\n" : "") + line.slice(5).trim();
        }
      }

      if (eventData) {
        try {
          const parsedData = JSON.parse(eventData);
          yield { type: eventType, data: parsedData };
        } catch {
          yield { type: eventType, data: eventData };
        }
      } else if (eventType) {
         yield { type: eventType, data: null };
      }
    }
  }
}
