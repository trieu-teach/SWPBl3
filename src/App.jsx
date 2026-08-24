import {
  createContext,
  lazy,
  Suspense,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import {
  Box,
  CircularProgress,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import { AuthProvider } from "./features/auth/AuthProvider.jsx";
import { ToastProvider } from "./components/Toast/ToastProvider.jsx";
import {
  GuestGuard,
  GuestRoute,
  RequireAuth,
} from "./features/auth/ProtectedRoute.jsx";

const Login = lazy(() => import("./pages/Auth/Login.jsx"));
const Register = lazy(() => import("./pages/Auth/Register.jsx"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("./pages/Auth/ResetPassword.jsx"));
const Profile = lazy(() => import("./pages/Profile/Profile.jsx"));
const UploadDocument = lazy(
  () => import("./pages/User/UploadDocument/UploadDocument.jsx"),
);
const DocumentLibrary = lazy(
  () => import("./pages/User/DocumentLibrary/DocumentLibrary.jsx"),
);
const DocumentDetails = lazy(
  () => import("./pages/User/DocumentDetails/DocumentDetails.jsx"),
);
const DocumentAIWorkspace = lazy(
  () => import("./pages/User/DocumentAIWorkspace/DocumentAIWorkspace.jsx"),
);
const CommunityLibrary = lazy(
  () => import("./pages/User/CommunityLibrary/CommunityLibrary.jsx"),
);
const SavedDocuments = lazy(
  () => import("./pages/User/SavedDocuments/SavedDocuments.jsx"),
);
const DocumentAppeals = lazy(
  () => import("./pages/User/DocumentAppeals/DocumentAppeals.jsx"),
);
const Subscription = lazy(
  () => import("./pages/User/Subscription/Subscription.jsx"),
);
const PaymentCallback = lazy(
  () => import("./pages/User/Subscription/PaymentCallback.jsx"),
);
const ChatPage = lazy(() => import("./pages/User/AIChat/ChatPage.jsx"));
const AdminDashboard = lazy(
  () => import("./pages/Admin/Dashboard/AdminDashboard.jsx"),
);
const AdminUsers = lazy(() => import("./pages/Admin/Users/AdminUsers.jsx"));
const AdminDocuments = lazy(
  () => import("./pages/Admin/Documents/AdminDocuments.jsx"),
);
const SubscriptionPlans = lazy(
  () => import("./pages/Admin/SubscriptionPlans/SubscriptionPlans.jsx"),
);
const Subscriptions = lazy(
  () => import("./pages/Admin/Subscriptions/Subscriptions.jsx"),
);
const AuditLogs = lazy(
  () => import("./pages/Admin/AuditLogs/AuditLogs.jsx"),
);
const DownloadLogs = lazy(
  () => import("./pages/Admin/DownloadLogs/DownloadLogs.jsx"),
);
const Reports = lazy(() => import("./pages/Admin/Reports/Reports.jsx"));
const ModeratorReports = lazy(
  () => import("./pages/Moderator/Reports/ModeratorReports.jsx"),
);
const ModeratorDocuments = lazy(
  () => import("./pages/Moderator/Documents/ModeratorDocuments.jsx"),
);
const ModeratorAppeals = lazy(
  () => import("./pages/Moderator/Appeals/ModeratorAppeals.jsx"),
);
const Homepage = lazy(() => import("./pages/Home/Homepage.jsx"));

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

function RouteLoadingFallback() {
  return (
    <Box
      role="status"
      aria-label="Đang tải trang"
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        bgcolor: "background.default",
      }}
    >
      <CircularProgress size={36} />
    </Box>
  );
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

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <ToastProvider>
          <BrowserRouter>
            <AuthProvider>
              <Suspense fallback={<RouteLoadingFallback />}>
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
                      path="/hoi-ai"
                      element={
                        <RequireAuth>
                          <ChatPage />
                        </RequireAuth>
                      }
                    />
                    <Route path="/ai-chat" element={<Navigate to="/hoi-ai" replace />} />
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
                    <Route path="/bang-gia" element={<Navigate to="/subscription" replace />} />
                    <Route
                      path="/goi-dich-vu"
                      element={
                        <RequireAuth>
                          <PaymentCallback />
                        </RequireAuth>
                      }
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
                          <Navigate to="/moderator/reports" replace />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/moderator/moderation"
                      element={
                        <RequireAuth allowedRoles={["MODERATOR"]}>
                          <ModeratorDocuments />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/appeals"
                      element={
                        <RequireAuth allowedRoles={["USER"]}>
                          <DocumentAppeals />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/moderator/appeals"
                      element={
                        <RequireAuth allowedRoles={["MODERATOR"]}>
                          <ModeratorAppeals />
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
              </Suspense>
            </AuthProvider>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
