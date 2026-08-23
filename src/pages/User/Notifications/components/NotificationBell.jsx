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
  Tab,
  Tabs,
} from "@mui/material";
import NotificationsOutlined from "@mui/icons-material/NotificationsOutlined";
import DoneAllOutlined from "@mui/icons-material/DoneAllOutlined";
import NotificationItem from "./NotificationItem.jsx";
import { useNotifications } from "../hooks/useNotifications";

export default function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [filter, setFilter] = useState("all");
  const menuRef = useRef(null);
  const {
    notifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    refresh,
  } = useNotifications({ isRead: filter === "read" ? true : filter === "unread" ? false : undefined });
  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFilterChange = (_event, newValue) => {
    setFilter(newValue);
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
            width: 400,
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
              pb: 1,
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

          {/* Filter Tabs */}
          <Tabs
            value={filter}
            onChange={handleFilterChange}
            sx={{
              minHeight: 40,
              px: 2,
              "& .MuiTabs-indicator": { height: 2 },
              "& .MuiTab-root": {
                minHeight: 40,
                fontSize: "0.8rem",
                textTransform: "none",
                px: 1.5,
              },
            }}
          >
            <Tab label="Tất cả" value="all" />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  Chưa đọc
                  {unreadCount > 0 && (
                    <Box
                      sx={{
                        bgcolor: "error.main",
                        color: "white",
                        borderRadius: "10px",
                        px: 0.75,
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        lineHeight: 1.4,
                      }}
                    >
                      {unreadCount}
                    </Box>
                  )}
                </Box>
              }
              value="unread"
            />
            <Tab label="Đã đọc" value="read" />
          </Tabs>

          <Divider />

          {/* Content */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              maxHeight: 400,
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
            ) : error ? (
              <Box sx={{ py: 5, px: 3, textAlign: "center" }}>
                <Typography color="error" sx={{ fontSize: "0.85rem", mb: 1.5 }}>
                  Không thể tải thông báo.
                </Typography>
                <Button size="small" onClick={refresh}>
                  Thử lại
                </Button>
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
                  Không có thông báo nào
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
