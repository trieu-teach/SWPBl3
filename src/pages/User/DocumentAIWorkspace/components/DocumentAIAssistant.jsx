import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  AddCommentOutlined,
  HistoryOutlined,
  SmartToyOutlined,
} from "@mui/icons-material";
import ChatConversation from "../../AIChat/components/ChatConversation.jsx";
import {
  CHAT_MODE_DOCUMENT,
  createDocumentContext,
} from "../../AIChat/chatContext.js";
import { useChatConversation } from "../../AIChat/hooks/useChatConversation.js";
import { useRouteChatSession } from "../../AIChat/hooks/useRouteChatSession.js";
import { useSessions } from "../../AIChat/hooks/useSessions.js";
import ChatSessionDrawer from "../../AIChat/components/ChatSessionDrawer.jsx";

function normalizeString(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized || null;
}

export default function DocumentAIAssistant({
  documentId,
  documentTitle = "",
  basePath,
  enabled = true,
  canSend = true,
  disabledReason = "",
  onSourceSelect,
}) {
  const [sessionsOpen, setSessionsOpen] = useState(false);

  const normalizedDocumentId = normalizeString(documentId);
  const normalizedBasePath = normalizeString(basePath);
  const normalizedDocumentTitle = normalizeString(documentTitle) || "";
  const normalizedDisabledReason = normalizeString(disabledReason) || "";
  const scopeEnabled = Boolean(
    enabled && normalizedDocumentId && normalizedBasePath,
  );
  const sendAllowed = Boolean(canSend);

  const documentChatContext = useMemo(
    () =>
      normalizedDocumentId
        ? createDocumentContext({
            documentId: normalizedDocumentId,
            title: normalizedDocumentTitle,
          })
        : null,
    [normalizedDocumentId, normalizedDocumentTitle],
  );

  const {
    sessions,
    loading: sessionsLoading,
    loadingMore: sessionsLoadingMore,
    error: sessionsError,
    hasMore: sessionsHasMore,
    loadMore: loadMoreSessions,
    refresh: refreshSessions,
  } = useSessions({
    mode: CHAT_MODE_DOCUMENT,
    documentId: normalizedDocumentId,
    enabled: scopeEnabled,
  });

  const {
    requestedSessionId,
    validatedSessionId,
    isValidating,
    error: routeError,
    selectSession,
    startNewChat,
    acceptCreatedSession,
    retryValidation,
  } = useRouteChatSession({
    mode: CHAT_MODE_DOCUMENT,
    documentId: normalizedDocumentId,
    basePath: normalizedBasePath,
    enabled: scopeEnabled,
  });

  const conversationEnabled = Boolean(
    scopeEnabled &&
      !isValidating &&
      (!requestedSessionId || validatedSessionId),
  );

  const handleSessionCreated = useCallback(
    (confirmedSessionId) => {
      acceptCreatedSession(confirmedSessionId);
    },
    [acceptCreatedSession],
  );

  const handleConversationCompleted = useCallback(() => {
    void refreshSessions();
  }, [refreshSessions]);

  const {
    messages,
    inputValue,
    setInputValue,
    isSending,
    error: sendError,
    historyError,
    isLoadingHistory,
    isLoadingOlderMessages,
    hasMoreHistory,
    sendMessage,
    retryMessage,
    loadOlderMessages,
    reset: resetConversation,
  } = useChatConversation({
    context: documentChatContext,
    sessionId: validatedSessionId,
    enabled: conversationEnabled,
    onSessionCreated: handleSessionCreated,
    onConversationCompleted: handleConversationCompleted,
  });

  const handleSend = useCallback(
    (message) => {
      if (!conversationEnabled || !sendAllowed) return false;
      return sendMessage(message);
    },
    [conversationEnabled, sendAllowed, sendMessage],
  );

  const handleRetryMessage = useCallback(
    (messageId) => {
      if (!conversationEnabled || !sendAllowed) return false;
      return retryMessage(messageId);
    },
    [conversationEnabled, sendAllowed, retryMessage],
  );

  const handleSelectSession = useCallback(
    (sessionId) => {
      void selectSession(sessionId);
    },
    [selectSession],
  );

  const handleNewChat = useCallback(() => {
    if (!scopeEnabled) return false;
    resetConversation();
    return startNewChat();
  }, [scopeEnabled, resetConversation, startNewChat]);

  const handleOpenSessions = useCallback(() => {
    if (scopeEnabled) setSessionsOpen(true);
  }, [scopeEnabled]);

  const activeSessionId = validatedSessionId ?? requestedSessionId;
  const composerDisabled = !conversationEnabled || !sendAllowed;
  const conversationError = historyError || sendError;

  return (
    <>
      <Paper
        component="section"
        aria-label="Trợ lý AI cho tài liệu"
        variant="outlined"
        sx={{
          width: "100%",
          height: "100%",
          minWidth: 0,
          minHeight: 0,
          borderRadius: 3,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          gap={1.5}
          sx={{ px: { xs: 2, sm: 2.5 }, py: 1.5, flexWrap: "wrap" }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              borderRadius: 2,
              bgcolor: "action.hover",
              color: "primary.main",
            }}
          >
            <SmartToyOutlined />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Trợ lý AI
            </Typography>
            {normalizedDocumentTitle && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {normalizedDocumentTitle}
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={0.75}>
            <Button
              size="small"
              startIcon={<AddCommentOutlined />}
              onClick={handleNewChat}
              disabled={!scopeEnabled}
            >
              Chat mới
            </Button>
            <Button
              size="small"
              startIcon={<HistoryOutlined />}
              onClick={handleOpenSessions}
              disabled={!scopeEnabled}
            >
              Lịch sử
            </Button>
          </Stack>
        </Stack>

        <Divider />

        {routeError && (
          <Alert
            severity="error"
            action={
              requestedSessionId && !isValidating ? (
                <Button
                  color="inherit"
                  size="small"
                  onClick={retryValidation}
                >
                  Thử lại
                </Button>
              ) : undefined
            }
            sx={{ mx: 2, mt: 2 }}
          >
            {routeError}
          </Alert>
        )}

        {scopeEnabled &&
          !sendAllowed &&
          normalizedDisabledReason && (
            <Alert severity="info" sx={{ mx: 2, mt: 2 }}>
              {normalizedDisabledReason}
            </Alert>
          )}

        <ChatConversation
          chatContext={documentChatContext}
          messages={messages}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSend={handleSend}
          onRetry={handleRetryMessage}
          onSourceSelect={onSourceSelect}
          isSending={isSending}
          error={conversationError}
          isLoadingHistory={isValidating || isLoadingHistory}
          isLoadingOlderMessages={isLoadingOlderMessages}
          hasMoreHistory={hasMoreHistory}
          onLoadOlder={loadOlderMessages}
          disabled={composerDisabled}
        />
      </Paper>

      <ChatSessionDrawer
        open={sessionsOpen}
        onClose={() => setSessionsOpen(false)}
        emptyText="Chưa có cuộc trò chuyện nào với tài liệu này."
        sessions={sessions}
        activeSessionId={activeSessionId}
        loading={sessionsLoading}
        loadingMore={sessionsLoadingMore}
        error={sessionsError}
        hasMore={sessionsHasMore}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onLoadMore={loadMoreSessions}
      />
    </>
  );
}
