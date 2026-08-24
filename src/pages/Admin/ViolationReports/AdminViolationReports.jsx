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
import AdminLayout from "../Layout/AdminLayout.jsx";
import AdminReportActionDialog from "./components/AdminReportActionDialog.jsx";
import AdminReportReviewDrawer from "./components/AdminReportReviewDrawer.jsx";
import useAdminViolationReports from "./hooks/useAdminViolationReports.js";

export default function AdminViolationReports() {
  const reports = useAdminViolationReports();

  return (
    <AdminLayout>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" fontWeight={800}>
            Báo cáo vi phạm
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Xem xét các báo cáo do người dùng gửi từ thư viện cộng đồng.
          </Typography>
        </Box>
        <FormControl size="small" sx={{ width: { xs: "100%", sm: 220 } }}>
          <InputLabel id="admin-violation-report-status-label">
            Trạng thái
          </InputLabel>
          <Select
            labelId="admin-violation-report-status-label"
            label="Trạng thái"
            value={reports.status}
            onChange={(event) => reports.updateStatus(event.target.value)}
          >
            {REPORT_STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {reports.error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={reports.loadReports}>
              Thử lại
            </Button>
          }
          sx={{ mb: 2 }}
        >
          {reports.error}
        </Alert>
      )}

      <Typography sx={{ mb: 1.5 }}>
        {reports.meta.totalItems || 0} báo cáo
      </Typography>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        {reports.loading ? (
          <Box sx={{ minHeight: 240, display: "grid", placeItems: "center" }}>
            <Box sx={{ textAlign: "center" }}>
              <CircularProgress size={30} />
              <Typography color="text.secondary" sx={{ mt: 1.5 }}>
                Đang tải báo cáo...
              </Typography>
            </Box>
          </Box>
        ) : reports.reports.length === 0 ? (
          <Box
            sx={{
              minHeight: 240,
              display: "grid",
              placeItems: "center",
              px: 2,
              textAlign: "center",
            }}
          >
            <Box>
              <ReportProblemOutlined color="disabled" sx={{ fontSize: 46 }} />
              <Typography fontWeight={750} sx={{ mt: 1 }}>
                Không có báo cáo ở trạng thái này
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                Hãy đổi bộ lọc hoặc tải lại danh sách.
              </Typography>
            </Box>
          </Box>
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
                {reports.reports.map((report) => {
                  const status = getReportStatusPresentation(report.status);
                  return (
                    <TableRow hover key={report.id}>
                      <TableCell>
                        <Typography fontWeight={700}>
                          {report.document?.title || "Tài liệu không còn tồn tại"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {report.document?.status || "—"} ·{" "}
                          {report.document?.visibility || "—"}
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
                      <TableCell>{formatModerationDate(report.createdAt)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={status.label}
                          color={status.color}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => reports.openReport(report)}>
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

      {!reports.loading && reports.meta.totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            page={reports.page}
            count={reports.meta.totalPages}
            color="primary"
            onChange={(_event, value) => reports.setPage(value)}
          />
        </Box>
      )}

      <AdminReportReviewDrawer reports={reports} />
      <AdminReportActionDialog
        action={reports.action}
        loading={reports.acting}
        onClose={() => reports.setAction(null)}
        onConfirm={reports.confirmAction}
      />
      <DocumentPreviewDialog
        preview={reports.preview}
        onClose={() => reports.setPreview(null)}
      />
    </AdminLayout>
  );
}
