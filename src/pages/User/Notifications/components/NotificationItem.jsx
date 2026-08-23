import { Box, Typography } from "@mui/material";
import NotificationsOutlined from "@mui/icons-material/NotificationsOutlined";
import PaymentOutlined from "@mui/icons-material/PaymentOutlined";
import SubscriptionOutlined from "@mui/icons-material/SubscriptionsOutlined";
import AccountCircleOutlined from "@mui/icons-material/AccountCircleOutlined";
import CheckCircleOutlineOutlined from "@mui/icons-material/CheckCircleOutlineOutlined";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import CancelOutlined from "@mui/icons-material/CancelOutlined";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../features/auth/AuthProvider.jsx";

const NOTIFICATION_ICONS = {
  PAYMENT_SUCCESS: PaymentOutlined,
  PAYMENT_REFUNDED: PaymentOutlined,
  SUBSCRIPTION_EXPIRED: SubscriptionOutlined,
  SUBSCRIPTION_EXPIRING_SOON: SubscriptionOutlined,
  ACCOUNT_STATUS_CHANGED: AccountCircleOutlined,
  ACCOUNT_ROLE_CHANGED: AccountCircleOutlined,
  REPORT_RESOLVED: CheckCircleOutlineOutlined,
  DOCUMENT_FLAGGED: WarningAmberOutlined,
  DOCUMENT_FLAGGED_OWNER: WarningAmberOutlined,
  DOCUMENT_APPROVED: CheckCircleOutlineOutlined,
  DOCUMENT_REJECTED: CancelOutlined,
};

const NOTIFICATION_COLORS = {
  PAYMENT_SUCCESS: "#22c55e",
  PAYMENT_REFUNDED: "#f59e0b",
  SUBSCRIPTION_EXPIRED: "#ef4444",
  SUBSCRIPTION_EXPIRING_SOON: "#f59e0b",
  ACCOUNT_STATUS_CHANGED: "#8b5cf6",
  ACCOUNT_ROLE_CHANGED: "#8b5cf6",
  REPORT_RESOLVED: "#22c55e",
  DOCUMENT_FLAGGED: "#f59e0b",
  DOCUMENT_FLAGGED_OWNER: "#f59e0b",
  DOCUMENT_APPROVED: "#22c55e",
  DOCUMENT_REJECTED: "#ef4444",
};

function getNotificationRoute(notification, userRole) {
  const { type, referenceId } = notification;
  switch (type) {
    case "PAYMENT_SUCCESS":
    case "PAYMENT_REFUNDED":
      return "/subscription";
    case "SUBSCRIPTION_EXPIRED":
    case "SUBSCRIPTION_EXPIRING_SOON":
      return "/goi-dich-vu";
    case "ACCOUNT_ROLE_CHANGED":
      return "/profile";
    case "ACCOUNT_STATUS_CHANGED":
      return null;
    case "REPORT_RESOLVED":
      return null;
    case "DOCUMENT_FLAGGED":
      return userRole === "MODERATOR"
        ? "/moderator/reports"
        : "/admin/documents";
    case "DOCUMENT_FLAGGED_OWNER":
    case "DOCUMENT_APPROVED":
    case "DOCUMENT_REJECTED":
      return referenceId ? `/documents/${referenceId}` : null;
    default:
      return null;
  }
}

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

export default function NotificationItem({ notification, onMarkAsRead, fullWidth }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = user?.role || "USER";
  const Icon = NOTIFICATION_ICONS[notification.type] || NotificationsOutlined;
  const color = NOTIFICATION_COLORS[notification.type] || "#6366f1";

  const handleClick = async () => {
    const route = getNotificationRoute(notification, userRole);
    if (route) {
      await onMarkAsRead(notification.id);
      navigate(route);
    }
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: "flex",
        gap: fullWidth ? 2 : 1.5,
        p: fullWidth ? 2.5 : 2,
        cursor: "pointer",
        backgroundColor: notification.isRead ? "transparent" : "action.hover",
        "&:hover": {
          backgroundColor: "action.selected",
        },
        transition: "background-color 0.15s ease",
      }}
    >
      <Box
        sx={{
          width: fullWidth ? 48 : 40,
          height: fullWidth ? 48 : 40,
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: `${color}15`,
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: fullWidth ? 24 : 20, color }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: fullWidth ? "0.95rem" : "0.85rem",
            fontWeight: notification.isRead ? 500 : 600,
            color: "text.primary",
            mb: 0.25,
          }}
        >
          {notification.title}
        </Typography>
        <Typography
          sx={{
            fontSize: fullWidth ? "0.85rem" : "0.78rem",
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
