import { Link } from "react-router-dom";
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
  getAppealSourceLabel,
  getUserAppealStatus,
} from "../utils/user-appeal-status.js";

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

export default function DocumentAppealDetailDialog({ appeals }) {
  const appeal = appeals.selectedAppeal;
  if (!appeal) return null;
  const status = getUserAppealStatus(appeal.status);

  return (
    <Dialog open onClose={appeals.closeDetail} fullWidth maxWidth="sm">
      <DialogTitle>Chi tiết khiếu nại</DialogTitle>
      <DialogContent dividers>
        <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
          <Typography variant="h6" fontWeight={750}>{appeal.reason}</Typography>
          <Chip size="small" label={status.label} color={status.color} />
        </Stack>
        <Typography color="text.secondary" sx={{ mt: 1, whiteSpace: "pre-wrap" }}>
          {appeal.description || "Bạn không cung cấp mô tả bổ sung."}
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mt: 3 }}>
          <Field label="Nguồn" value={getAppealSourceLabel(appeal.source)} />
          <Field label="Ngày gửi" value={appeal.createdAt ? new Date(appeal.createdAt).toLocaleString("vi-VN") : "—"} />
          {appeal.reviewedAt && (
            <Field label="Ngày xử lý" value={new Date(appeal.reviewedAt).toLocaleString("vi-VN")} />
          )}
          <Box sx={{ gridColumn: "1 / -1" }}>
            <Field
              label="Phản hồi của bộ phận kiểm duyệt"
              value={appeal.reviewNote || (appeal.status === "PENDING" ? "Chưa có phản hồi." : "Không có ghi chú bổ sung.")}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />
        <Typography fontWeight={750} sx={{ mb: 2 }}>Tài liệu liên quan</Typography>
        {appeals.detailLoading ? (
          <Stack direction="row" gap={1.5} alignItems="center">
            <CircularProgress size={22} />
            <Typography color="text.secondary">Đang tải tài liệu...</Typography>
          </Stack>
        ) : appeals.detailError ? (
          <Alert severity="warning">{appeals.detailError}</Alert>
        ) : appeals.document ? (
          <Stack gap={0.5}>
            <Typography fontWeight={700}>{appeals.document.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {appeals.document.fileName}
            </Typography>
          </Stack>
        ) : null}
      </DialogContent>
      <DialogActions>
        {appeals.document && (
          <Button component={Link} to={`/documents/${appeal.documentId}`}>
            Mở tài liệu
          </Button>
        )}
        <Button onClick={appeals.closeDetail}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
