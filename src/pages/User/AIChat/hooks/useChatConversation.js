import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createChatSession,
  getChatErrorMessage,
  getChatMessages,
  getHistoryErrorMessage,
  mapHistoryMessage,
} from "../../../../api/chat.api.js";
import { getChatErrorPresentation } from "../../../../api/chat.errors.js";
import {
  askDocumentStream,
  askLibraryStream,
} from "../../../../api/chat.stream.js";
import {
  applyChatProgressEvent,
  CANCELLED_CONTENT,
  cloneContextSnapshot,
  completeAssistantMessage,
  createConversationScope,
  createMessage,
  createRequestSnapshot,
  formatTime,
  normalizeId,
  parseChatDoneEvent,
  PENDING_CONTENT,
  prependUniqueMessages,
  validateChatProgressEvent,
} from "../chatConversation.model.js";
import {
  CHAT_MODE_DOCUMENT,
  CHAT_MODE_LIBRARY,
  hasSelectedSource,
} from "../chatContext.js";

const HISTORY_PAGE_LIMIT = 50;
const FALLBACK_SEND_ERROR =
  "Đã xảy ra lỗi khi tạo phản hồi. Tin nhắn của bạn vẫn được giữ lại.";

function notify(callback, ...args) {
  if (typeof callback !== "function") return;
  try {
    callback(...args);
  } catch {
    // Notification failures must not turn a completed response into failure.
  }
}

