import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Drawer,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import AssessmentOutlined from "@mui/icons-material/AssessmentOutlined";
import BookmarkOutlined from "@mui/icons-material/BookmarkOutlined";
import DashboardOutlined from "@mui/icons-material/DashboardOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import FolderOpenOutlined from "@mui/icons-material/FolderOpenOutlined";
import HistoryOutlined from "@mui/icons-material/HistoryOutlined";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";
import LocalOfferOutlined from "@mui/icons-material/LocalOfferOutlined";
import MenuRounded from "@mui/icons-material/MenuRounded";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import ShoppingCartOutlined from "@mui/icons-material/ShoppingCartOutlined";
import UploadFileOutlined from "@mui/icons-material/UploadFileOutlined";
import ReportProblemOutlined from "@mui/icons-material/ReportProblemOutlined";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import { useColorMode } from "../../App.jsx";
import ColorModeToggle from "../ColorModeToggle/ColorModeToggle.jsx";
import Logo from "../Logo/Logo.jsx";
import { useAuth } from "../../features/auth/AuthProvider.jsx";
import NotificationBell from "../../pages/User/Notifications/components/NotificationBell.jsx";

const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 88;

const USER_NAVIGATION = [
  { label: "Thư viện", path: "/documents", icon: FolderOpenOutlined },
  {
    label: "Tải tài liệu",
    path: "/documents/upload",
    icon: UploadFileOutlined,
  },
  { label: "Đã lưu", path: "/saved-documents", icon: BookmarkOutlined },
  { label: "Đăng ký gói", path: "/subscription", icon: ShoppingCartOutlined },
  { label: "Hỏi AI", path: "/ai-chat", icon: SmartToyOutlined },
  { label: "Cộng đồng", path: "/community", icon: PeopleAltOutlined },
];

const ADMIN_NAVIGATION = [
  { label: "Tổng quan", path: "/admin/dashboard", icon: DashboardOutlined },
  { label: "Người dùng", path: "/admin/users", icon: PeopleAltOutlined },
  { label: "Tài liệu", path: "/admin/documents", icon: DescriptionOutlined },
  {
    label: "Gói dịch vụ",
    path: "/admin/subscription-plans",
    icon: LocalOfferOutlined,
  },
  {
    label: "Đăng ký gói",
    path: "/admin/subscriptions",
    icon: ShoppingCartOutlined,
  },
  {
    label: "Nhật ký kiểm tra",
    path: "/admin/audit-logs",
    icon: HistoryOutlined,
  },
  {
    label: "Nhật ký tải xuống",
    path: "/admin/download-logs",
    icon: DownloadOutlined,
  },
  { label: "Báo cáo", path: "/admin/reports", icon: AssessmentOutlined },
];

const MODERATOR_NAVIGATION = [
  {
    label: "Báo cáo vi phạm",
    path: "/moderator/reports",
    icon: ReportProblemOutlined,
  },
];

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

function isActivePath(currentPath, itemPath) {
  if (["/dashboard", "/admin/dashboard"].includes(itemPath))
    return currentPath === itemPath;
  if (itemPath === "/documents") {
    const isUploadPath =
      currentPath === "/documents/upload" ||
      currentPath.startsWith("/documents/upload/");

    return (
      currentPath === "/documents" ||
      (currentPath.startsWith("/documents/") && !isUploadPath)
    );
  }
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

function NavItem({ item, active, onClick, accent, collapsed = false }) {
  const Icon = item.icon;
  const content = (
    <Box
      component={Link}
      to={item.path}
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: collapsed ? 0 : 1.5,
        px: collapsed ? 1 : 2,
        py: 1.25,
        borderRadius: "12px",
        textDecoration: "none",
        color: active ? accent : "text.primary",
        backgroundColor: active ? `${accent}15` : "transparent",
        fontWeight: active ? 600 : 500,
        transition: "all 0.2s ease",
        cursor: "pointer",
        "&:hover": {
          backgroundColor: active ? `${accent}20` : "action.hover",
          color: accent,
        },
      }}
    >
      <Icon sx={{ fontSize: 20, opacity: active ? 1 : 0.7 }} />
      {!collapsed && (
        <Typography
          sx={{
            fontWeight: active ? 600 : 500,
            fontSize: "0.875rem",
          }}
        >
          {item.label}
        </Typography>
      )}
    </Box>
  );

  return collapsed ? (
    <Tooltip title={item.label} placement="right" arrow>
      {content}
    </Tooltip>
  ) : (
    content
  );
}

