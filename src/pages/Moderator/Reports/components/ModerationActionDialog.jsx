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
    title: "Ẩn tạm thời tài liệu",
    consequence:
      "Báo cáo sẽ được đóng, tài liệu bị ẩn khỏi cộng đồng và chủ tài liệu có 7 ngày để khiếu nại.",
    color: "warning",
  },
  delete: {
    title: "Xóa tài liệu",
    consequence:
      "Báo cáo sẽ được đóng và tài liệu bị xóa mềm. Chủ tài liệu không thể khiếu nại để khôi phục.",
    color: "error",
  },
  dismiss: {
    title: "Xác nhận không vi phạm",
    consequence:
      "Báo cáo sẽ được kết luận là không hợp lệ và tài liệu được giữ nguyên.",
    color: "success",
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
          sx={{ mb: 2 }}
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
