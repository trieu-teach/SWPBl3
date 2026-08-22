import { useEffect, useState } from "react";
import {
  Button,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

export default function RenameSessionDialog({ open, session, loading, error, onClose, onConfirm }) {
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (open) setTitle(session?.title ?? "");
  }, [open, session]);

  function submit(event) {
    event.preventDefault();
    const normalized = title.trim();
    if (normalized) onConfirm?.(normalized);
  }

  return (
    <Dialog open={Boolean(open)} onClose={loading ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>Đổi tên cuộc trò chuyện</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          margin="dense"
          label="Tên cuộc trò chuyện"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          slotProps={{ htmlInput: { maxLength: 120 } }}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit(event);
          }}
        />
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Hủy</Button>
        <Button variant="contained" onClick={submit} disabled={loading || !title.trim()}>
          {loading ? "Đang lưu..." : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
