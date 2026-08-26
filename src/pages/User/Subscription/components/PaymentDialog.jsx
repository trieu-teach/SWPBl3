import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import CancelOutlined from "@mui/icons-material/CancelOutlined";
import CheckCircle from "@mui/icons-material/CheckCircle";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutlineRounded";
import Close from "@mui/icons-material/Close";
import ContentCopyOutlined from "@mui/icons-material/ContentCopyOutlined";
import ErrorOutline from "@mui/icons-material/ErrorOutlineOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
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
import { useEffect, useState } from "react";

const TERMINAL_STATUSES = ["PAID", "SUCCESS", "EXPIRED", "CANCELLED", "FAILED", "REFUNDED"];

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

function TerminalStatusView({ status, payment, onCreateNew }) {
  const statusConfig = {
    PAID: {
      severity: "success",
      icon: <CheckCircle sx={{ fontSize: 48, color: "success.main" }} />,
      title: "Thanh toán thành công!",
      message: "Gói cước của bạn đã được kích hoạt. Cảm ơn bạn đã tin tưởng sử dụng dịch vụ.",
    },
    SUCCESS: {
      severity: "success",
      icon: <CheckCircle sx={{ fontSize: 48, color: "success.main" }} />,
      title: "Thanh toán thành công!",
      message: "Gói cước của bạn đã được kích hoạt. Cảm ơn bạn đã tin tưởng sử dụng dịch vụ.",
    },
    EXPIRED: {
      severity: "warning",
      icon: <AccessTimeOutlined sx={{ fontSize: 48, color: "warning.main" }} />,
      title: "Mã thanh toán đã hết hạn",
      message: "Mã thanh toán chỉ có hiệu lực trong 15 phút. Vui lòng tạo giao dịch mới.",
    },
    CANCELLED: {
      severity: "info",
      icon: <CancelOutlined sx={{ fontSize: 48, color: "info.main" }} />,
      title: "Đã hủy thanh toán",
      message: "Giao dịch thanh toán đã bị hủy. Bạn có thể tạo giao dịch mới khi sẵn sàng.",
    },
    FAILED: {
      severity: "error",
      icon: <ErrorOutline sx={{ fontSize: 48, color: "error.main" }} />,
      title: "Thanh toán thất bại",
      message: "Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ.",
    },
    REFUNDED: {
      severity: "info",
      icon: <CheckCircleOutline sx={{ fontSize: 48, color: "info.main" }} />,
      title: "Đã hoàn tiền",
      message: "Khoản thanh toán đã được hoàn lại. Vui lòng kiểm tra tài khoản ngân hàng của bạn.",
    },
  };

  const config = statusConfig[status] || statusConfig.FAILED;

  return (
    <Stack spacing={3} alignItems="center" sx={{ textAlign: "center", py: 2 }}>
      {config.icon}
      <Typography variant="h6" fontWeight={800}>
        {config.title}
      </Typography>
      <Typography color="text.secondary">{config.message}</Typography>

      {["EXPIRED", "CANCELLED", "FAILED"].includes(status) && (
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={onCreateNew}
          sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
        >
          Tạo giao dịch mới
        </Button>
      )}

      {payment?.amount && (
        <Alert severity={config.severity} sx={{ width: "100%" }}>
          Thanh toán: {formatMoney(payment.amount)}
        </Alert>
      )}
    </Stack>
  );
}

/**
 * PaymentDialog - Dialog thanh toán hiển thị mã QR VietQR
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * LUỒNG UI CỦA DIALOG
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Dialog có 3 TRẠNG THÁI CHÍNH:
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ TRẠNG THÁI 1: PENDING (QR Code + Countdown)                          │
 * │                                                                         │
 * │  ┌─────────────────┐                                                   │
 * │  │    [QR CODE]    │  ← Ảnh QR từ backend (SePay)                    │
 * │  │                 │                                                   │
 * │  └─────────────────┘                                                   │
 * │                                                                         │
 * │  ⏱️ 14:59  ← Countdown 15 phút                                        │
 * │                                                                         │
 * │  Ngân hàng: VietinBank                                                 │
 * │  Số tài khoản: 1234567890 [📋]                                        │
 * │  Chủ tài khoản: Cong ty ABC                                            │
 * │  Số tiền: 99,000 đ                                                    │
 * │  Nội dung CK: INV-xxx-xxx [📋]                                        │
 * │                                                                         │
 * │  ⚠️ Vui lòng chuyển đúng số tiền...                                   │
 * │  🔄 Đang chờ ngân hàng xác nhận...                                    │
 * │                                                                         │
 * │  [Hủy thanh toán]                                                     │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ TRẠNG THÁI 2: PAID/SUCCESS (Thành công)                              │
 * │                                                                         │
 * │  ✅                                                                    │
 * │  Thanh toán thành công!                                                │
 * │  Cảm ơn bạn đã tin tưởng sử dụng dịch vụ.                           │
 * │                                                                         │
 * │  [Thanh toán: 99,000 đ]                                               │
 * │                                                                         │
 * │  [Đóng]                                                               │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ TRẠNG THÁI 3: TERMINAL STATES                                          │
 * │                                                                         │
 * │  ⏱️ (EXPIRED)  │  ❌ (FAILED)  │  ℹ️ (CANCELLED)  │  💰 (REFUNDED)   │
 * │                                                                         │
 * │  Mã thanh toán     │  Thanh toán     │  Đã hủy        │  Đã hoàn tiền   │
 * │  đã hết hạn        │  thất bại       │  thanh toán     │                 │
 * │                                                                         │
 * │  [Tạo giao dịch mới]                                                 │
 * │                                                                         │
 * │  [Đóng]                                                               │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * CÁC TRẠNG THÁI THANH TOÁN (STATUS)
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 *   PENDING   → Đang chờ (hiện QR, countdown đếm ngược)
 *   PAID      → Thành công (hiện checkmark xanh)
 *   SUCCESS   → Thành công (alias của PAID)
 *   EXPIRED   → Hết hạn (15 phút không thanh toán)
 *   CANCELLED → User hủy
 *   FAILED    → Thất bại
 *   REFUNDED  → Đã hoàn tiền
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * PROPS
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 *   payment          : Object từ backend (invoiceNumber, qrUrl, amount, ...)
 *   remainingSeconds : Số giây còn lại cho countdown
 *   cancelling       : Boolean - đang hủy thanh toán
 *   onCancel         : Function - user click "Hủy thanh toán"
 *   onDismiss        : Function - user click "Đóng"
 *   onCreateNew      : Function - user click "Tạo giao dịch mới"
 */
