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
  const isUserReportAppeal =
    moderation.selectedAppeal.source === "USER_REPORT";
  const reviewNoteRequired = isUserReportAppeal && !approving;
  const missingReviewNote = reviewNoteRequired && !reviewNote.trim();

  const decisionMessage = approving
    ? isUserReportAppeal
      ? "Khiếu nại sẽ được chấp nhận. Tài liệu chỉ xuất hiện lại nếu không còn bị giữ bởi lý do kiểm duyệt hoặc bản quyền khác."
      : "Khiếu nại sẽ được chấp nhận và tài liệu được cập nhật theo kết quả kiểm duyệt."
    : isUserReportAppeal
      ? "Tài liệu tiếp tục bị ẩn. Người dùng không thể khiếu nại lại cùng báo cáo này."
      : "Tài liệu tiếp tục bị từ chối và ẩn khỏi cộng đồng.";

  return (
    <Dialog open onClose={moderation.acting ? undefined : () => moderation.setDecision(null)} fullWidth maxWidth="xs">
      <DialogTitle>{approving ? "Chấp nhận khiếu nại" : "Từ chối khiếu nại"}</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          Xác nhận xử lý khiếu nại <strong>{moderation.selectedAppeal.reason}</strong>?
        </Typography>
        <Alert severity={approving ? "success" : "warning"} sx={{ mb: 2 }}>
          {decisionMessage}
        </Alert>
        <TextField
          label={
            reviewNoteRequired
              ? "Ghi chú xử lý *"
              : "Ghi chú xử lý (không bắt buộc)"
          }
          value={reviewNote}
          onChange={(event) => setReviewNote(event.target.value.slice(0, 2000))}
          required={reviewNoteRequired}
          error={missingReviewNote}
          helperText={
            reviewNoteRequired
              ? `Bắt buộc khi từ chối khiếu nại báo cáo · ${reviewNote.length}/2000`
              : `${reviewNote.length}/2000`
          }
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
          disabled={moderation.acting || missingReviewNote}
          onClick={() => moderation.confirmDecision(reviewNote)}
        >
          {moderation.acting ? "Đang xử lý..." : "Xác nhận"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
