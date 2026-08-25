import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import ShoppingCartOutlined from "@mui/icons-material/ShoppingCartOutlined";
import WarningIcon from "@mui/icons-material/Warning";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getMySubscription,
  getPaymentStatus,
  updatePaymentStatus,
} from "../../../api/subscription.api.js";
import { useAuth } from "../../../features/auth/AuthProvider.jsx";

const POLL_DELAY_MS = 2_000;
const FALLBACK_POLL_DURATION_MS = 3 * 60_000;

const STATUS_CONFIG = {
  PENDING: {
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.1)",
    icon: CircularProgress,
    title: "Đang xác nhận thanh toán...",
    description:
      "Vui lòng chờ trong giây lát. Hệ thống đang xác nhận giao dịch với SePay.",
  },
  PAID: {
    color: "#10b981",
    bgColor: "rgba(16, 185, 129, 0.1)",
    icon: CheckCircleIcon,
    title: "Thanh toán thành công!",
    description: "Gói dịch vụ của bạn đã được kích hoạt.",
  },
  FAILED: {
    color: "#ef4444",
    bgColor: "rgba(239, 68, 68, 0.1)",
    icon: ErrorIcon,
    title: "Thanh toán thất bại",
    description: "Giao dịch chưa hoàn tất. Vui lòng thử lại.",
  },
  CANCELLED: {
    color: "#6b7280",
    bgColor: "rgba(107, 114, 128, 0.1)",
    icon: CancelIcon,
    title: "Đã hủy thanh toán",
    description: "Gói hiện tại của bạn không bị thay đổi.",
  },
  EXPIRED: {
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.1)",
    icon: WarningIcon,
    title: "Đơn thanh toán đã hết hạn",
    description: "Bạn có thể quay lại trang gói dịch vụ để tạo giao dịch mới.",
  },
  REFUNDED: {
    color: "#8b5cf6",
    bgColor: "rgba(139, 92, 246, 0.1)",
    icon: WarningIcon,
    title: "Giao dịch đã được hoàn tiền",
    description: "Quyền lợi gói đã được backend cập nhật lại.",
  },
};

function formatDate(dateString) {
  if (!dateString) return "Không giới hạn";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatMoney(amount, currency = "VND") {
  if (typeof amount !== "number") return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
  }).format(amount);
}

function clearPendingPayment() {
  sessionStorage.removeItem("pendingInvoice");
  sessionStorage.removeItem("pendingPaymentExpiresAt");
}

/**
 * Trang PaymentCallback - xử lý kết quả thanh toán từ SePay
 * URL: /payment-callback?payment=success&invoice=xxx
 * 
 * Luồng:
 * 1. Lấy invoiceNumber từ URL hoặc sessionStorage
 * 2. Polling API kiểm tra trạng thái thanh toán
 * 3. Khi có kết quả cuối cùng -> hiển thị UI tương ứng
 * 4. Refresh user data để cập nhật subscription
 */
