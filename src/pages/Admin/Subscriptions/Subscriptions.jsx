import { Box, Typography } from "@mui/material";
import AdminLayout from "../Layout/AdminLayout.jsx";
import SubscriptionFilters from "./components/SubscriptionFilters.jsx";
import SubscriptionTable from "./components/SubscriptionTable.jsx";
import SubscriptionDetailDialog from "./components/SubscriptionDetailDialog.jsx";
import useAdminSubscriptions from "./hooks/useAdminSubscriptions.js";

export default function Subscriptions() {
  const admin = useAdminSubscriptions();

  return (
    <AdminLayout>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={800}>
          Quản lý đăng ký gói
        </Typography>
        <Typography color="text.secondary">
          Theo dõi người dùng và các gói trả phí đang hoạt động.
        </Typography>
      </Box>
      <SubscriptionFilters admin={admin} />
      <SubscriptionTable admin={admin} />
      <SubscriptionDetailDialog admin={admin} />
    </AdminLayout>
  );
}
