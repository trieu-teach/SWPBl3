import { Box, Stack } from "@mui/material";
import { useEffect, useRef, useLayoutEffect } from "react";
import ChatMessage from "./ChatMessage.jsx";
import ChatEmptyState from "./ChatEmptyState.jsx";
import ChatHistoryLoader from "./ChatHistoryLoader.jsx";

function isNearBottom(element) {
  const distanceFromBottom =
    element.scrollHeight - element.scrollTop - element.clientHeight;
  return distanceFromBottom < 120;
}

export default function ChatMessageList({
  chatContext,
  messages,
  isSending,
  onRetry,
  onSend,
  onApplyDeepDive,
  onAskDeepDive,
  onSourceSelect,
  onPreviewDocument,
  loadingPreviewId,
  // History loader props
  hasMoreHistory,
  isLoadingOlderMessages,
  onLoadOlderMessages,
}) {
  const listRef = useRef(null);
  const shouldStickToBottomRef = useRef(true);
  
  // Track previous scrollHeight for scroll preservation when prepending
  const prevScrollHeightRef = useRef(0);
  const prevMessagesLengthRef = useRef(messages.length);

  // Scroll preservation for prepended older messages
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    // If messages were added to the TOP (prepended), the length increases
    // and the new first message is different from the old first message
    // (We simplify by assuming if length grew but we didn't scroll to bottom, it might be a prepend)
    if (messages.length > prevMessagesLengthRef.current) {
      // If we are prepending, the scroll height increases.
      // We want to keep the scroll position relative to the *old* content.
      if (prevScrollHeightRef.current > 0 && !shouldStickToBottomRef.current) {
        const heightDiff = list.scrollHeight - prevScrollHeightRef.current;
        if (heightDiff > 0) {
          list.scrollTop += heightDiff;
        }
      }
    }

    prevScrollHeightRef.current = list.scrollHeight;
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  // Scroll to bottom for new messages
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const lastMessage = messages.at(-1);
    const isNewUserMessage = lastMessage?.role === "user";
    const isPendingAssistantMessage = lastMessage?.status === "loading" || lastMessage?.status === "streaming";
    const shouldForceScroll = isNewUserMessage || isPendingAssistantMessage;

    // Only scroll to bottom if we were already near bottom OR it's a new interaction
    if (shouldStickToBottomRef.current || shouldForceScroll) {
      list.scrollTo({
        top: list.scrollHeight,
        behavior: "smooth",
      });
      shouldStickToBottomRef.current = true;
    }
  }, [messages]);

  function handleScroll(event) {
    shouldStickToBottomRef.current = isNearBottom(event.currentTarget);
    prevScrollHeightRef.current = event.currentTarget.scrollHeight;
  }

  if (!messages.length) {
    return (
      <Box
        ref={listRef}
        onScroll={handleScroll}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          overscrollBehaviorY: "contain",
          p: { xs: 2, sm: 3 },
          display: "flex",
          flexDirection: "column"
        }}
      >
        <ChatEmptyState chatContext={chatContext} />
      </Box>
    );
  }

  return (
    <Box
      ref={listRef}
      onScroll={handleScroll}
      sx={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        overflowX: "hidden",
        overscrollBehaviorY: "contain",
        p: { xs: 1.5, sm: 3 },
      }}
    >
      <ChatHistoryLoader
        hasMore={hasMoreHistory}
        isLoading={isLoadingOlderMessages}
        onLoad={onLoadOlderMessages}
      />
      
      <Stack spacing={2.25} sx={{ width: "100%", maxWidth: 980, minWidth: 0, mx: "auto" }}>
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            isSending={isSending}
            onRetry={onRetry}
            onSend={onSend}
            onApplyDeepDive={onApplyDeepDive}
            onAskDeepDive={onAskDeepDive}
            onSourceSelect={onSourceSelect}
            onPreviewDocument={onPreviewDocument}
            loadingId={loadingPreviewId}
          />
        ))}
      </Stack>
    </Box>
  );
}
