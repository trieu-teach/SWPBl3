import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  REPORT_REASONS,
  REPORT_REASON_OPTIONS,
} from "../../../../lib/moderation.js";

export default function ReportDocumentDialog({
  document,
  loading,
  error,
  reported,
  onClose,
  onSubmit,
}) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setReason("");
    setDescription("");
  }, [document]);

  if (!document) return null;

  function submit(event) {
    event.preventDefault();
    if (
      loading ||
      reported ||
      !REPORT_REASONS.includes(reason) ||
      description.trim().length > 2000
    ) {
      return;
    }
    onSubmit({
      reason,
      ...(description.trim() ? { description: description.trim() } : {}),
    });
  }

  return (
    <Dialog
      open
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      component="form"
      onSubmit={submit}
    >
      <DialogTitle>Báo cáo tài liệu</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Typography>
            Bạn đang báo cáo <strong>{document.title}</strong>. Báo cáo sẽ được
            gửi đến đội ngũ kiểm duyệt.
          </Typography>
          {error && (
            <Alert severity={reported ? "warning" : "error"}>
              {error}
            </Alert>
          )}
          <FormControl fullWidth required>
            <InputLabel id="report-reason-label">Lý do</InputLabel>
            <Select
              labelId="report-reason-label"
              label="Lý do"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              disabled={loading || reported}
            >
              {REPORT_REASON_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Mô tả thêm (không bắt buộc)"
            multiline
            minRows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value.slice(0, 2000))}
            helperText={`${description.length}/2000`}
            disabled={loading || reported}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || reported || !REPORT_REASONS.includes(reason)}
        >
          {loading ? "Đang gửi..." : "Gửi báo cáo"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
