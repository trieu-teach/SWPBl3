import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  Alert,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import CancelIcon from "@mui/icons-material/Cancel";
import WarningIcon from "@mui/icons-material/Warning";
import ShoppingCartOutlined from "@mui/icons-material/ShoppingCartOutlined";
import { getPaymentStatus, updatePaymentStatus, getMySubscription } from "../../../api/subscription.api.js";
import { useAuth } from "../../../features/auth/AuthProvider.jsx";

const STATUS_CONFIG = {
  PENDING: {
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.1)",
    icon: CircularProgress,
    title: "Đang xác nhận thanh toán...",
    description: "Vui lòng đợi trong giây lát. Đơn hàng của bạn đang được xác nhận.",
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
    description: "Đơn hàng không được thanh toán thành công. Vui lòng thử lại.",
  },
  CANCELLED: {
    color: "#6b7280",
    bgColor: "rgba(107, 114, 128, 0.1)",
    icon: CancelIcon,
    title: "Đã hủy thanh toán",
    description: "Bạn đã hủy thanh toán. Gói của bạn vẫn được giữ nguyên.",
  },
  EXPIRED: {
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.1)",
    icon: WarningIcon,
    title: "Đơn hàng đã hết hạn",
    description: "Thời gian chờ thanh toán đã kết thúc. Bạn có thể thử đặt hàng lại.",
  },
  REFUNDED: {
    color: "#8b5cf6",
    bgColor: "rgba(139, 92, 246, 0.1)",
    icon: WarningIcon,
    title: "Đơn hàng đã hoàn tiền",
    description: "Đơn hàng này đã được hoàn tiền.",
  },
};

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const payment = searchParams.get("payment");
  const invoiceParam = searchParams.get("invoice");

  const [invoiceNumber, setInvoiceNumber] = useState(invoiceParam || sessionStorage.getItem("pendingInvoice") || "");
  const [status, setStatus] = useState("PENDING");
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pollIntervalRef = useRef(null);
  const expiresAtRef = useRef(null);

  const clearPoll = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearPoll();
  }, [clearPoll]);

  useEffect(() => {
    if (invoiceParam) {
      sessionStorage.setItem("pendingInvoice", invoiceParam);
      setInvoiceNumber(invoiceParam);
    }
  }, [invoiceParam]);

  useEffect(() => {
    if (!invoiceNumber) {
      setLoading(false);
      setError("Không tìm thấy mã đơn hàng.");
      return;
    }

    if (payment === "cancel") {
      handleCancel();
      return;
    }

    if (payment === "error") {
      handleError();
      return;
    }

    if (payment === "success") {
      startPolling();
      return;
    }

    setLoading(false);
    setError("Đường dẫn không hợp lệ.");
  }, [payment, invoiceNumber]);

  const handleCancel = async () => {
    setLoading(true);
    try {
      await updatePaymentStatus(invoiceNumber, "CANCELLED");
      setStatus("CANCELLED");
    } catch {
      setStatus("CANCELLED");
    } finally {
      setLoading(false);
    }
  };

  const handleError = async () => {
    setLoading(true);
    try {
      await updatePaymentStatus(invoiceNumber, "FAILED");
      setStatus("FAILED");
    } catch {
      setStatus("FAILED");
    } finally {
      setLoading(false);
    }
  };

  const startPolling = async () => {
    clearPoll();
    setLoading(true);
    setStatus("PENDING");

    expiresAtRef.current = new Date(Date.now() + 60 * 1000);

    pollIntervalRef.current = setInterval(async () => {
      if (new Date() > expiresAtRef.current) {
        clearPoll();
        setStatus("EXPIRED");
        setLoading(false);
        return;
      }

      try {
        const data = await getPaymentStatus(invoiceNumber);
        setPaymentData(data);

        if (data?.status === "PAID") {
          clearPoll();
          setStatus("PAID");
          setLoading(false);
          try {
            await refreshUser();
          } catch {
            // Ignore refresh errors
          }
        } else if (data?.status && !["PENDING", "PAID"].includes(data.status)) {
          clearPoll();
          setStatus(data.status);
          setLoading(false);
        }
      } catch (err) {
        // Continue polling on error
      }
    }, 2000);
  };

  const handleBackToSubscription = () => {
    sessionStorage.removeItem("pendingInvoice");
    navigate("/subscription");
  };

  const handleRetry = () => {
    sessionStorage.removeItem("pendingInvoice");
    navigate("/subscription");
  };

  const currentConfig = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const StatusIcon = currentConfig.icon;

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
      <Card
        sx={{
          maxWidth: 500,
          width: "100%",
          borderRadius: "var(--radius-md)",
          overflow: "visible",
        }}
      >
        <CardContent sx={{ p: 4, textAlign: "center" }}>
          {loading && status === "PENDING" ? (
            <>
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
                <CircularProgress size={40} sx={{ color: currentConfig.color }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                {currentConfig.title}
              </Typography>
              <Typography sx={{ color: "var(--text-secondary)", mb: 2 }}>
                {currentConfig.description}
              </Typography>
              {invoiceNumber && (
                <Typography sx={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                  Mã đơn: <strong>{invoiceNumber}</strong>
                </Typography>
              )}
            </>
          ) : status === "PAID" ? (
            <>
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
                <StatusIcon sx={{ fontSize: 48, color: currentConfig.color }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: currentConfig.color }}>
                {currentConfig.title}
              </Typography>
              <Typography sx={{ color: "var(--text-secondary)", mb: 1 }}>
                {currentConfig.description}
              </Typography>
              {paymentData?.expiresAt && (
                <Typography sx={{ fontWeight: 600, mb: 3 }}>
                  Hạn sử dụng: {formatDate(paymentData.expiresAt)}
                </Typography>
              )}
              <Button
                variant="contained"
                startIcon={<ShoppingCartOutlined />}
                onClick={handleBackToSubscription}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Quay lại trang gói dịch vụ
              </Button>
            </>
          ) : (
            <>
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
                <StatusIcon sx={{ fontSize: 48, color: currentConfig.color }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: currentConfig.color }}>
                {currentConfig.title}
              </Typography>
              <Typography sx={{ color: "var(--text-secondary)", mb: 3 }}>
                {currentConfig.description}
              </Typography>
              {error && (
                <Alert severity="error" sx={{ mb: 3, textAlign: "left" }}>
                  {error}
                </Alert>
              )}
              <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                <Button variant="outlined" onClick={handleBackToSubscription}>
                  Quay lại
                </Button>
                {["FAILED", "CANCELLED", "EXPIRED"].includes(status) && (
                  <Button variant="contained" onClick={handleRetry}>
                    Thử lại
                  </Button>
                )}
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
