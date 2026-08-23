import { Box, IconButton, Skeleton, Stack, Tooltip, Typography } from "@mui/material";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import LibraryBooksOutlined from "@mui/icons-material/LibraryBooksOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlined from "@mui/icons-material/EditOutlined";

const MODE_ICON = {
  ASK_MY_LIBRARY: LibraryBooksOutlined,
  ASK_THIS_DOCUMENT: DescriptionOutlined,
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

export default function ConversationItem({ session, isActive, onSelect, onRename, onDelete }) {
  const Icon = MODE_ICON[session.mode] ?? SmartToyOutlined;
  const label = getSessionLabel(session);
  
  const isDocMode = session.mode === "ASK_THIS_DOCUMENT";
  const docTitle = session.document?.title;
  const contextSub = isDocMode && docTitle ? docTitle : "Thư viện của bạn";

  return (
      <Box
        onClick={() => onSelect(session)}
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
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
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
              title={label}
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
            <Stack direction="row" spacing={0.5} sx={{ minWidth: 0, alignItems: "center" }}>
              <Typography variant="caption" color="text.disabled" noWrap sx={{ minWidth: 0, flex: 1 }}>
                {session.lastMessage?.content || contextSub}
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>
                {formatRelativeTime(session.updatedAt)}
              </Typography>
            </Stack>
          </Box>
          <Stack direction="row" spacing={0.25} onClick={(event) => event.stopPropagation()}>
            <Tooltip title="Đổi tên">
              <IconButton size="small" aria-label={`Đổi tên ${label}`} onClick={() => onRename?.(session)}>
                <EditOutlined sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Xóa">
              <IconButton size="small" color="error" aria-label={`Xóa ${label}`} onClick={() => onDelete?.(session)}>
                <DeleteOutlineRounded sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>
  );
}
