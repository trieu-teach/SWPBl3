import {
  Box,
  ButtonBase,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import LibraryBooksOutlined from "@mui/icons-material/LibraryBooksOutlined";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import { getSessionLabel } from "../sessionPresentation.js";

const MODE_ICON = {
  ASK_MY_LIBRARY: LibraryBooksOutlined,
  ASK_THIS_DOCUMENT: DescriptionOutlined,
};

function formatRelativeTime(isoString) {
  if (!isoString) return "";
  const timestamp = new Date(isoString).getTime();
  if (Number.isNaN(timestamp)) return "";

  const diffMinutes = Math.max(
    0,
    Math.floor((Date.now() - timestamp) / 60_000),
  );
  if (diffMinutes < 1) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày`;
  return new Date(isoString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}

export function ConversationItemSkeleton({ collapsed = false }) {
  return (
    <Box sx={{ px: collapsed ? 1.25 : 1.5, py: 0.5 }}>
      <Skeleton
        variant="rounded"
        width={collapsed ? 44 : "100%"}
        height={collapsed ? 44 : 54}
        sx={{ borderRadius: 2 }}
      />
    </Box>
  );
}

export default function ConversationItem({
  session,
  isActive,
  onSelect,
  collapsed = false,
}) {
  const Icon = MODE_ICON[session.mode] ?? SmartToyOutlined;
  const label = getSessionLabel(session);
  const timestamp = formatRelativeTime(
    session.updatedAt || session.lastMessage?.createdAt || session.createdAt,
  );
  const contextLabel =
    session.mode === "ASK_THIS_DOCUMENT" && session.document?.title
      ? session.document.title
      : "Thư viện";

  const item = (
    <ButtonBase
      onClick={() => onSelect(session)}
      aria-current={isActive ? "page" : undefined}
      aria-label={`${label}${timestamp ? `, ${timestamp}` : ""}`}
      sx={{
        width: collapsed ? 44 : "calc(100% - 16px)",
        minHeight: collapsed ? 44 : 56,
        mx: collapsed ? "auto" : 1,
        px: collapsed ? 0 : 1.25,
        py: collapsed ? 0 : 0.8,
        display: "flex",
        justifyContent: collapsed ? "center" : "flex-start",
        borderRadius: 2,
        textAlign: "left",
        color: "text.primary",
        bgcolor: isActive ? "action.selected" : "transparent",
        transition: "background-color 150ms ease, color 150ms ease",
        "&:hover": {
          bgcolor: isActive ? "action.selected" : "action.hover",
        },
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: -2,
        },
        "@media (prefers-reduced-motion: reduce)": { transition: "none" },
      }}
    >
      <Stack
        direction="row"
        spacing={1.1}
        sx={{ minWidth: 0, width: "100%", alignItems: "center" }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            borderRadius: 1.5,
            bgcolor: isActive ? "primary.main" : "action.hover",
            color: isActive ? "primary.contrastText" : "text.secondary",
          }}
        >
          <Icon sx={{ fontSize: 17 }} />
        </Box>

        {!collapsed && (
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="body2"
              noWrap
              sx={{ fontWeight: isActive ? 700 : 600, lineHeight: 1.35 }}
            >
              {label}
            </Typography>
            <Stack
              direction="row"
              spacing={0.65}
              sx={{ mt: 0.25, minWidth: 0, alignItems: "center" }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                sx={{ flex: 1 }}
              >
                {contextLabel}
              </Typography>
              {timestamp && (
                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{ flexShrink: 0 }}
                >
                  {timestamp}
                </Typography>
              )}
            </Stack>
          </Box>
        )}
      </Stack>
    </ButtonBase>
  );

  return collapsed ? (
    <Tooltip title={label} placement="right" enterDelay={500}>
      {item}
    </Tooltip>
  ) : (
    item
  );
}
