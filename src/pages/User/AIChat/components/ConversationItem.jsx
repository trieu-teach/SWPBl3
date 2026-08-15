import { Box, Skeleton, Stack, Tooltip, Typography } from "@mui/material";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import MenuBookOutlined from "@mui/icons-material/MenuBookOutlined";

const MODE_ICON = {
  ASK_MY_LIBRARY: MenuBookOutlined,
  ASK_THIS_DOCUMENT: MenuBookOutlined,
};

function formatRelativeTime(isoString) {
  if (!isoString) return "";
  try {
    const now = Date.now();
    const date = new Date(isoString).getTime();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Vừa xong";
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH} giờ trước`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD} ngày trước`;
    return new Date(isoString).toLocaleDateString("vi-VN");
  } catch {
    return "";
  }
}

function getSessionLabel(session) {
  if (session.title) return session.title;
  const preview = session.lastMessage?.content;
  if (preview) return preview.length > 48 ? `${preview.slice(0, 48)}…` : preview;
  return "Chat mới";
}

export function ConversationItemSkeleton() {
  return (
    <Box sx={{ px: 1.5, py: 0.75 }}>
      <Skeleton variant="rounded" height={52} sx={{ borderRadius: 2 }} />
    </Box>
  );
}

export default function ConversationItem({ session, isActive, onSelect }) {
  const Icon = MODE_ICON[session.mode] ?? SmartToyOutlined;
  const label = getSessionLabel(session);
  const timeLabel = formatRelativeTime(session.updatedAt);

  return (
    <Tooltip title={label} placement="right" enterDelay={700}>
      <Box
        onClick={() => onSelect(session.id)}
        sx={{
          mx: 1,
          px: 1.5,
          py: 1,
          borderRadius: 2,
          cursor: "pointer",
          bgcolor: isActive ? "action.selected" : "transparent",
          transition: "background 0.15s",
          "&:hover": { bgcolor: isActive ? "action.selected" : "action.hover" },
          userSelect: "none",
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 30,
              height: 30,
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              borderRadius: 1.5,
              bgcolor: isActive ? "primary.main" : "action.hover",
              color: isActive ? "primary.contrastText" : "text.secondary",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            <Icon sx={{ fontSize: "1rem" }} />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: isActive ? 700 : 500,
                lineHeight: 1.4,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: isActive ? "text.primary" : "text.primary",
              }}
            >
              {label}
            </Typography>
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ display: "block", lineHeight: 1.3 }}
            >
              {timeLabel}
              {session.messageCount > 0 && ` · ${session.messageCount} tin nhắn`}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Tooltip>
  );
}
