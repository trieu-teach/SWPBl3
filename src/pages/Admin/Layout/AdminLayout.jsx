import AppShell from "../../../components/AppShell/AppShell.jsx";

export default function AdminLayout({ children }) {
  return <AppShell role="ADMIN">{children}</AppShell>;
}
