import AdminLayout from "../Layout/AdminLayout.jsx";
import AdminUserDetailDialog from "./components/AdminUserDetailDialog.jsx";
import AdminUsersFilters from "./components/AdminUsersFilters.jsx";
import AdminUsersHeader from "./components/AdminUsersHeader.jsx";
import AdminUsersTable from "./components/AdminUsersTable.jsx";
import UserStatusDialog from "./components/UserStatusDialog.jsx";
import useAdminUsers from "./hooks/useAdminUsers.js";

export default function AdminUsers() {
  const adminUsers = useAdminUsers();
  return (
    <AdminLayout>
      <AdminUsersHeader />
      <AdminUsersFilters adminUsers={adminUsers} />
      <AdminUsersTable adminUsers={adminUsers} />
      <AdminUserDetailDialog
        user={adminUsers.selectedUser}
        onClose={() => adminUsers.setSelectedUser(null)}
        onChangeStatus={adminUsers.setStatusTarget}
      />
      <UserStatusDialog
        user={adminUsers.statusTarget}
        loading={adminUsers.updating}
        onClose={() => adminUsers.setStatusTarget(null)}
        onConfirm={adminUsers.changeStatus}
      />
    </AdminLayout>
  );
}
