import {
  Alert,
  AlertTitle,
  Box,
  Typography,
} from "@mui/material";
import AssessmentOutlined from "@mui/icons-material/AssessmentOutlined";
import AdminLayout from "../Layout/AdminLayout.jsx";
import ReportFilters from "./components/ReportFilters.jsx";
import UploadStatsChart from "./components/UploadStatsChart.jsx";
import TopDocumentsChart from "./components/TopDocumentsChart.jsx";
import useReports from "./hooks/useReports.js";

export default function Reports() {
  const reports = useReports();

  const hasAnyError =
    reports.uploadError ||
    reports.downloadedError ||
    reports.savedError;

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
            <AssessmentOutlined sx={{ fontSize: 24 }} />
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
              Báo cáo thống kê
            </Typography>
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: "0.9rem",
                fontWeight: 400,
              }}
            >
              Thống kê và báo cáo tổng hợp của hệ thống
            </Typography>
          </Box>
        </Box>
      </Box>

      {hasAnyError ? (
        <Box>
          {reports.uploadError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
              <AlertTitle>Upload Statistics</AlertTitle>
              {reports.uploadError}
            </Alert>
          )}
          {reports.downloadedError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
              <AlertTitle>Most Downloaded</AlertTitle>
              {reports.downloadedError}
            </Alert>
          )}
          {reports.savedError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
              <AlertTitle>Most Saved</AlertTitle>
              {reports.savedError}
            </Alert>
          )}
        </Box>
      ) : (
        <>
          <ReportFilters reports={reports} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Upload Statistics — full width */}
            <Box
              sx={{
                p: 3,
                borderRadius: "20px",
                border: "1px solid",
                borderColor: "divider",
                background: "background.paper",
                boxShadow: "none",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <AssessmentOutlined sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="body1" fontWeight={700}>
                  Thống kê Upload theo thời gian
                </Typography>
              </Box>
              <UploadStatsChart
                data={reports.uploadStats}
                loading={reports.uploadLoading}
              />
            </Box>

            {/* Top charts — side by side */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                gap: 3,
              }}
            >
              {/* Top Downloaded */}
              <Box
                sx={{
                  p: 3,
                  borderRadius: "20px",
                  border: "1px solid",
                  borderColor: "divider",
                  background: "background.paper",
                  boxShadow: "none",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="body1" fontWeight={700}>
                    Tài liệu tải nhiều nhất
                  </Typography>
                </Box>
                <TopDocumentsChart
                  data={reports.topDownloaded}
                  loading={reports.downloadedLoading}
                  title="TÀI LIỆU TẢI NHIỀU NHẤT"
                  metricKey="downloadCount"
                />
              </Box>

              {/* Top Saved */}
              <Box
                sx={{
                  p: 3,
                  borderRadius: "20px",
                  border: "1px solid",
                  borderColor: "divider",
                  background: "background.paper",
                  boxShadow: "none",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="body1" fontWeight={700}>
                    Tài liệu được lưu nhiều nhất
                  </Typography>
                </Box>
                <TopDocumentsChart
                  data={reports.topSaved}
                  loading={reports.savedLoading}
                  title="TÀI LIỆU ĐƯỢC LƯU NHIỀU NHẤT"
                  metricKey="saveCount"
                />
              </Box>
            </Box>
          </Box>
        </>
      )}
    </AdminLayout>
  );
}
