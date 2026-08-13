import { Box, Typography, Card, CardContent } from "@mui/material";
import HistoryOutlined from "@mui/icons-material/HistoryOutlined";
import AdminLayout from "../Layout/AdminLayout.jsx";
import AuditLogFilters from "./components/AuditLogFilters.jsx";
import AuditLogTable from "./components/AuditLogTable.jsx";
import useAuditLogs from "./hooks/useAuditLogs.js";

export default function AuditLogs() {
  const audit = useAuditLogs();

  return (
    <AdminLayout>
      {/* Page Header */}
      <Box
        sx={{
          mb: 3,
          pb: 3,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 0.5 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "14px",
              background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              boxShadow: "0 8px 24px rgba(249, 115, 22, 0.35)",
            }}
          >
            <HistoryOutlined sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "1.75rem",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                color: "text.primary",
              }}
            >
              Nhật ký kiểm tra
            </Typography>
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: "0.9rem",
                fontWeight: 400,
              }}
            >
              Theo dõi toàn bộ hoạt động trên hệ thống
            </Typography>
          </Box>
        </Box>
      </Box>

      <AuditLogFilters audit={audit} />
      <AuditLogTable audit={audit} />
    </AdminLayout>
  );
}
