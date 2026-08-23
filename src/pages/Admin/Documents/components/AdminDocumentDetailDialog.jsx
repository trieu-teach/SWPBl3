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
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  canDecideDocumentModeration,
  canHideModeratedDocument,
  canUnhideModeratedDocument,
  getDocumentModerationFlagPresentation,
  getDocumentModerationStatusPresentation,
  normalizeModerationKeyword,
} from "../../../../lib/moderation.js";

const CONTEXT_FIELD_LABELS = {
  title: "Tiêu đề",
  description: "Mô tả",
  extractedText: "Nội dung tài liệu",
};

function formatDate(value, fallback = "—") {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? fallback
    : date.toLocaleString("vi-VN");
}

function getMatchedKeywordName(value) {
  if (typeof value === "string") return value;
  return value?.keyword || "";
}

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
export default function AdminDocumentDetailDialog({
  document,
  acting,
  claimed,
  moderationKeywordIds,
  onClose,
  onPreview,
  onAction,
  onClaim,
  onExceptKeyword,
}) {
  if (!document) return null;

  const canDecide = canDecideDocumentModeration(document);
  const canHide = canHideModeratedDocument(document);
  const canUnhide = canUnhideModeratedDocument(document);
  const moderationStatus = getDocumentModerationStatusPresentation(
    document.moderationStatus,
  );
  const moderationFlag = getDocumentModerationFlagPresentation(
    document.moderationFlag,
  );
  const matchedKeywords = Array.isArray(document.matchedKeywords)
    ? document.matchedKeywords.filter(getMatchedKeywordName)
    : [];
  const matchedContexts = Array.isArray(document.matchedContexts)
    ? document.matchedContexts
    : [];

  return (
    <Dialog
      open
      onClose={acting ? undefined : onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>Chi tiết tài liệu</DialogTitle>
      <DialogContent dividers>
        <Typography variant="h6" fontWeight={750}>
          {document.title}
        </Typography>
        <Typography color="text.secondary">{document.fileName}</Typography>
        <Stack direction="row" gap={1} flexWrap="wrap" sx={{ my: 2 }}>
          <Chip
            size="small"
            color={
              document.visibility === "PUBLIC" ? "success" : "secondary"
            }
            variant="outlined"
            label={document.visibility === "PUBLIC" ? "Công khai" : "Riêng tư"}
          />
          <Chip
            size="small"
            label={moderationStatus.label}
            color={moderationStatus.color}
          />
          {document.moderationFlag && (
            <Chip
              size="small"
              label={`Máy quét: ${moderationFlag.label}`}
              color={moderationFlag.color}
              variant="outlined"
            />
          )}
          {document.severityBand && (
            <Chip
              size="small"
              label={`Mức độ: ${document.severityBand}`}
              color={
                ["HIGH", "CRITICAL"].includes(document.severityBand)
                  ? "error"
                  : "warning"
              }
              variant="outlined"
            />
          )}
          <Chip
            size="small"
            label={document.status === "HIDDEN" ? "Đã ẩn" : "Hoạt động"}
            color={document.status === "HIDDEN" ? "error" : "success"}
            variant="outlined"
          />
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
            value={`${document.owner?.fullName || ""} (${document.owner?.email || ""})`}
          />
          <Field
            label="Môn học · Danh mục"
            value={`${document.subject?.name || "—"} · ${document.category?.name || "—"}`}
          />
          <Field
            label="Dung lượng"
            value={`${Math.ceil(Number(document.fileSize || 0) / 1024)} KB`}
          />
          <Field label="Trạng thái AI" value={document.aiStatus} />
          <Field
            label="Ngày tải lên"
            value={formatDate(document.createdAt)}
          />
          <Field
            label="Ngày kiểm duyệt"
            value={formatDate(document.reviewedAt, "Chưa kiểm duyệt")}
          />
          {document.appealDeadline && (
            <Field
              label="Hạn khiếu nại"
              value={formatDate(document.appealDeadline)}
            />
          )}
          <Box sx={{ gridColumn: "1 / -1" }}>
            <Field label="Mô tả" value={document.description} />
          </Box>
          {document.rejectionReason && (
            <Box sx={{ gridColumn: "1 / -1" }}>
              <Field label="Lý do từ chối" value={document.rejectionReason} />
            </Box>
          )}
        </Box>

        {canDecide && (
          <Alert severity={claimed ? "success" : "info"} sx={{ mt: 3 }}>
            {claimed
              ? "Bạn đang giữ tài liệu này để xử lý. Khóa tự hết hạn sau 30 phút."
              : "Hãy nhận xử lý trước khi duyệt, từ chối hoặc tạo ngoại lệ từ khóa."}
          </Alert>
        )}

        {matchedKeywords.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle1" fontWeight={750} sx={{ mb: 1 }}>
              Từ khóa máy quét phát hiện
            </Typography>
            <Stack spacing={1}>
              {matchedKeywords.map((match, index) => {
                const keyword = getMatchedKeywordName(match);
                const keywordId =
                  match?.id ||
                  moderationKeywordIds?.[normalizeModerationKeyword(keyword)];

                return (
                  <Paper
                    key={`${keyword}-${index}`}
                    variant="outlined"
                    sx={{ p: 1.5, borderRadius: 2 }}
                  >
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      alignItems={{ sm: "center" }}
                      justifyContent="space-between"
                      gap={1}
                    >
                      <Typography fontWeight={700}>{keyword}</Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={!claimed || !keywordId || acting}
                        title={
                          !keywordId
                            ? "Không tìm thấy mã từ khóa đang hoạt động."
                            : undefined
                        }
                        onClick={() => onExceptKeyword(keywordId)}
                      >
                        Bỏ qua từ khóa này
                      </Button>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          </Box>
        )}

        {matchedContexts.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight={750} sx={{ mb: 1 }}>
              Vị trí khớp trong tài liệu
            </Typography>
            <Stack spacing={1}>
              {matchedContexts.map((context, index) => (
                <Paper
                  key={`${context.keyword}-${context.field}-${index}`}
                  variant="outlined"
                  sx={{ p: 1.5, borderRadius: 2 }}
                >
                  <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 1 }}>
                    <Chip size="small" label={context.keyword || "Từ khóa"} />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={CONTEXT_FIELD_LABELS[context.field] || context.field}
                    />
                  </Stack>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
                  >
                    {context.excerpt || "Không có đoạn trích."}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ flexWrap: "wrap" }}>
        <Button onClick={() => onPreview(document)} disabled={acting}>
          Xem file
        </Button>
        {canDecide && !claimed && (
          <Button
            variant="contained"
            onClick={() => onClaim(document)}
            disabled={acting}
          >
            {acting ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Nhận xử lý"
            )}
          </Button>
        )}
        {canDecide && claimed && (
          <>
            <Button
              color="success"
              disabled={acting}
              onClick={() => onAction({ type: "approve", document })}
            >
              Duyệt
            </Button>
            <Button
              color="error"
              disabled={acting}
              onClick={() => onAction({ type: "reject", document })}
            >
              Từ chối
            </Button>
          </>
        )}
        {canHide && (
          <Button
            color="error"
            disabled={acting}
            onClick={() => onAction({ type: "hide", document })}
          >
            Ẩn
          </Button>
        )}
        {canUnhide && (
          <Button
            color="success"
            disabled={acting}
            onClick={() => onAction({ type: "unhide", document })}
          >
            Khôi phục
          </Button>
        )}
        <Button onClick={onClose} disabled={acting}>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
