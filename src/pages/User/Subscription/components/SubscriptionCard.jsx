import { Box, Button, Card, CardContent, CircularProgress, Typography } from "@mui/material";
import CheckCircle from "@mui/icons-material/CheckCircle";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutlineRounded";
import ShoppingCartOutlined from "@mui/icons-material/ShoppingCartOutlined";

function formatStorage(megabytes) {
  if (megabytes >= 1024) {
    return `${(megabytes / 1024).toLocaleString("vi-VN")} GB`;
  }
  return `${megabytes.toLocaleString("vi-VN")} MB`;
}

const FEATURE_LABELS = {
  storageLimitMb: "Dung lượng lưu trữ",
  uploadLimit: "Lượt tải lên",
  aiChatLimit: "Câu hỏi AI",
  durationDays: "Thời hạn",
};

const FEATURE_FORMATTERS = {
  storageLimitMb: formatStorage,
  aiChatLimit: (v) => (v === null ? "Không giới hạn" : `${v.toLocaleString("vi-VN")} câu`),
  uploadLimit: (v) => `${v.toLocaleString("vi-VN")} lượt`,
  durationDays: (v) => `${v} ngày`,
};

export default function SubscriptionCard({ plan, isCurrentPlan, onPurchase, loading }) {
  const features = [
    { key: "storageLimitMb", label: FEATURE_LABELS.storageLimitMb },
    { key: "uploadLimit", label: FEATURE_LABELS.uploadLimit },
    { key: "aiChatLimit", label: FEATURE_LABELS.aiChatLimit },
    { key: "durationDays", label: FEATURE_LABELS.durationDays },
  ];

  const getValue = (key) => {
    const fmt = FEATURE_FORMATTERS[key];
    return fmt ? fmt(plan[key]) : plan[key];
  };

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
      <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: 3, position: "relative" }}>
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
            {plan.checkoutAmount?.toLocaleString("vi-VN") || 0}
          </Typography>
          <Typography
            component="span"
            sx={{ color: "var(--text-secondary)", ml: 0.5 }}
          >
            đ
          </Typography>
        </Box>

        <Box sx={{ flex: 1, mb: 3 }}>
          {features.map(({ key, label }) => (
            <Box
              key={key}
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
            >
              <CheckCircle sx={{ fontSize: 16, color: "success.main", flexShrink: 0 }} />
              <Typography variant="body2">
                {label}: <strong>{getValue(key)}</strong>
              </Typography>
            </Box>
          ))}
        </Box>

        <Button
          variant={isCurrentPlan ? "outlined" : "contained"}
          fullWidth
          disabled={loading || isCurrentPlan}
          onClick={() => onPurchase(plan.code)}
          startIcon={
            loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : isCurrentPlan ? (
              <CheckCircleOutline />
            ) : (
              <ShoppingCartOutlined />
            )
          }
          sx={{
            py: 1.25,
            fontWeight: 600,
            borderRadius: "10px",
            textTransform: "none",
          }}
        >
          {isCurrentPlan ? "Gói hiện tại" : loading ? "Đang xử lý..." : "Chọn gói này"}
        </Button>
      </CardContent>
    </Card>
  );
}
