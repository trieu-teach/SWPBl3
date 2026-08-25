import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import CheckCircle from "@mui/icons-material/CheckCircle";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutlineRounded";
import ShoppingCartOutlined from "@mui/icons-material/ShoppingCartOutlined";
import CurrencyBitcoinOutlined from "@mui/icons-material/CurrencyBitcoinOutlined";

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
    key: "aiCreditLimit",
    label: "Câu hỏi AI",
    format: (value) =>
      value === null
        ? "Không giới hạn"
        : `${(value || 0).toLocaleString("vi-VN")} Credits`,
  },
  {
    key: "durationDays",
    label: "Thời hạn",
    format: (value = 0) => `${value} ngày`,
  },
];

const PLAN_COLORS = {
  STUDENT: { primary: "#6366f1", light: "#e0e7ff", lightDark: "#312e81" },
  PRO: { primary: "#6366f1", light: "#e0e7ff", lightDark: "#312e81" },
  GOLD: { primary: "#6366f1", light: "#e0e7ff", lightDark: "#312e81" },
};

/**
 * SubscriptionCard - Component hiển thị thông tin một gói dịch vụ
 * 
 * Props:
 * - plan: thông tin gói dịch vụ từ backend
 * - buttonState: trạng thái nút (disabled, label)
 * - onPurchase: callback khi click mua gói
 * - loading: đang loading tạo checkout
 * - processing: có giao dịch đang xử lý
 */
