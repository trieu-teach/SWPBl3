import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";

export default function UserRoleDialog({ user, loading, onClose, onConfirm }) {
  const [role, setRole] = useState("USER");

  useEffect(() => {
    setRole(user?.role === "MODERATOR" ? "MODERATOR" : "USER");
  }, [user]);

  if (!user) return null;

  const unchanged = role === user.role;

  return (
    <Dialog
      open
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>Thay đổi vai trò</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          Chọn vai trò mới cho <strong>{user.email}</strong>.
        </Typography>

        <Alert severity="info" sx={{ mb: 2 }}>
          Kiểm duyệt viên có thể xử lý và kiểm duyệt tài liệu cộng đồng.
        </Alert>

        <FormControl>
          <RadioGroup
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <FormControlLabel
              value="USER"
              control={<Radio />}
              label="Người dùng"
            />
            <FormControlLabel
              value="MODERATOR"
              control={<Radio />}
              label="Kiểm duyệt viên"
            />
          </RadioGroup>
        </FormControl>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={() => onConfirm(role)}
          disabled={loading || unchanged}
        >
          {loading ? "Đang cập nhật..." : "Xác nhận"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
