import {
  Alert,
  AlertTitle,
  Box,
  Grid,
  Typography,
  Chip,
} from "@mui/material";
import AssessmentOutlined from "@mui/icons-material/AssessmentOutlined";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import BookmarkOutlined from "@mui/icons-material/BookmarkOutlined";
import AdminLayout from "../Layout/AdminLayout.jsx";
import ReportFilters from "./components/ReportFilters.jsx";
import UploadStatsChart from "./components/UploadStatsChart.jsx";
import TopDocumentsChart from "./components/TopDocumentsChart.jsx";
import SubscriptionPieChart from "./components/SubscriptionPieChart.jsx";
import useReports from "./hooks/useReports.js";

function SectionHeader({ icon, title, subtitle, color }) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "14px",
          background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          flexShrink: 0,
          boxShadow: `0 8px 24px ${color}33`,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            mb: 0.25,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function ChartCard({ children, error, errorTitle }) {
  return (
    <Box
      sx={{
        borderRadius: "20px",
        border: "1px solid",
        borderColor: "divider",
        background: "background.paper",
        p: 3,
        boxShadow: "none",
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
          <AlertTitle>{errorTitle}</AlertTitle>
          {error}
        </Alert>
      )}
      {children}
    </Box>
  );
}

function DateCaption({ label, dateRange, getDateCaption }) {
  const caption = getDateCaption(dateRange);
  return (
    <Chip
      label={`${label}: ${caption}`}
      size="small"
      sx={{
        bgcolor: "grey.100",
        color: "text.secondary",
        fontWeight: 500,
        fontSize: "0.75rem",
        height: 26,
      }}
    />
  );
}

export default function Reports() {
  const reports = useReports();

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

      <ReportFilters reports={reports} />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {/* SECTION 1: Upload Statistics - Full Width */}
        <ChartCard error={reports.uploadError} errorTitle="Upload Statistics">
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
            <SectionHeader
              icon={<TrendingUpOutlined sx={{ fontSize: 24 }} />}
              title="Thống kê Upload theo thời gian"
              subtitle="Xu hướng upload tài liệu trong khoảng thời gian đã chọn"
              color="#6366f1"
            />
            <DateCaption
              label="Upload"
              dateRange={reports.uploadRange}
              getDateCaption={reports.getDateCaption}
            />
          </Box>
          <UploadStatsChart
            data={reports.uploadStats}
            loading={reports.uploadLoading}
            dateRange={reports.uploadRange}
          />
        </ChartCard>

        {/* SECTION 2: Top Downloaded - Full Width */}
        <ChartCard error={reports.downloadedError} errorTitle="Most Downloaded">
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
            <SectionHeader
              icon={<DownloadOutlined sx={{ fontSize: 24 }} />}
              title="Tài liệu được tải nhiều nhất"
              subtitle="Top 10 tài liệu có lượt tải cao nhất trong khoảng thời gian"
              color="#f97316"
            />
            <DateCaption
              label="Top tải"
              dateRange={reports.downloadedRange}
              getDateCaption={reports.getDateCaption}
            />
          </Box>
          <TopDocumentsChart
            data={reports.topDownloaded}
            loading={reports.downloadedLoading}
            metricKey="downloadCount"
            metricLabel="lượt tải"
            barColor="#f97316"
          />
        </ChartCard>

        {/* SECTION 3: Top Saved - Full Width */}
        <ChartCard error={reports.savedError} errorTitle="Most Saved">
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
            <SectionHeader
              icon={<BookmarkOutlined sx={{ fontSize: 24 }} />}
              title="Tài liệu được lưu nhiều nhất"
              subtitle="Top 10 tài liệu được người dùng lưu lại nhiều nhất"
              color="#10b981"
            />
            <DateCaption
              label="Top lưu"
              dateRange={reports.savedRange}
              getDateCaption={reports.getDateCaption}
            />
          </Box>
          <TopDocumentsChart
            data={reports.topSaved}
            loading={reports.savedLoading}
            metricKey="saveCount"
            metricLabel="lượt lưu"
            barColor="#10b981"
          />
        </ChartCard>

        {/* SECTION 4: Subscription Distribution */}
        <ChartCard error={reports.subscriptionError} errorTitle="Subscription Stats">
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
            <SectionHeader
              icon={<AssessmentOutlined sx={{ fontSize: 24 }} />}
              title="Phân bố gói dịch vụ"
              subtitle="Thống kê lượt mua theo từng gói dịch vụ"
              color="#8b5cf6"
            />
            <DateCaption
              label="Phân bố"
              dateRange={reports.statsRange}
              getDateCaption={reports.getDateCaption}
            />
          </Box>
          <SubscriptionPieChart
            data={reports.subscriptionStats}
            loading={reports.subscriptionLoading}
            dateRange={reports.statsRange}
          />
        </ChartCard>
      </Box>
    </AdminLayout>
  );
}
