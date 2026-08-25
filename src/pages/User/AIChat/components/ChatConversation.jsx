import { Box, CircularProgress, Typography } from "@mui/material";
import ChatInput from "./ChatInput.jsx";
import ChatMessageList from "./ChatMessageList.jsx";
import LibrarySourceEmptyState from "./LibrarySourceEmptyState.jsx";
import ChatCreditBanner from "./ChatCreditBanner.jsx";

export default function ChatConversation({
  chatContext,
  messages = [],
  inputValue = "",
  onInputChange,
  onSend,
  onRetry,
  onStop,
  onApplyDeepDive,
  onAskDeepDive,
  onSourceSelect,
  isSending = false,
  error = null,
  isLoadingHistory = false,
  isLoadingOlderMessages = false,
  hasMoreHistory = false,
  onLoadOlder,
  disabled = false,
  sourceRequired = false,
  creditPresentation,
  onPreviewDocument,
  loadingPreviewId,
}) {
  const creditBlocked = creditPresentation?.blocked === true;
  const messageActionsDisabled = isSending || disabled || creditBlocked;

  // When sourceRequired and there are no messages yet, show a dedicated
  // full-screen prompt instead of the regular empty state / message list.
  const showFullscreenSourcePrompt = sourceRequired && messages.length === 0;

  return (
    <Box
      aria-busy={
        isLoadingHistory || isLoadingOlderMessages || isSending
      }
      sx={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      {isLoadingHistory ? (
        <Box
          role="status"
          aria-live="polite"
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            color: "text.secondary",
          }}
        >
          <CircularProgress size={20} thickness={5} />
          <Typography variant="body2">
            Đang tải cuộc hội thoại...
          </Typography>
        </Box>
      ) : showFullscreenSourcePrompt ? (
        <LibrarySourceEmptyState variant="fullscreen" />
      ) : (
        <ChatMessageList
          chatContext={chatContext}
          messages={messages}
          isSending={messageActionsDisabled}
          onRetry={creditBlocked ? undefined : onRetry}
          onSend={creditBlocked ? undefined : onSend}
          onApplyDeepDive={onApplyDeepDive}
          onAskDeepDive={onAskDeepDive}
          onStop={onStop}
          onSourceSelect={onSourceSelect}
          onPreviewDocument={onPreviewDocument}
          loadingPreviewId={loadingPreviewId}
          hasMoreHistory={hasMoreHistory}
          isLoadingOlderMessages={isLoadingOlderMessages}
          onLoadOlderMessages={onLoadOlder}
        />
      )}

      <Box
        component="fieldset"
        disabled={disabled}
        aria-disabled={disabled}
        sx={{
          flexShrink: 0,
          minWidth: 0,
          m: 0,
          p: 0,
          border: 0,
        }}
      >
        <ChatCreditBanner presentation={creditPresentation} />
        {/* Banner: shown above input when source was deselected mid-chat */}
        {sourceRequired && messages.length > 0 && (
          <LibrarySourceEmptyState variant="banner" />
        )}
        <ChatInput
          chatContext={chatContext}
          value={inputValue}
          onChange={onInputChange}
          onSend={onSend}
          onStop={onStop}
          isSending={isSending}
          error={sourceRequired ? null : error}
          sourceRequired={sourceRequired}
          creditBlocked={creditBlocked}
        />
      </Box>
    </Box>
  );
}