export function useChatConversation({
  context,
  sessionId,
  enabled = true,
  onSessionCreated,
  onConversationCompleted,
  onSessionUnavailable,
} = {}) {
  const scope = useMemo(
    () => createConversationScope(context, enabled),
    [context, enabled],
  );
  const scopeKey = scope?.key ?? null;
  const suppliedSessionId = normalizeId(sessionId);

  const [owner, setOwner] = useState({ scopeKey: null, sessionId: null });
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [historyStatus, setHistoryStatus] = useState("idle");
  const [historyError, setHistoryError] = useState(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);

  const mountedRef = useRef(true);
  const latestScopeRef = useRef(scope);
  const activeScopeRef = useRef(null);
  const activeSessionIdRef = useRef(null);
  const confirmedSessionRef = useRef(null);
  const sendingRef = useRef(false);
  const streamGenerationRef = useRef(0);
  const streamRequestRef = useRef(null);
  const abortControllerRef = useRef(null);
  const historyGenerationRef = useRef(0);
  const historyRequestRef = useRef(null);
  const onSessionCreatedRef = useRef(onSessionCreated);
  const onConversationCompletedRef = useRef(onConversationCompleted);
  const onSessionUnavailableRef = useRef(onSessionUnavailable);

  latestScopeRef.current = scope;
  onSessionCreatedRef.current = onSessionCreated;
  onConversationCompletedRef.current = onConversationCompleted;
  onSessionUnavailableRef.current = onSessionUnavailable;

  const invalidateHistory = useCallback(() => {
    historyGenerationRef.current += 1;
    historyRequestRef.current = null;
  }, []);

  const invalidateStream = useCallback((markCancelled = false) => {
    const activeRequest = streamRequestRef.current;
    streamGenerationRef.current += 1;
    streamRequestRef.current = null;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    sendingRef.current = false;

    if (markCancelled && activeRequest && mountedRef.current) {
      setMessages((current) =>
        current.map((message) => {
          if (
            message.id !== activeRequest.targetMessageId ||
            (message.status !== "loading" && message.status !== "streaming")
          ) {
            return message;
          }

          const hasPartial =
            message.content && message.content !== PENDING_CONTENT;
          return {
            ...message,
            content: hasPartial ? message.content : CANCELLED_CONTENT,
            status: "cancelled",
            streamPhase: "CANCELLED",
            errorDetail: undefined,
            createdAt: formatTime(new Date()),
          };
        }),
      );
      setStatus("idle");
      setError(null);
    }
  }, []);

  const clearConversationState = useCallback(
    (nextScopeKey, nextSessionId) => {
      setOwner({ scopeKey: nextScopeKey, sessionId: nextSessionId });
      setMessages([]);
      setInputValue("");
      setStatus("idle");
      setError(null);
      setHistoryStatus("idle");
      setHistoryError(null);
      setHistoryPage(1);
      setHasMoreHistory(false);
      setIsLoadingOlderMessages(false);
    },
    [],
  );

  const loadInitialHistory = useCallback(async (historyScope, targetSessionId) => {
    const historyRequest = {
      generation: ++historyGenerationRef.current,
      scopeKey: historyScope.key,
      sessionId: targetSessionId,
      type: "initial",
    };
    historyRequestRef.current = historyRequest;

    const ownsHistoryRequest = () =>
      mountedRef.current &&
      historyRequestRef.current === historyRequest &&
      historyGenerationRef.current === historyRequest.generation;
    const isValidHistoryRequest = () =>
      ownsHistoryRequest() &&
      activeScopeRef.current?.key === historyRequest.scopeKey &&
      activeSessionIdRef.current === historyRequest.sessionId;

    setHistoryStatus("loading");
    setHistoryError(null);

    try {
      const firstPageResponse = await getChatMessages(targetSessionId, {
        page: 1,
        limit: HISTORY_PAGE_LIMIT,
      });
      if (!isValidHistoryRequest()) return;

      const totalPages = firstPageResponse?.meta?.totalPages ?? 1;
      const latestPage = Math.max(1, totalPages);
      const latestPageResponse =
        latestPage === 1
          ? firstPageResponse
          : await getChatMessages(targetSessionId, {
              page: latestPage,
              limit: HISTORY_PAGE_LIMIT,
            });
      if (!isValidHistoryRequest()) return;

      const items = Array.isArray(latestPageResponse?.items)
        ? latestPageResponse.items
        : [];
      setMessages(items.map(mapHistoryMessage));
      setHistoryPage(latestPage);
      setHasMoreHistory(latestPage > 1);
      setHistoryStatus("success");
    } catch (historyFailure) {
      if (isValidHistoryRequest()) {
        setHistoryError(getHistoryErrorMessage(historyFailure));
        setHistoryStatus("error");
      }
    } finally {
      if (ownsHistoryRequest()) {
        historyRequestRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    const transitionScope = latestScopeRef.current;
    const previousScopeKey = activeScopeRef.current?.key ?? null;
    const confirmedSession = confirmedSessionRef.current;
    const isConfirmedSessionAdoption = Boolean(
      transitionScope &&
        suppliedSessionId &&
        previousScopeKey === transitionScope.key &&
        confirmedSession?.scopeKey === transitionScope.key &&
        confirmedSession.sessionId === suppliedSessionId,
    );

    if (isConfirmedSessionAdoption) {
      activeScopeRef.current = transitionScope;
      activeSessionIdRef.current = suppliedSessionId;
      confirmedSessionRef.current = null;
      setOwner({
        scopeKey: transitionScope.key,
        sessionId: suppliedSessionId,
      });
      return;
    }

    invalidateStream(false);
    invalidateHistory();
    confirmedSessionRef.current = null;
    activeScopeRef.current = transitionScope;
    activeSessionIdRef.current = transitionScope ? suppliedSessionId : null;
    clearConversationState(
      transitionScope?.key ?? null,
      transitionScope ? suppliedSessionId : null,
    );

    if (transitionScope && suppliedSessionId) {
      void loadInitialHistory(transitionScope, suppliedSessionId);
    }
  }, [
    scopeKey,
    suppliedSessionId,
    invalidateStream,
    invalidateHistory,
    clearConversationState,
    loadInitialHistory,
  ]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      invalidateStream(false);
      invalidateHistory();
      activeScopeRef.current = null;
      activeSessionIdRef.current = null;
      confirmedSessionRef.current = null;
    };
  }, [invalidateStream, invalidateHistory]);

  const executeRequest = useCallback(async (targetMessageId, requestSnapshot) => {
    const requestScope = createConversationScope(requestSnapshot.context, true);
    if (!requestScope) return false;

    const requestController = new AbortController();
    const streamRequest = {
      generation: ++streamGenerationRef.current,
      scopeKey: requestScope.key,
      targetMessageId,
      controller: requestController,
    };
    streamRequestRef.current = streamRequest;
    abortControllerRef.current = requestController;

    const ownsStreamRequest = () =>
      mountedRef.current &&
      streamRequestRef.current === streamRequest &&
      streamGenerationRef.current === streamRequest.generation;
    const isValidStreamRequest = () =>
      ownsStreamRequest() &&
      activeScopeRef.current?.key === streamRequest.scopeKey;

    try {
      const { question, context: contextSnapshot, requestId } = requestSnapshot;
      let knownSessionId = requestSnapshot.sessionId;
      const createdNewSession = !knownSessionId;

      if (!knownSessionId) {
        const createdSession = await createChatSession({
          mode: contextSnapshot.mode,
          documentId:
            contextSnapshot.mode === CHAT_MODE_DOCUMENT
              ? contextSnapshot.documentId
              : undefined,
          documentIds:
            contextSnapshot.mode === CHAT_MODE_LIBRARY
              ? contextSnapshot.libraryFilters?.documentIds
              : undefined,
          signal: requestController.signal,
        });
        knownSessionId = normalizeId(createdSession?.id);
        if (!knownSessionId) throw new Error("Không nhận được sessionId hợp lệ.");

        requestSnapshot.sessionId = knownSessionId;
        confirmedSessionRef.current = {
          scopeKey: requestScope.key,
          sessionId: knownSessionId,
        };
        activeSessionIdRef.current = knownSessionId;
        setOwner({ scopeKey: requestScope.key, sessionId: knownSessionId });
        setMessages((current) =>
          current.map((message) =>
            message.id === targetMessageId
              ? { ...message, requestSnapshot: { ...requestSnapshot }, sessionId: knownSessionId }
              : message,
          ),
        );
        notify(onSessionCreatedRef.current, knownSessionId, { createdSession });
      }

      const stream =
        contextSnapshot.mode === CHAT_MODE_DOCUMENT
          ? askDocumentStream({
              documentId: contextSnapshot.documentId,
              question,
              sessionId: knownSessionId,
              requestId,
              signal: requestController.signal,
            })
          : askLibraryStream({
              question,
              sessionId: knownSessionId,
              requestId,
              limit: 5,
              // The backend accepts subjectIds/documentIds in filters.
              // chat.stream sanitizes display-only metadata before sending.
              filters: contextSnapshot.libraryFilters,
              signal: requestController.signal,
            });

      let receivedDone = false;
      let receivedDelta = false;

      for await (const event of stream) {
        if (!isValidStreamRequest() || requestController.signal.aborted) {
          return false;
        }

        const { type, data } = event;

        if (type === "done") {
          const doneEvent = parseChatDoneEvent(data, knownSessionId);

          receivedDone = true;
          setMessages((current) =>
            current.map((message) =>
              message.id === targetMessageId
                ? completeAssistantMessage(message, doneEvent, {
                    receivedDelta,
                  })
                : message,
            ),
          );

          notify(onConversationCompletedRef.current, {
            sessionId: doneEvent.sessionId,
            messageId: doneEvent.messageId,
            answerStatus: doneEvent.answerStatus,
            usage: doneEvent.usage,
            isNewSession: createdNewSession,
            context: cloneContextSnapshot(contextSnapshot),
          });
          continue;
        }

        const progressEvent = validateChatProgressEvent(type, data);
        if (type === "delta") receivedDelta = true;

        setMessages((current) =>
          current.map((message) =>
            message.id === targetMessageId
              ? applyChatProgressEvent(message, progressEvent)
              : message,
          ),
        );
      }

      if (!isValidStreamRequest() || requestController.signal.aborted) {
        return false;
      }
      if (!receivedDone) {
        throw new Error(
          "Phản hồi AI bị gián đoạn trước khi hoàn tất. Vui lòng thử lại.",
        );
      }

      setStatus("success");
      return true;
    } catch (requestError) {
      if (
        requestError?.name === "AbortError" ||
        !isValidStreamRequest() ||
        requestController.signal.aborted
      ) {
        return false;
      }

      const errorPresentation = getChatErrorPresentation(requestError);
      const errorMessage = getChatErrorMessage(requestError) || FALLBACK_SEND_ERROR;
      setMessages((current) =>
        current.map((message) => {
          if (message.id !== targetMessageId) return message;

          const hasPartial =
            message.content && message.content !== PENDING_CONTENT;
          return {
            ...message,
            content: hasPartial ? message.content : errorMessage,
            errorDetail: hasPartial ? errorMessage : undefined,
            status: "error",
            ...(requestError.code !== undefined
              ? { streamErrorCode: requestError.code }
              : {}),
            ...(typeof requestError.retryable === "boolean"
              ? { streamRetryable: requestError.retryable }
              : { streamRetryable: errorPresentation.retryable === true }),
            errorActionLabel: errorPresentation.actionLabel,
            errorActionPath: errorPresentation.actionPath,
            createdAt: formatTime(new Date()),
          };
        }),
      );
      setError(errorMessage);
      setStatus("error");
      if (errorPresentation.resetSession) {
        notify(onSessionUnavailableRef.current, requestSnapshot.sessionId);
      }
      return false;
    } finally {
      if (ownsStreamRequest()) {
        streamRequestRef.current = null;
        abortControllerRef.current = null;
        sendingRef.current = false;
      }
    }
  }, []);

  const effectiveSessionId =
    suppliedSessionId ||
    (confirmedSessionRef.current?.scopeKey === scopeKey
      ? confirmedSessionRef.current.sessionId
      : null);
  const ownerMatches = Boolean(
    scope &&
      owner.scopeKey === scope.key &&
      owner.sessionId === effectiveSessionId,
  );

  const sendMessage = useCallback(
    async (rawMessage = inputValue) => {
      const activeScope = latestScopeRef.current;
      const content = (typeof rawMessage === "string"
        ? rawMessage
        : inputValue
      ).trim();
      if (!activeScope || !content || sendingRef.current) return false;

      // Guard: block sending when in LIBRARY mode without any selected source.
      // This is a hard check at the logic layer — do not rely on UI disabled state alone.
      if (
        activeScope.context.mode === CHAT_MODE_LIBRARY &&
        !hasSelectedSource(activeScope.context.libraryFilters)
      ) {
        return false;
      }

      const knownSessionId =
        suppliedSessionId ||
        (confirmedSessionRef.current?.scopeKey === activeScope.key
          ? confirmedSessionRef.current.sessionId
          : null);
      const requestSnapshot = createRequestSnapshot(
        content,
        activeScope.context,
        knownSessionId,
      );
      const userMessage = createMessage({
        role: "user",
        content,
        status: "sent",
      });
      const pendingMessage = createMessage({
        role: "assistant",
        content: PENDING_CONTENT,
        status: "loading",
        retryOf: userMessage.id,
      });
      pendingMessage.requestSnapshot = requestSnapshot;

      setOwner({ scopeKey: activeScope.key, sessionId: knownSessionId });
      setMessages((current) => [...current, userMessage, pendingMessage]);
      setInputValue("");
      setError(null);
      setStatus("sending");
      sendingRef.current = true;

      return executeRequest(pendingMessage.id, requestSnapshot);
    },
    [inputValue, suppliedSessionId, executeRequest],
  );

  const retryMessage = useCallback(
    async (assistantMessageId) => {
      if (sendingRef.current) return false;

      const failedMessage = messages.find(
        (message) => message.id === assistantMessageId,
      );
      const requestSnapshot = failedMessage?.requestSnapshot;
      const retryScope = requestSnapshot
        ? createConversationScope(requestSnapshot.context, true)
        : null;
      const activeScope = latestScopeRef.current;
      const activeSessionId =
        suppliedSessionId ||
        (confirmedSessionRef.current?.scopeKey === activeScope?.key
          ? confirmedSessionRef.current.sessionId
          : null);

      if (
        !failedMessage ||
        failedMessage.status !== "error" ||
        failedMessage.streamRetryable !== true ||
        !requestSnapshot?.question?.trim() ||
        !retryScope ||
        retryScope.key !== activeScope?.key ||
        requestSnapshot.sessionId !== activeSessionId
      ) {
        return false;
      }

      setMessages((current) =>
        current.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                content: PENDING_CONTENT,
                errorDetail: undefined,
                streamErrorCode: undefined,
                streamRetryable: undefined,
                status: "loading",
                streamPhase: undefined,
                createdAt: formatTime(new Date()),
              }
            : message,
        ),
      );
      setError(null);
      setStatus("sending");
      sendingRef.current = true;

      return executeRequest(assistantMessageId, requestSnapshot);
    },
    [messages, suppliedSessionId, executeRequest],
  );

  const loadOlderMessages = useCallback(async () => {
    const activeScope = latestScopeRef.current;
    const targetSessionId = effectiveSessionId;
    if (
      !activeScope ||
      !targetSessionId ||
      !ownerMatches ||
      !hasMoreHistory ||
      historyRequestRef.current
    ) {
      return false;
    }

    const nextPage = historyPage - 1;
    if (nextPage < 1) {
      setHasMoreHistory(false);
      return false;
    }

    const historyRequest = {
      generation: ++historyGenerationRef.current,
      scopeKey: activeScope.key,
      sessionId: targetSessionId,
      type: "older",
    };
    historyRequestRef.current = historyRequest;

    const ownsHistoryRequest = () =>
      mountedRef.current &&
      historyRequestRef.current === historyRequest &&
      historyGenerationRef.current === historyRequest.generation;
    const isValidHistoryRequest = () =>
      ownsHistoryRequest() &&
      activeScopeRef.current?.key === historyRequest.scopeKey &&
      activeSessionIdRef.current === historyRequest.sessionId;

    setIsLoadingOlderMessages(true);

    try {
      const response = await getChatMessages(targetSessionId, {
        page: nextPage,
        limit: HISTORY_PAGE_LIMIT,
      });
      if (!isValidHistoryRequest()) return false;

      const items = Array.isArray(response?.items) ? response.items : [];
      setMessages((current) =>
        prependUniqueMessages(items.map(mapHistoryMessage), current),
      );
      setHistoryPage(nextPage);
      setHasMoreHistory(nextPage > 1);
      return true;
    } catch {
      return false;
    } finally {
      if (ownsHistoryRequest()) {
        setIsLoadingOlderMessages(false);
        historyRequestRef.current = null;
      }
    }
  }, [
    effectiveSessionId,
    ownerMatches,
    hasMoreHistory,
    historyPage,
  ]);

  const abort = useCallback(() => {
    if (!streamRequestRef.current) return false;
    invalidateStream(true);
    return true;
  }, [invalidateStream]);

  const reset = useCallback(() => {
    const activeScope = latestScopeRef.current;
    invalidateStream(false);
    invalidateHistory();
    confirmedSessionRef.current = null;
    activeScopeRef.current = activeScope;
    activeSessionIdRef.current = activeScope ? suppliedSessionId : null;
    clearConversationState(
      activeScope?.key ?? null,
      activeScope ? suppliedSessionId : null,
    );
  }, [
    suppliedSessionId,
    invalidateStream,
    invalidateHistory,
    clearConversationState,
  ]);

  return {
    messages: ownerMatches ? messages : [],
    inputValue: ownerMatches ? inputValue : "",
    setInputValue,
    isSending: ownerMatches && status === "sending",
    status: ownerMatches ? status : "idle",
    error: ownerMatches ? error : null,
    historyStatus: ownerMatches ? historyStatus : "idle",
    historyError: ownerMatches ? historyError : null,
    isLoadingHistory:
      ownerMatches
        ? historyStatus === "loading"
        : Boolean(scope && effectiveSessionId),
    isLoadingOlderMessages:
      ownerMatches && isLoadingOlderMessages,
    hasMoreHistory: ownerMatches && hasMoreHistory,
    sendMessage,
    retryMessage,
    loadOlderMessages,
    abort,
    reset,
  };
}
