import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Box, Paper } from "@mui/material";
import UserLayout from "../Layout/UserLayout.jsx";
import ChatHeader from "./components/ChatHeader.jsx";
import ChatContextBar from "./components/ChatContextBar.jsx";
import ChatConversation from "./components/ChatConversation.jsx";
import ChatInput from "./components/ChatInput.jsx";
import ChatMessageList from "./components/ChatMessageList.jsx";
import DocumentPickerDialog from "./components/DocumentPickerDialog.jsx";
import ConversationSidebar from "./components/ConversationSidebar.jsx";
import { useChat } from "./hooks/useChat.js";
import { useChatConversation } from "./hooks/useChatConversation.js";
import { useRouteChatSession } from "./hooks/useRouteChatSession.js";
import { useSessions } from "./hooks/useSessions.js";
import {
  CHAT_MODE_DOCUMENT,
  CHAT_MODE_LIBRARY,
  createDocumentContext,
  createLibraryContext,
} from "./chatContext.js";

const LIBRARY_BASE_PATH = "/ai-chat";

function getLegacyDocumentContext(locationState) {
  if (locationState?.mode !== CHAT_MODE_DOCUMENT) return null;

  return createDocumentContext({
    documentId:
      locationState.documentId ?? locationState.document?.id,
    title: locationState.document?.title ?? "",
  });
}

function createLegacySessionListScope(chatContext) {
  if (chatContext?.mode === CHAT_MODE_LIBRARY) {
    return { mode: CHAT_MODE_LIBRARY, enabled: true };
  }

  if (chatContext?.mode === CHAT_MODE_DOCUMENT) {
    const documentId =
      typeof chatContext.documentId === "string"
        ? chatContext.documentId.trim()
        : "";

    return documentId
      ? { mode: CHAT_MODE_DOCUMENT, documentId, enabled: true }
      : { enabled: false };
  }

  return { enabled: false };
}

function ChatPageLayout({
  chatContext,
  selectedDocuments,
  onRemoveDocument,
  onApplyDocuments,
  sessions,
  sessionsLoading,
  sessionsError,
  sessionsHasMore,
  currentSessionId,
  onSelectSession,
  onLoadMoreSessions,
  onNewChat,
  children,
}) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
          onSelect={onSelectSession}
          onLoadMore={onLoadMoreSessions}
          onNewChat={onNewChat}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            minHeight: 0,
          }}
        >
          <ChatHeader
            chatContext={chatContext}
            selectedDocuments={selectedDocuments}
            onOpenPicker={() => setIsPickerOpen(true)}
            onOpenSidebar={() => setMobileSidebarOpen(true)}
          />

          <ChatContextBar
            chatContext={chatContext}
            selectedDocuments={selectedDocuments}
            onRemove={onRemoveDocument}
            onOpenPicker={() => setIsPickerOpen(true)}
          />

          {children}
        </Box>
      </Paper>

      <DocumentPickerDialog
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        selectedDocuments={selectedDocuments}
        onApply={onApplyDocuments}
      />
    </UserLayout>
  );
}

