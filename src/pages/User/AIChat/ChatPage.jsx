import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Box, Paper } from "@mui/material";
import UserLayout from "../Layout/UserLayout.jsx";
import { useToast } from "../../../components/Toast/ToastProvider.jsx";
import { getDocument } from "../../../api/documents.api.js";
import {
  LIBRARY_DOCUMENT_LIMIT_MESSAGE,
  MAX_LIBRARY_DOCUMENTS,
} from "../../../api/chat.constants.js";
import ChatHeader from "./components/ChatHeader.jsx";
import ChatContextBar from "./components/ChatContextBar.jsx";
import ChatConversation from "./components/ChatConversation.jsx";
import ChatSessionDrawer from "./components/ChatSessionDrawer.jsx";
import LibraryDocumentSidebar from "./components/LibraryDocumentSidebar.jsx";
import { useChatConversation } from "./hooks/useChatConversation.js";
import useLibraryDocuments from "./hooks/useLibraryDocuments.js";
import { useRouteChatSession } from "./hooks/useRouteChatSession.js";
import { useSessions } from "./hooks/useSessions.js";
import useChatCredits from "./hooks/useChatCredits.js";
import { getChatCreditPresentation } from "./chatCredits.js";
import {
  CHAT_MODE_DOCUMENT,
  CHAT_MODE_LIBRARY,
  createLibraryContext,
  getLibraryScopePresentation,
  hasStartedLibraryConversation,
  hasSameLibrarySource,
  setLibrarySubjectScopes,
  toggleLibraryDocumentScope,
} from "./chatContext.js";

const LIBRARY_BASE_PATH = "/hoi-ai";
const LIBRARY_PRESELECTION_KEY = "libraryDocumentPreselection";
// Keep the existing key for backward compatibility; values now remember both
// subject discovery scopes and document deep-dive scopes.
const SESSION_SCOPE_STORAGE_KEY = "aiChatSubjectScopes";
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
  const subjectId = normalizeId(candidate?.subjectId ?? candidate?.subject?.id);
  const subjectName =
    typeof candidate?.subjectName === "string"
      ? candidate.subjectName.trim()
      : typeof candidate?.subject?.name === "string"
        ? candidate.subject.name.trim()
        : "";

  if (!id || !title) return null;
  return { id, title, subjectId, subjectName };
}

function createInitialLibraryContext(preselectedDocument) {
  return preselectedDocument
    ? createLibraryContext({
        documentIds: [preselectedDocument.id],
        _documentMeta: [preselectedDocument],
      })
    : createLibraryContext(null);
}

function getSessionDocuments(session) {
  return (
    session?.documents
      ?.filter((document) => document?.id)
      .map((document) => ({
        id: document.id,
        title: document.title || "Tài liệu",
        subjectId: normalizeId(document.subjectId ?? document.subject?.id),
        accessType: document.accessType,
        visibility: document.visibility,
        aiUsable: document.available !== false,
        available: document.available !== false,
        unavailableReason: document.unavailableReason ?? null,
      })) ?? []
  );
}

function getDocumentSubject(document) {
  const id = normalizeId(document?.subjectId ?? document?.subject?.id);
  if (!id) return null;
  const name =
    typeof document?.subject === "string"
      ? document.subject.trim()
      : typeof document?.subject?.name === "string"
        ? document.subject.name.trim()
        : typeof document?.subjectName === "string"
          ? document.subjectName.trim()
          : "";
  return { id, name: name || "Môn học đã chọn" };
}

function readStoredSessionScopes() {
  if (typeof sessionStorage === "undefined") return new Map();
  try {
    const parsed = JSON.parse(sessionStorage.getItem(SESSION_SCOPE_STORAGE_KEY));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return new Map();
    }
    return new Map(Object.entries(parsed));
  } catch {
    return new Map();
  }
}

function persistSessionScopes(scopes) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(
      SESSION_SCOPE_STORAGE_KEY,
      JSON.stringify(Object.fromEntries(scopes)),
    );
  } catch {
    // The in-memory map still keeps the active tab working when storage is blocked.
  }
}

