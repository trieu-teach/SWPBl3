import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { SendOutlined } from "@mui/icons-material";

const APPEALABLE_STATUSES = ["REJECTED", "AUTO_BLOCKED"];

function getAppealDeadline(value) {
  if (!value) return null;

  const deadline = new Date(value);
  return Number.isNaN(deadline.getTime()) ? null : deadline;
}

export default function DocumentAppealForm({
  document,
  loading,
  onSubmit,
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [validationError, setValidationError] = useState("");

  const deadline = getAppealDeadline(document?.appealDeadline);
  const isKeywordModerationAppeal = APPEALABLE_STATUSES.includes(
    document?.moderationStatus,
  );
  const isCommunityReportAppeal =
    document?.status === "HIDDEN" &&
    !isKeywordModerationAppeal &&
    Boolean(deadline);

  if (
    document?.visibility !== "PUBLIC" ||
    (!isKeywordModerationAppeal && !isCommunityReportAppeal)
  ) {
    return null;
  }

  const canAppeal = Boolean(deadline && deadline.getTime() > Date.now());

  function closeDialog() {
    if (loading) return;
    setOpen(false);
    setValidationError("");
  }

  async function submit(event) {
    event.preventDefault();
    const normalizedReason = reason.trim();

    if (normalizedReason.length < 3) {
      setValidationError("Lý do khiếu nại phải có ít nhất 3 ký tự.");
      return;
    }

    setValidationError("");
    const submitted = await onSubmit(normalizedReason, description.trim());

    if (submitted) {
      setReason("");
      setDescription("");
      setOpen(false);
    }
  }

  return (
    <Stack spacing={1} sx={{ mt: 2 }}>
      {canAppeal && isCommunityReportAppeal && (
        <Alert severity="warning">
          Tài liệu đã bị ẩn sau khi được cộng đồng báo cáo. Bạn có thể gửi
          khiếu nại trước {deadline.toLocaleString("vi-VN")}.
        </Alert>
      )}
      {!canAppeal && (
        <Alert severity="warning">
          Đã hết thời hạn gửi khiếu nại cho quyết định này.
        </Alert>
      )}
      <Button
        fullWidth
        variant="outlined"
        color="warning"
        startIcon={<SendOutlined />}
        onClick={() => setOpen(true)}
        disabled={!canAppeal || loading}
      >
        {isCommunityReportAppeal
          ? "Khiếu nại quyết định ẩn"
          : "Gửi khiếu nại"}
      </Button>

      <Dialog
        open={open}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
        component="form"
        onSubmit={submit}
      >
        <DialogTitle>Gửi khiếu nại tài liệu</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {isCommunityReportAppeal
              ? `Hãy giải thích vì sao tài liệu “${document.title}” nên được khôi phục sau báo cáo cộng đồng.`
              : `Hãy giải thích vì sao tài liệu “${document.title}” cần được xem xét lại.`}
          </Typography>
          {deadline && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Thời hạn gửi: {deadline.toLocaleString("vi-VN")}
            </Alert>
          )}
          {validationError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {validationError}
            </Alert>
          )}
          <Stack spacing={2}>
            <TextField
              autoFocus
              required
              fullWidth
              multiline
              minRows={3}
              label="Lý do khiếu nại"
              value={reason}
              onChange={(event) => {
                setReason(event.target.value.slice(0, 500));
                if (validationError) setValidationError("");
              }}
              helperText={`${reason.length}/500 · Tối thiểu 3 ký tự`}
              disabled={loading}
            />
            <TextField
              fullWidth
              multiline
              minRows={4}
              label="Thông tin bổ sung (không bắt buộc)"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value.slice(0, 2000))
              }
              helperText={`${description.length}/2000`}
              disabled={loading}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi khiếu nại"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
