import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export default function DeleteSessionDialog({ open, session, loading, error, onClose, onConfirm }) {
  return (
    <Dialog open={Boolean(open)} onClose={loading ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>Xóa cuộc trò chuyện?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Cuộc trò chuyện “{session?.title || "Chat mới"}” và toàn bộ lịch sử liên quan sẽ bị xóa.
        </DialogContentText>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Hủy</Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={loading}>
          {loading ? "Đang xóa..." : "Xóa"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
