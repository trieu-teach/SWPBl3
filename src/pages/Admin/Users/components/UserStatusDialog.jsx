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

export default function UserStatusDialog({ user, loading, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  useEffect(() => setReason(""), [user]);
  if (!user) return null;
  const blocking = user.status === "ACTIVE";
  return (
    <Dialog open onClose={loading ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>{blocking ? "Khóa tài khoản" : "Mở khóa tài khoản"}</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          Bạn có chắc muốn {blocking ? "khóa" : "mở khóa"} tài khoản <strong>{user.email}</strong>?
        </Typography>
        {blocking && <Alert severity="warning" sx={{ mb: 2 }}>Người dùng sẽ không thể tiếp tục sử dụng hệ thống.</Alert>}
        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Lý do (không bắt buộc)"
          value={reason}
          onChange={(event) => setReason(event.target.value.slice(0, 500))}
          helperText={`${reason.length}/500`}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Hủy</Button>
        <Button variant="contained" color={blocking ? "error" : "success"} onClick={() => onConfirm(reason)} disabled={loading}>
          {loading ? "Đang cập nhật..." : "Xác nhận"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
