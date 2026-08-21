import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutlineRounded";
import Close from "@mui/icons-material/Close";
import ContentCopyOutlined from "@mui/icons-material/ContentCopyOutlined";
import ErrorOutline from "@mui/icons-material/ErrorOutlineOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";

function formatMoney(amount = 0) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function formatCountdown(totalSeconds) {
  const seconds = Math.max(0, totalSeconds || 0);
  const minutesPart = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secondsPart = (seconds % 60).toString().padStart(2, "0");
  return `${minutesPart}:${secondsPart}`;
}

function PaymentRow({ label, value, copyValue, emphasize = false, onCopy }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 2,
        py: 1,
      }}
    >
      <Typography color="text.secondary" variant="body2">
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
        <Typography
          sx={{
            fontWeight: emphasize ? 800 : 600,
            color: emphasize ? "primary.main" : "text.primary",
            textAlign: "right",
            overflowWrap: "anywhere",
          }}
        >
          {value || "—"}
        </Typography>
        {copyValue && (
          <Tooltip title="Sao chép">
            <IconButton size="small" onClick={() => onCopy(copyValue)}>
              <ContentCopyOutlined fontSize="inherit" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}

export default function PaymentDialog({
  payment,
  remainingSeconds,
  cancelling,
  onCancel,
  onDismiss,
}) {
  const [copied, setCopied] = useState("");
  const isPending = payment?.status === "PENDING";
  const isExpired = payment?.status === "EXPIRED" || remainingSeconds === 0;

  const copy = async (value) => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(String(value));
      window.setTimeout(() => setCopied(""), 1_500);
    } catch {
      setCopied("");
    }
  };

  const close = () => {
    if (isPending && !isExpired) onCancel();
    else onDismiss();
  };

  return (
    <Dialog
      open={Boolean(payment)}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={isPending}
      onClose={(_event, reason) => {
        if (reason !== "backdropClick") close();
      }}
      PaperProps={{ sx: { borderRadius: 3, backgroundImage: "none" } }}
    >
      <DialogTitle sx={{ pr: 7 }}>
        <Typography component="div" variant="h6" fontWeight={800}>
          Thanh toán gói dịch vụ
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Quét mã VietQR bằng ứng dụng ngân hàng của bạn.
        </Typography>
        <IconButton
          aria-label="Đóng"
          onClick={close}
          disabled={cancelling}
          sx={{ position: "absolute", top: 12, right: 12 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {isPending && !isExpired ? (
          <Stack spacing={2.5}>
            <Box
              sx={{
                mx: "auto",
                width: "min(100%, 300px)",
                p: 1.5,
                borderRadius: 2,
                bgcolor: "white",
                border: "1px solid var(--border-color)",
              }}
            >
              <Box
                component="img"
                src={payment.qrUrl}
                alt={`VietQR cho đơn ${payment.invoiceNumber}`}
                sx={{ display: "block", width: "100%", aspectRatio: "1", objectFit: "contain" }}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                color: remainingSeconds <= 30 ? "error.main" : "warning.main",
              }}
            >
              <AccessTimeOutlined />
              <Typography fontWeight={800} fontSize="1.15rem">
                {formatCountdown(remainingSeconds)}
              </Typography>
            </Box>

            <Box>
              <PaymentRow label="Ngân hàng" value={payment.bankName} onCopy={copy} />
              <Divider />
              <PaymentRow
                label="Số tài khoản"
                value={payment.bankAcc}
                copyValue={payment.bankAcc}
                onCopy={copy}
              />
              <Divider />
              <PaymentRow label="Chủ tài khoản" value={payment.accountName} onCopy={copy} />
              <Divider />
              <PaymentRow
                label="Số tiền"
                value={formatMoney(payment.amount)}
                copyValue={payment.amount}
                emphasize
                onCopy={copy}
              />
              <Divider />
              <PaymentRow
                label="Nội dung chuyển khoản"
                value={payment.invoiceNumber}
                copyValue={payment.invoiceNumber}
                emphasize
                onCopy={copy}
              />
            </Box>

            {copied && (
              <Alert severity="success" icon={<CheckCircleOutline />}>
                Đã sao chép.
              </Alert>
            )}
            <Alert severity="warning">
              Vui lòng chuyển đúng số tiền và giữ nguyên nội dung chuyển khoản để hệ thống tự động kích hoạt gói.
            </Alert>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
              <CircularProgress size={18} />
              <Typography variant="body2" color="text.secondary">
                Đang chờ ngân hàng xác nhận thanh toán...
              </Typography>
            </Box>
          </Stack>
        ) : (
          <Alert severity="warning" icon={<ErrorOutline />}>
            Đơn thanh toán đã hết hạn hoặc không còn ở trạng thái chờ. Hãy đóng cửa sổ và tạo giao dịch mới.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {isPending && !isExpired ? (
          <Button color="error" onClick={onCancel} disabled={cancelling}>
            {cancelling ? "Đang hủy..." : "Hủy thanh toán"}
          </Button>
        ) : (
          <Button variant="contained" onClick={onDismiss}>
            Đóng
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
