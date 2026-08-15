import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Drawer,
  IconButton,
  Tooltip,
  Typography,
  Badge,
} from "@mui/material";
import AdminPanelSettingsOutlined from "@mui/icons-material/AdminPanelSettingsOutlined";
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
import NotificationsOutlined from "@mui/icons-material/NotificationsOutlined";
import { useColorMode } from "../../App.jsx";
import ColorModeToggle from "../ColorModeToggle/ColorModeToggle.jsx";
import Logo from "../Logo/Logo.jsx";
import { useAuth } from "../../features/auth/AuthProvider.jsx";

const DRAWER_WIDTH = 280;

const USER_NAVIGATION = [
  { label: "Tổng quan", path: "/dashboard", icon: DashboardOutlined },
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
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

function NavItem({ item, active, onClick, accent }) {
  const Icon = item.icon;
  return (
    <Box
      component={Link}
      to={item.path}
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
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
      <Typography
        sx={{
          fontWeight: active ? 600 : 500,
          fontSize: "0.875rem",
        }}
      >
        {item.label}
      </Typography>
    </Box>
  );
}

function SidebarContent({
  isAdmin,
  navigation,
  location,
  setMobileOpen,
  user,
  initials,
  handleLogout,
}) {
  const accent = isAdmin ? "#f97316" : "#6366f1";

  return (
    <Box
      sx={{
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
        to={isAdmin ? "/admin/dashboard" : "/dashboard"}
        onClick={() => setMobileOpen(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2.5,
          py: 2.5,
          textDecoration: "none",
          color: "inherit",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Logo size={44} color={accent} showText={false} />
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
            {isAdmin ? "Hệ thống quản trị" : "Không gian học tập"}
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <Box
        sx={{
          flex: 1,
          px: 1.5,
          py: 2,
          overflowY: "auto",
        }}
      >
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
          {isAdmin ? "Quản trị" : "Chính"}
        </Typography>
        {navigation.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            active={isActivePath(location.pathname, item.path)}
            onClick={() => setMobileOpen(false)}
            accent={accent}
          />
        ))}
      </Box>

      {/* Footer Section */}
      <Box
        sx={{ px: 1.5, py: 2, borderTop: "1px solid", borderColor: "divider" }}
      >
        {/* User Card */}
        <Box
          sx={{
            p: 2,
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
              gap: 1.5,
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
              <Typography sx={{ fontSize: "0.72rem", color: "text.secondary" }}>
                {isAdmin ? "Quản trị viên" : "Sinh viên"}
              </Typography>
            </Box>
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
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 500 }}>
              Đăng xuất
            </Typography>
          </Box>
        </Box>

        {/* Version */}
        <Typography
          sx={{
            textAlign: "center",
            fontSize: "0.65rem",
            color: "text.disabled",
          }}
        >
          DocuMind v1.0.0
        </Typography>
      </Box>
    </Box>
  );
}

export default function AppShell({ children, role = "USER" }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { mode } = useColorMode();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = role === "ADMIN";
  const navigation = isAdmin ? ADMIN_NAVIGATION : USER_NAVIGATION;
  const initials = useMemo(
    () => getInitials(user?.fullName, isAdmin ? "AD" : "U"),
    [isAdmin, user?.fullName],
  );

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const accent = isAdmin ? "#f97316" : "#6366f1";

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Desktop Sidebar */}
      <Box
        component="aside"
        sx={{
          display: { xs: "none", md: "block" },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 1200,
        }}
      >
        <SidebarContent
          isAdmin={isAdmin}
          navigation={navigation}
          location={location}
          setMobileOpen={setMobileOpen}
          user={user}
          initials={initials}
          handleLogout={handleLogout}
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
          ml: { md: `${DRAWER_WIDTH}px` },
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          backgroundColor: "background.default",
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ColorModeToggle />

            {/* Notification */}
            <Tooltip title="Thông báo">
              <IconButton>
                <Badge
                  badgeContent={0}
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
