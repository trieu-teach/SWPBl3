import { Link, useLocation } from "react-router-dom";
import { Box, Typography, IconButton, Tooltip, Avatar } from "@mui/material";
import {
  Brightness4,
  Brightness7,
  Logout,
  Person,
  Home,
} from "@mui/icons-material";
import { useAuth } from "../../../features/auth/AuthProvider";
import { useColorMode } from "../../../App.jsx";

export default function UserLayout({ children }) {
  const { user, logout } = useAuth();
  const { mode, toggle } = useColorMode();
  const location = useLocation();

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
        transition: "background 0.2s, color 0.2s",
      }}
    >
      {/* Header */}
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "var(--border-color)",
          backdropFilter: "blur(12px)",
          background: "var(--bg-header)",
        }}
      >
        {/* Logo / Brand */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            component={Link}
            to="/"
            sx={{ textDecoration: "none", color: "inherit" }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-primary)" }}
            >
              DocuMind
            </Typography>
          </Box>
        </Box>

        {/* Nav */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Trang chủ">
            <IconButton
              component={Link}
              to="/"
              sx={{ color: "var(--text-secondary)" }}
            >
              <Home />
            </IconButton>
          </Tooltip>

          <Tooltip title={mode === "dark" ? "Chuyển nền sáng" : "Chuyển nền tối"}>
            <IconButton
              onClick={toggle}
              sx={{ color: "var(--text-secondary)" }}
            >
              {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Hồ sơ cá nhân">
            <IconButton
              component={Link}
              to="/profile"
              sx={{ color: location.pathname === "/profile" ? "var(--accent)" : "var(--text-secondary)" }}
            >
              <Person />
            </IconButton>
          </Tooltip>

          <Tooltip title="Đăng xuất">
            <IconButton
              onClick={logout}
              sx={{ color: "var(--text-secondary)" }}
            >
              <Logout />
            </IconButton>
          </Tooltip>

          <Avatar
            sx={{
              width: 36,
              height: 36,
              fontSize: "0.85rem",
              fontWeight: 700,
              ml: 0.5,
              background: "var(--accent)",
              color: "#fff",
            }}
          >
            {initials}
          </Avatar>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: "auto" }}>
        {children}
      </Box>
    </Box>
  );
}
