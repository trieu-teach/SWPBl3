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
    title: "Ẩn tài liệu",
    consequence:
      "Báo cáo sẽ được đóng, tài liệu bị ẩn khỏi cộng đồng và chủ tài liệu có 7 ngày để khiếu nại.",
    color: "warning",
  },
  delete: {
    title: "Xóa mềm tài liệu",
    consequence:
      "Báo cáo sẽ được đóng và tài liệu bị xóa mềm. Chủ tài liệu không thể khiếu nại để khôi phục.",
    color: "error",
  },
  resolve: {
    title: "Đánh dấu đã xử lý",
    consequence: "Báo cáo sẽ được đóng. Trạng thái tài liệu không tự động thay đổi.",
    color: "success",
  },
  dismiss: {
    title: "Bỏ qua báo cáo",
    consequence: "Báo cáo sẽ được đóng mà không thay đổi trạng thái tài liệu.",
    color: "warning",
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
