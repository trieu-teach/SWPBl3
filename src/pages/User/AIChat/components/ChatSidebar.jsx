import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddCommentOutlined from "@mui/icons-material/AddCommentOutlined";
import ChatBubbleOutlineOutlined from "@mui/icons-material/ChatBubbleOutlineOutlined";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import ConversationItem, {
  ConversationItemSkeleton,
} from "./ConversationItem.jsx";
import { getSessionLabel } from "../sessionPresentation.js";

const EXPANDED_WIDTH = 272;
const COLLAPSED_WIDTH = 72;
const MOBILE_WIDTH = 292;

const GROUP_ORDER = ["today", "yesterday", "week", "older"];
const GROUP_LABELS = {
  today: "Hôm nay",
  yesterday: "Hôm qua",
  week: "7 ngày trước",
  older: "Cũ hơn",
};

function getSessionDate(session) {
  const candidate =
    session?.updatedAt || session?.lastMessage?.createdAt || session?.createdAt;
  const date = candidate ? new Date(candidate) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function getDateGroup(session) {
  const date = getSessionDate(session);
  if (!date) return "older";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sessionDay = new Date(date);
  sessionDay.setHours(0, 0, 0, 0);
  const dayDifference = Math.floor(
    (today.getTime() - sessionDay.getTime()) / 86_400_000,
  );

  if (dayDifference <= 0) return "today";
  if (dayDifference === 1) return "yesterday";
  if (dayDifference <= 7) return "week";
  return "older";
}

function groupSessions(sessions) {
  const groups = new Map(GROUP_ORDER.map((key) => [key, []]));
  sessions.forEach((session) => groups.get(getDateGroup(session)).push(session));
  return GROUP_ORDER.map((key) => ({
    key,
    label: GROUP_LABELS[key],
    sessions: groups.get(key),
  })).filter((group) => group.sessions.length > 0);
}

function SidebarContent({
  collapsed,
  sessions,
  activeSessionId,
  loading,
  loadingMore,
  error,
  hasMore,
  onSelectSession,
  onNewChat,
  onLoadMore,
  onClose,
  onToggleCollapse,
  canCollapse,
}) {
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLocaleLowerCase("vi-VN");
  const filteredSessions = useMemo(
    () =>
      sessions.filter((session) => {
        if (!normalizedSearch) return true;
        const searchable = [
          getSessionLabel(session),
          session.document?.title,
          session.lastMessage?.content,
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("vi-VN");
        return searchable.includes(normalizedSearch);
      }),
    [normalizedSearch, sessions],
  );
  const groupedSessions = useMemo(
    () => groupSessions(filteredSessions),
    [filteredSessions],
  );
  const initialLoading = loading && sessions.length === 0;

  function handleNewChat() {
    onNewChat?.();
    onClose?.();
  }

  function handleSelect(session) {
    onSelectSession?.(session.id, session);
    onClose?.();
  }

  return (
    <Stack
      component="aside"
      aria-label="Danh sách cuộc trò chuyện"
      sx={{ height: "100%", minHeight: 0, bgcolor: "background.paper" }}
    >
      <Stack
        direction="row"
        sx={{
          px: collapsed ? 1 : 1.5,
          py: 1.5,
          flexShrink: 0,
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
        }}
      >
        {!collapsed && (
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <ChatBubbleOutlineOutlined color="primary" fontSize="small" />
            <Typography sx={{ fontSize: "0.9rem", fontWeight: 800 }}>
              Cuộc trò chuyện
            </Typography>
          </Stack>
        )}
        {onClose && (
          <IconButton
            size="small"
            onClick={onClose}
            aria-label="Đóng danh sách cuộc trò chuyện"
          >
            <CloseOutlined fontSize="small" />
          </IconButton>
        )}
      </Stack>

      <Box sx={{ px: collapsed ? 1 : 1.5, pb: 1.25 }}>
        {collapsed ? (
          <Tooltip title="Chat mới" placement="right">
            <IconButton
              onClick={handleNewChat}
              aria-label="Tạo cuộc trò chuyện mới"
              color="primary"
              sx={{ width: 44, height: 44, border: "1px solid", borderColor: "divider" }}
            >
              <AddCommentOutlined />
            </IconButton>
          </Tooltip>
        ) : (
          <Button
            fullWidth
            variant="outlined"
            startIcon={<AddCommentOutlined />}
            onClick={handleNewChat}
            sx={{ minHeight: 42, justifyContent: "flex-start", fontWeight: 700 }}
          >
            Chat mới
          </Button>
        )}
      </Box>

      {!collapsed && (
        <Box sx={{ px: 1.5, pb: 1.25 }}>
          <TextField
            fullWidth
            size="small"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm cuộc trò chuyện..."
            slotProps={{
              htmlInput: { "aria-label": "Tìm cuộc trò chuyện" },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined sx={{ fontSize: 18 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                minHeight: 40,
                borderRadius: 2,
                bgcolor: "background.default",
              },
            }}
          />
        </Box>
      )}

      <Divider />

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          py: 1,
          overscrollBehaviorY: "contain",
        }}
      >
        {initialLoading &&
          Array.from({ length: 6 }).map((_, index) => (
            <ConversationItemSkeleton key={index} collapsed={collapsed} />
          ))}

        {error && !initialLoading && !collapsed && (
          <Alert severity="error" sx={{ mx: 1.5, mb: 1, fontSize: "0.75rem" }}>
            Không thể tải lịch sử trò chuyện.
          </Alert>
        )}

        {!initialLoading && !error && filteredSessions.length === 0 && !collapsed && (
          <Stack spacing={1} sx={{ px: 2, py: 5, alignItems: "center" }}>
            <ChatBubbleOutlineOutlined sx={{ color: "text.disabled" }} />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textAlign: "center" }}
            >
              {normalizedSearch
                ? "Không tìm thấy cuộc trò chuyện phù hợp."
                : "Chưa có cuộc trò chuyện nào."}
            </Typography>
          </Stack>
        )}

        {!initialLoading &&
          groupedSessions.map((group) => (
            <Box component="section" key={group.key} sx={{ mb: collapsed ? 0.5 : 1.25 }}>
              {!collapsed && (
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ display: "block", px: 2, pb: 0.25, fontSize: "0.64rem", fontWeight: 800 }}
                >
                  {group.label}
                </Typography>
              )}
              {group.sessions.map((session) => (
                <ConversationItem
                  key={session.id}
                  session={session}
                  isActive={session.id === activeSessionId}
                  onSelect={handleSelect}
                  collapsed={collapsed}
                />
              ))}
            </Box>
          ))}

        {hasMore && !initialLoading && !collapsed && (
          <Box sx={{ px: 1.5, py: 1 }}>
            <Button
              fullWidth
              size="small"
              onClick={onLoadMore}
              disabled={loadingMore}
              startIcon={loadingMore ? <CircularProgress size={15} /> : undefined}
            >
              {loadingMore ? "Đang tải..." : "Tải thêm"}
            </Button>
          </Box>
        )}
      </Box>

      {canCollapse && (
        <Box sx={{ p: 1, borderTop: "1px solid", borderColor: "divider" }}>
          <Tooltip title={collapsed ? "Mở rộng" : "Thu gọn"} placement="right">
            <IconButton
              size="small"
              onClick={onToggleCollapse}
              aria-label={collapsed ? "Mở rộng danh sách trò chuyện" : "Thu gọn danh sách trò chuyện"}
              sx={{ width: 40, height: 40 }}
            >
              {collapsed ? <ChevronRightRounded /> : <ChevronLeftRounded />}
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Stack>
  );
}

