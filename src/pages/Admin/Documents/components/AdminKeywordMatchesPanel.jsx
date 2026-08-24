import { useMemo, useState } from "react";
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
  TextField,
  Typography,
} from "@mui/material";
import ReportProblemOutlined from "@mui/icons-material/ReportProblemOutlined";

const SEVERITY = {
  LOW: { label: "Thấp", color: "info" },
  MEDIUM: { label: "Trung bình", color: "warning" },
  HIGH: { label: "Cao", color: "error" },
  CRITICAL: { label: "Nghiêm trọng", color: "error" },
};

const FIELD_LABEL = {
  title: "Tiêu đề",
  description: "Mô tả",
  extractedText: "Nội dung tài liệu",
};

function getKeywordName(match) {
  return typeof match === "string" ? match : match?.keyword || "";
}

function normalizeKeyword(value) {
  return String(value || "").trim().toLocaleLowerCase("vi-VN");
}

export default function AdminKeywordMatchesPanel({
  document,
  keywordCatalog,
  claimed,
  loading,
  onAddException,
}) {
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState("");
  const matches = Array.isArray(document.matchedKeywords)
    ? document.matchedKeywords
    : [];
  const contexts = Array.isArray(document.matchedContexts)
    ? document.matchedContexts
    : [];
  const severity = SEVERITY[document.severityBand] || {
    label: document.severityBand || "Chưa xác định",
    color: "default",
  };

  const catalogByName = useMemo(
    () =>
      new Map(
        keywordCatalog.map((entry) => [
          normalizeKeyword(entry.keyword),
          entry,
        ]),
      ),
    [keywordCatalog],
  );

  if (!matches.length && !contexts.length) return null;

  function openException(match) {
    const name = getKeywordName(match);
    const catalogEntry = catalogByName.get(normalizeKeyword(name));
    const keywordId = match?.id || match?.keywordId || catalogEntry?.id;

    setSelected({ name, keywordId });
    setReason("");
  }

  function closeException() {
    if (loading) return;
    setSelected(null);
    setReason("");
  }

  async function submitException() {
    if (!selected?.keywordId) return;
    const succeeded = await onAddException(selected.keywordId, reason);
    if (succeeded) {
      setSelected(null);
      setReason("");
    }
  }

  return (
    <Paper variant="outlined" sx={{ mt: 3, p: 2.25, borderRadius: 3 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        gap={1.5}
      >
        <Box>
          <Stack direction="row" alignItems="center" gap={1}>
            <ReportProblemOutlined color="warning" />
            <Typography variant="subtitle1" fontWeight={750}>
              Nội dung cần kiểm tra
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Các kết quả do hệ thống dò từ khóa phát hiện.
          </Typography>
        </Box>
        <Chip
          size="small"
          label={`Mức độ: ${severity.label}`}
          color={severity.color}
          variant={document.severityBand === "CRITICAL" ? "filled" : "outlined"}
        />
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Stack gap={1.5}>
        {matches.map((match) => {
          const name = getKeywordName(match);
          const keywordContexts = contexts.filter(
            (context) =>
              normalizeKeyword(context?.keyword) === normalizeKeyword(name),
          );
          const catalogEntry = catalogByName.get(normalizeKeyword(name));
          const hasKeywordId = Boolean(
            match?.id || match?.keywordId || catalogEntry?.id,
          );

          return (
            <Box
              key={name}
              sx={{
                p: 1.5,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                gap={1}
              >
                <Chip label={name} color="warning" size="small" />
                <Button
                  size="small"
                  onClick={() => openException(match)}
                  disabled={!claimed || loading || !hasKeywordId}
                >
                  Bỏ qua từ khóa này
                </Button>
              </Stack>

              {keywordContexts.map((context, index) => (
                <Box key={`${name}-${context.field}-${index}`} sx={{ mt: 1.25 }}>
                  <Typography variant="caption" color="text.secondary">
                    {FIELD_LABEL[context.field] || context.field || "Vị trí khớp"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mt: 0.25, overflowWrap: "anywhere" }}
                  >
                    {context.excerpt || "Không có đoạn trích."}
                  </Typography>
                </Box>
              ))}

              {!claimed && (
                <Alert severity="info" sx={{ mt: 1.25, py: 0 }}>
                  Nhận xử lý tài liệu trước khi thêm ngoại lệ.
                </Alert>
              )}
              {claimed && !hasKeywordId && (
                <Alert severity="warning" sx={{ mt: 1.25, py: 0 }}>
                  Không tìm thấy mã từ khóa tương ứng từ backend.
                </Alert>
              )}
            </Box>
          );
        })}
      </Stack>

      <Dialog open={Boolean(selected)} onClose={closeException} fullWidth maxWidth="sm">
        <DialogTitle>Bỏ qua từ khóa “{selected?.name}”</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Ngoại lệ chỉ áp dụng cho tài liệu này. Backend sẽ quét lại ngay sau
            khi xác nhận.
          </Alert>
          <TextField
            label="Lý do"
            placeholder="Ví dụ: Từ khóa xuất hiện trong ngữ cảnh học thuật"
            value={reason}
            onChange={(event) => setReason(event.target.value.slice(0, 500))}
            helperText={`${reason.length}/500 · Không bắt buộc`}
            multiline
            minRows={3}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeException} disabled={loading}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={submitException}
            disabled={loading || !selected?.keywordId}
          >
            Xác nhận và quét lại
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
