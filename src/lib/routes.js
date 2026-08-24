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
  aiChat: "/hoi-ai",
  community: "/community",
  savedDocuments: "/saved-documents",
  appeals: "/appeals",
  adminDashboard: "/admin/dashboard",
  adminUsers: "/admin/users",
  adminDocuments: "/admin/documents",
  moderatorDashboard: "/moderator/dashboard",
};

export function getAuthenticatedHomeRoute(role) {
  switch (role) {
    case "ADMIN":
      return ROUTES.adminDashboard;
    case "MODERATOR":
      return ROUTES.moderatorDashboard;
    default:
      return ROUTES.dashboard;
  }
}
