export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  dashboard: "/dashboard",
  profile: "/profile",
  documents: "/documents",
  uploadDocument: "/documents/upload",
  aiChat: "/ai-chat",
  community: "/community",
  adminDashboard: "/admin/dashboard",
  adminUsers: "/admin/users",
  adminDocuments: "/admin/documents",
};

export function getAuthenticatedHomeRoute(role) {
  return role === "ADMIN" ? ROUTES.adminDashboard : ROUTES.dashboard;
}
