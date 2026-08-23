import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  canDecideDocumentAppeal,
  formatModerationDate,
  getDocumentModerationFlagPresentation,
  getDocumentModerationStatusPresentation,
} from "../../../../lib/moderation.js";

function Field({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography sx={{ overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

export default function AppealDecisionDialog({ appeals }) {
  const appeal = appeals.selectedAppeal;
  const document = appeals.document;
  const [reviewNote, setReviewNote] = useState("");

  useEffect(() => setReviewNote(""), [appeal]);
  if (!appeal) return null;

  const moderationStatus = getDocumentModerationStatusPresentation(
    document?.moderationStatus,
  );
  const moderationFlag = getDocumentModerationFlagPresentation(
    document?.moderationFlag,
  );
  const canDecide =
    canDecideDocumentAppeal(appeal) && Boolean(document) && !appeals.detailError;

  return (
    <Dialog
      open
      onClose={appeals.acting ? undefined : appeals.closeAppeal}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>Xem xét khiếu nại</DialogTitle>
      <DialogContent>
        <Typography variant="overline" color="text.secondary">
          Nội dung người dùng gửi
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <Field label="Lý do" value={appeal.reason} />
          <Field label="Thời điểm gửi" value={formatModerationDate(appeal.createdAt)} />
          <Box sx={{ gridColumn: "1 / -1" }}>
            <Field
              label="Mô tả bổ sung"
              value={appeal.description || "Không có mô tả bổ sung"}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />
        <Typography variant="overline" color="text.secondary">
          Tài liệu liên quan
        </Typography>

        {appeals.detailLoading && (
          <Stack direction="row" alignItems="center" gap={1.5} sx={{ py: 3 }}>
            <CircularProgress size={22} />
            <Typography color="text.secondary">Đang tải chi tiết tài liệu...</Typography>
          </Stack>
        )}

        {appeals.detailError && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" onClick={appeals.retryDetail}>
                Thử lại
              </Button>
            }
            sx={{ my: 2 }}
          >
            {appeals.detailError}
          </Alert>
        )}

        {document && (
          <>
            <Typography variant="h6" fontWeight={750} sx={{ mb: 1.5 }}>
              {document.title}
            </Typography>
            <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
              <Chip
                size="small"
                label={moderationStatus.label}
                color={moderationStatus.color}
              />
              <Chip
                size="small"
                variant="outlined"
                label={moderationFlag.label}
                color={moderationFlag.color}
              />
              <Chip size="small" variant="outlined" label={document.status} />
            </Stack>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              <Field
                label="Người đăng"
                value={
                  document.owner
                    ? `${document.owner.fullName || "—"} (${document.owner.email || "—"})`
                    : appeal.userId
                }
              />
              <Field label="Tên tệp" value={document.fileName} />
              <Field label="Lý do kiểm duyệt" value={document.rejectionReason} />
              <Field label="Hạn khiếu nại" value={formatModerationDate(document.appealDeadline)} />
              <Box sx={{ gridColumn: "1 / -1" }}>
                <Field label="Mô tả tài liệu" value={document.description} />
              </Box>
            </Box>
          </>
        )}

        {canDecide && (
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Ghi chú xử lý (không bắt buộc)"
            value={reviewNote}
            onChange={(event) => setReviewNote(event.target.value)}
            inputProps={{ maxLength: 2000 }}
            helperText={`${reviewNote.length}/2000 ký tự`}
            disabled={appeals.acting}
            sx={{ mt: 3 }}
          />
        )}

        {!canDecideDocumentAppeal(appeal) && (
          <Alert severity="info" sx={{ mt: 3 }}>
            Khiếu nại này đã rời hàng chờ và chỉ còn ở chế độ xem.
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={appeals.closeAppeal} disabled={appeals.acting}>
          Đóng
        </Button>
        {canDecide && (
          <>
            <Button
              color="error"
              onClick={() => appeals.decideAppeal("REJECTED", reviewNote)}
              disabled={appeals.acting}
            >
              Từ chối
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => appeals.decideAppeal("APPROVED", reviewNote)}
              disabled={appeals.acting}
            >
              {appeals.acting ? "Đang cập nhật..." : "Chấp nhận và khôi phục"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
