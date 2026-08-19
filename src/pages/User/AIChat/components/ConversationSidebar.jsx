import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AddCommentOutlined from "@mui/icons-material/AddCommentOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import ChatBubbleOutlineOutlined from "@mui/icons-material/ChatBubbleOutlineOutlined";
import ConversationItem, {
  ConversationItemSkeleton,
} from "./ConversationItem.jsx";

const SIDEBAR_WIDTH = 272;

function SidebarInner({
  sessions,
  loading,
  error,
  hasMore,
  currentSessionId,
  onSelect,
  onLoadMore,
  onNewChat,
  onClose,
  showCloseButton,
}) {
  return (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        borderRight: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1.75, borderBottom: "1px solid", borderColor: "divider", flexShrink: 0 }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <ChatBubbleOutlineOutlined sx={{ fontSize: "1.1rem", color: "text.secondary" }} />
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Hội thoại
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Chat mới">
            <IconButton size="small" onClick={onNewChat} aria-label="Tạo chat mới">
              <AddCommentOutlined sx={{ fontSize: "1.1rem" }} />
            </IconButton>
          </Tooltip>
          {showCloseButton && (
            <IconButton size="small" onClick={onClose} aria-label="Đóng sidebar">
              <CloseOutlined sx={{ fontSize: "1.1rem" }} />
            </IconButton>
          )}
        </Stack>
      </Stack>

      {/* Session list */}
      <Box sx={{ flex: 1, overflowY: "auto", py: 1 }}>
        {/* Loading skeletons */}
        {loading && sessions.length === 0 && (
          <Box>
            {Array.from({ length: 6 }).map((_, i) => (
              <ConversationItemSkeleton key={i} />
            ))}
          </Box>
        )}

        {/* Error state */}
        {error && !loading && (
          <Box sx={{ px: 2, py: 2 }}>
            <Alert severity="error" sx={{ fontSize: "0.78rem" }}>
              {error}
            </Alert>
          </Box>
        )}

        {/* Empty state */}
        {!loading && !error && sessions.length === 0 && (
          <Stack alignItems="center" sx={{ px: 2, pt: 4 }} spacing={1}>
            <ChatBubbleOutlineOutlined sx={{ fontSize: 40, color: "text.disabled" }} />
            <Typography variant="caption" color="text.secondary" textAlign="center">
              Chưa có hội thoại nào.
              <br />
              Bắt đầu bằng cách đặt câu hỏi.
            </Typography>
          </Stack>
        )}

        {/* Session items */}
        {sessions.map((session) => (
          <ConversationItem
            key={session.id}
            session={session}
            isActive={session.id === currentSessionId}
            onSelect={(sess) => {
              onSelect(sess.id, sess);
              if (onClose) onClose(); // close mobile drawer after select
            }}
          />
        ))}

        {/* Load more */}
        {hasMore && !loading && (
          <>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ px: 2, pb: 1 }}>
              <Button
                fullWidth
                size="small"
                variant="text"
                onClick={onLoadMore}
                sx={{ fontSize: "0.78rem", fontWeight: 600 }}
              >
                Tải thêm
              </Button>
            </Box>
          </>
        )}

        {/* Loading more indicator */}
        {loading && sessions.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={18} />
          </Box>
        )}
      </Box>
    </Box>
  );
}

/**
 * Desktop: fixed inline panel
 * Mobile: Drawer (controlled via mobileOpen prop)
 */
export default function ConversationSidebar({
  sessions,
  loading,
  error,
  hasMore,
  currentSessionId,
  mobileOpen,
  onSelect,
  onLoadMore,
  onNewChat,
  onMobileClose,
}) {
  const commonProps = {
    sessions,
    loading,
    error,
    hasMore,
    currentSessionId,
    onSelect,
    onLoadMore,
    onNewChat,
  };

  return (
    <>
      {/* Desktop sidebar */}
      <Box
        component="aside"
        sx={{
          display: { xs: "none", md: "flex" },
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          height: "100%",
          overflow: "hidden",
        }}
      >
        <SidebarInner {...commonProps} showCloseButton={false} />
      </Box>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        <SidebarInner
          {...commonProps}
          showCloseButton
          onClose={onMobileClose}
        />
      </Drawer>
    </>
  );
}
