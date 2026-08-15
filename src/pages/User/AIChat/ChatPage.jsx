import { useEffect, useRef, useState } from "react";
import { Box, Paper } from "@mui/material";
import UserLayout from "../Layout/UserLayout.jsx";
import ChatHeader from "./components/ChatHeader.jsx";
import ChatContextBar from "./components/ChatContextBar.jsx";
import ChatInput from "./components/ChatInput.jsx";
import ChatMessageList from "./components/ChatMessageList.jsx";
import DocumentPickerDialog from "./components/DocumentPickerDialog.jsx";
import ConversationSidebar from "./components/ConversationSidebar.jsx";
import { useChat } from "./hooks/useChat.js";
import { useSessions } from "./hooks/useSessions.js";

export default function ChatPage() {
  const {
    // messages
    messages,
    inputValue,
    setInputValue,
    isSending,
    error,
    sendMessage,
    retryMessage,
    // session state
    currentSessionId,
    hasMoreHistory,
    isLoadingOlderMessages,
    loadSession,
    loadOlderMessages,
    startNewChat,
    // document context
    selectedDocuments,
    removeDocument,
    applyDocuments,
  } = useChat();

  const {
    sessions,
    loading: sessionsLoading,
    error: sessionsError,
    hasMore: sessionsHasMore,
    loadMore: loadMoreSessions,
    refresh: refreshSessions,
  } = useSessions();

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Refresh session list when a new session is created (currentSessionId changes from null to string)
  const prevSessionIdRef = useRef(currentSessionId);
  useEffect(() => {
    if (currentSessionId && currentSessionId !== prevSessionIdRef.current) {
      refreshSessions();
    }
    prevSessionIdRef.current = currentSessionId;
  }, [currentSessionId, refreshSessions]);

  return (
    <UserLayout>
      <Paper
        variant="outlined"
        sx={{
          height: {
            xs: "calc(100dvh - 106px)",
            sm: "calc(100dvh - 122px)",
            lg: "calc(100dvh - 138px)",
          },
          minHeight: 0,
          display: "flex",
          flexDirection: "row",
          overflow: "hidden",
          borderRadius: 3,
          bgcolor: "background.default",
        }}
      >
        <ConversationSidebar
          sessions={sessions}
          loading={sessionsLoading}
          error={sessionsError}
          hasMore={sessionsHasMore}
          currentSessionId={currentSessionId}
          mobileOpen={mobileSidebarOpen}
          onSelect={loadSession}
          onLoadMore={loadMoreSessions}
          onNewChat={startNewChat}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <ChatHeader
            selectedDocuments={selectedDocuments}
            onOpenPicker={() => setIsPickerOpen(true)}
            onOpenSidebar={() => setMobileSidebarOpen(true)}
          />

          <ChatContextBar
            selectedDocuments={selectedDocuments}
            onRemove={removeDocument}
            onOpenPicker={() => setIsPickerOpen(true)}
          />

          <ChatMessageList
            messages={messages}
            isSending={isSending}
            onRetry={retryMessage}
            hasMoreHistory={hasMoreHistory}
            isLoadingOlderMessages={isLoadingOlderMessages}
            onLoadOlderMessages={loadOlderMessages}
          />

          <Box sx={{ flexShrink: 0 }}>
            <ChatInput
              value={inputValue}
              onChange={setInputValue}
              onSend={sendMessage}
              isSending={isSending}
              error={error}
            />
          </Box>
        </Box>
      </Paper>

      <DocumentPickerDialog
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        selectedDocuments={selectedDocuments}
        onApply={applyDocuments}
      />
    </UserLayout>
  );
}
