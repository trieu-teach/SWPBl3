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

function prependUniqueMessages(olderMessages, currentMessages) {
  const seenIds = new Set(currentMessages.map((message) => message.id));
  const uniqueOlderMessages = olderMessages.filter((message) => {
    if (seenIds.has(message.id)) return false;
    seenIds.add(message.id);
    return true;
  });

  return [...uniqueOlderMessages, ...currentMessages];
}

function snapshotChatContext(context) {
  if (isDocumentContext(context)) {
    return {
      ...context,
      document: context.document ? { ...context.document } : null,
    };
  }

  if (isLibraryContext(context)) {
    const filters = context.libraryFilters;
    return {
      ...context,
      libraryFilters: filters
        ? {
            ...filters,
            subjectIds: filters.subjectIds
              ? [...filters.subjectIds]
              : undefined,
            documentIds: filters.documentIds
              ? [...filters.documentIds]
              : undefined,
            _documentMeta: filters._documentMeta
              ? filters._documentMeta.map((document) => ({ ...document }))
              : undefined,
          }
        : null,
    };
  }

  return context;
}

function createRequestSnapshot(question, context, sessionId) {
  return {
    question,
    context: snapshotChatContext(context),
    sessionId: sessionId || null,
  };
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
   * Load the latest page of a session's message history.
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
      const firstPageResponse = await getChatMessages(sessionId, {
        page: 1,
        limit: HISTORY_PAGE_LIMIT,
      });
      const firstPageMeta = firstPageResponse?.meta || {};
      const totalPages = firstPageMeta.totalPages ?? 1;
      const latestPage = Math.max(1, totalPages);
      const latestPageResponse =
        latestPage === 1
          ? firstPageResponse
          : await getChatMessages(sessionId, {
              page: latestPage,
              limit: HISTORY_PAGE_LIMIT,
            });

      const items = Array.isArray(latestPageResponse?.items)
        ? latestPageResponse.items
        : [];

      const mapped = items.map(mapHistoryMessage);

      // Prevent race condition if user started a new chat or switched again
      if (activeSessionIdRef.current === sessionId) {
        setMessages(mapped);
        setHistoryPage(latestPage);
        setHasMoreHistory(latestPage > 1);
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
   * Load the previous (older) page of messages and prepend to the list.
   */
  const loadOlderMessages = useCallback(async () => {
    if (!currentSessionId || !hasMoreHistory || historyLoadingRef.current) return;
    historyLoadingRef.current = true;
    setIsLoadingOlderMessages(true);

    const sessionId = currentSessionId;
    const nextPage = historyPage - 1;

    if (nextPage < 1) {
      setHasMoreHistory(false);
      setIsLoadingOlderMessages(false);
      historyLoadingRef.current = false;
      return;
    }

    try {
      const response = await getChatMessages(sessionId, {
        page: nextPage,
        limit: HISTORY_PAGE_LIMIT,
      });

      const items = Array.isArray(response?.items) ? response.items : [];
      const mapped = items.map(mapHistoryMessage);

      if (activeSessionIdRef.current === sessionId) {
        setMessages((current) => prependUniqueMessages(mapped, current));
        setHistoryPage(nextPage);
        setHasMoreHistory(nextPage > 1);
      }
    } catch {
      // silent — user can retry by clicking again
    } finally {
      setIsLoadingOlderMessages(false);
      historyLoadingRef.current = false;
    }
  }, [currentSessionId, hasMoreHistory, historyPage]);

  // ── Execute Request (Helper) ──────────────────────────────────────────────

  const performRequest = async (targetMessageId, questionText, effectiveContext, activeSessionId) => {
    let requestController = null;

    try {
      if (isDocumentContext(effectiveContext) || isLibraryContext(effectiveContext)) {
        let stream;

        requestController = new AbortController();
        abortControllerRef.current = requestController;
        const { signal } = requestController;

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

        let receivedDone = false;

        for await (const event of stream) {
          if (signal.aborted) return;

          const { type, data } = event;

          if (type === "done") {
            receivedDone = true;
            setMessages((current) =>
              current.map((message) =>
                message.id === targetMessageId
                  ? {
                      ...message,
                      content: data.answer,
                      status: "complete",
                      streamPhase: "COMPLETED",
                      backendMessageId: data.messageId,
                      sessionId: data.sessionId,
                      ...(Array.isArray(data.sources)
                        ? { sources: data.sources }
                        : {}),
                      ...(Array.isArray(data.suggestedPrompts)
                        ? { suggestedPrompts: data.suggestedPrompts }
                        : {}),
                      ...(typeof data.answerStatus === "string"
                        ? { answerStatus: data.answerStatus }
                        : {}),
                      createdAt: formatTime(new Date()),
                    }
                  : message,
              ),
            );

            if (!activeSessionId) {
              setCurrentSessionId(data.sessionId);
              activeSessionIdRef.current = data.sessionId;
            }
            continue;
          }

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
            }

            return current.map((m) => (m.id === targetMessageId ? nextMessage : m));
          });
        }

        if (signal.aborted) return;
        if (!receivedDone) {
          throw new Error(
            "Phản hồi AI bị gián đoạn trước khi hoàn tất. Vui lòng thử lại.",
          );
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
              ...(requestError.code !== undefined
                ? { streamErrorCode: requestError.code }
                : {}),
              ...(typeof requestError.retryable === "boolean"
                ? { streamRetryable: requestError.retryable }
                : {}),
              createdAt: formatTime(new Date()),
            };
          }
          return item;
        }),
      );
      setError(errorMessage);
      setStatus("error");
    } finally {
      if (
        requestController &&
        abortControllerRef.current === requestController
      ) {
        abortControllerRef.current = null;
      }
      sendingRef.current = false;
    }
  };

  // ── Send message ──────────────────────────────────────────────────────────

  const sendMessage = useCallback(
    async (rawMessage = inputValue) => {
      const content = rawMessage.trim();
      if (!content || sendingRef.current) return;

      const contextSnapshot = chatContext;
      const sessionId = currentSessionId;
      const effectiveContext = hasActiveContext(contextSnapshot)
        ? contextSnapshot
        : createLibraryContext(null);
      const requestSnapshot = createRequestSnapshot(
        content,
        effectiveContext,
        sessionId,
      );

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
      pendingMessage.requestSnapshot = requestSnapshot;

      setMessages((current) => [...current, userMessage, pendingMessage]);
      setInputValue("");
      setError(null);
      setStatus("sending");
      sendingRef.current = true;

      await performRequest(pendingMessage.id, content, effectiveContext, sessionId);
    },
    [inputValue, chatContext, currentSessionId], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── Retry message ─────────────────────────────────────────────────────────

  const retryMessage = useCallback(
    async (assistantMessageId) => {
      if (sendingRef.current) return;

      const failedMsg = messages.find((m) => m.id === assistantMessageId);
      const requestSnapshot = failedMsg?.requestSnapshot;
      const content = requestSnapshot?.question?.trim();
      if (
        !failedMsg ||
        !content ||
        !hasActiveContext(requestSnapshot?.context)
      ) {
        return;
      }

      setMessages((current) =>
        current.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                content: "Đang suy nghĩ...",
                errorDetail: undefined,
                streamErrorCode: undefined,
                streamRetryable: undefined,
                status: "loading",
                createdAt: formatTime(new Date()),
              }
            : message,
        ),
      );
      setError(null);
      setStatus("sending");
      sendingRef.current = true;

      await performRequest(
        assistantMessageId,
        content,
        requestSnapshot.context,
        requestSnapshot.sessionId,
      );
    },
    [messages], // eslint-disable-line react-hooks/exhaustive-deps
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
