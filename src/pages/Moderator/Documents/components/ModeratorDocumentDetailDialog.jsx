import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  canModeratorDecide,
  getModeratorDocumentStatus,
} from "../utils/moderator-document-status.js";

const FIELD_LABEL = {
  title: "Tiêu đề",
  description: "Mô tả",
  extractedText: "Nội dung tài liệu",
};

function Field({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography sx={{ overflowWrap: "anywhere" }}>{value || "—"}</Typography>
    </Box>
  );
}

export default function ModeratorDocumentDetailDialog({ moderation }) {
  const document = moderation.detail;
  if (!document) return null;

  const status = getModeratorDocumentStatus(document.moderationStatus);
  const canDecide = canModeratorDecide(document);
  const claimed = moderation.claimedDocumentId === document.id;
  const contexts = Array.isArray(document.matchedContexts)
    ? document.matchedContexts
    : [];

  return (
    <Dialog
      open
      onClose={moderation.acting ? undefined : () => moderation.setDetail(null)}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>Chi tiết kiểm duyệt</DialogTitle>
      <DialogContent dividers>
        <Typography variant="h6" fontWeight={750}>
          {document.title}
        </Typography>
        <Typography color="text.secondary">{document.fileName}</Typography>
        <Stack direction="row" gap={1} flexWrap="wrap" sx={{ my: 2 }}>
          <Chip size="small" label={status.label} color={status.color} />
          {document.severityBand && (
            <Chip
              size="small"
              label={`Mức độ ${document.severityBand}`}
              color={
                ["HIGH", "CRITICAL"].includes(document.severityBand)
                  ? "error"
                  : "warning"
              }
              variant="outlined"
            />
          )}
        </Stack>

        <Divider sx={{ mb: 2 }} />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <Field
            label="Người đăng"
            value={`${document.owner?.fullName || "—"} · ${document.owner?.email || "—"}`}
          />
          <Field
            label="Môn học · Danh mục"
            value={`${document.subject?.name || "—"} · ${document.category?.name || "—"}`}
          />
          <Field label="Trạng thái tài liệu" value={document.status} />
          <Field label="Trạng thái quét" value={document.moderationFlag} />
          <Box sx={{ gridColumn: "1 / -1" }}>
            <Field label="Mô tả" value={document.description} />
          </Box>
        </Box>

        {contexts.length > 0 && (
          <Paper variant="outlined" sx={{ mt: 3, p: 2, borderRadius: 3 }}>
            <Typography fontWeight={750}>Nội dung bị phát hiện</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Moderator chỉ xem kết quả quét, không được tạo ngoại lệ từ khóa.
            </Typography>
            <Stack gap={1.25} sx={{ mt: 2 }}>
              {contexts.map((context, index) => (
                <Box
                  key={`${context.keyword}-${context.field}-${index}`}
                  sx={{ p: 1.25, border: "1px solid", borderColor: "divider", borderRadius: 2 }}
                >
                  <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                    <Chip size="small" color="warning" label={context.keyword} />
                    <Typography variant="caption" color="text.secondary">
                      {FIELD_LABEL[context.field] || context.field}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ mt: 1, overflowWrap: "anywhere" }}>
                    {context.excerpt}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        )}

        {document.ownerReview && (
          <Alert severity="warning" sx={{ mt: 3 }}>
            Chủ tài liệu có {Object.values(document.ownerReview.documentCounts || {}).reduce(
              (total, count) => total + Number(count || 0),
              0,
            )} tài liệu công khai được ghi nhận. Moderator không có quyền khóa tài khoản.
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ flexWrap: "wrap" }}>
        <Button onClick={() => moderation.openPreview(document)}>Xem file</Button>
        {canDecide && !claimed && (
          <Button
            variant="contained"
            onClick={moderation.claimDetail}
            disabled={moderation.acting}
          >
            Nhận xử lý
          </Button>
        )}
        {canDecide && (
          <>
            <Button
              color="success"
              disabled={!claimed || moderation.acting}
              onClick={() => moderation.setAction({ type: "approve", document })}
            >
              Duyệt
            </Button>
            <Button
              color="error"
              disabled={!claimed || moderation.acting}
              onClick={() => moderation.setAction({ type: "reject", document })}
            >
              Từ chối
            </Button>
          </>
        )}
        <Button
          onClick={() => moderation.setDetail(null)}
          disabled={moderation.acting}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
