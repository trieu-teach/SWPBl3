import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Box, Paper } from "@mui/material";
import UserLayout from "../Layout/UserLayout.jsx";
import ChatHeader from "./components/ChatHeader.jsx";
import ChatContextBar from "./components/ChatContextBar.jsx";
import ChatConversation from "./components/ChatConversation.jsx";
import ChatSessionDrawer from "./components/ChatSessionDrawer.jsx";
import LibraryDocumentSidebar from "./components/LibraryDocumentSidebar.jsx";
import { useChatConversation } from "./hooks/useChatConversation.js";
import useLibraryDocuments from "./hooks/useLibraryDocuments.js";
import { useRouteChatSession } from "./hooks/useRouteChatSession.js";
import { useSessions } from "./hooks/useSessions.js";
import {
  CHAT_MODE_DOCUMENT,
  CHAT_MODE_LIBRARY,
  createLibraryContext,
  getLibraryScopePresentation,
  hasSelectedSource,
  setLibrarySubjectScopes,
  toggleLibraryDocumentScope,
} from "./chatContext.js";

const LIBRARY_BASE_PATH = "/hoi-ai";
const LIBRARY_PRESELECTION_KEY = "libraryDocumentPreselection";
const SUBJECT_SCOPE_STORAGE_KEY = "aiChatSubjectScopes";
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

function readStoredSubjectScopes() {
  if (typeof sessionStorage === "undefined") return new Map();
  try {
    const parsed = JSON.parse(sessionStorage.getItem(SUBJECT_SCOPE_STORAGE_KEY));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return new Map();
    }
    return new Map(Object.entries(parsed));
  } catch {
    return new Map();
  }
}

function persistSubjectScopes(scopes) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(
      SUBJECT_SCOPE_STORAGE_KEY,
      JSON.stringify(Object.fromEntries(scopes)),
    );
  } catch {
    // The in-memory map still keeps the active tab working when storage is blocked.
  }
}

import useDocumentPreview from "./hooks/useDocumentPreview.js";
import DocumentPreviewDialog from "../DocumentLibrary/components/DocumentPreviewDialog.jsx";

function ChatPageLayout({
  chatContext,
  libraryScope,
  selectedDocuments,
  selectedSubjectIds,
  onRemoveDocument,
  onToggleDocument,
  onChangeSubjects,
  libraryDocuments,
  sessions,
  sessionsLoading,
  sessionsLoadingMore,
  sessionsError,
  sessionsHasMore,
  currentSessionId,
  onSelectSession,
  onLoadMoreSessions,
  onNewChat,
  onRenameSession,
  onDeleteSession,
  renamingSessionId,
  deletingSessionId,
  sessionActionError,
  onClearSessionActionError,
  selectionLocked,
  children,
}) {
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  
  const { preview, loadingId, openPreview, closePreview } = useDocumentPreview();

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
          scope={libraryScope}
          selectedDocuments={selectedDocuments}
          selectedSubjectIds={selectedSubjectIds}
          onToggleDocument={onToggleDocument}
          onChangeSubjects={onChangeSubjects}
          selectionLocked={selectionLocked}
          mobileOpen={documentsOpen}
          onMobileClose={() => setDocumentsOpen(false)}
          onPreviewDocument={openPreview}
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
            selectionLocked={selectionLocked}
          />

          {typeof children === "function" 
            ? children({ onPreviewDocument: openPreview, loadingPreviewId: loadingId }) 
            : React.cloneElement(children, { onPreviewDocument: openPreview, loadingPreviewId: loadingId })}
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
        onRenameSession={onRenameSession}
        onDeleteSession={onDeleteSession}
        renamingSessionId={renamingSessionId}
        deletingSessionId={deletingSessionId}
        actionError={sessionActionError}
        onClearActionError={onClearSessionActionError}
      />
      
      <DocumentPreviewDialog preview={preview} onClose={closePreview} />
    </UserLayout>
  );
}

