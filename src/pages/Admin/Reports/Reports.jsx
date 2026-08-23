import {
  Alert,
  AlertTitle,
  Box,
  Typography,
  Chip,
} from "@mui/material";
import AssessmentOutlined from "@mui/icons-material/AssessmentOutlined";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import BookmarkOutlined from "@mui/icons-material/BookmarkOutlined";
import FolderOutlined from "@mui/icons-material/FolderOutlined";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import UploadOutlined from "@mui/icons-material/UploadOutlined";
import AdminLayout from "../Layout/AdminLayout.jsx";
import ReportFilters from "./components/ReportFilters.jsx";
import UploadStatsChart from "./components/UploadStatsChart.jsx";
import TopDocumentsChart from "./components/TopDocumentsChart.jsx";
import SubscriptionPieChart from "./components/SubscriptionPieChart.jsx";
import HeaviestDocumentsChart from "./components/HeaviestDocumentsChart.jsx";
import TopUsersChart from "./components/TopUsersChart.jsx";
import useReports from "./hooks/useReports.js";

const styles = {
  container: {
    maxWidth: 1600,
    mx: "auto",
    px: { xs: 2, md: 3 },
    pb: 4,
  },
  pageHeader: {
    mb: 3,
    pb: 3,
    borderBottom: "1px solid",
    borderColor: "divider",
  },
  headerIconBox: {
    width: 48,
    height: 48,
    borderRadius: "14px",
    background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    boxShadow: "0 8px 24px rgba(249, 115, 22, 0.35)",
    flexShrink: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
    gap: { xs: 2.5, md: 3 },
    alignItems: "stretch",
  },
  chartCard: {
    borderRadius: "20px",
    border: "1px solid",
    borderColor: "divider",
    background: "background.paper",
    boxShadow: "none",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
  },
  chartCardFull: {
    borderRadius: "20px",
    border: "1px solid",
    borderColor: "divider",
    background: "background.paper",
    boxShadow: "none",
    gridColumn: "1 / -1",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 2,
    mb: 2,
    flexWrap: "wrap",
    flexShrink: 0,
    p: { xs: 2, md: 3 },
    pb: 0,
  },
  cardContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    p: { xs: 2, md: 3 },
    pt: 1.5,
  },
  iconBox: (color) => ({
    width: 44,
    height: 44,
    borderRadius: "12px",
    background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    flexShrink: 0,
    boxShadow: `0 6px 20px ${color}33`,
  }),
  titleSection: {
    flex: 1,
    minWidth: 0,
  },
  dateChip: {
    bgcolor: "action.hover",
    color: "text.secondary",
    fontWeight: 500,
    fontSize: "0.7rem",
    height: 24,
    px: 1,
    flexShrink: 0,
  },
};

function SectionHeader({ icon, title, subtitle, color }) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
      <Box sx={styles.iconBox(color)}>
        {icon}
      </Box>
      <Box sx={styles.titleSection}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            mb: 0.25,
            fontSize: { xs: "0.95rem", md: "1rem" },
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: "0.75rem", md: "0.8rem" }, lineHeight: 1.4 }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function ChartCard({ children, error, errorTitle }) {
  return (
    <Box sx={styles.chartCard}>
      {error && (
        <Alert severity="error" sx={{ m: 2, mb: 0, borderRadius: 3 }}>
          <AlertTitle>{errorTitle}</AlertTitle>
          {error}
        </Alert>
      )}
      {children}
    </Box>
  );
}

