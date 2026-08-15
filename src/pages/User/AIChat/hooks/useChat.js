import { useCallback, useMemo, useRef, useState } from "react";
import { getChatErrorMessage, sendChatMessage } from "../../../../api/chat.api.js";

const ERROR_MESSAGE =
  "Đã xảy ra lỗi khi tạo phản hồi. Tin nhắn của bạn vẫn được giữ lại.";

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

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const sendingRef = useRef(false);

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
    // docs: Array<{ id, title }> — full replacement from picker Apply
    setSelectedDocuments(docs.map((d) => ({ id: d.id, title: d.title })));
  }, []);

  const clearDocuments = useCallback(() => {
    setSelectedDocuments([]);
  }, []);

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

      // Capture IDs at send time — snapshot, not reactive
      const documentIds = selectedDocuments.map((d) => d.id);

      try {
        const response = await sendChatMessage({ question: content, documentIds });
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
    [inputValue, selectedDocuments],
  );

  // ── Retry message ─────────────────────────────────────────────────────────

  const retryMessage = useCallback(
    async (assistantMessageId) => {
      if (sendingRef.current) return;

      const failedAssistantMessage = messages.find(
        (message) => message.id === assistantMessageId,
      );
      const userMessage = messages.find(
        (message) => message.id === failedAssistantMessage?.retryOf,
      );
      const content = userMessage?.content?.trim();

      if (!failedAssistantMessage || !content) return;

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

      // Retry with current document context
      const documentIds = selectedDocuments.map((d) => d.id);

      try {
        const response = await sendChatMessage({ question: content, documentIds });
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
    [messages, selectedDocuments],
  );

  return useMemo(
    () => ({
      messages,
      inputValue,
      setInputValue,
      isSending,
      status,
      error,
      sendMessage,
      retryMessage,
      // document context
      selectedDocuments,
      selectedDocumentIds,
      addDocument,
      removeDocument,
      applyDocuments,
      clearDocuments,
    }),
    [
      error,
      inputValue,
      isSending,
      messages,
      retryMessage,
      sendMessage,
      status,
      selectedDocuments,
      selectedDocumentIds,
      addDocument,
      removeDocument,
      applyDocuments,
      clearDocuments,
    ],
  );
}
