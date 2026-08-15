import { Box, Typography } from "@mui/material";
import HistoryOutlined from "@mui/icons-material/HistoryOutlined";
import AdminLayout from "../Layout/AdminLayout.jsx";
import AuditLogFilters from "./components/AuditLogFilters.jsx";
import AuditLogTable from "./components/AuditLogTable.jsx";
import useAuditLogs from "./hooks/useAuditLogs.js";

export default function AuditLogs() {
  const audit = useAuditLogs();

  return (
    <AdminLayout>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={800}>
          Nhật ký kiểm tra
        </Typography>
        <Typography color="text.secondary">
          Theo dõi toàn bộ hoạt động trên hệ thống
        </Typography>
      </Box>

      <AuditLogFilters audit={audit} />
      <AuditLogTable audit={audit} />
    </AdminLayout>
  );
}
