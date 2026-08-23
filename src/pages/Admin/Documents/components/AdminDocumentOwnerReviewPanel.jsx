import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import AccountCircleOutlined from "@mui/icons-material/AccountCircleOutlined";
import BlockOutlined from "@mui/icons-material/BlockOutlined";
import { ADMIN_MODERATION_STATUS } from "../utils/admin-document-status.js";

const STATUS_LABEL = {
  ACTIVE: "Hoạt động",
  BLOCKED: "Đã khóa",
  INACTIVE: "Chưa kích hoạt",
};

const ROLE_LABEL = {
  USER: "Người dùng",
  MODERATOR: "Kiểm duyệt viên",
  ADMIN: "Quản trị viên",
};

export default function AdminDocumentOwnerReviewPanel({
  document,
  loading,
  onBlockOwner,
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reason, setReason] = useState("");
  const ownerReview = document.ownerReview;

  if (!ownerReview) return null;

  const documentCounts = Object.entries(ownerReview.documentCounts || {}).filter(
    ([, count]) => Number(count) > 0,
  );
  const canBlock = ownerReview.canBan && ownerReview.status === "ACTIVE";

  function closeDialog() {
    if (loading) return;
    setConfirmOpen(false);
    setReason("");
  }

  async function submitBlock() {
    if (reason.trim().length < 3) return;
    const succeeded = await onBlockOwner(reason.trim());
    if (succeeded) {
      setConfirmOpen(false);
      setReason("");
    }
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        mt: 3,
        p: 2.25,
        borderRadius: 3,
        borderColor: "error.main",
        bgcolor: (theme) => alpha(theme.palette.error.main, 0.06),
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        gap={1.5}
      >
        <Stack direction="row" alignItems="center" gap={1.25}>
          <AccountCircleOutlined color="error" />
          <Box>
            <Typography variant="subtitle1" fontWeight={750}>
              Đánh giá chủ tài liệu
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Chỉ xuất hiện với tài liệu nghiêm trọng hoặc bị máy tự động chặn.
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" gap={1} flexWrap="wrap">
          <Chip
            size="small"
            label={ROLE_LABEL[ownerReview.role] || ownerReview.role}
            variant="outlined"
          />
          <Chip
            size="small"
            label={STATUS_LABEL[ownerReview.status] || ownerReview.status}
            color={ownerReview.status === "BLOCKED" ? "error" : "success"}
          />
        </Stack>
      </Stack>

      <Box sx={{ mt: 2 }}>
        <Typography fontWeight={700}>
          {document.owner?.fullName || "Người dùng"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {document.owner?.email || ownerReview.ownerId}
        </Typography>
      </Box>

      {documentCounts.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              sm: "repeat(3, minmax(0, 1fr))",
            },
            gap: 1,
            mt: 2,
          }}
        >
          {documentCounts.map(([status, count]) => (
            <Box
              key={status}
              sx={{
                p: 1.25,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                bgcolor: "background.paper",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {ADMIN_MODERATION_STATUS[status]?.label || status}
              </Typography>
              <Typography variant="h6" fontWeight={750}>
                {count}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {canBlock && (
        <Stack alignItems="flex-end" sx={{ mt: 2 }}>
          <Button
            color="error"
            variant="contained"
            startIcon={<BlockOutlined />}
            onClick={() => setConfirmOpen(true)}
          >
            Khóa tài khoản
          </Button>
        </Stack>
      )}

      {ownerReview.status === "BLOCKED" && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Tài khoản này đã bị khóa và không thể tiếp tục sử dụng hệ thống.
        </Alert>
      )}

      <Dialog open={confirmOpen} onClose={closeDialog} fullWidth maxWidth="xs">
        <DialogTitle>Khóa tài khoản chủ tài liệu</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Người dùng sẽ không thể tiếp tục sử dụng hệ thống. Tài khoản không
            bị khóa tự động chỉ vì tài liệu bị gắn cờ.
          </Alert>
          <Typography sx={{ mb: 2 }}>
            Xác nhận khóa <strong>{document.owner?.email}</strong>?
          </Typography>
          <TextField
            label="Lý do khóa *"
            value={reason}
            onChange={(event) => setReason(event.target.value.slice(0, 500))}
            helperText={`${reason.length}/500 · Tối thiểu 3 ký tự`}
            error={reason.length > 0 && reason.trim().length < 3}
            multiline
            minRows={3}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={loading}>
            Hủy
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={submitBlock}
            disabled={loading || reason.trim().length < 3}
          >
            {loading ? "Đang khóa..." : "Xác nhận khóa"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