export default function ChatSidebar({
  sessions = [],
  activeSessionId = null,
  loading = false,
  loadingMore = false,
  error = "",
  hasMore = false,
  onSelectSession,
  onNewChat,
  onLoadMore,
  mobileOpen = false,
  onMobileClose,
}) {
  const theme = useTheme();
  const compactViewport = useMediaQuery(theme.breakpoints.down("lg"));
  const [collapsed, setCollapsed] = useState(false);
  const compact = compactViewport || collapsed;

  const commonProps = {
    sessions,
    activeSessionId,
    loading,
    loadingMore,
    error,
    hasMore,
    onSelectSession,
    onNewChat,
    onLoadMore,
  };

  return (
    <>
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          width: compact ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
          flexShrink: 0,
          minHeight: 0,
          overflow: "hidden",
          borderRight: "1px solid",
          borderColor: "divider",
          transition: "width 180ms ease",
          "@media (prefers-reduced-motion: reduce)": { transition: "none" },
        }}
      >
        <SidebarContent
          {...commonProps}
          collapsed={compact}
          canCollapse={!compactViewport}
          onToggleCollapse={() => setCollapsed((current) => !current)}
        />
      </Box>

      <Drawer
        anchor="left"
        open={Boolean(mobileOpen)}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": {
            width: { xs: "min(100vw, 320px)", sm: MOBILE_WIDTH },
            maxWidth: "100vw",
            overflow: "hidden",
          },
        }}
      >
        <SidebarContent
          {...commonProps}
          collapsed={false}
          onClose={onMobileClose}
          canCollapse={false}
        />
      </Drawer>
    </>
  );
}
