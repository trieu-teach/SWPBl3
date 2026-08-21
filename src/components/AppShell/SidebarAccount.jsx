import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Avatar,
  Box,
  ClickAwayListener,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";
import SubscriptionSummary from "./SubscriptionSummary.jsx";

function getInitials(name, fallback) {
  if (!name?.trim()) return fallback;

  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(-2)
    .toUpperCase();
}

const ROLE_LABELS = {
  ADMIN: "Quản trị viên",
  MODERATOR: "Kiểm duyệt viên",
  USER: "Sinh viên",
};

const ROLE_INITIALS = {
  ADMIN: "AD",
  MODERATOR: "MD",
  USER: "U",
};

export default function SidebarAccount({
  user,
  role,
  accent,
  collapsed,
  subscription,
  onNavigate,
  onLogout,
}) {
  const [expanded, setExpanded] = useState(false);
  const isUser = role === "USER";
  const canShowSubscription = !collapsed && isUser && subscription;
  const initials = getInitials(
    user?.fullName,
    ROLE_INITIALS[role] || ROLE_INITIALS.USER,
  );

  return (
    <ClickAwayListener onClickAway={() => setExpanded(false)}>
      <Box
        sx={{
          position: "relative",
          p: collapsed ? 1 : 2,
          mb: 1.5,
          borderRadius: "16px",
          backgroundColor: "action.hover",
        }}
      >
        <Box
          component={Link}
          to="/profile"
          onClick={onNavigate}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: collapsed ? 0 : 1.5,
            pr: collapsed ? 0 : 3.5,
            mb: 1.5,
            color: "inherit",
            textDecoration: "none",
          }}
        >
          <Avatar
            src={user?.avatarUrl || undefined}
            sx={{
              width: 40,
              height: 40,
              bgcolor: accent,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {initials}
          </Avatar>

          {!collapsed && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  overflow: "hidden",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.fullName || "Người dùng"}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                <Typography
                  sx={{ fontSize: "0.72rem", color: "text.secondary" }}
                >
                  {ROLE_LABELS[role] || ROLE_LABELS.USER}
                </Typography>

                {isUser && subscription && (
                  <Typography
                    sx={{
                      fontSize: "0.72rem",
                      color: "primary.main",
                      fontWeight: 600,
                    }}
                  >
                    · {subscription.planName || subscription.plan}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </Box>

        {canShowSubscription && (
          <Tooltip
            title={expanded ? "Ẩn thông tin gói" : "Xem thông tin gói"}
          >
            <IconButton
              size="small"
              aria-label={
                expanded ? "Ẩn thông tin gói" : "Xem thông tin gói"
              }
              aria-expanded={expanded}
              onClick={() => setExpanded((current) => !current)}
              sx={{
                position: "absolute",
                top: 20,
                right: 12,
                color: "text.secondary",
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            >
              <ExpandMoreRounded />
            </IconButton>
          </Tooltip>
        )}

        {canShowSubscription && expanded && (
          <SubscriptionSummary subscription={subscription} />
        )}

        <Box
          onClick={onLogout}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            py: 1,
            borderRadius: "10px",
            color: "text.secondary",
            cursor: "pointer",
            transition: "all 0.2s",
            "&:hover": {
              color: "error.main",
              backgroundColor: "rgba(239,68,68,0.08)",
            },
          }}
        >
          <LogoutOutlined sx={{ fontSize: 18 }} />
          {!collapsed && (
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 500 }}>
              Đăng xuất
            </Typography>
          )}
        </Box>
      </Box>
    </ClickAwayListener>
  );
}