export default function PaymentDialog({
  payment,
  remainingSeconds,
  cancelling,
  onCancel,
  onDismiss,
  onCreateNew,
}) {
  const [copied, setCopied] = useState("");
  const isPending = payment?.status === "PENDING";
  const isExpired = payment?.status === "EXPIRED" || remainingSeconds === 0;
  const isTerminal = TERMINAL_STATUSES.includes(payment?.status);

  // Auto-dismiss on terminal status
  useEffect(() => {
    if (isTerminal && ["EXPIRED", "CANCELLED", "FAILED", "REFUNDED"].includes(payment?.status)) {
      // Don't auto-dismiss, show the status view instead
    }
  }, [isTerminal, payment?.status]);

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

  // Extract bank info from BE response
  // Backend returns flat fields: bankAcc, bankName, accountName
  // Support both flat and nested bankInfo for backwards compatibility
  const bankInfo = payment?.bankInfo || {};
  const qrUrl = payment?.qrUrl;
  const amount = payment?.amount;
  const invoiceNumber = payment?.invoiceNumber;
  const bankName = payment?.bankName || bankInfo?.bankName;
  const accountNumber = payment?.bankAcc || bankInfo?.accountNumber;
  const accountHolder = payment?.accountName || bankInfo?.accountHolder;

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
        {/* PAID SUCCESS STATE */}
        {payment?.status === "PAID" || payment?.status === "SUCCESS" ? (
          <Stack spacing={3} alignItems="center" sx={{ textAlign: "center", py: 2 }}>
            <CheckCircle sx={{ fontSize: 64, color: "success.main" }} />
            <Typography variant="h5" fontWeight={800} color="success.main">
              Thanh toán thành công!
            </Typography>
            <Typography color="text.secondary">
              Cảm ơn bạn đã tin tưởng sử dụng dịch vụ. Gói cước của bạn đã được kích hoạt.
            </Typography>
            {payment?.amount && (
              <Alert severity="success" icon={<CheckCircleOutline />}>
                Số tiền: {formatMoney(payment.amount)}
              </Alert>
            )}
          </Stack>
        ) : /* TERMINAL NON-SUCCESS STATES */
        isTerminal ? (
          <TerminalStatusView
            status={payment.status}
            payment={payment}
            onCreateNew={onCreateNew}
          />
        ) : /* PENDING STATE - QR Code + Countdown */
        isPending && !isExpired ? (
          <Stack spacing={2.5} alignItems="center">

            {/* ========================
                QR SECTION
                ======================== */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, py: 1 }}>
              {/* QR Code */}
              <Box
                component="img"
                src={qrUrl}
                alt={`VietQR cho đơn ${invoiceNumber}`}
                sx={{
                  width: 260,
                  height: 260,
                  objectFit: "contain",
                }}
              />
            </Box>

            {/* Countdown */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <AccessTimeOutlined sx={{ fontSize: 18, color: remainingSeconds <= 30 ? "error.main" : "text.secondary" }} />
              <Typography fontWeight={700} fontSize="1rem" color={remainingSeconds <= 30 ? "error.main" : "text.primary"}>
                {formatCountdown(remainingSeconds)}
              </Typography>
            </Box>

            {/* ========================
                PAYMENT INFO
                ======================== */}
            <Box sx={{ width: "100%", pt: 1 }}>
              <PaymentRow label="Ngân hàng" value={bankName} onCopy={copy} />
              <Divider />
              <PaymentRow label="Số tài khoản" value={accountNumber} copyValue={accountNumber} onCopy={copy} />
              <Divider />
              <PaymentRow label="Chủ tài khoản" value={accountHolder} onCopy={copy} />
              <Divider />
              <PaymentRow label="Số tiền" value={formatMoney(amount)} copyValue={amount} emphasize onCopy={copy} />
              <Divider />
              <PaymentRow label="Nội dung CK" value={invoiceNumber} copyValue={invoiceNumber} emphasize onCopy={copy} />
            </Box>

            {/* Copy Toast */}
            {copied && (
              <Alert severity="success" icon={<CheckCircleOutline />} sx={{ width: "100%" }}>
                Đã sao chép.
              </Alert>
            )}

            {/* Warning */}
            <Alert severity="warning" sx={{ width: "100%" }}>
              Vui lòng chuyển đúng số tiền và giữ nguyên nội dung chuyển khoản để hệ thống tự động kích hoạt gói.
            </Alert>

            {/* Waiting Status */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={14} />
              <Typography variant="body2" color="text.secondary">
                Đang chờ ngân hàng xác nhận...
              </Typography>
            </Box>
          </Stack>
        ) : (
          /* EXPIRED / UNKNOWN STATE */
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
