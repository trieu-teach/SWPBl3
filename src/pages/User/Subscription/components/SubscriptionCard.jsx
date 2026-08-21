import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import CheckCircle from "@mui/icons-material/CheckCircle";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutlineRounded";
import ShoppingCartOutlined from "@mui/icons-material/ShoppingCartOutlined";

function formatStorage(megabytes = 0) {
  if (megabytes >= 1024) {
    return `${(megabytes / 1024).toLocaleString("vi-VN")} GB`;
  }
  return `${megabytes.toLocaleString("vi-VN")} MB`;
}

const FEATURES = [
  {
    key: "storageLimitMb",
    label: "Dung lượng lưu trữ",
    format: formatStorage,
  },
  {
    key: "uploadLimit",
    label: "Lượt tải lên",
    format: (value = 0) => `${value.toLocaleString("vi-VN")} lượt`,
  },
  {
    key: "aiChatLimit",
    label: "Câu hỏi AI",
    format: (value) =>
      value === null
        ? "Không giới hạn"
        : `${(value || 0).toLocaleString("vi-VN")} câu`,
  },
  {
    key: "durationDays",
    label: "Thời hạn",
    format: (value = 0) => `${value} ngày`,
  },
];

export default function SubscriptionCard({
  plan,
  buttonState,
  onPurchase,
  loading,
  processing,
}) {
  const displayPrice = plan.checkoutAmount ?? plan.amount ?? 0;
  const originalPrice = plan.amount ?? displayPrice;
  const hasDiscount = originalPrice > displayPrice;
  const isCurrentPlan = buttonState?.label === "Đang dùng";

  const buttonIcon = loading ? (
    <CircularProgress size={18} color="inherit" />
  ) : isCurrentPlan ? (
    <CheckCircleOutline />
  ) : buttonState?.label === "Nâng cấp" ? (
    <ArrowUpwardIcon />
  ) : (
    <ShoppingCartOutlined />
  );

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-card)",
        border: "2px solid",
        borderColor: isCurrentPlan ? "primary.main" : "var(--border-color)",
        borderRadius: "var(--radius-md)",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: isCurrentPlan
            ? "0 12px 32px rgba(99, 102, 241, 0.25)"
            : "0 12px 32px rgba(0,0,0,0.15)",
        },
      }}
    >
      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          p: 3,
          position: "relative",
        }}
      >
        {isCurrentPlan && (
          <Box
            sx={{
              position: "absolute",
              top: -12,
              right: 16,
              bgcolor: "primary.main",
              color: "white",
              px: 1.5,
              py: 0.25,
              borderRadius: "8px",
              fontSize: "0.7rem",
              fontWeight: 600,
            }}
          >
            Đang dùng
          </Box>
        )}

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          {plan.name}
        </Typography>
        {plan.description && (
          <Typography
            variant="body2"
            sx={{ color: "var(--text-secondary)", mb: 2 }}
          >
            {plan.description}
          </Typography>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography
            component="span"
            sx={{ fontSize: "2rem", fontWeight: 800, color: "primary.main" }}
          >
            {displayPrice.toLocaleString("vi-VN")}
          </Typography>
          <Typography
            component="span"
            sx={{ color: "var(--text-secondary)", ml: 0.5 }}
          >
            đ
          </Typography>
          {hasDiscount && (
            <Typography
              sx={{
                mt: 0.5,
                color: "text.secondary",
                fontSize: "0.9rem",
                textDecoration: "line-through",
              }}
            >
              {originalPrice.toLocaleString("vi-VN")} đ
            </Typography>
          )}
        </Box>

        <Box sx={{ flex: 1, mb: 3 }}>
          {FEATURES.map(({ key, label, format }) => (
            <Box
              key={key}
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
            >
              <CheckCircle
                sx={{ fontSize: 16, color: "success.main", flexShrink: 0 }}
              />
              <Typography variant="body2">
                {label}: <strong>{format(plan[key])}</strong>
              </Typography>
            </Box>
          ))}
        </Box>

        {!buttonState?.disabled && (
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                px: 1.5,
                py: 0.5,
                borderRadius: "8px",
                backgroundColor: "#d1fae5",
                color: "#047857",
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              Thanh toán qua SePay
            </Box>
          </Box>
        )}

        <Button
          variant={isCurrentPlan ? "outlined" : "contained"}
          fullWidth
          disabled={buttonState?.disabled || processing}
          onClick={() => onPurchase?.(plan.code)}
          startIcon={buttonIcon}
          sx={{
            py: 1.25,
            fontWeight: 600,
            borderRadius: "10px",
            textTransform: "none",
          }}
        >
          {loading ? "Đang tạo giao dịch..." : buttonState?.label || "Mua gói"}
        </Button>
      </CardContent>
    </Card>
  );
}
