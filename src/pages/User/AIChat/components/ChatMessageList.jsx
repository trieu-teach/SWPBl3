import { Box, Stack } from "@mui/material";
import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage.jsx";
import ChatEmptyState from "./ChatEmptyState.jsx";

function isNearBottom(element) {
  const distanceFromBottom =
    element.scrollHeight - element.scrollTop - element.clientHeight;

  return distanceFromBottom < 120;
}

export default function ChatMessageList({ messages, isSending, onRetry }) {
  const listRef = useRef(null);
  const shouldStickToBottomRef = useRef(true);

  useEffect(() => {
    const list = listRef.current;
    const lastMessage = messages.at(-1);
    const shouldForceScroll =
      lastMessage?.role === "user" || lastMessage?.status === "loading";

    if (!list || (!shouldStickToBottomRef.current && !shouldForceScroll)) return;

    list.scrollTo({
      top: list.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  function handleScroll(event) {
    shouldStickToBottomRef.current = isNearBottom(event.currentTarget);
  }

  if (!messages.length) {
    return (
      <Box
        ref={listRef}
        onScroll={handleScroll}
        sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: { xs: 2, sm: 3 } }}
      >
        <ChatEmptyState />
      </Box>
    );
  }

  return (
    <Box
      ref={listRef}
      onScroll={handleScroll}
      sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: { xs: 2, sm: 3 } }}
    >
      <Stack spacing={2.5}>
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            isSending={isSending}
            onRetry={onRetry}
          />
        ))}
      </Stack>
    </Box>
  );
}
