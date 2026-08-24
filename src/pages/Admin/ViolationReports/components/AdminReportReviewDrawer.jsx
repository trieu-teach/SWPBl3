import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
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

export default function AdminReportReviewDrawer({ reports }) {
  const report = reports.selectedReport;
  const document = reports.document;
  if (!report) return null;

  const reportStatus = getReportStatusPresentation(report.status);
  const documentTitle = document?.title || report.document?.title || "Tài liệu";
  const isPending = report.status === "PENDING";
  const canApplyDocumentAction =
    Boolean(document) && document.status !== "DELETED";

  function requestAction(type) {
    reports.setAction({ type, documentTitle });
  }

  return (
    <Drawer
      anchor="right"
      open
      onClose={reports.closeReport}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 560, lg: 680 },
          maxWidth: "100vw",
        },
      }}
    >
      <Box sx={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            px: 3,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" fontWeight={800}>
              Chi tiết báo cáo vi phạm
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Mã {report.id}
            </Typography>
          </Box>
          <IconButton onClick={reports.closeReport} disabled={reports.acting}>
            <CloseOutlined />
          </IconButton>
        </Box>

        <Box sx={{ p: 3, flex: 1, overflowY: "auto" }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
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
          </Box>

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
            <Field
              label="Thời điểm gửi"
              value={formatModerationDate(report.createdAt)}
            />
            <Box sx={{ gridColumn: "1 / -1" }}>
              <Field
                label="Mô tả"
                value={report.description || "Không có mô tả thêm"}
              />
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
            Tài liệu liên quan
          </Typography>

          {reports.detailLoading && (
            <Box sx={{ py: 4, display: "flex", alignItems: "center", gap: 1.5 }}>
              <CircularProgress size={22} />
              <Typography color="text.secondary">
                Đang tải chi tiết tài liệu...
              </Typography>
            </Box>
          )}

          {reports.detailError && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" onClick={reports.retryDetail}>
                  Thử lại
                </Button>
              }
              sx={{ my: 2 }}
            >
              {reports.detailError}
            </Alert>
          )}

          {document && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="h6" fontWeight={750}>
                {document.title}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                {document.fileName}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, my: 2 }}>
                <Chip
                  size="small"
                  label={document.status === "HIDDEN" ? "Đã ẩn" : document.status}
                  color={document.status === "ACTIVE" ? "success" : "error"}
                />
                <Chip size="small" variant="outlined" label={document.visibility} />
                <Chip
                  size="small"
                  variant="outlined"
                  label={document.moderationStatus}
                />
              </Box>
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
                  reports.previewLoading ? (
                    <CircularProgress size={16} />
                  ) : (
                    <VisibilityOutlined />
                  )
                }
                onClick={reports.openPreview}
                disabled={reports.previewLoading}
              >
                Xem trước tài liệu
              </Button>
            </Box>
          )}
        </Box>

        <Box
          sx={{
            p: 2,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "flex-end",
            gap: 1,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          {isPending && (
            <>
              <Button color="warning" onClick={() => requestAction("dismiss")}>
                Bỏ qua
              </Button>
              <Button variant="outlined" onClick={() => requestAction("resolve")}>
                Đã xử lý
              </Button>
              {canApplyDocumentAction && (
                <Button color="warning" onClick={() => requestAction("hide")}>
                  Ẩn tài liệu
                </Button>
              )}
              {canApplyDocumentAction && (
                <Button
                  color="error"
                  variant="contained"
                  onClick={() => requestAction("delete")}
                >
                  Xóa mềm
                </Button>
              )}
            </>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
