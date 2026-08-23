import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export default function DeactivatePlanDialog({
  plan,
  loading,
  onClose,
  onConfirm,
}) {
  return (
    <Dialog
      open={Boolean(plan)}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Ngừng cung cấp gói?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Gói <strong>{plan?.name}</strong> sẽ không còn xuất hiện để người dùng
          đăng ký. Dữ liệu và lịch sử thanh toán hiện có vẫn được giữ nguyên.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Ngừng cung cấp"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
