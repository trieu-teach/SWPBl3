import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import {
  getChatErrorMessage,
  getChatMessages,
  getHistoryErrorMessage,
  mapHistoryMessage,
  sendChatMessage,
} from "../../../../api/chat.api.js";
import { askDocumentStream, askLibraryStream } from "../../../../api/chat.stream.js";
import {
  createDocumentContext,
  createLibraryContext,
  deriveContextFromSession,
  hasActiveContext,
  isDocumentContext,
  isLibraryContext,
} from "../chatContext.js";

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
  const [sessionStatus, setSessionStatus] = useState("idle"); // "idle"|"loading"|"error"|"success"
  const [sessionError, setSessionError] = useState(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
  const historyLoadingRef = useRef(false);
  const abortControllerRef = useRef(null);
  const activeSessionIdRef = useRef(null);

  // Sync ref with state for async callbacks
  useEffect(() => {
    activeSessionIdRef.current = currentSessionId;
  }, [currentSessionId]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // ── Chat context state ────────────────────────────────────────────────────
  //
  // Replaces the old flat `selectedDocuments` array.
  //
  // null   = no mode/context selected yet
  // { mode: "ASK_MY_LIBRARY", ... }   = library chat (default new-chat mode)
  // { mode: "ASK_THIS_DOCUMENT", ... } = document chat
  //
  // Important: chatContext === null is different from "no documents selected".
  // An ASK_MY_LIBRARY context with libraryFilters === null still has a valid context.
  const [chatContext, setChatContext] = useState(null);

  const isSending = status === "sending";

  // ── Derived: backward-compat helpers for existing components ─────────────
  //
  // These bridge the gap between the old `selectedDocuments` prop API that
  // ChatContextBar / ChatHeader / DocumentPickerDialog currently consume and
  // the new context model. They will be removed when those components are
  // redesigned in later tasks.

  /** Documents currently used as library filters (optional narrowing). */
  const selectedDocuments = useMemo(() => {
    if (!isLibraryContext(chatContext)) return [];
    const ids = chatContext.libraryFilters?.documentIds ?? [];
    // The context only stores IDs; we need {id, title} pairs.
    // ChatContextBar currently only needs {id, title} — the titles were
    // supplied by the picker dialog when applying. We reconstruct them here
    // by reading the stored title metadata if available.
    return (chatContext.libraryFilters?._documentMeta ?? []).filter((d) =>
      ids.includes(d.id),
    );
  }, [chatContext]);

  /** Derived IDs array for request mapping (backward compat). */
  const selectedDocumentIds = useMemo(
    () => selectedDocuments.map((d) => d.id),
    [selectedDocuments],
  );

  // ── Context actions ───────────────────────────────────────────────────────

  /**
   * Activate ASK_THIS_DOCUMENT mode with a specific document.
   * Called by Task 2 (Document Detail → Ask AI entry point).
   *
   * @param {{ id: string, title: string }} document
   */
  const setDocumentContext = useCallback((document) => {
    setChatContext(createDocumentContext(document));
  }, []);

  /**
   * Activate ASK_MY_LIBRARY mode (default new-chat mode).
   * Optional filters can be supplied later via updateLibraryFilters.
   */
  const setLibraryContext = useCallback(() => {
    setChatContext(createLibraryContext(null));
  }, []);

  /**
   * Apply library document filters from the DocumentPickerDialog.
   *
   * This replaces the old `applyDocuments` action.
   * The dialog supplies an array of { id, title } objects.
   * We store documentIds inside libraryFilters and keep the full
   * { id, title } metadata in _documentMeta for backward-compat rendering.
   *
   * If docs is empty the filters are cleared but the Library context is kept.
   *
   * @param {{ id: string, title: string }[]} docs
   */
  const applyLibraryFilters = useCallback((docs) => {
    setChatContext((current) => {
      const base = isLibraryContext(current) ? current : createLibraryContext(null);
      if (!docs || docs.length === 0) {
        return { ...base, libraryFilters: null };
      }
      return {
        ...base,
        libraryFilters: {
          ...(base.libraryFilters ?? {}),
          documentIds: docs.map((d) => d.id),
          _documentMeta: docs.map((d) => ({ id: d.id, title: d.title })),
        },
      };
    });
  }, []);

  /**
   * Remove one document from the library filters.
   * Matches the old `removeDocument` prop API.
   *
   * @param {string} id
   */
  const removeLibraryFilter = useCallback((id) => {
    setChatContext((current) => {
      if (!isLibraryContext(current)) return current;
      const prev = current.libraryFilters ?? {};
      const nextIds = (prev.documentIds ?? []).filter((d) => d !== id);
      const nextMeta = (prev._documentMeta ?? []).filter((d) => d.id !== id);
      return {
        ...current,
        libraryFilters:
          nextIds.length === 0
            ? null
            : { ...prev, documentIds: nextIds, _documentMeta: nextMeta },
      };
    });
  }, []);

  /**
   * Clear the chat context entirely (no mode selected).
   */
  const clearContext = useCallback(() => {
    setChatContext(null);
  }, []);

  // ── Session actions ───────────────────────────────────────────────────────

  /**
   * Start a new library chat session — clears all session + message state,
   * and initialises the Library context as the default mode.
   */
  const startNewChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setCurrentSessionId(null);
    activeSessionIdRef.current = null;
    setMessages([]);
    setInputValue("");
    setError(null);
    setStatus("idle");
    setSessionStatus("idle");
    setSessionError(null);
    setHistoryPage(1);
    setHasMoreHistory(false);
    // Default mode for a new chat is ASK_MY_LIBRARY.
    setChatContext(createLibraryContext(null));
  }, []);

  /**
   * Load page 1 of a session's message history.
   * Derives the chat context from the session metadata returned by the sidebar.
   *
   * @param {string} sessionId
   * @param {{ mode?: string, documentId?: string | null, document?: object | null } | null} [sessionMeta]
   */
  const loadSession = useCallback(async (sessionId, sessionMeta = null) => {
    if (!sessionId) return;
    if (historyLoadingRef.current) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setCurrentSessionId(sessionId);
    activeSessionIdRef.current = sessionId;
    setMessages([]);
    setError(null);
    setStatus("idle");
    setSessionStatus("loading");
    setSessionError(null);
    setHistoryPage(1);
    setHasMoreHistory(false);
    historyLoadingRef.current = true;

    // Restore context from session metadata when available.
    // This ensures the context banner / header shows correct info
    // even before the first message is received.
    if (sessionMeta) {
      const derived = deriveContextFromSession(sessionMeta);
      if (derived) setChatContext(derived);
    }

    try {
      const response = await getChatMessages(sessionId, {
        page: 1,
        limit: HISTORY_PAGE_LIMIT,
      });

      const items = Array.isArray(response?.items) ? response.items : [];
      const meta = response?.meta || {};

      const mapped = items.map(mapHistoryMessage);

      // Prevent race condition if user started a new chat or switched again
      if (activeSessionIdRef.current === sessionId) {
        setMessages(mapped);
        setHistoryPage(1);
        const totalPages = meta.totalPages ?? 1;
        setHasMoreHistory(totalPages > 1);
        setSessionStatus("success");
      }
    } catch (err) {
      if (activeSessionIdRef.current === sessionId) {
        const message = getHistoryErrorMessage(err);
        setSessionError(message);
        setSessionStatus("error");
      }
    } finally {
      if (activeSessionIdRef.current === sessionId) {
        historyLoadingRef.current = false;
      }
    }
  }, []);

  /**
   * Load the next (older) page of messages and prepend to the list.
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

  // ── Execute Request (Helper) ──────────────────────────────────────────────

  const performRequest = async (targetMessageId, questionText, effectiveContext, activeSessionId) => {
    try {
      if (isDocumentContext(effectiveContext) || isLibraryContext(effectiveContext)) {
        let stream;
        
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        if (isDocumentContext(effectiveContext)) {
          stream = askDocumentStream({
            documentId: effectiveContext.document?.id,
            question: questionText,
            sessionId: activeSessionId,
            signal,
          });
        } else {
          // ASK_MY_LIBRARY
          stream = askLibraryStream({
            question: questionText,
            sessionId: activeSessionId,
            limit: 5,
            filters: effectiveContext.libraryFilters,
            signal,
          });
        }

        for await (const event of stream) {
          const { type, data } = event;
          setMessages((current) => {
            const message = current.find((m) => m.id === targetMessageId);
            if (!message) return current;

            let nextMessage = { ...message };

            if (type === "status") {
              nextMessage.status = "streaming";
              nextMessage.streamPhase = data.phase;
              if (data.phase === "generating" && nextMessage.content === "Đang suy nghĩ...") {
                nextMessage.content = "";
              }
            } else if (type === "sources") {
              nextMessage.status = "streaming";
              nextMessage.sources = data;
              if (nextMessage.content === "Đang suy nghĩ...") nextMessage.content = "";
            } else if (type === "delta") {
              nextMessage.status = "streaming";
              if (nextMessage.content === "Đang suy nghĩ...") nextMessage.content = "";
              nextMessage.content += data.text;
            } else if (type === "done") {
              nextMessage.content = data.answer;
              nextMessage.status = "complete";
              nextMessage.streamPhase = "COMPLETED";
              nextMessage.backendMessageId = data.messageId;
              nextMessage.sessionId = data.sessionId;
              nextMessage.sources = data.sources;
              nextMessage.suggestedPrompts = data.suggestedPrompts || [];
              nextMessage.answerStatus = data.answerStatus;
              nextMessage.createdAt = formatTime(new Date());

              if (!activeSessionId && data.sessionId) {
                setCurrentSessionId(data.sessionId);
              }
            } else if (type === "error") {
              throw new Error(data.message || "Lỗi stream");
            }
            
            return current.map((m) => (m.id === targetMessageId ? nextMessage : m));
          });
        }
        setStatus("success");
      } else {
        // Fallback for unknown context
        const response = await sendChatMessage({
          question: questionText,
          sessionId: activeSessionId,
        });

        if (!activeSessionId && response.sessionId) {
          setCurrentSessionId(response.sessionId);
        }

        setMessages((current) =>
          current.map((message) =>
            message.id === targetMessageId
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
      }
    } catch (requestError) {
      if (requestError.name === "AbortError") {
        return;
      }
      const errorMessage = getChatErrorMessage(requestError) || ERROR_MESSAGE;
      setMessages((current) =>
        current.map((item) => {
          if (item.id === targetMessageId) {
            const hasPartial = hasActiveContext(effectiveContext) && item.content && item.content !== "Đang suy nghĩ...";
            return {
              ...item,
              content: hasPartial ? item.content : errorMessage,
              errorDetail: hasPartial ? errorMessage : undefined,
              status: "error",
              createdAt: formatTime(new Date()),
            };
          }
          return item;
        }),
      );
      setError(errorMessage);
      setStatus("error");
    } finally {
      sendingRef.current = false;
    }
  };

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

      const contextSnapshot = chatContext;
      const sessionId = currentSessionId;
      const effectiveContext = hasActiveContext(contextSnapshot)
        ? contextSnapshot
        : createLibraryContext(null);

      await performRequest(pendingMessage.id, content, effectiveContext, sessionId);
    },
    [inputValue, chatContext, currentSessionId], // eslint-disable-line react-hooks/exhaustive-deps
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
                errorDetail: undefined,
                status: "loading",
                createdAt: formatTime(new Date()),
              }
            : message,
        ),
      );
      setError(null);
      setStatus("sending");
      sendingRef.current = true;

      const contextSnapshot = chatContext;
      const sessionId = currentSessionId;
      const effectiveContext = hasActiveContext(contextSnapshot)
        ? contextSnapshot
        : createLibraryContext(null);

      await performRequest(assistantMessageId, content, effectiveContext, sessionId);
    },
    [messages, chatContext, currentSessionId], // eslint-disable-line react-hooks/exhaustive-deps
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
      // ── Chat context (new model) ──────────────────────────
      chatContext,
      setDocumentContext,
      setLibraryContext,
      applyLibraryFilters,
      removeLibraryFilter,
      clearContext,
      // ── Backward-compat helpers ───────────────────────────
      // These bridge the old `selectedDocuments` prop API used by ChatContextBar,
      // ChatHeader, and DocumentPickerDialog. They will be removed when those
      // components are updated in later tasks.
      selectedDocuments,
      selectedDocumentIds,
      // Map old prop names so ChatPage doesn't need to change today:
      applyDocuments: applyLibraryFilters,
      removeDocument: removeLibraryFilter,
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
      chatContext,
      setDocumentContext,
      setLibraryContext,
      applyLibraryFilters,
      removeLibraryFilter,
      clearContext,
      selectedDocuments,
      selectedDocumentIds,
    ],
  );
}
