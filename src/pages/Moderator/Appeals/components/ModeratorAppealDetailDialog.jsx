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
  Typography,
} from "@mui/material";
import {
  canDecideAppeal,
  getModeratorAppealSourceLabel,
  getModeratorAppealStatus,
} from "../utils/moderator-appeal-status.js";

function Field({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography sx={{ overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>
        {value || "—"}
      </Typography>
    </Box>
  );
}

export default function ModeratorAppealDetailDialog({ moderation }) {
  const appeal = moderation.selectedAppeal;
  if (!appeal) return null;
  const status = getModeratorAppealStatus(appeal.status);
  const canDecide = canDecideAppeal(appeal);

  return (
    <Dialog open onClose={moderation.acting ? undefined : moderation.closeDetail} fullWidth maxWidth="md">
      <DialogTitle>Chi tiết khiếu nại</DialogTitle>
      <DialogContent dividers>
        <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
          <Typography variant="h6" fontWeight={750}>{appeal.reason || "Khiếu nại tài liệu"}</Typography>
          <Chip size="small" label={status.label} color={status.color} />
        </Stack>
        <Typography color="text.secondary" sx={{ mt: 1, whiteSpace: "pre-wrap" }}>
          {appeal.description || "Người dùng không cung cấp mô tả bổ sung."}
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mt: 3 }}>
          <Field label="Mã khiếu nại" value={appeal.id} />
          <Field label="Mã người gửi" value={appeal.userId} />
          <Field
            label="Nguồn khiếu nại"
            value={getModeratorAppealSourceLabel(appeal.source)}
          />
          <Field label="Ngày gửi" value={appeal.createdAt ? new Date(appeal.createdAt).toLocaleString("vi-VN") : "—"} />
          {appeal.reviewNote && <Field label="Ghi chú xử lý" value={appeal.reviewNote} />}
        </Box>

        <Divider sx={{ my: 3 }} />
        <Typography fontWeight={750} sx={{ mb: 2 }}>Tài liệu liên quan</Typography>
        {moderation.detailLoading ? (
          <Stack direction="row" gap={1.5} alignItems="center">
            <CircularProgress size={22} />
            <Typography color="text.secondary">Đang tải tài liệu...</Typography>
          </Stack>
        ) : moderation.detailError ? (
          <Alert severity="error">{moderation.detailError}</Alert>
        ) : moderation.document ? (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <Field label="Tên tài liệu" value={moderation.document.title} />
            <Field label="Tên tệp" value={moderation.document.fileName} />
            <Field label="Người đăng" value={`${moderation.document.owner?.fullName || "—"} · ${moderation.document.owner?.email || "—"}`} />
            <Field label="Trạng thái kiểm duyệt" value={moderation.document.moderationStatus} />
            <Box sx={{ gridColumn: "1 / -1" }}>
              <Field label="Lý do từ chối trước đó" value={moderation.document.rejectionReason} />
            </Box>
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ flexWrap: "wrap" }}>
        <Button onClick={moderation.openPreview} disabled={!moderation.document || moderation.acting}>
          Xem file
        </Button>
        {canDecide && (
          <>
            <Button color="success" disabled={moderation.acting} onClick={() => moderation.setDecision("APPROVED")}>
              Chấp nhận
            </Button>
            <Button color="error" disabled={moderation.acting} onClick={() => moderation.setDecision("REJECTED")}>
              Từ chối
            </Button>
          </>
        )}
        <Button onClick={moderation.closeDetail} disabled={moderation.acting}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
