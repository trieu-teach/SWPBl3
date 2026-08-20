import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ReportProblemOutlined from "@mui/icons-material/ReportProblemOutlined";
import DocumentPreviewDialog from "../../User/DocumentLibrary/components/DocumentPreviewDialog.jsx";
import {
  formatModerationDate,
  getReportReasonLabel,
  getReportStatusPresentation,
  REPORT_STATUS_OPTIONS,
} from "../../../lib/moderation.js";
import AdminLayout from "../../Admin/Layout/AdminLayout.jsx";
import ModeratorLayout from "../Layout/ModeratorLayout.jsx";
import ModerationActionDialog from "./components/ModerationActionDialog.jsx";
import ReportReviewDrawer from "./components/ReportReviewDrawer.jsx";
import useModerationReports from "./hooks/useModerationReports.js";

export default function ModeratorReports({ role = "MODERATOR" }) {
  const moderation = useModerationReports();
  const Layout = role === "ADMIN" ? AdminLayout : ModeratorLayout;

  return (
    <Layout>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h4" fontWeight={800}>
            Báo cáo vi phạm
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Xem xét báo cáo và áp dụng hành động kiểm duyệt rõ ràng, độc lập.
          </Typography>
        </Box>
        <FormControl
          size="small"
          sx={{
            width: { xs: "100%", sm: 220 },
            flexShrink: 0,
          }}
        >
          <InputLabel id="moderation-report-status-label">Trạng thái</InputLabel>
          <Select
            labelId="moderation-report-status-label"
            label="Trạng thái"
            value={moderation.status}
            onChange={(event) => moderation.updateStatus(event.target.value)}
          >
            {REPORT_STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {moderation.error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={moderation.loadReports}>
              Thử lại
            </Button>
          }
          sx={{ mb: 2 }}
        >
          {moderation.error}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        {moderation.loading ? (
          <Stack sx={{ alignItems: "center", gap: 1.5, py: 8 }}>
            <CircularProgress size={30} />
            <Typography color="text.secondary">Đang tải báo cáo...</Typography>
          </Stack>
        ) : moderation.reports.length === 0 ? (
          <Stack
            sx={{
              alignItems: "center",
              gap: 1,
              py: 8,
              px: 2,
              textAlign: "center",
            }}
          >
            <ReportProblemOutlined color="disabled" sx={{ fontSize: 46 }} />
            <Typography fontWeight={750}>Không có báo cáo ở trạng thái này</Typography>
            <Typography color="text.secondary">
              Hàng đợi sẽ tự cập nhật khi bạn đổi bộ lọc hoặc thử lại.
            </Typography>
          </Stack>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 820 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Tài liệu</TableCell>
                  <TableCell>Lý do</TableCell>
                  <TableCell>Người báo cáo</TableCell>
                  <TableCell>Thời điểm</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {moderation.reports.map((report) => {
                  const status = getReportStatusPresentation(report.status);
                  return (
                    <TableRow hover key={report.id}>
                      <TableCell>
                        <Typography fontWeight={700}>
                          {report.document?.title || "Tài liệu không còn tồn tại"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {report.document?.status || "—"} ·{" "}
                          {report.document?.visibility || "—"} ·{" "}
                          {report.document?.moderationStatus || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>{getReportReasonLabel(report.reason)}</TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {report.reporter?.fullName || "—"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {report.reporter?.email || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatModerationDate(report.createdAt)}
                        </Typography>
                        {report.resolvedAt && (
                          <>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block" }}
                            >
                              Đóng: {formatModerationDate(report.resolvedAt)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Bởi: {report.resolver?.fullName || report.resolver?.email || "—"}
                            </Typography>
                          </>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={status.label} color={status.color} />
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => moderation.openReport(report)}>
                          Xem xét
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {!moderation.loading && moderation.meta.totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            page={moderation.page}
            count={moderation.meta.totalPages}
            color="primary"
            onChange={(_event, value) => moderation.setPage(value)}
          />
        </Box>
      )}

      <ReportReviewDrawer moderation={moderation} />
      <ModerationActionDialog
        action={moderation.action}
        loading={moderation.acting}
        onClose={() => moderation.setAction(null)}
        onConfirm={moderation.confirmAction}
      />
      <DocumentPreviewDialog
        preview={moderation.preview}
        onClose={() => moderation.setPreview(null)}
      />
    </Layout>
  );
}
