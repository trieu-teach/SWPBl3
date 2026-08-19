import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
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
  const location = useLocation();

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
    // context (new model)
    chatContext,
    setDocumentContext,
    // backward-compat props consumed by existing components
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

  // ── Initialize context from navigation state (Document → Ask AI entry flow) ──
  //
  // When the user clicks "Ask AI" on Document Detail, React Router carries:
  //   location.state = { mode: "ASK_THIS_DOCUMENT", document: { id, title } }
  //
  // We initialize the ASK_THIS_DOCUMENT context exactly once on mount.
  // If the page is opened without navigation state (direct /ai-chat access),
  // this effect is a no-op and the hook's default context (null) is preserved.
  //
  // We intentionally do NOT put location.state in the dependency array —
  // context should only be set from nav state on the initial render, not on
  // every re-navigation to the same page while already viewing it.
  const contextInitializedRef = useRef(false);
  useEffect(() => {
    if (contextInitializedRef.current) return;
    const state = location.state;
    if (
      state?.mode === "ASK_THIS_DOCUMENT" &&
      state?.document?.id &&
      state?.document?.title
    ) {
      setDocumentContext({ id: state.document.id, title: state.document.title });
      contextInitializedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          height: "100%",
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

        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}>
          <ChatHeader
            chatContext={chatContext}
            selectedDocuments={selectedDocuments}
            onOpenPicker={() => setIsPickerOpen(true)}
            onOpenSidebar={() => setMobileSidebarOpen(true)}
          />

          <ChatContextBar
            chatContext={chatContext}
            selectedDocuments={selectedDocuments}
            onRemove={removeDocument}
            onOpenPicker={() => setIsPickerOpen(true)}
          />

          <ChatMessageList
            chatContext={chatContext}
            messages={messages}
            isSending={isSending}
            onRetry={retryMessage}
            onSend={sendMessage}
            hasMoreHistory={hasMoreHistory}
            isLoadingOlderMessages={isLoadingOlderMessages}
            onLoadOlderMessages={loadOlderMessages}
          />

          <Box sx={{ flexShrink: 0 }}>
            <ChatInput
              chatContext={chatContext}
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
