import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AdminPanelSettingsOutlined,
  Brightness4Outlined,
  Brightness7Outlined,
  DashboardOutlined,
  DescriptionOutlined,
  FolderOpenOutlined,
  LogoutOutlined,
  MenuRounded,
  PeopleAltOutlined,
  PersonOutlined,
  SmartToyOutlined,
  UploadFileOutlined,
} from "@mui/icons-material";
import { useColorMode } from "../../App.jsx";
import { useAuth } from "../../features/auth/AuthProvider.jsx";

const DRAWER_WIDTH = 264;
const USER_NAVIGATION = [
  { label: "Tổng quan", path: "/dashboard", icon: DashboardOutlined },
  { label: "Thư viện", path: "/documents", icon: FolderOpenOutlined },
  {
    label: "Tải tài liệu",
    path: "/documents/upload",
    icon: UploadFileOutlined,
  },
  { label: "Hỏi AI", path: "/ai-chat", icon: SmartToyOutlined },
  { label: "Cộng đồng", path: "/community", icon: PeopleAltOutlined },
];
const ADMIN_NAVIGATION = [
  { label: "Tổng quan", path: "/admin/dashboard", icon: DashboardOutlined },
  { label: "Người dùng", path: "/admin/users", icon: PeopleAltOutlined },
  { label: "Tài liệu", path: "/admin/documents", icon: DescriptionOutlined },
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

export default function AppShell({ children, role = "USER" }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { mode, toggle } = useColorMode();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = role === "ADMIN";
  const navigation = isAdmin ? ADMIN_NAVIGATION : USER_NAVIGATION;
  const accent = isAdmin ? "#dc6b45" : "#536dfe";
  const initials = useMemo(
    () => getInitials(user?.fullName, isAdmin ? "AD" : "U"),
    [isAdmin, user?.fullName],
  );

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        component={Link}
        to={isAdmin ? "/admin/dashboard" : "/dashboard"}
        onClick={() => setMobileOpen(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2.5,
          height: 72,
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            display: "grid",
            placeItems: "center",
            borderRadius: "12px",
            color: "white",
            background: `linear-gradient(145deg, ${accent}, #7c3aed)`,
          }}
        >
          {isAdmin ? <AdminPanelSettingsOutlined /> : <DescriptionOutlined />}
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, lineHeight: 1.1 }}>
            DocuMind
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {isAdmin ? "Không gian quản trị" : "Không gian học tập"}
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List
        component="nav"
        aria-label="Điều hướng chính"
        sx={{ px: 1.5, py: 2 }}
      >
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(location.pathname, item.path);
          return (
            <ListItemButton
              key={item.path}
              component={Link}
              to={item.path}
              selected={active}
              onClick={() => setMobileOpen(false)}
              sx={{
                mb: 0.5,
                borderRadius: "12px",
                color: active ? accent : "text.secondary",
                "&.Mui-selected": {
                  backgroundColor: `${accent}16`,
                  color: accent,
                },
                "&.Mui-selected:hover": { backgroundColor: `${accent}22` },
              }}
            >
              <ListItemIcon sx={{ minWidth: 42, color: "inherit" }}>
                <Icon />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{ primary: { fontWeight: active ? 700 : 600 } }}
              />
            </ListItemButton>
          );
        })}
      </List>
      <Box sx={{ mt: "auto", p: 1.5 }}>
        <Divider sx={{ mb: 1.5 }} />
        <ListItemButton
          component={Link}
          to="/profile"
          onClick={() => setMobileOpen(false)}
          selected={location.pathname === "/profile"}
          sx={{ borderRadius: "12px" }}
        >
          <ListItemIcon sx={{ minWidth: 42 }}>
            <PersonOutlined />
          </ListItemIcon>
          <ListItemText
            primary="Hồ sơ cá nhân"
            slotProps={{ primary: { fontWeight: 600 } }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: DRAWER_WIDTH,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            borderRight: "1px solid",
            borderColor: "divider",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
        }}
      >
        {drawerContent}
      </Drawer>
      <Box sx={{ ml: { md: `${DRAWER_WIDTH}px` } }}>
        <Box
          component="header"
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            height: 72,
            px: { xs: 2, sm: 3 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor:
              mode === "dark" ? "rgba(11,15,26,.88)" : "rgba(255,255,255,.88)",
            backdropFilter: "blur(16px)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ display: { md: "none" } }}
              aria-label="Mở menu"
            >
              <MenuRounded />
            </IconButton>
            <Typography
              sx={{ display: { xs: "none", sm: "block" }, fontWeight: 700 }}
            >
              {navigation.find((item) =>
                isActivePath(location.pathname, item.path),
              )?.label || "DocuMind"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Tooltip
              title={
                mode === "dark" ? "Chuyển sang nền sáng" : "Chuyển sang nền tối"
              }
            >
              <IconButton onClick={toggle} aria-label="Đổi giao diện sáng tối">
                {mode === "dark" ? (
                  <Brightness7Outlined />
                ) : (
                  <Brightness4Outlined />
                )}
              </IconButton>
            </Tooltip>
            <Box
              component={Link}
              to="/profile"
              sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1 }}
            >
              <Avatar
                src={user?.avatarUrl || undefined}
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: accent,
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                {initials}
              </Avatar>
              <Box sx={{ display: { xs: "none", sm: "block" }, maxWidth: 180 }}>
                <Typography noWrap sx={{ fontSize: 14, fontWeight: 700 }}>
                  {user?.fullName || "Người dùng"}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {isAdmin ? "Quản trị viên" : "Sinh viên"}
                </Typography>
              </Box>
            </Box>
            <Tooltip title="Đăng xuất">
              <IconButton
                onClick={handleLogout}
                aria-label="Đăng xuất"
                sx={{ ml: 0.5 }}
              >
                <LogoutOutlined />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Box
          component="main"
          sx={{
            width: "100%",
            maxWidth: 1440,
            mx: "auto",
            p: { xs: 2, sm: 3, lg: 4 },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
