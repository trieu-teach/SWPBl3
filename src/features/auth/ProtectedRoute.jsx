import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

function getRoleBasedRoute(role) {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "MODERATOR":
      return "/moderator/reports";
    default:
      return "/documents";
  }
}

/**
 * GuestGuard — chặn người đã đăng nhập truy cập trang auth
 * (login / register / forgot-password / reset-password)
 */
export function GuestGuard({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null;

  if (user) {
    return <Navigate to={getRoleBasedRoute(user.role)} state={{ from: location }} replace />;
  }

  return children;
}

/**
 * GuestRoute — redirect người đã đăng nhập ra khỏi trang public
 * (homepage)
 */
export function GuestRoute({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return null;

  if (user) {
    return <Navigate to={getRoleBasedRoute(user.role)} state={{ from: location }} replace />;
  }

  return children;
}

/**
 * RequireAuth — yêu cầu đăng nhập mới cho phép truy cập
 * allowedRoles: nếu truyền, chỉ cho phép các role được liệt kê
 */
export function RequireAuth({ children, allowedRoles }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleBasedRoute(user.role)} state={{ from: location }} replace />;
  }

  return children;
}
