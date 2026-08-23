import { useState } from "react";
import {
  Alert,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import GavelOutlined from "@mui/icons-material/GavelOutlined";
import { getDocumentAppealState } from "../../../../lib/moderation.js";

function formatDeadline(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "thời hạn được hệ thống cho phép"
    : date.toLocaleString("vi-VN");
}

export default function DocumentAppealForm({ document, loading, onSubmit }) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [validationError, setValidationError] = useState("");

  if (getDocumentAppealState(document) !== "available") return null;

  async function handleSubmit(event) {
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
    }
  }

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      variant="outlined"
      sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, mb: 3 }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <GavelOutlined color="warning" />
        <Typography variant="h6" fontWeight={750}>
          Gửi khiếu nại
        </Typography>
      </Stack>
      <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
        Hãy giải thích vì sao quyết định kiểm duyệt cần được xem xét lại. Không
        cần nêu hoặc đoán từ khóa máy quét.
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Hạn gửi: {formatDeadline(document.appealDeadline)}
      </Alert>
      <Stack spacing={2}>
        <TextField
          required
          label="Lý do khiếu nại"
          value={reason}
          onChange={(event) => {
            setReason(event.target.value.slice(0, 500));
            if (validationError) setValidationError("");
          }}
          error={Boolean(validationError)}
          helperText={validationError || `${reason.length}/500`}
          disabled={loading}
        />
        <TextField
          multiline
          minRows={4}
          label="Mô tả bổ sung (không bắt buộc)"
          value={description}
          onChange={(event) =>
            setDescription(event.target.value.slice(0, 2000))
          }
          helperText={`${description.length}/2000`}
          disabled={loading}
        />
        <Button
          type="submit"
          variant="contained"
          color="warning"
          disabled={loading || reason.trim().length < 3}
          sx={{ alignSelf: "flex-start" }}
        >
          {loading ? "Đang gửi..." : "Gửi khiếu nại"}
        </Button>
      </Stack>
    </Paper>
  );
}