export default function SubscriptionCard({
  plan,
  buttonState,
  onPurchase,
  loading,
  processing,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const displayPrice = plan.checkoutAmount ?? plan.amount ?? 0;
  const originalPrice = plan.amount ?? displayPrice;
  const hasDiscount = originalPrice > displayPrice;
  const isCurrentPlan = buttonState?.label === "Đang dùng";

  const planKey = (plan.code || plan.name || "").toUpperCase().includes("GOLD")
    ? "GOLD"
    : (plan.code || plan.name || "").toUpperCase().includes("PRO")
    ? "PRO"
    : "STUDENT";
  const planColors = PLAN_COLORS[planKey] || PLAN_COLORS.STUDENT;

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
        minHeight: { xs: 420, md: 480 },
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-card)",
        border: "2px solid",
        borderColor: isCurrentPlan ? planColors.primary : "var(--border-color)",
        borderRadius: "16px",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        overflow: "hidden",
        position: "relative",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: isCurrentPlan
            ? `0 16px 40px ${planColors.primary}30`
            : isDark
            ? "0 12px 32px rgba(0,0,0,0.4)"
            : "0 12px 32px rgba(0,0,0,0.12)",
        },
      }}
    >
      {/* Corner Ribbon - TOP LEFT - "Đang dùng" */}
      {isCurrentPlan && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 10,
            overflow: "hidden",
            width: 120,
            height: 120,
            pointerEvents: "none",
          }}
        >
          {/* Ribbon background */}
          <Box
            sx={{
              position: "absolute",
              top: 18,
              left: -32,
              width: 100,
              height: 28,
              bgcolor: planColors.primary,
              transform: "rotate(-45deg)",
              transformOrigin: "center center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.65rem",
                fontWeight: 700,
                color: "white",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                textAlign: "center",
                width: "100%",
                pl: 2,
              }}
            >
              Đang dùng
            </Typography>
          </Box>
        </Box>
      )}


      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          p: { xs: 3, md: 4 },
          position: "relative",
        }}
      >
        {/* Plan Name */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 0.5,
            color: planKey === "GOLD" ? planColors.primary : "text.primary",
            mt: isCurrentPlan ? 2 : 0,
          }}
        >
          {plan.name}
        </Typography>

        {/* Description */}
        {plan.description && (
          <Typography
            variant="body2"
            sx={{
              color: "var(--text-secondary)",
              mb: 2.5,
              fontSize: "0.85rem",
              lineHeight: 1.5,
            }}
          >
            {plan.description}
          </Typography>
        )}

        {/* Price Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
            <Typography
              component="span"
              sx={{
                fontSize: "2.25rem",
                fontWeight: 800,
                color: planKey === "GOLD" ? planColors.primary : planColors.primary,
                lineHeight: 1,
                fontFamily: "inherit",
              }}
            >
              {displayPrice.toLocaleString("vi-VN")}
            </Typography>
            <Typography
              component="span"
              sx={{
                fontSize: "1rem",
                fontWeight: 500,
                color: "var(--text-secondary)",
              }}
            >
              đ
            </Typography>
          </Box>
          {hasDiscount && (
            <Typography
              sx={{
                color: isDark ? "text.disabled" : "text.disabled",
                fontSize: "0.875rem",
                textDecoration: "line-through",
                mt: 0.5,
                display: "block",
              }}
            >
              {originalPrice.toLocaleString("vi-VN")} đ
            </Typography>
          )}
        </Box>

        {/* Features List */}
        <Box
          sx={{
            flex: 1,
            mb: 3,
            display: "flex",
            flexDirection: "column",
            gap: 1.25,
          }}
        >
          {FEATURES.map(({ key, label, format }) => (
            <Box
              key={key}
              sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
            >
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  bgcolor: isDark ? planColors.lightDark : planColors.light,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <CheckCircle
                  sx={{
                    fontSize: 14,
                    color: planColors.primary,
                  }}
                />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: "var(--text-secondary)",
                  fontSize: "0.875rem",
                }}
              >
                {label}:{" "}
                <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
                  {format(plan[key])}
                </Box>
              </Typography>
            </Box>
          ))}
        </Box>

        {/* SePay Chip */}
        {!buttonState?.disabled && (
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
                px: 1.5,
                py: 0.5,
                borderRadius: "20px",
                backgroundColor: isDark ? "#052e16" : "#f0fdf4",
                border: `1px solid ${isDark ? "#166534" : "#bbf7d0"}`,
              }}
            >
              <CurrencyBitcoinOutlined sx={{ fontSize: 14, color: isDark ? "#4ade80" : "#16a34a" }} />
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: isDark ? "#4ade80" : "#15803d",
                }}
              >
                Thanh toán qua SePay
              </Typography>
            </Box>
          </Box>
        )}

        {/* CTA Button */}
        <Button
          variant={isCurrentPlan ? "outlined" : "contained"}
          fullWidth
          disabled={buttonState?.disabled || processing}
          onClick={() => onPurchase?.(plan.code)}
          startIcon={buttonIcon}
          sx={{
            py: 1.5,
            fontWeight: 600,
            borderRadius: "12px",
            textTransform: "none",
            fontSize: "0.9rem",
            bgcolor: isCurrentPlan
              ? "transparent"
              : planKey === "GOLD"
              ? planColors.primary
              : planColors.primary,
            color: isCurrentPlan
              ? planColors.primary
              : "white",
            borderColor: isCurrentPlan
              ? planColors.primary
              : planKey === "GOLD"
              ? planColors.primary
              : planColors.primary,
            "&:hover": {
              bgcolor: isCurrentPlan
                ? `${planColors.primary}20`
                : planKey === "GOLD"
                ? "#d97706"
                : "#4f46e5",
              borderColor: isCurrentPlan
                ? planColors.primary
                : planKey === "GOLD"
                ? "#d97706"
                : "#4f46e5",
            },
            "&.Mui-disabled": {
              borderColor: isDark ? "rgba(255,255,255,0.12)" : "divider",
              color: "text.disabled",
              bgcolor: isDark ? "rgba(255,255,255,0.05)" : "action.disabledBackground",
            },
          }}
        >
          {loading ? "Đang tạo giao dịch..." : buttonState?.label || "Mua gói"}
        </Button>
      </CardContent>
    </Card>
  );
}
