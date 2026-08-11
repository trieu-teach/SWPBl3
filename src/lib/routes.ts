export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  dashboard: "/dashboard",
  profile: "/profile",
  adminDashboard: "/admin/dashboard",
};

export function getAuthenticatedHomeRoute(role) {
  return role === "ADMIN" ? ROUTES.adminDashboard : ROUTES.dashboard;
}
