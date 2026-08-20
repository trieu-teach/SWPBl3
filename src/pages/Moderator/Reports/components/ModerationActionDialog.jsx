import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

const ACTION_COPY = {
  hide: {
    title: "Xử lý và ẩn tài liệu",
    consequence:
      "Báo cáo sẽ được xử lý và tài liệu sẽ không còn khả dụng theo cách thông thường.",
    color: "warning",
  },
  resolve: {
    title: "Xử lý báo cáo",
    consequence: "Báo cáo sẽ được đóng mà không thay đổi trạng thái tài liệu.",
    color: "success",
  },
  dismiss: {
    title: "Bỏ qua báo cáo",
    consequence: "Báo cáo sẽ được đóng mà không thay đổi trạng thái tài liệu.",
    color: "primary",
  },
  delete: {
    title: "Xử lý và xóa tài liệu",
    consequence:
      "Tài liệu sẽ bị đánh dấu đã xóa. Hành động này xử lý báo cáo và thay đổi trạng thái tài liệu.",
    color: "error",
  },
};

export default function ModerationActionDialog({
  action,
  loading,
  onClose,
  onConfirm,
}) {
  if (!action) return null;
  const copy = ACTION_COPY[action.type];
  if (!copy) return null;

  return (
    <Dialog open onClose={loading ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>{copy.title}</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          Xác nhận thao tác với <strong>{action.documentTitle}</strong>?
        </Typography>
        <Alert
          severity={
            action.type === "delete"
              ? "error"
              : action.type === "hide"
                ? "warning"
                : "info"
          }
        >
          {copy.consequence}
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          variant="contained"
          color={copy.color}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Đang cập nhật..." : "Xác nhận"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
