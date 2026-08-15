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
      <Box mb={3}>
        <Typography variant="h4" fontWeight={800}>
          Nhật ký tải xuống
        </Typography>
        <Typography color="text.secondary">
          Theo dõi hoạt động tải tài liệu của người dùng
        </Typography>
      </Box>

      <DownloadLogFilters download={download} />
      <DownloadLogTable download={download} />
    </AdminLayout>
  );
}