function ChartCardFull({ children, error, errorTitle }) {
  return (
    <Box sx={styles.chartCardFull}>
      {error && (
        <Alert severity="error" sx={{ m: 2, mb: 0, borderRadius: 3 }}>
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
      sx={styles.dateChip}
    />
  );
}

export default function Reports() {
  const reports = useReports();

  return (
    <AdminLayout>
      <Box sx={styles.container}>
        {/* Page Header */}
        <Box sx={styles.pageHeader}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={styles.headerIconBox}>
              <AssessmentOutlined sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "1.5rem", md: "1.75rem" },
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
                  fontSize: { xs: "0.8rem", md: "0.9rem" },
                }}
              >
                Thống kê và báo cáo tổng hợp của hệ thống
              </Typography>
            </Box>
          </Box>
        </Box>

        <ReportFilters reports={reports} />

        {/* Charts Grid */}
        <Box sx={styles.grid}>
          {/* Row 1: Upload Stats - Full Width */}
          <ChartCardFull error={reports.uploadError} errorTitle="Upload Statistics">
            <Box sx={styles.cardHeader}>
              <SectionHeader
                icon={<TrendingUpOutlined sx={{ fontSize: 20 }} />}
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
            <Box sx={styles.cardContent}>
              <UploadStatsChart
                data={reports.uploadStats}
                loading={reports.uploadLoading}
                dateRange={reports.uploadRange}
              />
            </Box>
          </ChartCardFull>

          {/* Row 2: Top Downloaded + Top Saved */}
          <ChartCard error={reports.downloadedError} errorTitle="Most Downloaded">
            <Box sx={styles.cardHeader}>
              <SectionHeader
                icon={<DownloadOutlined sx={{ fontSize: 20 }} />}
                title="Tài liệu được tải nhiều nhất"
                subtitle="Top 10 tài liệu có lượt tải cao nhất"
                color="#f97316"
              />
              <DateCaption
                label="Top tải"
                dateRange={reports.downloadedRange}
                getDateCaption={reports.getDateCaption}
              />
            </Box>
            <Box sx={styles.cardContent}>
              <TopDocumentsChart
                data={reports.topDownloaded}
                loading={reports.downloadedLoading}
                metricKey="downloadCount"
                metricLabel="lượt tải"
                barColor="#f97316"
              />
            </Box>
          </ChartCard>

          <ChartCard error={reports.savedError} errorTitle="Most Saved">
            <Box sx={styles.cardHeader}>
              <SectionHeader
                icon={<BookmarkOutlined sx={{ fontSize: 20 }} />}
                title="Tài liệu được lưu nhiều nhất"
                subtitle="Top 10 tài liệu được lưu lại nhiều nhất"
                color="#10b981"
              />
              <DateCaption
                label="Top lưu"
                dateRange={reports.savedRange}
                getDateCaption={reports.getDateCaption}
              />
            </Box>
            <Box sx={styles.cardContent}>
              <TopDocumentsChart
                data={reports.topSaved}
                loading={reports.savedLoading}
                metricKey="saveCount"
                metricLabel="lượt lưu"
                barColor="#10b981"
              />
            </Box>
          </ChartCard>

          {/* Row 3: Subscription + Heaviest */}
          <ChartCard error={reports.subscriptionError} errorTitle="Subscription Stats">
            <Box sx={styles.cardHeader}>
              <SectionHeader
                icon={<AssessmentOutlined sx={{ fontSize: 20 }} />}
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
            <Box sx={styles.cardContent}>
              <SubscriptionPieChart
                data={reports.subscriptionStats}
                loading={reports.subscriptionLoading}
                dateRange={reports.statsRange}
              />
            </Box>
          </ChartCard>

          <ChartCard error={reports.heaviestError} errorTitle="Heaviest Documents">
            <Box sx={styles.cardHeader}>
              <SectionHeader
                icon={<FolderOutlined sx={{ fontSize: 20 }} />}
                title="Tài liệu có dung lượng nặng nhất"
                subtitle="Trong các tài liệu tải lên khoảng thời gian đã chọn"
                color="#ef4444"
              />
              <DateCaption
                label="Tài liệu nặng"
                dateRange={reports.heaviestRange}
                getDateCaption={reports.getDateCaption}
              />
            </Box>
            <Box sx={styles.cardContent}>
              <HeaviestDocumentsChart
                data={reports.heaviestDocuments}
                loading={reports.heaviestLoading}
                barColor="#ef4444"
              />
            </Box>
          </ChartCard>

          {/* Row 4: Top Contributors + Top Uploaders */}
          <ChartCard error={reports.contributorsError} errorTitle="Top Contributors">
            <Box sx={styles.cardHeader}>
              <SectionHeader
                icon={<PeopleOutlined sx={{ fontSize: 20 }} />}
                title="Người đóng góp cộng đồng nhiều nhất"
                subtitle="Chỉ đếm tài liệu công khai đã được duyệt"
                color="#06b6d4"
              />
              <DateCaption
                label="Top đóng góp"
                dateRange={reports.contributorsRange}
                getDateCaption={reports.getDateCaption}
              />
            </Box>
            <Box sx={styles.cardContent}>
              <TopUsersChart
                data={reports.topContributors}
                loading={reports.contributorsLoading}
                metricKey="documentCount"
                metricLabel="tài liệu"
                barColor="#06b6d4"
                showStorage={false}
              />
            </Box>
          </ChartCard>

          <ChartCard error={reports.uploadersError} errorTitle="Top Uploaders">
            <Box sx={styles.cardHeader}>
              <SectionHeader
                icon={<UploadOutlined sx={{ fontSize: 20 }} />}
                title="Người tải lên hệ thống nhiều nhất"
                subtitle="Đếm toàn bộ tài liệu kể cả riêng tư và chưa duyệt"
                color="#f59e0b"
              />
              <DateCaption
                label="Top tải lên"
                dateRange={reports.uploadersRange}
                getDateCaption={reports.getDateCaption}
              />
            </Box>
            <Box sx={styles.cardContent}>
              <TopUsersChart
                data={reports.topUploaders}
                loading={reports.uploadersLoading}
                metricKey="documentCount"
                metricLabel="tài liệu"
                barColor="#f59e0b"
                showStorage={true}
              />
            </Box>
          </ChartCard>
        </Box>
      </Box>
    </AdminLayout>
  );
}
