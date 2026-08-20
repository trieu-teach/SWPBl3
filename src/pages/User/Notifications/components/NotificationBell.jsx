import { useState, useRef, useEffect } from "react";
import {
  Box,
  IconButton,
  Badge,
  Typography,
  Button,
  Divider,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import NotificationsOutlined from "@mui/icons-material/NotificationsOutlined";
import DoneAllOutlined from "@mui/icons-material/DoneAllOutlined";
import PaymentOutlined from "@mui/icons-material/PaymentOutlined";
import SubscriptionOutlined from "@mui/icons-material/SubscriptionsOutlined";
import AccountCircleOutlined from "@mui/icons-material/AccountCircleOutlined";
import CheckCircleOutlineOutlined from "@mui/icons-material/CheckCircleOutlineOutlined";
import { useNotifications } from "../hooks/useNotifications";

const NOTIFICATION_ICONS = {
  PAYMENT_SUCCESS: PaymentOutlined,
  PAYMENT_REFUNDED: PaymentOutlined,
  SUBSCRIPTION_EXPIRED: SubscriptionOutlined,
  SUBSCRIPTION_EXPIRING_SOON: SubscriptionOutlined,
  ACCOUNT_STATUS_CHANGED: AccountCircleOutlined,
  ACCOUNT_ROLE_CHANGED: AccountCircleOutlined,
  REPORT_RESOLVED: CheckCircleOutlineOutlined,
};

const NOTIFICATION_COLORS = {
  PAYMENT_SUCCESS: "#22c55e",
  PAYMENT_REFUNDED: "#f59e0b",
  SUBSCRIPTION_EXPIRED: "#ef4444",
  SUBSCRIPTION_EXPIRING_SOON: "#f59e0b",
  ACCOUNT_STATUS_CHANGED: "#8b5cf6",
  ACCOUNT_ROLE_CHANGED: "#8b5cf6",
  REPORT_RESOLVED: "#22c55e",
};

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
  });
}

function NotificationItem({ notification, onMarkAsRead }) {
  const Icon = NOTIFICATION_ICONS[notification.type] || NotificationsOutlined;
  const color = NOTIFICATION_COLORS[notification.type] || "#6366f1";

  return (
    <Box
      onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
      sx={{
        display: "flex",
        gap: 1.5,
        p: 2,
        cursor: notification.isRead ? "default" : "pointer",
        backgroundColor: notification.isRead ? "transparent" : "action.hover",
        "&:hover": {
          backgroundColor: notification.isRead
            ? "action.hover"
            : "action.selected",
        },
        transition: "background-color 0.15s ease",
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: `${color}15`,
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 20, color }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: "0.85rem",
            fontWeight: notification.isRead ? 500 : 600,
            color: "text.primary",
            mb: 0.25,
          }}
        >
          {notification.title}
        </Typography>
        <Typography
          sx={{
            fontSize: "0.78rem",
            color: "text.secondary",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {notification.body}
        </Typography>
        <Typography
          sx={{
            fontSize: "0.7rem",
            color: "text.disabled",
            mt: 0.5,
          }}
        >
          {formatTimeAgo(notification.createdAt)}
        </Typography>
      </Box>
      {!notification.isRead && (
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: color,
            flexShrink: 0,
            mt: 0.75,
          }}
        />
      )}
    </Box>
  );
}

export default function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState(null);
  const menuRef = useRef(null);
  const {
    notifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useNotifications();
  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        handleClose();
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <>
      <Tooltip title="Thông báo">
        <IconButton onClick={handleOpen} sx={{ color: "text.primary" }}>
          <Badge
            badgeContent={unreadCount > 99 ? "99+" : unreadCount}
            color="error"
            sx={{
              "& .MuiBadge-badge": {
                fontSize: "0.6rem",
                height: 16,
                minWidth: 16,
              },
            }}
          >
            <NotificationsOutlined sx={{ fontSize: 22 }} />
          </Badge>
        </IconButton>
      </Tooltip>

      {open && (
        <Box
          ref={menuRef}
          sx={{
            position: "absolute",
            top: "100%",
            right: 0,
            mt: 1,
            width: 380,
            maxHeight: 520,
            backgroundColor: "background.paper",
            borderRadius: "16px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            zIndex: 1300,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: "1rem" }}>
              Thông báo
            </Typography>
            {unreadCount > 0 && (
              <Button
                size="small"
                startIcon={<DoneAllOutlined sx={{ fontSize: 16 }} />}
                onClick={markAllNotificationsAsRead}
                sx={{ fontSize: "0.75rem" }}
              >
                Đánh dấu đã đọc
              </Button>
            )}
          </Box>

          {/* Content */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              "&::-webkit-scrollbar": {
                width: 6,
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "divider",
                borderRadius: 3,
              },
            }}
          >
            {isLoading ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 6,
                }}
              >
                <CircularProgress size={24} />
              </Box>
            ) : notifications.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 6,
                  px: 3,
                }}
              >
                <NotificationsOutlined
                  sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }}
                />
                <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                  Chưa có thông báo nào
                </Typography>
              </Box>
            ) : (
              <>
                {notifications.map((notification, index) => (
                  <Box key={notification.id}>
                    {index > 0 && <Divider />}
                    <NotificationItem
                      notification={notification}
                      onMarkAsRead={markNotificationAsRead}
                    />
                  </Box>
                ))}
                {hasMore && (
                  <Box sx={{ p: 2, textAlign: "center" }}>
                    <Button
                      size="small"
                      onClick={loadMore}
                      disabled={isLoadingMore}
                      sx={{ fontSize: "0.8rem" }}
                    >
                      {isLoadingMore ? "Đang tải..." : "Xem thêm"}
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
      )}
    </>
  );
}
