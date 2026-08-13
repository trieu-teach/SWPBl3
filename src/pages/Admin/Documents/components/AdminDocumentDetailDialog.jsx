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
            label={document.visibility === "PUBLIC" ? "Công khai" : "Riêng tư"}
          />
          <Chip
            size="small"
            label={document.moderationStatus}
            color={
              document.moderationStatus === "APPROVED"
                ? "success"
                : document.moderationStatus === "REJECTED"
                  ? "error"
                  : "warning"
            }
          />
          <Chip
            size="small"
            label={document.status === "HIDDEN" ? "Đã ẩn" : "Hoạt động"}
            color={document.status === "HIDDEN" ? "error" : "success"}
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
        {document.visibility === "PUBLIC" &&
          document.moderationStatus !== "APPROVED" && (
            <Button
              color="success"
              onClick={() => onAction({ type: "approve", document })}
            >
              Duyệt
            </Button>
          )}
        {document.visibility === "PUBLIC" &&
          document.moderationStatus !== "REJECTED" && (
            <Button
              color="error"
              onClick={() => onAction({ type: "reject", document })}
            >
              Từ chối
            </Button>
          )}
        <Button
          color={document.status === "HIDDEN" ? "success" : "error"}
          onClick={() =>
            onAction({
              type: document.status === "HIDDEN" ? "unhide" : "hide",
              document,
            })
          }
        >
          {document.status === "HIDDEN" ? "Khôi phục" : "Ẩn"}
        </Button>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
