import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import {
  formatModerationDate,
  getReportReasonLabel,
  getReportStatusPresentation,
} from "../../../../lib/moderation.js";

function Field({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography sx={{ overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

export default function ReportReviewDrawer({ moderation }) {
  const report = moderation.selectedReport;
  const document = moderation.document;
  const reportStatus = getReportStatusPresentation(report?.status);
  const documentTitle = document?.title || report?.document?.title || "Tài liệu";
  const isPending = report?.status === "PENDING";
  const canHide = document?.status === "ACTIVE";
  const canUnhide = document?.status === "HIDDEN";

  function requestAction(type) {
    moderation.setAction({ type, documentTitle });
  }

  return (
    <Drawer
      anchor="right"
      open={Boolean(report)}
      onClose={moderation.closeReport}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 560, lg: 680 },
          maxWidth: "100vw",
        },
      }}
    >
      {report && (
        <Box sx={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 3, py: 2, borderBottom: "1px solid", borderColor: "divider" }}
          >
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Xem xét báo cáo
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Mã {report.id}
              </Typography>
            </Box>
            <IconButton onClick={moderation.closeReport} disabled={moderation.acting}>
              <CloseOutlined />
            </IconButton>
          </Stack>

          <Box sx={{ p: 3, flex: 1, overflowY: "auto" }}>
            <Typography variant="overline" color="text.secondary">
              Báo cáo
            </Typography>
            <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
              <Chip
                size="small"
                label={reportStatus.label}
                color={reportStatus.color}
              />
              <Chip
                size="small"
                variant="outlined"
                label={getReportReasonLabel(report.reason)}
              />
            </Stack>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              <Field
                label="Người báo cáo"
                value={
                  report.reporter
                    ? `${report.reporter.fullName || "—"} (${report.reporter.email || "—"})`
                    : "—"
                }
              />
              <Field label="Thời điểm gửi" value={formatModerationDate(report.createdAt)} />
              <Box sx={{ gridColumn: "1 / -1" }}>
                <Field label="Mô tả" value={report.description || "Không có mô tả thêm"} />
              </Box>
              {report.resolvedAt && (
                <>
                  <Field
                    label="Thời điểm đóng"
                    value={formatModerationDate(report.resolvedAt)}
                  />
                  <Field
                    label="Người xử lý"
                    value={report.resolver?.fullName || report.resolver?.email}
                  />
                </>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />
            <Typography variant="overline" color="text.secondary">
              Tài liệu
            </Typography>

            {moderation.detailLoading && (
              <Stack direction="row" alignItems="center" gap={1.5} sx={{ py: 4 }}>
                <CircularProgress size={22} />
                <Typography color="text.secondary">Đang tải chi tiết tài liệu...</Typography>
              </Stack>
            )}

            {moderation.detailError && (
              <Alert
                severity="error"
                action={
                  <Button color="inherit" onClick={moderation.retryDetail}>
                    Thử lại
                  </Button>
                }
                sx={{ my: 2 }}
              >
                {moderation.detailError}
              </Alert>
            )}

            {document && (
              <>
                <Typography variant="h6" fontWeight={750} sx={{ mb: 1.5 }}>
                  {document.title}
                </Typography>
                <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
                  <Chip
                    size="small"
                    label={document.status === "HIDDEN" ? "Đã ẩn" : document.status}
                    color={document.status === "HIDDEN" ? "error" : "success"}
                  />
                  <Chip size="small" variant="outlined" label={document.visibility} />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={document.moderationStatus}
                  />
                </Stack>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2,
                  }}
                >
                  <Field
                    label="Người đăng"
                    value={
                      document.owner
                        ? `${document.owner.fullName || "—"} (${document.owner.email || "—"})`
                        : "—"
                    }
                  />
                  <Field label="Tên tệp" value={document.fileName} />
                  <Field label="Loại tệp" value={document.fileType} />
                  <Field label="Ngày tải lên" value={formatModerationDate(document.createdAt)} />
                  <Field
                    label="Môn học · Danh mục"
                    value={`${document.subject?.name || "—"} · ${document.category?.name || "—"}`}
                  />
                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <Field label="Mô tả tài liệu" value={document.description} />
                  </Box>
                </Box>
                <Button
                  sx={{ mt: 2 }}
                  startIcon={
                    moderation.previewLoading ? (
                      <CircularProgress size={16} />
                    ) : (
                      <VisibilityOutlined />
                    )
                  }
                  onClick={moderation.openPreview}
                  disabled={moderation.previewLoading}
                >
                  Xem trước tài liệu
                </Button>
              </>
            )}
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            gap={1}
            justifyContent="flex-end"
            sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}
          >
            {canHide && (
              <Button color="error" onClick={() => requestAction("hide")}>
                Ẩn tài liệu
              </Button>
            )}
            {canUnhide && (
              <Button color="success" onClick={() => requestAction("unhide")}>
                Khôi phục tài liệu
              </Button>
            )}
            {isPending && (
              <>
                <Button color="warning" onClick={() => requestAction("dismiss")}>
                  Bỏ qua báo cáo
                </Button>
                <Button variant="contained" onClick={() => requestAction("resolve")}>
                  Đánh dấu đã xử lý
                </Button>
              </>
            )}
          </Stack>
        </Box>
      )}
    </Drawer>
  );
}
