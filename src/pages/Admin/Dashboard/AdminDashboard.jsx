import AssessmentOutlined from "@mui/icons-material/AssessmentOutlined";
import RefreshOutlined from "@mui/icons-material/RefreshOutlined";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import AdminLayout from "../Layout/AdminLayout.jsx";
import ActivityCards from "./components/ActivityCards.jsx";
import AttentionCards from "./components/AttentionCards.jsx";
import StatisticsBreakdown from "./components/StatisticsBreakdown.jsx";
import SummaryCards from "./components/SummaryCards.jsx";
import UploadAndVisibilityCharts from "./components/UploadAndVisibilityCharts.jsx";
import useAdminDashboard from "./hooks/useAdminDashboard.js";

export default function AdminDashboard() {
  const dashboard = useAdminDashboard();

  return (
    <AdminLayout>
      <Stack spacing={3.5}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                color: "white",
                background: "linear-gradient(135deg, #f97316, #ea580c)",
              }}
            >
              <AssessmentOutlined />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={800}>
                Tổng quan hệ thống
              </Typography>
              <Typography color="text.secondary">
                Theo dõi toàn bộ hoạt động của DocuMind.
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshOutlined />}
            onClick={dashboard.load}
            disabled={dashboard.loading}
          >
            Làm mới
          </Button>
        </Box>

        {dashboard.error && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" onClick={dashboard.load}>
                Thử lại
              </Button>
            }
          >
            {dashboard.error}
          </Alert>
        )}

        <SummaryCards
          pulse={dashboard.overview?.pulse}
          loading={dashboard.loading}
        />

        {!dashboard.loading && !dashboard.error && (
          <>
            <AttentionCards attention={dashboard.overview?.attention} />
            <ActivityCards activity={dashboard.overview?.activity} />
            <UploadAndVisibilityCharts
              uploads={dashboard.uploads}
              visibility={dashboard.visibility}
            />
            <StatisticsBreakdown statistics={dashboard.statistics} />
          </>
        )}
      </Stack>
    </AdminLayout>
  );
}
