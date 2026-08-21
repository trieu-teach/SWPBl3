import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Box, Paper } from "@mui/material";
import UserLayout from "../Layout/UserLayout.jsx";
import DocumentPreviewDialog from "../DocumentLibrary/components/DocumentPreviewDialog.jsx";
import ChatHeader from "./components/ChatHeader.jsx";
import ChatContextBar from "./components/ChatContextBar.jsx";
import ChatConversation from "./components/ChatConversation.jsx";
import ChatSessionDrawer from "./components/ChatSessionDrawer.jsx";
import LibraryDocumentSidebar from "./components/LibraryDocumentSidebar.jsx";
import { MAX_SELECTED_DOCUMENTS } from "../../../api/chat.api.js";
import { useChatConversation } from "./hooks/useChatConversation.js";
import useLibraryDocumentPreview from "./hooks/useLibraryDocumentPreview.js";
import useLibraryDocuments from "./hooks/useLibraryDocuments.js";
import { useRouteChatSession } from "./hooks/useRouteChatSession.js";
import { useSessions } from "./hooks/useSessions.js";
import {
  CHAT_MODE_DOCUMENT,
  CHAT_MODE_LIBRARY,
  createLibraryContext,
} from "./chatContext.js";

const LIBRARY_BASE_PATH = "/ai-chat";
const LIBRARY_PRESELECTION_KEY = "libraryDocumentPreselection";
// AppShell header plus its responsive page-content padding.
const CHAT_WORKSPACE_HEIGHT = {
  xs: "calc(100dvh - 104px)",
  sm: "calc(100dvh - 120px)",
  lg: "calc(100dvh - 136px)",
};

function normalizeId(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized || null;
}

function getLegacyDocumentId(locationState) {
  if (locationState?.mode !== CHAT_MODE_DOCUMENT) return null;

  const hasExplicitDocumentId = Object.prototype.hasOwnProperty.call(
    locationState,
    "documentId",
  );
  const candidate = hasExplicitDocumentId
    ? locationState.documentId
    : locationState.document?.id;

  return normalizeId(candidate);
}

function getLibraryPreselection(locationState) {
  const candidate = locationState?.[LIBRARY_PRESELECTION_KEY];
  const id = normalizeId(candidate?.id);
  const title =
    typeof candidate?.title === "string" ? candidate.title.trim() : "";

  if (!id || !title) return null;
  return { id, title };
}

function createInitialLibraryContext(preselectedDocument) {
  return preselectedDocument
    ? createLibraryContext({
        documentIds: [preselectedDocument.id],
        _documentMeta: [preselectedDocument],
      })
    : createLibraryContext(null);
}

function updateDocumentInContext(currentContext, document, shouldSelect) {
  const documentId = normalizeId(document?.id);
  if (!documentId) return currentContext;

  const filters = currentContext.libraryFilters ?? {};
  const currentIds = Array.isArray(filters.documentIds)
    ? filters.documentIds
    : [];
  const currentMeta = Array.isArray(filters._documentMeta)
    ? filters._documentMeta
    : [];
  const selected = currentIds.includes(documentId);
  const nextSelected = shouldSelect ?? !selected;

  if (nextSelected && !selected && currentIds.length >= MAX_SELECTED_DOCUMENTS) {
    return currentContext;
  }

  const nextIds = nextSelected
    ? [...new Set([...currentIds, documentId])]
    : currentIds.filter((id) => id !== documentId);
  const metaById = new Map(
    currentMeta
      .filter((item) => normalizeId(item?.id))
      .map((item) => [item.id, item]),
  );

  if (nextSelected) {
    metaById.set(documentId, {
      id: documentId,
      title:
        typeof document?.title === "string" && document.title.trim()
          ? document.title.trim()
          : metaById.get(documentId)?.title || "Tài liệu",
    });
  } else {
    metaById.delete(documentId);
  }

  const nextFilters = { ...filters };
  if (nextIds.length > 0) {
    nextFilters.documentIds = nextIds;
    nextFilters._documentMeta = nextIds
      .map((id) => metaById.get(id))
      .filter(Boolean);
  } else {
    delete nextFilters.documentIds;
    delete nextFilters._documentMeta;
  }

  return createLibraryContext(
    Object.keys(nextFilters).length > 0 ? nextFilters : null,
  );
}

