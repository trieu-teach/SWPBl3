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
  dismiss: {
    title: "Bỏ qua báo cáo",
    message: "Báo cáo sẽ được đóng mà không thay đổi tài liệu.",
    color: "warning",
  },
  resolve: {
    title: "Đánh dấu đã xử lý",
    message: "Báo cáo sẽ được đóng mà không thay đổi tài liệu.",
    color: "success",
  },
  hide: {
    title: "Ẩn tài liệu",
    message:
      "Tài liệu sẽ bị ẩn khỏi cộng đồng. Chủ tài liệu có 7 ngày để khiếu nại.",
    color: "warning",
  },
  delete: {
    title: "Xóa mềm tài liệu",
    message:
      "Tài liệu sẽ bị xóa mềm và không thể khôi phục thông qua khiếu nại.",
    color: "error",
  },
};

export default function AdminReportActionDialog({
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
          {copy.message}
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
