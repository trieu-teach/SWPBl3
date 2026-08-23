import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import {
  canAdminDecide,
  canAdminHide,
  canAdminUnhide,
  getAdminDocumentModeration,
  getAdminDocumentStatus,
} from "../utils/admin-document-status.js";

function Field({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography sx={{ overflowWrap: "anywhere" }}>{value || "—"}</Typography>
    </Box>
  );
}
export default function AdminDocumentDetailDialog({
  document,
  onClose,
  onPreview,
  onAction,
}) {
  if (!document) return null;

  const moderation = getAdminDocumentModeration(document);
  const status = getAdminDocumentStatus(document.status);
  const canDecide = canAdminDecide(document);
  const canHide = canAdminHide(document);
  const canUnhide = canAdminUnhide(document);

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Chi tiết tài liệu</DialogTitle>
      <DialogContent dividers>
        <Typography variant="h6" fontWeight={750}>
          {document.title}
        </Typography>
        <Typography color="text.secondary">{document.fileName}</Typography>
        <Stack direction="row" gap={1} flexWrap="wrap" sx={{ my: 2 }}>
          <Chip
            size="small"
            color={
              document.visibility === "PUBLIC" ? "success" : "secondary"
            }
            variant="outlined"
            label={document.visibility === "PUBLIC" ? "Công khai" : "Riêng tư"}
          />
          <Chip
            size="small"
            label={moderation.label}
            color={moderation.color}
          />
          <Chip
            size="small"
            label={status.label}
            color={status.color}
            variant="outlined"
          />
        </Stack>
        <Divider sx={{ mb: 2 }} />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <Field
            label="Người đăng"
            value={`${document.owner?.fullName || ""} (${document.owner?.email || ""})`}
          />
          <Field
            label="Môn học · Danh mục"
            value={`${document.subject?.name || "—"} · ${document.category?.name || "—"}`}
          />
          <Field
            label="Dung lượng"
            value={`${Math.ceil(Number(document.fileSize || 0) / 1024)} KB`}
          />
          <Field label="Trạng thái AI" value={document.aiStatus} />
          <Field
            label="Ngày tải lên"
            value={new Date(document.createdAt).toLocaleString("vi-VN")}
          />
          <Field
            label="Ngày kiểm duyệt"
            value={
              document.reviewedAt
                ? new Date(document.reviewedAt).toLocaleString("vi-VN")
                : "Chưa kiểm duyệt"
            }
          />
          <Box sx={{ gridColumn: "1 / -1" }}>
            <Field label="Mô tả" value={document.description} />
          </Box>
          {document.rejectionReason && (
            <Box sx={{ gridColumn: "1 / -1" }}>
              <Field label="Lý do từ chối" value={document.rejectionReason} />
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ flexWrap: "wrap" }}>
        <Button onClick={() => onPreview(document)}>Xem file</Button>
        {canDecide && (
          <>
            <Button
              color="success"
              onClick={() => onAction({ type: "approve", document })}
            >
              Duyệt
            </Button>
            <Button
              color="error"
              onClick={() => onAction({ type: "reject", document })}
            >
              Từ chối
            </Button>
          </>
        )}
        {(canHide || canUnhide) && (
          <Button
            color={canUnhide ? "success" : "error"}
            onClick={() =>
              onAction({
                type: canUnhide ? "unhide" : "hide",
                document,
              })
            }
          >
            {canUnhide ? "Khôi phục" : "Ẩn"}
          </Button>
        )}
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