function getDeepDiveDocuments(suggestedDocuments, libraryDocuments) {
  const libraryById = new Map(
    (Array.isArray(libraryDocuments) ? libraryDocuments : [])
      .filter((document) => normalizeId(document?.id))
      .map((document) => [normalizeId(document.id), document]),
  );
  const documentsById = new Map();

  (Array.isArray(suggestedDocuments) ? suggestedDocuments : []).forEach(
    (suggestedDocument) => {
      const id = normalizeId(suggestedDocument?.id);
      if (!id || documentsById.has(id)) return;

      const libraryDocument = libraryById.get(id);
      documentsById.set(id, {
        ...libraryDocument,
        ...suggestedDocument,
        id,
        title:
          suggestedDocument?.title || libraryDocument?.title || "Tài liệu",
        subjectId: normalizeId(
          libraryDocument?.subjectId ?? libraryDocument?.subject?.id,
        ),
        aiUsable: libraryDocument?.aiUsable !== false,
        available: libraryDocument?.available !== false,
      });
    },
  );

  return [...documentsById.values()].slice(0, MAX_LIBRARY_DOCUMENTS);
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
  onChangeSubject,
  onClearDeepDiveScope,
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
  scopeTransitionLocked,
  sourceLockedByConversation,
  creditPresentation,
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
          onChangeSubject={onChangeSubject}
          selectionLocked={selectionLocked}
          sourceLockedByConversation={sourceLockedByConversation}
          onNewChat={onNewChat}
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
            selectedDocumentCount={selectedDocuments.length}
            creditPresentation={creditPresentation}
          />

          <ChatContextBar
            chatContext={chatContext}
            selectedDocuments={selectedDocuments}
            onRemove={onRemoveDocument}
            onClearDeepDiveScope={onClearDeepDiveScope}
            selectionLocked={selectionLocked}
            scopeTransitionLocked={scopeTransitionLocked}
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
  const toast = useToast();
  const initialPreselectionRef = useRef(preselectedDocument);
  const preselectionResolvedRef = useRef(Boolean(preselectedDocument?.subjectId));
  const [libraryContext, setLibraryContext] = useState(() =>
    createInitialLibraryContext(preselectedDocument),
  );
  const sessionScopesRef = useRef(null);
  if (sessionScopesRef.current === null) {
    sessionScopesRef.current = readStoredSessionScopes();
  }
  const libraryDocuments = useLibraryDocuments();
  const {
    credits,
    loading: creditsLoading,
    error: creditsError,
    refresh: refreshChatCredits,
    applyUsage: applyChatUsage,
  } = useChatCredits();
  const creditPresentation = useMemo(
    () =>
      getChatCreditPresentation(credits, CHAT_MODE_LIBRARY, {
        loading: creditsLoading,
        error: creditsError,
      }),
    [credits, creditsError, creditsLoading],
  );

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
    (sessionId, { createdSession } = {}) => {
      const documentIds = Array.isArray(
        libraryContext.libraryFilters?.documentIds,
      )
        ? libraryContext.libraryFilters.documentIds
        : [];
      const subjectIds = Array.isArray(
        libraryContext.libraryFilters?.subjectIds,
      )
        ? libraryContext.libraryFilters.subjectIds
        : [];

      if (documentIds.length > 0) {
        const documents = Array.isArray(
          libraryContext.libraryFilters?._documentMeta,
        )
          ? libraryContext.libraryFilters._documentMeta
          : documentIds.map((id) => ({ id, title: "Tài liệu" }));
        sessionScopesRef.current.set(sessionId, {
          documentIds,
          documents,
        });
        persistSessionScopes(sessionScopesRef.current);
      } else if (subjectIds.length > 0) {
        const subjects = Array.isArray(
          libraryContext.libraryFilters?._subjectsMeta,
        )
          ? libraryContext.libraryFilters._subjectsMeta
          : subjectIds.map((id) => ({ id, name: "Môn học đã chọn" }));
        sessionScopesRef.current.set(sessionId, {
          subjectIds,
          subjects,
        });
        persistSessionScopes(sessionScopesRef.current);
      }
      acceptCreatedSession(sessionId, createdSession);
      void refreshSessions();
    },
    [acceptCreatedSession, libraryContext, refreshSessions],
  );

  const handleConversationCompleted = useCallback(
    ({ usage } = {}) => {
      applyChatUsage(usage);
      void refreshSessions();
      window.dispatchEvent(new Event("subscription:refresh"));
    },
    [applyChatUsage, refreshSessions],
  );

  const handleConversationFailed = useCallback(() => {
    void refreshChatCredits();
  }, [refreshChatCredits]);

  const conversationEnabled =
    !isValidating &&
    (!requestedSessionId || Boolean(validatedSessionId));

  const conversation = useChatConversation({
    context: libraryContext,
    sessionId: validatedSessionId,
    enabled: conversationEnabled,
    onSessionCreated: handleSessionCreated,
    onConversationCompleted: handleConversationCompleted,
    onConversationFailed: handleConversationFailed,
    onSessionUnavailable: startNewChat,
  });
  const resetConversation = conversation.reset;
  const sendConversationMessage = conversation.sendMessage;

  const handleNewChat = useCallback(() => {
    resetConversation();
    return startNewChat();
  }, [resetConversation, startNewChat]);

  const activeSessionId = validatedSessionId ?? requestedSessionId;
  const sourceLockedByConversation = hasStartedLibraryConversation({
    sessionId: activeSessionId,
    messages: conversation.messages,
  });
  const scopeTransitionLocked = isValidating || conversation.isSending;
  const selectionLocked = scopeTransitionLocked || sourceLockedByConversation;

  const applyLibrarySourceChange = useCallback(
    (nextContext) => {
      if (selectionLocked) return false;

      const sourceChanged = !hasSameLibrarySource(libraryContext, nextContext);
      setLibraryContext(nextContext);
      return sourceChanged;
    },
    [libraryContext, selectionLocked],
  );

  useEffect(() => {
    const preselection = initialPreselectionRef.current;
    if (!preselection?.id || preselectionResolvedRef.current) return undefined;

    let active = true;
    preselectionResolvedRef.current = true;
    getDocument(preselection.id)
      .then((document) => {
        if (!active) return;
        const subject = getDocumentSubject(document);
        if (!subject) return;
        const selectedDocument = {
          ...preselection,
          subjectId: subject.id,
          accessType: document?.accessType,
          visibility: document?.visibility,
          aiUsable: document?.aiUsable !== false,
        };
        setLibraryContext(
          createLibraryContext({
            documentIds: [selectedDocument.id],
            _documentMeta: [selectedDocument],
          }),
        );
      })
      .catch(() => {
        // Keep the preselected file even if its optional subject lookup fails.
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!validatedSessionId || !validatedSession) return;
    const sessionDocuments = getSessionDocuments(validatedSession);
    const rememberedSessionScope = sessionScopesRef.current.get(
      validatedSessionId,
    );
    const directSubjectIds = [
      normalizeId(validatedSession.subjectId ?? validatedSession.subject?.id),
      ...(Array.isArray(validatedSession.subjectIds)
        ? validatedSession.subjectIds.map(normalizeId)
        : []),
    ].filter(Boolean);
    const rememberedSubjectIds = [
      normalizeId(rememberedSessionScope?.subjectId),
      ...(Array.isArray(rememberedSessionScope?.subjectIds)
        ? rememberedSessionScope.subjectIds.map(normalizeId)
        : []),
    ].filter(Boolean);
    const rememberedDocumentIds = Array.isArray(
      rememberedSessionScope?.documentIds,
    )
      ? rememberedSessionScope.documentIds.map(normalizeId).filter(Boolean)
      : [];
    const rememberedDocumentsById = new Map(
      (Array.isArray(rememberedSessionScope?.documents)
        ? rememberedSessionScope.documents
        : []
      )
        .filter((document) => normalizeId(document?.id))
        .map((document) => [normalizeId(document.id), document]),
    );
    const documentsById = new Map(
      libraryDocuments.current.documents.map((document) => [document.id, document]),
    );
    const rememberedDocuments = rememberedDocumentIds.map((documentId) => ({
      ...documentsById.get(documentId),
      ...rememberedDocumentsById.get(documentId),
      id: documentId,
      title:
        rememberedDocumentsById.get(documentId)?.title ||
        documentsById.get(documentId)?.title ||
        "Tài liệu",
    }));
    const effectiveDocuments =
      rememberedDocuments.length > 0 ? rememberedDocuments : sessionDocuments;
    const hydratedDocuments = effectiveDocuments.map((document) => ({
      ...documentsById.get(document.id),
      ...document,
      subjectId:
        document.subjectId ?? documentsById.get(document.id)?.subjectId ?? null,
    }));
    const sessionSubjectIds = [
      ...new Set(
        directSubjectIds.length > 0
          ? directSubjectIds
          : rememberedSubjectIds,
      ),
    ];

    if (hydratedDocuments.length > 0) {
      setLibraryContext(
        createLibraryContext({
          documentIds: hydratedDocuments.map((document) => document.id),
          _documentMeta: hydratedDocuments,
        }),
      );
      return;
    }

    if (sessionSubjectIds.length === 0) {
      setLibraryContext(createLibraryContext(null));
      return;
    }

    const rememberedSubjects = [
      ...(Array.isArray(rememberedSessionScope?.subjects)
        ? rememberedSessionScope.subjects
        : []),
      ...(rememberedSessionScope?.subject
        ? [rememberedSessionScope.subject]
        : []),
    ];
    const rememberedSubjectsById = new Map(
      rememberedSubjects
        .filter((subject) => normalizeId(subject?.id))
        .map((subject) => [normalizeId(subject.id), subject]),
    );
    const subjects = sessionSubjectIds.map((subjectId) =>
      libraryDocuments.subjects.find((item) => item.id === subjectId) ?? {
        id: subjectId,
        name:
          rememberedSubjectsById.get(subjectId)?.name ||
          (sessionSubjectIds.length === 1
            ? validatedSession.subject?.name || validatedSession.subjectName
            : null) ||
          "Môn học đã chọn",
      },
    );
    setLibraryContext(
      createLibraryContext({
        subjectIds: sessionSubjectIds,
        _subjectsMeta: subjects,
      }),
    );
    sessionScopesRef.current.set(validatedSessionId, {
      subjectIds: sessionSubjectIds,
      subjects,
    });
    persistSessionScopes(sessionScopesRef.current);
  }, [
    libraryDocuments.current.documents,
    libraryDocuments.subjects,
    validatedSession,
    validatedSessionId,
  ]);

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
  const selectedSubjectIds = useMemo(
    () => libraryContext.libraryFilters?.subjectIds ?? [],
    [libraryContext],
  );
  const selectedSubjects = useMemo(
    () => {
      const contextSubjects = new Map(
        (libraryContext.libraryFilters?._subjectsMeta ?? []).map((subject) => [
          subject.id,
          subject,
        ]),
      );
      return selectedSubjectIds.map(
        (subjectId) =>
          libraryDocuments.subjects.find(
            (subject) => subject.id === subjectId,
          ) ??
          contextSubjects.get(subjectId) ?? {
            id: subjectId,
            name: "Môn học đã chọn",
          },
      );
    },
    [libraryContext, libraryDocuments.subjects, selectedSubjectIds],
  );

  const rememberDocumentScope = useCallback(
    (documents) => {
      if (!activeSessionId) return;

      const rememberedDocuments = documents.map((document) => ({
        id: document.id,
        title: document.title,
        subjectId: document.subjectId,
        accessType: document.accessType,
        visibility: document.visibility,
        aiUsable: document.aiUsable !== false,
        available: document.available !== false,
        unavailableReason: document.unavailableReason ?? null,
      }));
      sessionScopesRef.current.set(activeSessionId, {
        documentIds: rememberedDocuments.map((document) => document.id),
        documents: rememberedDocuments,
      });
      persistSessionScopes(sessionScopesRef.current);
    },
    [activeSessionId],
  );

  const applyDeepDiveScope = useCallback(
    (suggestedDocuments) => {
      if (scopeTransitionLocked) return null;

      const documents = getDeepDiveDocuments(
        suggestedDocuments,
        libraryDocuments.current.documents,
      );
      if (documents.length === 0) {
        toast.warning("Không có tài liệu hợp lệ để chuyển sang chế độ hỏi sâu.");
        return null;
      }

      const nextContext = createLibraryContext({
        documentIds: documents.map((document) => document.id),
        _documentMeta: documents,
      });
      setLibraryContext(nextContext);
      rememberDocumentScope(documents);
      return nextContext;
    },
    [
      libraryDocuments.current.documents,
      rememberDocumentScope,
      scopeTransitionLocked,
      toast,
    ],
  );

  const askDeepDive = useCallback(
    (suggestedDocuments, prompt) => {
      const question = typeof prompt === "string" ? prompt.trim() : "";
      if (!question) return false;

      const nextContext = applyDeepDiveScope(suggestedDocuments);
      if (!nextContext) return false;

      return sendConversationMessage(question, { context: nextContext });
    },
    [applyDeepDiveScope, sendConversationMessage],
  );

  const clearDeepDiveScope = useCallback(() => {
    if (scopeTransitionLocked) return false;

    setLibraryContext(createLibraryContext(null));
    if (activeSessionId) {
      sessionScopesRef.current.delete(activeSessionId);
      persistSessionScopes(sessionScopesRef.current);
    }
    return true;
  }, [activeSessionId, scopeTransitionLocked]);

  const removeDocument = useCallback(
    (documentId) => {
      if (selectionLocked) return false;
      const selectedIds = libraryContext.libraryFilters?.documentIds ?? [];
      if (!selectedIds.includes(documentId)) return false;

      const next = toggleLibraryDocumentScope(
        libraryContext,
        { id: documentId },
        false,
      );
      const nextContext = next.libraryFilters?.documentIds?.length
        ? next
        : setLibrarySubjectScopes(selectedSubjects);
      applyLibrarySourceChange(nextContext);
      return true;
    },
    [
      applyLibrarySourceChange,
      libraryContext,
      selectedSubjects,
      selectionLocked,
    ],
  );

  const toggleDocument = useCallback(
    (document) => {
      if (selectionLocked || !document?.id) return false;
      if (
        selectedSubjectIds.length > 0 &&
        !selectedSubjectIds.includes(document.subjectId)
      ) {
        toast.warning("Chỉ có thể chọn tài liệu thuộc các môn học hiện tại.");
        return false;
      }
      const selectedIds = libraryContext.libraryFilters?.documentIds ?? [];
      if (selectedIds.includes(document.id)) {
        return removeDocument(document.id);
      }

      if (document.aiUsable !== true) {
        toast.warning("Tài liệu chưa sẵn sàng để sử dụng với AI.");
        return false;
      }
      if (selectedIds.length >= MAX_LIBRARY_DOCUMENTS) {
        toast.warning(LIBRARY_DOCUMENT_LIMIT_MESSAGE);
        return false;
      }

      const next = toggleLibraryDocumentScope(libraryContext, document);
      const nextContext = next.libraryFilters?.documentIds?.length
        ? next
        : setLibrarySubjectScopes(selectedSubjects);
      applyLibrarySourceChange(nextContext);
      return true;
    },
    [
      applyLibrarySourceChange,
      libraryContext,
      removeDocument,
      selectedSubjectIds,
      selectedSubjects,
      selectionLocked,
      toast,
    ],
  );

  const changeSubjects = useCallback(
    (subjectIds) => {
      const normalizedIds = Array.isArray(subjectIds)
        ? [...new Set(subjectIds.map(normalizeId).filter(Boolean))]
        : [];
      const nextSubjects = normalizedIds.map(
        (subjectId) =>
          libraryDocuments.subjects.find(
            (subject) => subject.id === subjectId,
          ) ?? { id: subjectId, name: "Môn học đã chọn" },
      );

      // Changing the subject filter clears explicit file selection so hidden
      // documents cannot remain in the next request scope.
      applyLibrarySourceChange(setLibrarySubjectScopes(nextSubjects));
    },
    [applyLibrarySourceChange, libraryDocuments.subjects],
  );

  const handleDeleteSession = useCallback(async (sessionId) => {
    const deleted = await deleteSession(sessionId);
    if (deleted) {
      sessionScopesRef.current.delete(sessionId);
      persistSessionScopes(sessionScopesRef.current);
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

  const conversationError =
    routeError || conversation.historyError || conversation.error;

  // Null filters mean the whole eligible personal/saved library.
  const sourceRequired = false;

  return (
    <>
      <ChatPageLayout
        chatContext={libraryContext}
        libraryScope={libraryScope}
        selectedDocuments={selectedDocuments}
        selectedSubjectIds={selectedSubjectIds}
        onRemoveDocument={removeDocument}
        onToggleDocument={toggleDocument}
        onChangeSubject={changeSubjects}
        onClearDeepDiveScope={clearDeepDiveScope}
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
        selectionLocked={selectionLocked}
        scopeTransitionLocked={scopeTransitionLocked}
        sourceLockedByConversation={sourceLockedByConversation}
        creditPresentation={creditPresentation}
      >
        <ChatConversation
          chatContext={libraryContext}
          messages={conversation.messages}
          inputValue={conversation.inputValue}
          onInputChange={conversation.setInputValue}
          onSend={sendConversationMessage}
          onRetry={conversation.retryMessage}
          onStop={conversation.abort}
          onApplyDeepDive={applyDeepDiveScope}
          onAskDeepDive={askDeepDive}
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
          creditPresentation={creditPresentation}
        />
      </ChatPageLayout>
    </>
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