function LibraryChatRuntime({ preselectedDocument }) {
  const [libraryContext, setLibraryContext] = useState(() =>
    createInitialLibraryContext(preselectedDocument),
  );
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const sessionSubjectScopesRef = useRef(null);
  if (sessionSubjectScopesRef.current === null) {
    sessionSubjectScopesRef.current = readStoredSubjectScopes();
  }
  const libraryDocuments = useLibraryDocuments();

  const {
    requestedSessionId,
    validatedSessionId,
    validatedSession,
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
    renameSession,
    deleteSession,
    renamingSessionId,
    deletingSessionId,
    actionError: sessionActionError,
    clearActionError: clearSessionActionError,
  } = useSessions({
    mode: CHAT_MODE_LIBRARY,
    enabled: true,
  });

  const handleSessionCreated = useCallback(
    (sessionId) => {
      const subjectIds = libraryContext.libraryFilters?.subjectIds ?? [];
      if (subjectIds.length > 0) {
        sessionSubjectScopesRef.current.set(sessionId, {
          subjectIds: [...subjectIds],
          subjects: libraryContext.libraryFilters?._subjectsMeta ?? [],
        });
        persistSubjectScopes(sessionSubjectScopesRef.current);
      }
      acceptCreatedSession(sessionId);
      void refreshSessions();
    },
    [acceptCreatedSession, libraryContext, refreshSessions],
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
    onSessionUnavailable: startNewChat,
  });
  const resetConversation = conversation.reset;

  const handleNewChat = useCallback(() => {
    resetConversation();
    return startNewChat();
  }, [resetConversation, startNewChat]);

  useEffect(() => {
    if (!validatedSessionId || !validatedSession) return;
    const sessionSubjectId = normalizeId(
      validatedSession.subjectId ?? validatedSession.subject?.id,
    );
    if (sessionSubjectId) {
      setSelectedSubjectIds([sessionSubjectId]);
      setLibraryContext(
        setLibrarySubjectScopes([{
          id: sessionSubjectId,
          name: validatedSession.subject?.name || validatedSession.subjectName,
        }]),
      );
      return;
    }

    const rememberedSubjectScope = sessionSubjectScopesRef.current.get(
      validatedSessionId,
    );
    if (rememberedSubjectScope?.subjectIds?.length > 0) {
      setSelectedSubjectIds(rememberedSubjectScope.subjectIds);
      setLibraryContext(
        setLibrarySubjectScopes(rememberedSubjectScope.subjects),
      );
      return;
    }

    const availableDocuments = validatedSession.documents
      ?.filter((document) => document?.id)
      .map((document) => ({
        id: document.id,
        title: document.title || "Tài liệu",
        available: document.available !== false,
        unavailableReason: document.unavailableReason ?? null,
      })) ?? [];
    setSelectedSubjectIds([]);
    setLibraryContext(
      createLibraryContext(
        availableDocuments.length > 0
          ? {
              documentIds: availableDocuments.map((document) => document.id),
              _documentMeta: availableDocuments,
            }
          : null,
      ),
    );
  }, [validatedSession, validatedSessionId]);

  const selectedDocuments = useMemo(() => {
    const ids = libraryContext.libraryFilters?.documentIds ?? [];
    return (libraryContext.libraryFilters?._documentMeta ?? []).filter(
      (document) => ids.includes(document.id),
    );
  }, [libraryContext]);

  const libraryScope = useMemo(
    () => getLibraryScopePresentation(libraryContext),
    [libraryContext],
  );
  const selectedSubjects = useMemo(
    () => selectedSubjectIds.map((subjectId) =>
      libraryDocuments.subjects.find((subject) => subject.id === subjectId) ?? {
        id: subjectId,
        name: "Môn học đã chọn",
      }),
    [libraryDocuments.subjects, selectedSubjectIds],
  );

  const toggleDocument = useCallback((document) => {
    setLibraryContext((current) => {
      const next = toggleLibraryDocumentScope(current, document);
      return next.libraryFilters?.documentIds?.length
        ? next
        : setLibrarySubjectScopes(selectedSubjects);
    });
  }, [selectedSubjects]);

  const removeDocument = useCallback((documentId) => {
    setLibraryContext((current) => {
      const next = toggleLibraryDocumentScope(
        current,
        { id: documentId },
        false,
      );
      return next.libraryFilters?.documentIds?.length
        ? next
        : setLibrarySubjectScopes(selectedSubjects);
    });
  }, [selectedSubjects]);

  const changeSubjects = useCallback((subjectIds) => {
    const normalizedIds = [...new Set(
      (Array.isArray(subjectIds) ? subjectIds : [])
        .map(normalizeId)
        .filter(Boolean),
    )];
    const nextSubjects = normalizedIds.map((subjectId) =>
      libraryDocuments.subjects.find((subject) => subject.id === subjectId) ?? {
        id: subjectId,
        name: "Môn học đã chọn",
      });

    setSelectedSubjectIds(normalizedIds);
    setLibraryContext(setLibrarySubjectScopes(nextSubjects));
  }, [libraryDocuments.subjects]);

  const handleDeleteSession = useCallback(async (sessionId) => {
    const deleted = await deleteSession(sessionId);
    if (deleted) {
      sessionSubjectScopesRef.current.delete(sessionId);
      persistSubjectScopes(sessionSubjectScopesRef.current);
    }
    if (deleted && sessionId === (validatedSessionId ?? requestedSessionId)) {
      resetConversation();
      startNewChat();
    }
    return deleted;
  }, [deleteSession, requestedSessionId, resetConversation, startNewChat, validatedSessionId]);

  const handleSelectSession = useCallback(
    (sessionId) => {
      void selectSession(sessionId);
    },
    [selectSession],
  );

  const activeSessionId = validatedSessionId ?? requestedSessionId;
  const conversationError =
    routeError || conversation.historyError || conversation.error;

  // True when no primary source (subject or document) is selected.
  // Used to block sending and show the "select a source" prompt.
  const sourceRequired = !hasSelectedSource(libraryContext.libraryFilters);

  return (
    <ChatPageLayout
      chatContext={libraryContext}
      libraryScope={libraryScope}
      selectedDocuments={selectedDocuments}
      selectedSubjectIds={selectedSubjectIds}
      onRemoveDocument={removeDocument}
      onToggleDocument={toggleDocument}
      onChangeSubjects={changeSubjects}
      libraryDocuments={libraryDocuments}
      sessions={sessions}
      sessionsLoading={sessionsLoading}
      sessionsLoadingMore={sessionsLoadingMore}
      sessionsError={sessionsError}
      sessionsHasMore={sessionsHasMore}
      currentSessionId={activeSessionId}
      onSelectSession={handleSelectSession}
      onLoadMoreSessions={loadMoreSessions}
      onNewChat={handleNewChat}
      onRenameSession={renameSession}
      onDeleteSession={handleDeleteSession}
      renamingSessionId={renamingSessionId}
      deletingSessionId={deletingSessionId}
      sessionActionError={sessionActionError}
      onClearSessionActionError={clearSessionActionError}
      selectionLocked={false}
    >
      <ChatConversation
        chatContext={libraryContext}
        messages={conversation.messages}
        inputValue={conversation.inputValue}
        onInputChange={conversation.setInputValue}
        onSend={conversation.sendMessage}
        onRetry={conversation.retryMessage}
        onStop={conversation.abort}
        isSending={conversation.isSending}
        error={conversationError}
        isLoadingHistory={
          isValidating || conversation.isLoadingHistory
        }
        isLoadingOlderMessages={conversation.isLoadingOlderMessages}
        hasMoreHistory={conversation.hasMoreHistory}
        onLoadOlder={conversation.loadOlderMessages}
        disabled={!conversationEnabled}
        sourceRequired={sourceRequired}
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
