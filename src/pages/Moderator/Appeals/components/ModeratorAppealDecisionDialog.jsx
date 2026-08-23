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

export default function ModeratorAppealDecisionDialog({ moderation }) {
  const [reviewNote, setReviewNote] = useState("");
  useEffect(() => setReviewNote(""), [moderation.decision]);
  if (!moderation.decision || !moderation.selectedAppeal) return null;
  const approving = moderation.decision === "APPROVED";

  return (
    <Dialog open onClose={moderation.acting ? undefined : () => moderation.setDecision(null)} fullWidth maxWidth="xs">
      <DialogTitle>{approving ? "Chấp nhận khiếu nại" : "Từ chối khiếu nại"}</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          Xác nhận xử lý khiếu nại <strong>{moderation.selectedAppeal.reason}</strong>?
        </Typography>
        <Alert severity={approving ? "success" : "warning"} sx={{ mb: 2 }}>
          {approving
            ? "Tài liệu sẽ được duyệt và có thể xuất hiện trong cộng đồng."
            : "Tài liệu tiếp tục bị từ chối và ẩn khỏi cộng đồng."}
        </Alert>
        <TextField
          label="Ghi chú xử lý (không bắt buộc)"
          value={reviewNote}
          onChange={(event) => setReviewNote(event.target.value.slice(0, 2000))}
          helperText={`${reviewNote.length}/2000`}
          multiline
          minRows={3}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => moderation.setDecision(null)} disabled={moderation.acting}>Hủy</Button>
        <Button
          variant="contained"
          color={approving ? "success" : "error"}
          disabled={moderation.acting}
          onClick={() => moderation.confirmDecision(reviewNote)}
        >
          {moderation.acting ? "Đang xử lý..." : "Xác nhận"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
