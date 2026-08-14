import { useCallback, useMemo, useRef, useState } from "react";
import { sendMockMessage } from "../services/chat.mock.service.js";

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
  const sendingRef = useRef(false);

  const isSending = status === "sending";

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

      try {
        const response = await sendMockMessage(content);
        setMessages((current) =>
          current.map((message) =>
            message.id === pendingMessage.id
              ? {
                  ...message,
                  content: response.content,
                  status: "complete",
                  createdAt: formatTime(new Date()),
                }
              : message,
          ),
        );
        setStatus("success");
      } catch (requestError) {
        const message = requestError?.message || ERROR_MESSAGE;

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
    [inputValue],
  );

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

      try {
        const response = await sendMockMessage(content);
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantMessageId
              ? {
                  ...message,
                  content: response.content,
                  status: "complete",
                  createdAt: formatTime(new Date()),
                }
              : message,
          ),
        );
        setStatus("success");
      } catch (requestError) {
        const message = requestError?.message || ERROR_MESSAGE;

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
    [messages],
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
    }),
    [error, inputValue, isSending, messages, retryMessage, sendMessage, status],
  );
}
