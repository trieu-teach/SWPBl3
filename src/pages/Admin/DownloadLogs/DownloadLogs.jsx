import { Box, Typography, Card, CardContent } from "@mui/material";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import AdminLayout from "../Layout/AdminLayout.jsx";
import DownloadLogFilters from "./components/DownloadLogFilters.jsx";
import DownloadLogTable from "./components/DownloadLogTable.jsx";
import useDownloadLogs from "./hooks/useDownloadLogs.js";

export default function DownloadLogs() {
  const download = useDownloadLogs();

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
            <DownloadOutlined sx={{ fontSize: 24 }} />
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
              Nhật ký tải xuống
            </Typography>
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: "0.9rem",
                fontWeight: 400,
              }}
            >
              Theo dõi hoạt động tải tài liệu của người dùng
            </Typography>
          </Box>
        </Box>
      </Box>

      <DownloadLogFilters download={download} />
      <DownloadLogTable download={download} />
    </AdminLayout>
  );
}