function SidebarContent({
  isAdmin,
  isModerator,
  navigation,
  location,
  setMobileOpen,
  user,
  initials,
  handleLogout,
  collapsed = false,
  onToggle,
}) {
  const accent = isAdmin ? "#f97316" : isModerator ? "#d97706" : "#6366f1";
  const homePath = isAdmin
    ? "/admin/dashboard"
    : isModerator
      ? "/moderator/reports"
      : "/documents";
  const workspaceLabel = isAdmin
    ? "Hệ thống quản trị"
    : isModerator
      ? "Không gian kiểm duyệt"
      : "Không gian học tập";
  const navigationLabel = isAdmin
    ? "Quản trị"
    : isModerator
      ? "Kiểm duyệt"
      : "Chính";
  const roleLabel = isAdmin
    ? "Quản trị viên"
    : isModerator
      ? "Kiểm duyệt viên"
      : "Sinh viên";

  return (
    <Box
      sx={{
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.paper",
        borderRight: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* Logo Section */}
      <Box
        component={Link}
        to={homePath}
        onClick={() => setMobileOpen(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: collapsed ? 0 : 1.5,
          px: collapsed ? 1 : 2.5,
          py: 2.5,
          textDecoration: "none",
          color: "inherit",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Logo size={44} color={accent} showText={false} />
        {!collapsed && (
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                lineHeight: 1.1,
                fontSize: "1.1rem",
                letterSpacing: "-0.01em",
              }}
            >
              DocuMind
            </Typography>
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: "0.7rem",
                fontWeight: 500,
              }}
            >
              {workspaceLabel}
            </Typography>
          </Box>
        )}
      </Box>

      {onToggle && (
        <Tooltip title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}>
          <IconButton
            size="small"
            onClick={onToggle}
            aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
            sx={{
              position: "absolute",
              top: 28,
              right: -15,
              zIndex: 2,
              width: 30,
              height: 30,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: 2,
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            {collapsed ? <ChevronRightRounded /> : <ChevronLeftRounded />}
          </IconButton>
        </Tooltip>
      )}

      {/* Navigation */}
      <Box
        sx={{
          flex: 1,
          px: collapsed ? 1 : 1.5,
          py: 2,
          overflowY: "auto",
        }}
      >
        {!collapsed && (
          <Typography
            sx={{
              px: 2,
              py: 1,
              fontSize: "0.65rem",
              fontWeight: 700,
              color: "text.disabled",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {navigationLabel}
          </Typography>
        )}
        {navigation.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            active={isActivePath(location.pathname, item.path)}
            onClick={() => setMobileOpen(false)}
            accent={accent}
            collapsed={collapsed}
          />
        ))}
      </Box>

      {/* Footer Section */}
      <Box
        sx={{
          px: collapsed ? 1 : 1.5,
          py: 2,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* User Card */}
        <Box
          sx={{
            p: collapsed ? 1 : 2,
            borderRadius: "16px",
            backgroundColor: "action.hover",
            mb: 1.5,
          }}
        >
          <Box
            component={Link}
            to="/profile"
            onClick={() => setMobileOpen(false)}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: collapsed ? 0 : 1.5,
              textDecoration: "none",
              color: "inherit",
              mb: 1.5,
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
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.fullName || "Người dùng"}
                </Typography>
                <Typography
                  sx={{ fontSize: "0.72rem", color: "text.secondary" }}
                >
                  {roleLabel}
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            onClick={handleLogout}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              py: 1,
              borderRadius: "10px",
              cursor: "pointer",
              color: "text.secondary",
              background: "transparent",
              transition: "all 0.2s",
              "&:hover": {
                background: "rgba(239,68,68,0.08)",
                color: "error.main",
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

        {/* Version */}
        {!collapsed && (
          <Typography
            sx={{
              textAlign: "center",
              fontSize: "0.65rem",
              color: "text.disabled",
            }}
          >
            DocuMind v1.0.0
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default function AppShell({ children, role = "USER" }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("app_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });
  const { user, logout } = useAuth();
  const { mode } = useColorMode();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = role === "ADMIN";
  const isModerator = role === "MODERATOR";
  const navigation = isAdmin
    ? ADMIN_NAVIGATION
    : isModerator
      ? MODERATOR_NAVIGATION
      : USER_NAVIGATION;
  const initials = useMemo(
    () => getInitials(user?.fullName, isAdmin ? "AD" : isModerator ? "MD" : "U"),
    [isAdmin, isModerator, user?.fullName],
  );

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  function toggleSidebar() {
    setSidebarCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem("app_sidebar_collapsed", String(next));
      } catch {
        // Ignore storage errors and keep the in-memory state.
      }
      return next;
    });
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Desktop Sidebar */}
      <Box
        component="aside"
        sx={{
          display: { xs: "none", md: "block" },
          width: sidebarCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH,
          flexShrink: 0,
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 1200,
          transition: "width 0.22s ease",
        }}
      >
        <SidebarContent
          isAdmin={isAdmin}
          isModerator={isModerator}
          navigation={navigation}
          location={location}
          setMobileOpen={setMobileOpen}
          user={user}
          initials={initials}
          handleLogout={handleLogout}
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
        />
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
          },
        }}
      >
        <SidebarContent
          isAdmin={isAdmin}
          isModerator={isModerator}
          navigation={navigation}
          location={location}
          setMobileOpen={setMobileOpen}
          user={user}
          initials={initials}
          handleLogout={handleLogout}
        />
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flex: 1,
          ml: {
            md: `${sidebarCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH}px`,
          },
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          backgroundColor: "background.default",
          transition: "margin-left 0.22s ease",
        }}
      >
        {/* Top Header */}
        <Box
          component="header"
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1100,
            px: { xs: 2, sm: 3, lg: 4 },
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor:
              mode === "dark" ? "rgba(11,15,26,.88)" : "rgba(255,255,255,.88)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          {/* Left: Menu button + Page title */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ display: { md: "none" } }}
            >
              <MenuRounded />
            </IconButton>
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "1rem",
                }}
              >
                {navigation.find((item) =>
                  isActivePath(location.pathname, item.path),
                )?.label || "DocuMind"}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  color: "text.secondary",
                }}
              >
                {new Date().toLocaleDateString("vi-VN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Typography>
            </Box>
          </Box>

          {/* Right: Actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, position: "relative" }}>
            <ColorModeToggle />

            {/* Notification Bell */}
            <NotificationBell />
          </Box>
        </Box>

        {/* Page Content */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3, lg: 4 },
            maxWidth: 1600,
            mx: "auto",
            width: "100%",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
