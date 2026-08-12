import AppShell from "../../../components/AppShell/AppShell.jsx";
import { useAuth } from "../../../features/auth/AuthProvider.jsx";

export default function UserLayout({ children }) {
  const { user } = useAuth();
  return <AppShell role={user?.role}>{children}</AppShell>;
}
