import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
} from "@mui/material";
import {
  Brightness4,
  Brightness7,
  Logout,
  Person,
  Home,
  Dashboard,
  FactCheck,
} from "@mui/icons-material";
import { useAuth } from "../../../features/auth/AuthProvider";
import { useColorMode } from "../../../App.jsx";

export default function TeacherLayout({ children }) {
  const { user, logout } = useAuth();
  const { mode, toggle } = useColorMode();

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "T";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top bar */}
      <Box
        component="header"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 1.5,
          borderBottom: "1px solid var(--border-color)",
          background: "var(--bg-header)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            component={Link}
            to="/"
            sx={{ textDecoration: "none", color: "inherit" }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}
            >
              DocuMind
            </Typography>
          </Box>
          <Box
            sx={{
              px: 1.2,
              py: 0.3,
              borderRadius: "99px",
              background: "rgba(251,191,36,0.15)",
              color: "#fbbf24",
              fontSize: "0.7rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Teacher
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Trang chủ">
            <IconButton component={Link} to="/" sx={{ color: "var(--text-secondary)" }}>
              <Home />
            </IconButton>
          </Tooltip>
          <Tooltip title="Dashboard">
            <IconButton component={Link} to="/teacher/dashboard" sx={{ color: "#fbbf24" }}>
              <Dashboard />
            </IconButton>
          </Tooltip>
          <Tooltip title="Kiểm duyệt tài liệu">
            <IconButton component={Link} to="/teacher/moderation" sx={{ color: "var(--text-secondary)" }}>
              <FactCheck />
            </IconButton>
          </Tooltip>
          <Tooltip title="Hồ sơ">
            <IconButton component={Link} to="/profile" sx={{ color: "var(--text-secondary)" }}>
              <Person />
            </IconButton>
          </Tooltip>
          <Tooltip title={mode === "dark" ? "Chuyển nền sáng" : "Chuyển nền tối"}>
            <IconButton onClick={toggle} sx={{ color: "var(--text-secondary)" }}>
              {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Đăng xuất">
            <IconButton onClick={logout} sx={{ color: "var(--text-secondary)" }}>
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
              background: "#fbbf24",
              color: "#fff",
            }}
          >
            {initials}
          </Avatar>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
        {children}
      </Box>
    </Box>
  );
}
