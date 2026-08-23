import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import {
  AddCommentOutlined,
  ChatBubbleOutlineOutlined,
  CloseOutlined,
} from "@mui/icons-material";
import { useState } from "react";
import ConversationItem, {
  ConversationItemSkeleton,
} from "./ConversationItem.jsx";
import DeleteSessionDialog from "./DeleteSessionDialog.jsx";
import RenameSessionDialog from "./RenameSessionDialog.jsx";

const DRAWER_WIDTH = 360;
const DRAWER_TITLE_ID = "chat-session-drawer-title";

export default function ChatSessionDrawer({
  open = false,
  onClose,
  title = "Lịch sử trò chuyện",
  emptyText = "Chưa có cuộc trò chuyện nào.",
  sessions = [],
  activeSessionId = null,
  loading = false,
  loadingMore = false,
  error = "",
  hasMore = false,
  onSelectSession,
  onNewChat,
  onLoadMore,
  onRenameSession,
  onDeleteSession,
  renamingSessionId = null,
  deletingSessionId = null,
  actionError = "",
  onClearActionError,
}) {
  const [renameTarget, setRenameTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const sessionItems = Array.isArray(sessions) ? sessions : [];
  const initialLoading = loading && sessionItems.length === 0;
  const canSelectSession = typeof onSelectSession === "function";
  const canStartNewChat = typeof onNewChat === "function";
  const canLoadMore = typeof onLoadMore === "function";

  function handleClose() {
    onClose?.();
  }

  function handleSelectSession(session) {
    if (!canSelectSession) return;

    onSelectSession(session.id, session);
    handleClose();
  }

  function handleNewChat() {
    if (!canStartNewChat) return;

    onNewChat();
    handleClose();
  }

  function handleLoadMore() {
    if (!canLoadMore || loadingMore) return;
    onLoadMore();
  }

  async function handleRename(title) {
    if (!renameTarget || !onRenameSession) return;
    const renamed = await onRenameSession(renameTarget.id, title);
    if (renamed) setRenameTarget(null);
  }

  async function handleDelete() {
    if (!deleteTarget || !onDeleteSession) return;
    const deleted = await onDeleteSession(deleteTarget.id);
    if (deleted) setDeleteTarget(null);
  }

  function openRenameDialog(session) {
    onClearActionError?.();
    setDeleteTarget(null);
    setRenameTarget(session);
  }

  function openDeleteDialog(session) {
    onClearActionError?.();
    setRenameTarget(null);
    setDeleteTarget(session);
  }

  return (
    <Drawer
      anchor="right"
      variant="temporary"
      open={Boolean(open)}
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      slotProps={{
        paper: {
          component: "aside",
          "aria-labelledby": DRAWER_TITLE_ID,
        },
      }}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "100vw", sm: DRAWER_WIDTH },
          maxWidth: "100vw",
          boxSizing: "border-box",
          overflow: "hidden",
        },
      }}
    >
      <Stack sx={{ height: "100%", minHeight: 0 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ px: 2, py: 1.5, flexShrink: 0, alignItems: "center" }}
        >
          <ChatBubbleOutlineOutlined color="action" />
          <Typography
            id={DRAWER_TITLE_ID}
            variant="subtitle1"
            sx={{ minWidth: 0, flex: 1, fontWeight: 750 }}
          >
            {title}
          </Typography>
          <Button
            size="small"
            startIcon={<AddCommentOutlined />}
            onClick={handleNewChat}
            disabled={!canStartNewChat}
          >
            Chat mới
          </Button>
          <IconButton
            size="small"
            onClick={handleClose}
            disabled={typeof onClose !== "function"}
            aria-label="Đóng lịch sử trò chuyện"
          >
            <CloseOutlined />
          </IconButton>
        </Stack>

        <Divider />

        <Box sx={{ minHeight: 0, flex: 1, overflowY: "auto", py: 1 }}>
          {initialLoading && (
            <Box aria-busy="true" aria-label="Đang tải lịch sử trò chuyện">
              {Array.from({ length: 6 }).map((_, index) => (
                <ConversationItemSkeleton key={index} />
              ))}
            </Box>
          )}

          {error && !initialLoading && (
            <Box sx={{ px: 2, py: 1 }}>
              <Alert severity="error" sx={{ fontSize: "0.8rem" }}>
                Không thể tải lịch sử trò chuyện.
              </Alert>
            </Box>
          )}

          {!initialLoading && !error && sessionItems.length === 0 && (
            <Stack spacing={1} sx={{ px: 3, py: 6, alignItems: "center" }}>
              <ChatBubbleOutlineOutlined
                sx={{ fontSize: 44, color: "text.disabled" }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                {emptyText}
              </Typography>
            </Stack>
          )}

          {!initialLoading &&
            sessionItems.map((session) => (
              <ConversationItem
                key={session.id}
                session={session}
                isActive={session.id === activeSessionId}
                onSelect={handleSelectSession}
                onRename={openRenameDialog}
                onDelete={openDeleteDialog}
              />
            ))}

          {hasMore && !initialLoading && (
            <>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ px: 2, pb: 1 }}>
                <Button
                  fullWidth
                  size="small"
                  onClick={handleLoadMore}
                  disabled={!canLoadMore || loadingMore}
                  startIcon={
                    loadingMore ? <CircularProgress size={16} /> : undefined
                  }
                >
                  {loadingMore ? "Đang tải..." : "Tải thêm"}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Stack>
      <RenameSessionDialog
        open={Boolean(renameTarget)}
        session={renameTarget}
        loading={renamingSessionId === renameTarget?.id}
        error={actionError}
        onClose={() => {
          onClearActionError?.();
          setRenameTarget(null);
        }}
        onConfirm={handleRename}
      />
      <DeleteSessionDialog
        open={Boolean(deleteTarget)}
        session={deleteTarget}
        loading={deletingSessionId === deleteTarget?.id}
        error={actionError}
        onClose={() => {
          onClearActionError?.();
          setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
      />
    </Drawer>
  );
}
