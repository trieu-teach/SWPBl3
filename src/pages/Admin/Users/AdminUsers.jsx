import AdminLayout from "../Layout/AdminLayout.jsx";
import AdminUserDetailDialog from "./components/AdminUserDetailDialog.jsx";
import AdminUsersFilters from "./components/AdminUsersFilters.jsx";
import AdminUsersHeader from "./components/AdminUsersHeader.jsx";
import AdminUsersTable from "./components/AdminUsersTable.jsx";
import UserStatusDialog from "./components/UserStatusDialog.jsx";
import UserRoleDialog from "./components/UserRoleDialog.jsx";
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
        onChangeStatus={(user) => {
          adminUsers.setSelectedUser(null);
          adminUsers.setStatusTarget(user);
        }}
        onChangeRole={(user) => {
          adminUsers.setSelectedUser(null);
          adminUsers.setRoleTarget(user);
        }}
      />
      <UserStatusDialog
        user={adminUsers.statusTarget}
        loading={adminUsers.updating}
        onClose={() => adminUsers.setStatusTarget(null)}
        onConfirm={adminUsers.changeStatus}
      />
      <UserRoleDialog
        user={adminUsers.roleTarget}
        loading={adminUsers.updating}
        onClose={() => adminUsers.setRoleTarget(null)}
        onConfirm={adminUsers.changeRole}
      />
    </AdminLayout>
  );
}
