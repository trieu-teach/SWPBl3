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

export default function ModeratorDecisionDialog({ moderation }) {
  const [reason, setReason] = useState("");
  const action = moderation.action;

  useEffect(() => setReason(""), [action]);
  if (!action) return null;

  const rejecting = action.type === "reject";

  return (
    <Dialog
      open
      onClose={moderation.acting ? undefined : () => moderation.setAction(null)}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>{rejecting ? "Từ chối tài liệu" : "Duyệt tài liệu"}</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          Xác nhận thao tác với <strong>{action.document.title}</strong>?
        </Typography>
        <Alert severity={rejecting ? "warning" : "success"} sx={{ mb: 2 }}>
          {rejecting
            ? "Tài liệu sẽ bị ẩn và chủ tài liệu có thể khiếu nại trong thời hạn backend quy định."
            : "Tài liệu sẽ được phép xuất hiện trong cộng đồng."}
        </Alert>
        {rejecting && (
          <TextField
            label="Lý do từ chối *"
            value={reason}
            onChange={(event) => setReason(event.target.value.slice(0, 500))}
            helperText={`${reason.length}/500 · Tối thiểu 3 ký tự`}
            error={reason.length > 0 && reason.trim().length < 3}
            multiline
            minRows={3}
            fullWidth
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => moderation.setAction(null)}
          disabled={moderation.acting}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          color={rejecting ? "error" : "success"}
          onClick={() => moderation.confirmDecision(reason)}
          disabled={
            moderation.acting || (rejecting && reason.trim().length < 3)
          }
        >
          {moderation.acting ? "Đang xử lý..." : "Xác nhận"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
