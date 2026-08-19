import { Box, Typography } from "@mui/material";
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
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            flexShrink: 0,
            boxShadow: "0 4px 14px rgba(249, 115, 22, 0.35)",
          }}
        >
          <DownloadOutlined sx={{ fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>
            Nhật ký tải xuống
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
            Theo dõi hoạt động tải tài liệu
          </Typography>
        </Box>
      </Box>

      <DownloadLogFilters download={download} />
      <DownloadLogTable download={download} />
    </AdminLayout>
  );
}