export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const paymentResult = searchParams.get("payment");
  const invoiceNumber =
    searchParams.get("invoice") || sessionStorage.getItem("pendingInvoice") || "";

  const [status, setStatus] = useState("PENDING");
  const [paymentData, setPaymentData] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");
  const pollTimerRef = useRef(null);
  const cancellingRef = useRef(false);

  useEffect(() => {
    if (invoiceNumber) {
      sessionStorage.setItem("pendingInvoice", invoiceNumber);
    }
  }, [invoiceNumber]);

  useEffect(() => {
    let stopped = false;

    const finishPaid = async (data) => {
      setPaymentData(data);
      setStatus("PAID");
      setLoading(false);
      clearPendingPayment();

      const [currentSubscription] = await Promise.all([
        getMySubscription().catch(() => null),
        refreshUser().catch(() => null),
      ]);
      if (!stopped) setSubscription(currentSubscription);
    };

    const poll = async (deadline) => {
      if (stopped || cancellingRef.current) return;
      try {
        const data = await getPaymentStatus(invoiceNumber);
        if (stopped || cancellingRef.current) return;

        setPaymentData(data);
        setError("");

        if (["PAID", "SUCCESS"].includes(data?.status)) {
          await finishPaid(data);
          return;
        }

        if (data?.status && data.status !== "PENDING") {
          setStatus(data.status);
          setLoading(false);
          clearPendingPayment();
          return;
        }

        const backendDeadline = data?.expiresAt
          ? new Date(data.expiresAt).getTime() + 5_000
          : deadline;
        if (Date.now() >= backendDeadline) {
          setStatus("EXPIRED");
          setLoading(false);
          clearPendingPayment();
          return;
        }
      } catch (err) {
        if (!stopped) {
          setError(err.message || "Chưa thể kiểm tra trạng thái thanh toán.");
        }
      }

      if (!stopped && !cancellingRef.current) {
        pollTimerRef.current = window.setTimeout(
          () => poll(deadline),
          POLL_DELAY_MS,
        );
      }
    };

    const initialize = async () => {
      if (!invoiceNumber) {
        setError("Không tìm thấy mã đơn thanh toán.");
        setStatus("FAILED");
        setLoading(false);
        return;
      }

      if (paymentResult === "cancel" || paymentResult === "error") {
        const nextStatus = paymentResult === "cancel" ? "CANCELLED" : "FAILED";
        try {
          const data = await updatePaymentStatus(invoiceNumber, nextStatus);
          if (!stopped) setPaymentData(data);
        } catch {
          // Callback vẫn được hiển thị ngay cả khi yêu cầu cập nhật thất bại.
        }
        if (!stopped) {
          setStatus(nextStatus);
          setLoading(false);
          clearPendingPayment();
        }
        return;
      }

      if (paymentResult !== "success") {
        setError("Đường dẫn kết quả thanh toán không hợp lệ.");
        setStatus("FAILED");
        setLoading(false);
        return;
      }

      const storedExpiry = sessionStorage.getItem("pendingPaymentExpiresAt");
      const parsedExpiry = storedExpiry ? new Date(storedExpiry).getTime() : NaN;
      const deadline = Number.isFinite(parsedExpiry)
        ? parsedExpiry + 5_000
        : Date.now() + FALLBACK_POLL_DURATION_MS;
      await poll(deadline);
    };

    initialize();
    return () => {
      stopped = true;
      window.clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    };
  }, [invoiceNumber, paymentResult, refreshUser]);

  const currentConfig = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const StatusIcon = currentConfig.icon;
  const formattedAmount = useMemo(
    () => formatMoney(paymentData?.amount, paymentData?.currency),
    [paymentData],
  );

  const returnToPlans = () => {
    clearPendingPayment();
    navigate("/subscription", { replace: true });
  };

  const cancelPendingPayment = async () => {
    if (!invoiceNumber || cancelling) return;

    setCancelling(true);
    cancellingRef.current = true;
    setError("");

    try {
      const data = await updatePaymentStatus(invoiceNumber, "CANCELLED");
      window.clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
      setPaymentData(data);
      setStatus("CANCELLED");
      setLoading(false);
      clearPendingPayment();
    } catch (err) {
      cancellingRef.current = false;
      setError(err.message || "Không thể hủy giao dịch thanh toán.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        background: "var(--bg-primary)",
      }}
    >
      <Card sx={{ maxWidth: 540, width: "100%", borderRadius: "var(--radius-md)" }}>
        <CardContent sx={{ p: 4, textAlign: "center" }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: currentConfig.bgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            {loading && status === "PENDING" ? (
              <CircularProgress size={40} sx={{ color: currentConfig.color }} />
            ) : (
              <StatusIcon sx={{ fontSize: 48, color: currentConfig.color }} />
            )}
          </Box>

          <Typography
            variant="h5"
            sx={{ fontWeight: 700, mb: 2, color: currentConfig.color }}
          >
            {currentConfig.title}
          </Typography>
          <Typography sx={{ color: "var(--text-secondary)", mb: 2 }}>
            {currentConfig.description}
          </Typography>

          {invoiceNumber && (
            <Typography sx={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              Mã đơn: <strong>{invoiceNumber}</strong>
            </Typography>
          )}
          {formattedAmount && (
            <Typography sx={{ mt: 0.75, fontWeight: 700 }}>
              Số tiền: {formattedAmount}
            </Typography>
          )}
          {status === "PAID" && subscription && (
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontWeight: 700 }}>
                Gói {subscription.planName || subscription.plan}
              </Typography>
              <Typography sx={{ color: "var(--text-secondary)" }}>
                Hạn sử dụng: {formatDate(subscription.expiresAt)}
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="warning" sx={{ mt: 3, textAlign: "left" }}>
              {error}
            </Alert>
          )}

          {loading && status === "PENDING" && (
            <Button
              color="inherit"
              disabled={cancelling}
              onClick={cancelPendingPayment}
              sx={{ mt: 3 }}
            >
              {cancelling ? "Đang hủy..." : "Hủy thanh toán"}
            </Button>
          )}

          {!loading && (
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 3 }}>
              <Button
                variant={status === "PAID" ? "contained" : "outlined"}
                startIcon={status === "PAID" ? <ShoppingCartOutlined /> : null}
                onClick={returnToPlans}
              >
                {status === "PAID" ? "Xem gói của tôi" : "Quay lại chọn gói"}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
