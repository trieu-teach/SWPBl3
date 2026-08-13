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

export default function ModerationDialog({
  action,
  loading,
  onClose,
  onConfirm,
}) {
  const [reason, setReason] = useState("");
  useEffect(() => setReason(""), [action]);
  if (!action) return null;
  const required = action.type === "reject";
  const labels = {
    approve: "Duyệt tài liệu",
    reject: "Từ chối tài liệu",
    hide: "Ẩn tài liệu",
    unhide: "Khôi phục tài liệu",
  };
  return (
    <Dialog
      open
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>{labels[action.type]}</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          Xác nhận thao tác với <strong>{action.document.title}</strong>?
        </Typography>
        {action.type === "approve" && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Tài liệu sẽ xuất hiện trong thư viện cộng đồng.
          </Alert>
        )}
        <TextField
          fullWidth
          multiline
          minRows={3}
          required={required}
          label={required ? "Lý do từ chối" : "Lý do (không bắt buộc)"}
          value={reason}
          onChange={(event) => setReason(event.target.value.slice(0, 500))}
          helperText={`${reason.length}/500`}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          variant="contained"
          color={
            action.type === "reject" || action.type === "hide"
              ? "error"
              : "success"
          }
          disabled={loading || (required && !reason.trim())}
          onClick={() => onConfirm(reason)}
        >
          {loading ? "Đang cập nhật..." : "Xác nhận"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
