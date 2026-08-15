import { useCallback, useMemo, useRef, useState } from "react";
import {
  getChatErrorMessage,
  getChatMessages,
  getHistoryErrorMessage,
  mapHistoryMessage,
  sendChatMessage,
} from "../../../../api/chat.api.js";

const ERROR_MESSAGE =
  "Đã xảy ra lỗi khi tạo phản hồi. Tin nhắn của bạn vẫn được giữ lại.";

const HISTORY_PAGE_LIMIT = 50;

// ── Utilities ─────────────────────────────────────────────────────────────────

function createMessage({ role, content, status = "sent", retryOf = null }) {
  return {
    id: createId(),
    role,
    content,
    status,
    retryOf,
    createdAt: formatTime(new Date()),
  };
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatTime(date) {
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useChat() {
  // ── Message state ─────────────────────────────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const sendingRef = useRef(false);

  // ── Session state ─────────────────────────────────────────────────────────
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sessionStatus, setSessionStatus] = useState("idle"); // "idle"|"loading"|"error"
  const [sessionError, setSessionError] = useState(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
  const historyLoadingRef = useRef(false);

  // ── Document context state ────────────────────────────────────────────────
  const [selectedDocuments, setSelectedDocuments] = useState([]);

  const isSending = status === "sending";

  // Derived: IDs only for request mapping
  const selectedDocumentIds = useMemo(
    () => selectedDocuments.map((d) => d.id),
    [selectedDocuments],
  );

  // ── Document context actions ──────────────────────────────────────────────

  const addDocument = useCallback((doc) => {
    setSelectedDocuments((current) => {
      if (current.some((d) => d.id === doc.id)) return current;
      return [...current, { id: doc.id, title: doc.title }];
    });
  }, []);

  const removeDocument = useCallback((id) => {
    setSelectedDocuments((current) => current.filter((d) => d.id !== id));
  }, []);

  const applyDocuments = useCallback((docs) => {
    setSelectedDocuments(docs.map((d) => ({ id: d.id, title: d.title })));
  }, []);

  const clearDocuments = useCallback(() => {
    setSelectedDocuments([]);
  }, []);

  // ── Session actions ───────────────────────────────────────────────────────

  /**
   * Start a new blank chat — clears all session + message state.
   */
  const startNewChat = useCallback(() => {
    setCurrentSessionId(null);
    setMessages([]);
    setInputValue("");
    setError(null);
    setStatus("idle");
    setSessionStatus("idle");
    setSessionError(null);
    setHistoryPage(1);
    setHasMoreHistory(false);
  }, []);

  /**
   * Load page 1 of a session's message history.
   * Replaces the current message list.
   */
  const loadSession = useCallback(async (sessionId) => {
    if (!sessionId) return;
    if (historyLoadingRef.current) return;

    setCurrentSessionId(sessionId);
    setMessages([]);
    setError(null);
    setStatus("idle");
    setSessionStatus("loading");
    setSessionError(null);
    setHistoryPage(1);
    setHasMoreHistory(false);
    historyLoadingRef.current = true;

    try {
      const response = await getChatMessages(sessionId, {
        page: 1,
        limit: HISTORY_PAGE_LIMIT,
      });

      const items = Array.isArray(response?.items) ? response.items : [];
      const meta = response?.meta || {};

      // API returns messages oldest-first based on createdAt order
      // Map and preserve all fields including sources
      const mapped = items.map(mapHistoryMessage);

      setMessages(mapped);
      setHistoryPage(1);
      // Check if there are older pages (page 2+)
      // totalPages > 1 means there are older messages on higher page numbers
      const totalPages = meta.totalPages ?? 1;
      setHasMoreHistory(totalPages > 1);
      setSessionStatus("success");
    } catch (err) {
      const message = getHistoryErrorMessage(err);
      setSessionError(message);
      setSessionStatus("error");
    } finally {
      historyLoadingRef.current = false;
    }
  }, []);

  /**
   * Load the next (older) page of messages and prepend to the list.
   * The parent component is responsible for scroll preservation.
   */
  const loadOlderMessages = useCallback(async () => {
    if (!currentSessionId || !hasMoreHistory || historyLoadingRef.current) return;
    historyLoadingRef.current = true;
    setIsLoadingOlderMessages(true);

    const nextPage = historyPage + 1;

    try {
      const response = await getChatMessages(currentSessionId, {
        page: nextPage,
        limit: HISTORY_PAGE_LIMIT,
      });

      const items = Array.isArray(response?.items) ? response.items : [];
      const meta = response?.meta || {};
      const mapped = items.map(mapHistoryMessage);

      setMessages((current) => [...mapped, ...current]);
      setHistoryPage(nextPage);

      const totalPages = meta.totalPages ?? nextPage;
      setHasMoreHistory(nextPage < totalPages);
    } catch {
      // silent — user can retry by clicking again
    } finally {
      setIsLoadingOlderMessages(false);
      historyLoadingRef.current = false;
    }
  }, [currentSessionId, hasMoreHistory, historyPage]);

  // ── Send message ──────────────────────────────────────────────────────────

  const sendMessage = useCallback(
    async (rawMessage = inputValue) => {
      const content = rawMessage.trim();
      if (!content || sendingRef.current) return;

      const userMessage = createMessage({
        role: "user",
        content,
        status: "sent",
      });
      const pendingMessage = createMessage({
        role: "assistant",
        content: "Đang suy nghĩ...",
        status: "loading",
        retryOf: userMessage.id,
      });

      setMessages((current) => [...current, userMessage, pendingMessage]);
      setInputValue("");
      setError(null);
      setStatus("sending");
      sendingRef.current = true;

      // Snapshot at send time
      const documentIds = selectedDocuments.map((d) => d.id);
      const sessionId = currentSessionId;

      try {
        const response = await sendChatMessage({
          question: content,
          documentIds,
          sessionId,
        });

        // Capture sessionId from first response if we didn't have one
        if (!sessionId && response.sessionId) {
          setCurrentSessionId(response.sessionId);
        }

        setMessages((current) =>
          current.map((message) =>
            message.id === pendingMessage.id
              ? {
                  ...message,
                  content: response.answer,
                  status: "complete",
                  backendMessageId: response.messageId,
                  sessionId: response.sessionId,
                  sources: response.sources,
                  suggestedPrompts: response.suggestedPrompts,
                  answerStatus: response.answerStatus,
                  createdAt: formatTime(new Date()),
                }
              : message,
          ),
        );
        setStatus("success");
      } catch (requestError) {
        const message = getChatErrorMessage(requestError) || ERROR_MESSAGE;
        setMessages((current) =>
          current.map((item) =>
            item.id === pendingMessage.id
              ? {
                  ...item,
                  content: message,
                  status: "error",
                  createdAt: formatTime(new Date()),
                }
              : item,
          ),
        );
        setError(message);
        setStatus("error");
      } finally {
        sendingRef.current = false;
      }
    },
    [inputValue, selectedDocuments, currentSessionId],
  );

  // ── Retry message ─────────────────────────────────────────────────────────

  const retryMessage = useCallback(
    async (assistantMessageId) => {
      if (sendingRef.current) return;

      const failedMsg = messages.find((m) => m.id === assistantMessageId);
      const userMsg = messages.find((m) => m.id === failedMsg?.retryOf);
      const content = userMsg?.content?.trim();
      if (!failedMsg || !content) return;

      setMessages((current) =>
        current.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                content: "Đang suy nghĩ...",
                status: "loading",
                createdAt: formatTime(new Date()),
              }
            : message,
        ),
      );
      setError(null);
      setStatus("sending");
      sendingRef.current = true;

      const documentIds = selectedDocuments.map((d) => d.id);
      const sessionId = currentSessionId;

      try {
        const response = await sendChatMessage({
          question: content,
          documentIds,
          sessionId,
        });
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantMessageId
              ? {
                  ...message,
                  content: response.answer,
                  status: "complete",
                  backendMessageId: response.messageId,
                  sessionId: response.sessionId,
                  sources: response.sources,
                  suggestedPrompts: response.suggestedPrompts,
                  answerStatus: response.answerStatus,
                  createdAt: formatTime(new Date()),
                }
              : message,
          ),
        );
        setStatus("success");
      } catch (requestError) {
        const message = getChatErrorMessage(requestError) || ERROR_MESSAGE;
        setMessages((current) =>
          current.map((item) =>
            item.id === assistantMessageId
              ? {
                  ...item,
                  content: message,
                  status: "error",
                  createdAt: formatTime(new Date()),
                }
              : item,
          ),
        );
        setError(message);
        setStatus("error");
      } finally {
        sendingRef.current = false;
      }
    },
    [messages, selectedDocuments, currentSessionId],
  );

  // ── Return value ──────────────────────────────────────────────────────────

  return useMemo(
    () => ({
      // messages
      messages,
      inputValue,
      setInputValue,
      isSending,
      status,
      error,
      sendMessage,
      retryMessage,
      // session
      currentSessionId,
      sessionStatus,
      sessionError,
      hasMoreHistory,
      isLoadingOlderMessages,
      loadSession,
      loadOlderMessages,
      startNewChat,
      // document context
      selectedDocuments,
      selectedDocumentIds,
      addDocument,
      removeDocument,
      applyDocuments,
      clearDocuments,
    }),
    [
      messages,
      inputValue,
      isSending,
      status,
      error,
      sendMessage,
      retryMessage,
      currentSessionId,
      sessionStatus,
      sessionError,
      hasMoreHistory,
      isLoadingOlderMessages,
      loadSession,
      loadOlderMessages,
      startNewChat,
      selectedDocuments,
      selectedDocumentIds,
      addDocument,
      removeDocument,
      applyDocuments,
      clearDocuments,
    ],
  );
}
