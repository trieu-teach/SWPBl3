import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";

const ACTION_COPY = {
  hide: {
    title: "Ẩn tài liệu",
    consequence: "Tài liệu sẽ bị ẩn khỏi cộng đồng. Báo cáo vẫn cần được xử lý riêng.",
    color: "error",
  },
  unhide: {
    title: "Khôi phục tài liệu",
    consequence: "Tài liệu sẽ hoạt động trở lại theo trạng thái công khai hiện tại.",
    color: "success",
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
  const [reason, setReason] = useState("");
  useEffect(() => setReason(""), [action]);
  if (!action) return null;
  const copy = ACTION_COPY[action.type];
  const acceptsReason = action.type === "hide" || action.type === "unhide";

  return (
    <Dialog open onClose={loading ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>{copy.title}</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          Xác nhận thao tác với <strong>{action.documentTitle}</strong>?
        </Typography>
        <Alert severity={action.type === "hide" ? "warning" : "info"} sx={{ mb: 2 }}>
          {copy.consequence}
        </Alert>
        {acceptsReason && (
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Lý do (không bắt buộc)"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            disabled={loading}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          variant="contained"
          color={copy.color}
          onClick={() => onConfirm(reason.trim())}
          disabled={loading}
        >
          {loading ? "Đang cập nhật..." : "Xác nhận"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
