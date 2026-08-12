import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConfigProvider, App as AntApp, theme as antdThemeAlgo } from "antd";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { AuthProvider } from "./features/auth/AuthProvider.jsx";
import { GuestGuard, RequireAuth } from "./features/auth/ProtectedRoute.jsx";

// Guest routes (login / register / forgot-password)
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import ForgotPassword from "./pages/Auth/ForgotPassword.jsx";
import ResetPassword from "./pages/Auth/ResetPassword.jsx";

// Authenticated routes
import Dashboard from "./pages/User/Dashboard/Dashboard.jsx";
import Profile from "./pages/Profile/Profile.jsx";

// Admin routes
import AdminDashboard from "./pages/Admin/Dashboard/AdminDashboard.jsx";
import ComingSoon from "./pages/Shared/ComingSoon.jsx";

// Public
import Homepage from "./pages/Home/Homepage.jsx";

// ---------------------------------------------------------------------------
// Color mode context (light / dark)
// ---------------------------------------------------------------------------
const ColorModeContext = createContext({ mode: "dark", toggle: () => {} });

export function useColorMode() {
  return useContext(ColorModeContext);
}

const STORAGE_KEY = "documind-color-mode";

function getInitialMode() {
  if (typeof window === "undefined") return "dark";
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* ignore */
  }
  return "dark";
}

// ---------------------------------------------------------------------------
// Theme builders (MUI v9 — không dùng shouldForwardProp trong components nữa)
// ---------------------------------------------------------------------------
function buildMuiTheme(mode) {
  const isDark = mode === "dark";
  return createTheme({
    cssVariables: false,
    palette: {
      mode,
      primary: { main: isDark ? "#6366f1" : "#1f2a44" },
      secondary: { main: "#d97706" },
      background: {
        default: isDark ? "#0b0f1a" : "#f7f6f2",
        paper: isDark ? "#111827" : "#ffffff",
      },
      text: {
        primary: isDark ? "#f1f5f9" : "#0f172a",
        secondary: isDark ? "#94a3b8" : "#475569",
      },
    },
    typography: {
      fontFamily:
        '"Plus Jakarta Sans", "Inter", system-ui, -apple-system, sans-serif',
      button: { textTransform: "none", fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: { styleOverrides: { root: { textTransform: "none" } } },
    },
  });
}

function buildAntdTheme(mode) {
  return {
    algorithm:
      mode === "dark"
        ? antdThemeAlgo.darkAlgorithm
        : antdThemeAlgo.defaultAlgorithm,
    token: {
      colorPrimary: mode === "dark" ? "#6366f1" : "#1f2a44",
      fontFamily:
        '"Plus Jakarta Sans", "Inter", system-ui, -apple-system, sans-serif',
      borderRadius: 10,
    },
  };
}

export default function App() {
  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    document.body.dataset.theme = mode;
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      mode,
      toggle: () => setMode((prev) => (prev === "dark" ? "light" : "dark")),
    }),
    [mode],
  );

  const muiTheme = useMemo(() => buildMuiTheme(mode), [mode]);
  const antdThemeConfig = useMemo(() => buildAntdTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <ConfigProvider theme={antdThemeConfig}>
          <AntApp>
            <BrowserRouter>
              <AuthProvider>
                <Routes>
                  {/* ── Public ── */}
                  <Route path="/" element={<Homepage />} />

                  {/* ── Guest-only (đã đăng nhập → redirect) ── */}
                  <Route
                    path="/login"
                    element={
                      <GuestGuard>
                        <Login />
                      </GuestGuard>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <GuestGuard>
                        <Register />
                      </GuestGuard>
                    }
                  />
                  <Route
                    path="/forgot-password"
                    element={
                      <GuestGuard>
                        <ForgotPassword />
                      </GuestGuard>
                    }
                  />
                  <Route
                    path="/reset-password"
                    element={
                      <GuestGuard>
                        <ResetPassword />
                      </GuestGuard>
                    }
                  />

                  {/* ── Authenticated (User) ── */}
                  <Route
                    path="/dashboard"
                    element={
                      <RequireAuth>
                        <Dashboard />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <RequireAuth>
                        <Profile />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/documents"
                    element={
                      <RequireAuth>
                        <ComingSoon title="Thư viện tài liệu" />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/documents/upload"
                    element={
                      <RequireAuth>
                        <ComingSoon title="Tải tài liệu" />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/ai-chat"
                    element={
                      <RequireAuth>
                        <ComingSoon title="Hỏi đáp với AI" />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/community"
                    element={
                      <RequireAuth>
                        <ComingSoon title="Thư viện cộng đồng" />
                      </RequireAuth>
                    }
                  />

                  {/* ── Admin ── */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <RequireAuth allowedRoles={["ADMIN"]}>
                        <AdminDashboard />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <RequireAuth allowedRoles={["ADMIN"]}>
                        <ComingSoon title="Quản lý người dùng" />
                      </RequireAuth>
                    }
                  />
                  <Route
                    path="/admin/documents"
                    element={
                      <RequireAuth allowedRoles={["ADMIN"]}>
                        <ComingSoon title="Quản lý tài liệu" />
                      </RequireAuth>
                    }
                  />

                  {/* ── Catch-all ── */}
                  <Route path="*" element={<Homepage />} />
                </Routes>
              </AuthProvider>
            </BrowserRouter>
          </AntApp>
        </ConfigProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
