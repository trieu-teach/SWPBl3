import { Box } from "@mui/material";
import ChatInput from "./ChatInput.jsx";
import ChatMessageList from "./ChatMessageList.jsx";
import ChatSkeleton from "./ChatSkeleton.jsx";

export default function ChatConversation({
  chatContext,
  messages = [],
  inputValue = "",
  onInputChange,
  onSend,
  onRetry,
  onSourceSelect,
  onAbort,
  selectedDocuments = [],
  onRemoveDocument,
  onOpenDocuments,
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
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      {isLoadingHistory ? (
        <ChatSkeleton />
      ) : (
        <ChatMessageList
          chatContext={chatContext}
          messages={messages}
          isSending={messageActionsDisabled}
          onRetry={onRetry}
          onSend={onSend}
          onSourceSelect={onSourceSelect}
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
          onAbort={onAbort}
          isSending={isSending}
          error={error}
          selectedDocuments={selectedDocuments}
          onRemoveDocument={onRemoveDocument}
          onOpenDocuments={onOpenDocuments}
        />
      </Box>
    </Box>
  );
}