function ChatPageLayout({
  chatContext,
  selectedDocuments,
  onRemoveDocument,
  onToggleDocument,
  libraryDocuments,
  previewController,
  sessions,
  sessionsLoading,
  sessionsLoadingMore,
  sessionsError,
  sessionsHasMore,
  currentSessionId,
  onSelectSession,
  onLoadMoreSessions,
  onNewChat,
  children,
}) {
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  function handlePreviewDocument(document) {
    void previewController.openPreview(document).then((opened) => {
      if (opened) setDocumentsOpen(false);
    });
  }

  return (
    <UserLayout>
      <Paper
        variant="outlined"
        sx={{
          height: CHAT_WORKSPACE_HEIGHT,
          minHeight: 0,
          display: "flex",
          flexDirection: "row",
          overflow: "hidden",
          borderRadius: 3,
          bgcolor: "background.default",
        }}
      >
        <LibraryDocumentSidebar
          library={libraryDocuments}
          selectedDocuments={selectedDocuments}
          onToggleDocument={onToggleDocument}
          onPreviewDocument={handlePreviewDocument}
          previewingDocumentId={previewController.loadingDocumentId}
          previewError={previewController.error}
          mobileOpen={documentsOpen}
          onMobileClose={() => setDocumentsOpen(false)}
        />

        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            minHeight: 0,
            height: "100%",
            overflow: "hidden",
          }}
        >
          <ChatHeader
            chatContext={chatContext}
            onOpenDocuments={() => setDocumentsOpen(true)}
            onNewChat={onNewChat}
            onOpenHistory={() => setHistoryOpen(true)}
          />

          <ChatContextBar
            chatContext={chatContext}
            selectedDocuments={selectedDocuments}
            onRemove={onRemoveDocument}
          />

          {children}
        </Box>
      </Paper>

      <ChatSessionDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        emptyText="Chưa có cuộc trò chuyện nào trong thư viện."
        sessions={sessions}
        activeSessionId={currentSessionId}
        loading={sessionsLoading}
        loadingMore={sessionsLoadingMore}
        error={sessionsError}
        hasMore={sessionsHasMore}
        onSelectSession={onSelectSession}
        onNewChat={onNewChat}
        onLoadMore={onLoadMoreSessions}
      />

      <DocumentPreviewDialog
        preview={previewController.preview}
        onClose={previewController.closePreview}
      />
    </UserLayout>
  );
}

function LibraryChatRuntime({ preselectedDocument }) {
  const [libraryContext, setLibraryContext] = useState(() =>
    createInitialLibraryContext(preselectedDocument),
  );
  const libraryDocuments = useLibraryDocuments();
  const previewController = useLibraryDocumentPreview();

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
    loadingMore: sessionsLoadingMore,
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
    window.dispatchEvent(new Event("subscription:refresh"));
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
  const resetConversation = conversation.reset;

  const handleNewChat = useCallback(() => {
    resetConversation();
    return startNewChat();
  }, [resetConversation, startNewChat]);

  const selectedDocuments = useMemo(() => {
    const ids = libraryContext.libraryFilters?.documentIds ?? [];
    return (libraryContext.libraryFilters?._documentMeta ?? []).filter(
      (document) => ids.includes(document.id),
    );
  }, [libraryContext]);

  const toggleDocument = useCallback((document) => {
    setLibraryContext((current) =>
      updateDocumentInContext(current, document),
    );
  }, []);

  const removeDocument = useCallback((documentId) => {
    setLibraryContext((current) =>
      updateDocumentInContext(current, { id: documentId }, false),
    );
  }, []);

  const handleSelectSession = useCallback(
    (sessionId) => {
      void selectSession(sessionId);
    },
    [selectSession],
  );

  const activeSessionId = validatedSessionId ?? requestedSessionId;
  const conversationError =
    routeError || conversation.historyError || conversation.error;

  return (
    <ChatPageLayout
      chatContext={libraryContext}
      selectedDocuments={selectedDocuments}
      onRemoveDocument={removeDocument}
      onToggleDocument={toggleDocument}
      libraryDocuments={libraryDocuments}
      previewController={previewController}
      sessions={sessions}
      sessionsLoading={sessionsLoading}
      sessionsLoadingMore={sessionsLoadingMore}
      sessionsError={sessionsError}
      sessionsHasMore={sessionsHasMore}
      currentSessionId={activeSessionId}
      onSelectSession={handleSelectSession}
      onLoadMoreSessions={loadMoreSessions}
      onNewChat={handleNewChat}
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

export default function ChatPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLegacyDocumentState =
    location.state?.mode === CHAT_MODE_DOCUMENT;
  const legacyDocumentId = getLegacyDocumentId(location.state);
  const hasLibraryPreselectionState = Object.prototype.hasOwnProperty.call(
    location.state ?? {},
    LIBRARY_PRESELECTION_KEY,
  );
  const preselectedDocument = useMemo(
    () => getLibraryPreselection(location.state),
    [location.state],
  );

  useEffect(() => {
    if (!hasLibraryPreselectionState || isLegacyDocumentState) return;

    const nextState = { ...(location.state ?? {}) };
    delete nextState[LIBRARY_PRESELECTION_KEY];
    navigate(
      {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
      },
      {
        replace: true,
        state: Object.keys(nextState).length > 0 ? nextState : null,
      },
    );
  }, [
    hasLibraryPreselectionState,
    isLegacyDocumentState,
    location.hash,
    location.pathname,
    location.search,
    location.state,
    navigate,
  ]);

  if (legacyDocumentId) {
    return (
      <Navigate
        to={`/documents/${encodeURIComponent(legacyDocumentId)}/ai`}
        replace
      />
    );
  }

  if (isLegacyDocumentState) {
    return (
      <Navigate
        to={`${location.pathname}${location.search}`}
        replace
        state={null}
      />
    );
  }

  return <LibraryChatRuntime preselectedDocument={preselectedDocument} />;
}