function LibraryChatRuntime() {
  const [libraryContext, setLibraryContext] = useState(() =>
    createLibraryContext(null),
  );

  const {
    requestedSessionId,
    validatedSessionId,
    isValidating,
    error: routeError,
    selectSession,
    startNewChat,
    acceptCreatedSession,
  } = useRouteChatSession({
    mode: CHAT_MODE_LIBRARY,
    basePath: LIBRARY_BASE_PATH,
    enabled: true,
  });

  const {
    sessions,
    loading: sessionsLoading,
    error: sessionsError,
    hasMore: sessionsHasMore,
    loadMore: loadMoreSessions,
    refresh: refreshSessions,
  } = useSessions({
    mode: CHAT_MODE_LIBRARY,
    enabled: true,
  });

  const handleSessionCreated = useCallback(
    (sessionId) => {
      acceptCreatedSession(sessionId);
    },
    [acceptCreatedSession],
  );

  const handleConversationCompleted = useCallback(() => {
    void refreshSessions();
  }, [refreshSessions]);

  const conversationEnabled =
    !isValidating &&
    (!requestedSessionId || Boolean(validatedSessionId));

  const conversation = useChatConversation({
    context: libraryContext,
    sessionId: validatedSessionId,
    enabled: conversationEnabled,
    onSessionCreated: handleSessionCreated,
    onConversationCompleted: handleConversationCompleted,
  });

  const selectedDocuments = useMemo(() => {
    const ids = libraryContext.libraryFilters?.documentIds ?? [];
    return (libraryContext.libraryFilters?._documentMeta ?? []).filter(
      (document) => ids.includes(document.id),
    );
  }, [libraryContext]);

  const applyDocuments = useCallback((documents) => {
    setLibraryContext((current) => {
      if (!documents || documents.length === 0) {
        return createLibraryContext(null);
      }

      return createLibraryContext({
        ...(current.libraryFilters ?? {}),
        documentIds: documents.map((document) => document.id),
        _documentMeta: documents.map((document) => ({
          id: document.id,
          title: document.title,
        })),
      });
    });
  }, []);

  const removeDocument = useCallback((documentId) => {
    setLibraryContext((current) => {
      const filters = current.libraryFilters ?? {};
      const documentIds = (filters.documentIds ?? []).filter(
        (id) => id !== documentId,
      );
      const documentMeta = (filters._documentMeta ?? []).filter(
        (document) => document.id !== documentId,
      );

      return documentIds.length === 0
        ? createLibraryContext(null)
        : createLibraryContext({
            ...filters,
            documentIds,
            _documentMeta: documentMeta,
          });
    });
  }, []);

  const handleSelectSession = useCallback(
    (sessionId) => {
      void selectSession(sessionId);
    },
    [selectSession],
  );

  const activeSidebarSessionId =
    validatedSessionId ?? requestedSessionId;
  const conversationError =
    routeError || conversation.historyError || conversation.error;

  return (
    <ChatPageLayout
      chatContext={libraryContext}
      selectedDocuments={selectedDocuments}
      onRemoveDocument={removeDocument}
      onApplyDocuments={applyDocuments}
      sessions={sessions}
      sessionsLoading={sessionsLoading}
      sessionsError={sessionsError}
      sessionsHasMore={sessionsHasMore}
      currentSessionId={activeSidebarSessionId}
      onSelectSession={handleSelectSession}
      onLoadMoreSessions={loadMoreSessions}
      onNewChat={startNewChat}
    >
      <ChatConversation
        chatContext={libraryContext}
        messages={conversation.messages}
        inputValue={conversation.inputValue}
        onInputChange={conversation.setInputValue}
        onSend={conversation.sendMessage}
        onRetry={conversation.retryMessage}
        isSending={conversation.isSending}
        error={conversationError}
        isLoadingHistory={
          isValidating || conversation.isLoadingHistory
        }
        isLoadingOlderMessages={conversation.isLoadingOlderMessages}
        hasMoreHistory={conversation.hasMoreHistory}
        onLoadOlder={conversation.loadOlderMessages}
        disabled={!conversationEnabled}
      />
    </ChatPageLayout>
  );
}

function LegacyDocumentChatRuntime({ initialContext }) {
  const {
    messages,
    inputValue,
    setInputValue,
    isSending,
    error,
    sendMessage,
    retryMessage,
    currentSessionId,
    hasMoreHistory,
    isLoadingOlderMessages,
    loadSession,
    loadOlderMessages,
    startNewChat,
    chatContext,
    setDocumentContext,
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
  } = useSessions(createLegacySessionListScope(chatContext));

  useEffect(() => {
    setDocumentContext(initialContext.document);
  }, [initialContext, setDocumentContext]);

  const prevSessionIdRef = useRef(currentSessionId);
  useEffect(() => {
    if (currentSessionId && currentSessionId !== prevSessionIdRef.current) {
      refreshSessions();
    }
    prevSessionIdRef.current = currentSessionId;
  }, [currentSessionId, refreshSessions]);

  return (
    <ChatPageLayout
      chatContext={chatContext}
      selectedDocuments={selectedDocuments}
      onRemoveDocument={removeDocument}
      onApplyDocuments={applyDocuments}
      sessions={sessions}
      sessionsLoading={sessionsLoading}
      sessionsError={sessionsError}
      sessionsHasMore={sessionsHasMore}
      currentSessionId={currentSessionId}
      onSelectSession={loadSession}
      onLoadMoreSessions={loadMoreSessions}
      onNewChat={startNewChat}
    >
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
    </ChatPageLayout>
  );
}

export default function ChatPage() {
  const location = useLocation();
  const legacyDocumentContext = getLegacyDocumentContext(location.state);

  return legacyDocumentContext ? (
    <LegacyDocumentChatRuntime
      key={legacyDocumentContext.documentId}
      initialContext={legacyDocumentContext}
    />
  ) : (
    <LibraryChatRuntime />
  );
}
