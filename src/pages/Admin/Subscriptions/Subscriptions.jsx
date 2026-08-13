import { Box, Typography } from "@mui/material";
import AdminLayout from "../Layout/AdminLayout.jsx";
import SubscriptionFilters from "./components/SubscriptionFilters.jsx";
import SubscriptionStats from "./components/SubscriptionStats.jsx";
import SubscriptionTable from "./components/SubscriptionTable.jsx";
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
          Theo dõi doanh thu và người dùng đang sử dụng gói trả phí.
        </Typography>
      </Box>
      <SubscriptionStats stats={admin.stats} />
      <SubscriptionFilters admin={admin} />
      <SubscriptionTable admin={admin} />
    </AdminLayout>
  );
}
