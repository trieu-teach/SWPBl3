import { Box, CircularProgress, Typography } from "@mui/material";
import ChatInput from "./ChatInput.jsx";
import ChatMessageList from "./ChatMessageList.jsx";

export default function ChatConversation({
  chatContext,
  messages = [],
  inputValue = "",
  onInputChange,
  onSend,
  onRetry,
  isSending = false,
  error = null,
  isLoadingHistory = false,
  isLoadingOlderMessages = false,
  hasMoreHistory = false,
  onLoadOlder,
  disabled = false,
}) {
  const messageActionsDisabled = isSending || disabled;

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
      ) : (
        <ChatMessageList
          chatContext={chatContext}
          messages={messages}
          isSending={messageActionsDisabled}
          onRetry={onRetry}
          onSend={onSend}
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
        <ChatInput
          chatContext={chatContext}
          value={inputValue}
          onChange={onInputChange}
          onSend={onSend}
          isSending={isSending}
          error={error}
        />
      </Box>
    </Box>
  );
}
