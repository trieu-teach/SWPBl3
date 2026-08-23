import { Box, Divider, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useLayoutEffect, Fragment } from "react";
import ChatMessage from "./ChatMessage.jsx";
import ChatEmptyState from "./ChatEmptyState.jsx";
import ChatHistoryLoader from "./ChatHistoryLoader.jsx";
import { getLibraryScopePresentation, CHAT_MODE_LIBRARY } from "../chatContext.js";

function isNearBottom(element) {
  const distanceFromBottom =
    element.scrollHeight - element.scrollTop - element.clientHeight;
  return distanceFromBottom < 120;
}

/**
 * Shallow-compare libraryFilters by their primary source fields.
 * Returns true when both sides select the same source.
 */
function filtersAreEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.subjectId !== b.subjectId) return false;
  const aIds = (a.subjectIds ?? []).join(",");
  const bIds = (b.subjectIds ?? []).join(",");
  if (aIds !== bIds) return false;
  const aDocs = (a.documentIds ?? []).join(",");
  const bDocs = (b.documentIds ?? []).join(",");
  return aDocs === bDocs;
}

/**
 * Walk through the messages array and compute a list of render items,
 * inserting a source-change marker before any user message that immediately
 * follows an assistant message whose libraryFilters differ from the last
 * known assistant snapshot.
 *
 * Only messages created in this session (i.e. with requestSnapshot) are
 * considered. History messages (no requestSnapshot) are always rendered as-is.
 *
 * @param {object[]} messages
 * @returns {Array<{type: "message", message: object} | {type: "source-change", label: string, key: string}>}
 */
function buildRenderItems(messages) {
  const items = [];
  let lastAssistantFilters = undefined; // undefined = not yet seen any assistant snapshot

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];

    // Before rendering a user message, check whether the previous assistant
    // snapshot used a different source.
    if (
      message.role === "user" &&
      lastAssistantFilters !== undefined &&
      i > 0
    ) {
      // Look ahead: the upcoming assistant reply will carry the current source.
      // But we detect the change from the *previous* assistant snapshot vs the
      // source that was active when this user message was sent — which is the
      // same as what the *next* assistant message will record.
      // We can't read it yet, so we look at the context snapshot attached to
      // the assistant message that directly precedes this user message in the
      // stream (i.e. the one that was generated from the previous question).
      // At the moment the user sends a new question, the most recent assistant
      // snapshot reflects the *previous* question's source, so any divergence
      // with the current UI filters will be visible in the *next* assistant
      // message's requestSnapshot. We therefore defer the marker insertion to
      // just before the *next* assistant message instead.
    }

    // Insert marker before an assistant message when its filters differ from
    // the previous assistant message's filters.
    if (
      message.role === "assistant" &&
      message.requestSnapshot?.context?.mode === CHAT_MODE_LIBRARY
    ) {
      const currentFilters = message.requestSnapshot.context.libraryFilters ?? null;
      if (
        lastAssistantFilters !== undefined &&
        !filtersAreEqual(lastAssistantFilters, currentFilters)
      ) {
        const fakeContext = { mode: CHAT_MODE_LIBRARY, libraryFilters: currentFilters };
        const presentation = getLibraryScopePresentation(fakeContext);
        items.push({
          type: "source-change",
          label: presentation.label,
          key: `source-change-${message.id}`,
        });
      }
      lastAssistantFilters = currentFilters;
    }

    items.push({ type: "message", message });
  }

  return items;
}

function SourceChangeDivider({ label }) {
  return (
    <Box
      aria-label={`Nguồn thay đổi: ${label}`}
      sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.5 }}
    >
      <Divider sx={{ flex: 1 }} />
      <Typography
        variant="caption"
        color="text.disabled"
        sx={{ whiteSpace: "nowrap", fontStyle: "italic", fontSize: "0.72rem" }}
      >
        — Từ đây, câu trả lời dựa trên nguồn: {label} —
      </Typography>
      <Divider sx={{ flex: 1 }} />
    </Box>
  );
}

export default function ChatMessageList({
  chatContext,
  messages,
  isSending,
  onRetry,
  onSend,
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
        {buildRenderItems(messages).map((item) =>
          item.type === "source-change" ? (
            <SourceChangeDivider key={item.key} label={item.label} />
          ) : (
            <Fragment key={item.message.id}>
              <ChatMessage
                message={item.message}
                isSending={isSending}
                onRetry={onRetry}
                onSend={onSend}
                onSourceSelect={onSourceSelect}
                onPreviewDocument={onPreviewDocument}
                loadingId={loadingPreviewId}
              />
            </Fragment>
          ),
        )}
      </Stack>
    </Box>
  );
}
