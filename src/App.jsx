import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { ConfigProvider, App as AntApp, theme as antdThemeAlgo } from "antd";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { AuthProvider } from "./features/auth/AuthProvider.jsx";
import { ToastProvider } from "./components/Toast/ToastProvider.jsx";
import {
  GuestGuard,
  GuestRoute,
  RequireAuth,
} from "./features/auth/ProtectedRoute.jsx";

// Guest routes (login / register / forgot-password)
import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import ForgotPassword from "./pages/Auth/ForgotPassword.jsx";
import ResetPassword from "./pages/Auth/ResetPassword.jsx";

// Authenticated routes
import Profile from "./pages/Profile/Profile.jsx";
import UploadDocument from "./pages/User/UploadDocument/UploadDocument.jsx";
import DocumentLibrary from "./pages/User/DocumentLibrary/DocumentLibrary.jsx";
import DocumentDetails from "./pages/User/DocumentDetails/DocumentDetails.jsx";
import DocumentAIWorkspace from "./pages/User/DocumentAIWorkspace/DocumentAIWorkspace.jsx";
import CommunityLibrary from "./pages/User/CommunityLibrary/CommunityLibrary.jsx";
import SavedDocuments from "./pages/User/SavedDocuments/SavedDocuments.jsx";
import Subscription from "./pages/User/Subscription/Subscription.jsx";
import PaymentCallback from "./pages/User/Subscription/PaymentCallback.jsx";
import ChatPage from "./pages/User/AIChat/ChatPage.jsx";

// Admin routes
import AdminDashboard from "./pages/Admin/Dashboard/AdminDashboard.jsx";
import AdminUsers from "./pages/Admin/Users/AdminUsers.jsx";
import AdminDocuments from "./pages/Admin/Documents/AdminDocuments.jsx";
import SubscriptionPlans from "./pages/Admin/SubscriptionPlans/SubscriptionPlans.jsx";
import Subscriptions from "./pages/Admin/Subscriptions/Subscriptions.jsx";
import AuditLogs from "./pages/Admin/AuditLogs/AuditLogs.jsx";
import DownloadLogs from "./pages/Admin/DownloadLogs/DownloadLogs.jsx";
import Reports from "./pages/Admin/Reports/Reports.jsx";
// Moderator routes
import ModeratorReports from "./pages/Moderator/Reports/ModeratorReports.jsx";

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
            <ToastProvider>
              <BrowserRouter>
                <AuthProvider>
                  <Routes>
                    {/* ── Public (chỉ Guest mới vào được) ── */}
                    <Route
                      path="/"
                      element={
                        <GuestRoute>
                          <Homepage />
                        </GuestRoute>
                      }
                    />

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
                          <DocumentLibrary />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/documents/upload"
                      element={
                        <RequireAuth>
                          <UploadDocument />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/documents/:id"
                      element={
                        <RequireAuth>
                          <DocumentDetails />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/documents/:documentId/ai"
                      element={
                        <RequireAuth>
                          <DocumentAIWorkspace />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/ai-chat"
                      element={
                        <RequireAuth>
                          <ChatPage />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/community"
                      element={
                        <RequireAuth>
                          <CommunityLibrary />
                        </RequireAuth>
                      }
                    />

                    {/* ── Admin ── */}
                    <Route
                      path="/saved-documents"
                      element={
                        <RequireAuth>
                          <SavedDocuments />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/subscription"
                      element={
                        <RequireAuth>
                          <Subscription />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/goi-dich-vu"
                      element={<PaymentCallback />}
                    />
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
                          <AdminUsers />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/admin/documents"
                      element={
                        <RequireAuth allowedRoles={["ADMIN"]}>
                          <AdminDocuments />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/admin/subscription-plans"
                      element={
                        <RequireAuth allowedRoles={["ADMIN"]}>
                          <SubscriptionPlans />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/admin/subscriptions"
                      element={
                        <RequireAuth allowedRoles={["ADMIN"]}>
                          <Subscriptions />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/admin/audit-logs"
                      element={
                        <RequireAuth allowedRoles={["ADMIN"]}>
                          <AuditLogs />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/admin/download-logs"
                      element={
                        <RequireAuth allowedRoles={["ADMIN"]}>
                          <DownloadLogs />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/admin/reports"
                      element={
                        <RequireAuth allowedRoles={["ADMIN"]}>
                          <Reports />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/admin/moderation-reports"
                      element={
                        <RequireAuth allowedRoles={["ADMIN"]}>
                          <ModeratorReports role="ADMIN" />
                        </RequireAuth>
                      }
                    />

                    {/* ── Moderator ── */}
                    <Route
                      path="/moderator/reports"
                      element={
                        <RequireAuth allowedRoles={["ADMIN", "MODERATOR"]}>
                          <ModeratorReports />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/moderator/dashboard"
                      element={
                        <RequireAuth allowedRoles={["ADMIN", "MODERATOR"]}>
                          <Navigate to="/moderator/moderation" replace />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/moderator/moderation"
                      element={
                        <RequireAuth allowedRoles={["ADMIN", "MODERATOR"]}>
                          <AdminDocuments role="MODERATOR" />
                        </RequireAuth>
                      }
                    />

                    {/* ── Catch-all (Guest → homepage, User → dashboard) ── */}
                    <Route
                      path="*"
                      element={
                        <GuestRoute>
                          <Homepage />
                        </GuestRoute>
                      }
                    />
                  </Routes>
                </AuthProvider>
              </BrowserRouter>
            </ToastProvider>
          </AntApp>
        </ConfigProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
