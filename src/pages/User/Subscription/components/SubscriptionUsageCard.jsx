import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutlineRounded";
import StorageOutlined from "@mui/icons-material/StorageOutlined";
import {
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

function clampPercent(value) {
  return Math.min(100, Math.max(0, Number(value) || 0));
}

function formatDate(dateString) {
  if (!dateString) return "Không giới hạn";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatStorage(megabytes = 0) {
  if (megabytes >= 1024) {
    return `${(megabytes / 1024).toLocaleString("vi-VN", {
      maximumFractionDigits: 1,
    })} GB`;
  }
  return `${megabytes.toLocaleString("vi-VN")} MB`;
}

function UsageItem({ icon, label, detail, percent, unlimited = false }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const value = clampPercent(percent);
  const isWarning = value >= 80;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "8px",
              bgcolor: isDark ? "#312e81" : "#e0e7ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
          <Typography fontWeight={600} sx={{ fontSize: "0.9rem" }}>
            {label}
          </Typography>
        </Box>
        {unlimited ? (
          <Chip
            label="Không giới hạn"
            size="small"
            sx={{
              bgcolor: isDark ? "#052e16" : "#dcfce7",
              color: isDark ? "#4ade80" : "#15803d",
              fontWeight: 600,
              fontSize: "0.7rem",
              height: 22,
            }}
          />
        ) : (
          <Typography
            variant="body2"
            color={isWarning ? "warning.main" : "text.secondary"}
            sx={{
              textAlign: "right",
              fontWeight: isWarning ? 600 : 500,
              fontSize: "0.8rem",
            }}
          >
            {detail}
          </Typography>
        )}
      </Box>
      {!unlimited && (
        <LinearProgress
          variant="determinate"
          value={value}
          color={isWarning ? "warning" : "primary"}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: isDark ? "rgba(255,255,255,0.1)" : "#f3f4f6",
            ".MuiLinearProgress-bar": {
              borderRadius: 3,
            },
          }}
        />
      )}
    </Box>
  );
}

/**
 * SubscriptionUsageCard - Card hiển thị thông tin sử dụng của user
 * 
 * Hiển thị:
 * - Gói dịch vụ hiện tại và ngày hết hạn
 * - Dung lượng lưu trữ đã sử dụng
 * - Hạn mức AI Credits đã sử dụng
 */
export default function SubscriptionUsageCard({ subscription }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  if (!subscription) return null;

  const storageUsed = subscription.storageUsedMb || 0;
  const storageLimit = subscription.storageLimitMb || 0;
  const storagePercent =
    subscription.storageUsagePercent ??
    (storageLimit > 0 ? (storageUsed / storageLimit) * 100 : 0);

  const aiLimit = subscription.aiCreditLimit ?? subscription.aiChatLimit;
  const aiUsed = subscription.aiCreditsUsed ?? subscription.aiChatsUsed ?? 0;
  const aiRemaining =
    subscription.aiCreditsRemaining ??
    (aiLimit === null ? null : Math.max(0, (aiLimit || 0) - aiUsed));
  const aiPercent =
    subscription.aiUsagePercent ??
    (aiLimit ? (aiUsed / aiLimit) * 100 : 0);

  const daysRemaining = subscription.daysRemaining;

  return (
    <Card
      sx={{
        mb: 4,
        borderRadius: "16px",
        border: "1px solid",
        borderColor: "var(--border-color)",
        bgcolor: "var(--bg-card)",
        boxShadow: isDark
          ? "0 1px 3px rgba(0,0,0,0.3)"
          : "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 2,
            flexWrap: "wrap",
            mb: 3,
            pb: 3,
            borderBottom: "1px solid",
            borderColor: isDark ? "rgba(255,255,255,0.1)" : "divider",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                bgcolor: isDark ? "#052e16" : "#dcfce7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mt: 0.25,
              }}
            >
              <CheckCircleOutline sx={{ color: isDark ? "#4ade80" : "#16a34a", fontSize: 22 }} />
            </Box>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="h6"
                  fontWeight={800}
                  sx={{ fontSize: "1.1rem" }}
                >
                  Gói {subscription.planName || subscription.plan}
                </Typography>
                <Chip
                  label={subscription.plan || "FREE"}
                  size="small"
                  sx={{
                    bgcolor: isDark
                      ? subscription.plan === "FREE"
                        ? "rgba(255,255,255,0.1)"
                        : "#312e81"
                      : subscription.plan === "FREE"
                      ? "#f3f4f6"
                      : "#e0e7ff",
                    color: isDark
                      ? subscription.plan === "FREE"
                        ? "#9ca3af"
                        : "#a5b4fc"
                      : subscription.plan === "FREE"
                      ? "#6b7280"
                      : "#6366f1",
                    fontWeight: 700,
                    fontSize: "0.65rem",
                    height: 20,
                    borderRadius: "6px",
                  }}
                />
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.85rem", mt: 0.25 }}
              >
                Hiệu lực đến{" "}
                <Box component="span" sx={{ fontWeight: 600 }}>
                  {formatDate(subscription.expiresAt)}
                </Box>
                {daysRemaining != null && daysRemaining > 0 && (
                  <Box
                    component="span"
                    sx={{
                      ml: 1,
                      color: daysRemaining <= 7 ? "error.main" : "warning.main",
                      fontWeight: 600,
                    }}
                  >
                    ({daysRemaining} ngày còn lại)
                  </Box>
                )}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Usage Stats */}
        <Stack spacing={2.5}>
          <UsageItem
            icon={<StorageOutlined sx={{ color: "#6366f1", fontSize: 16 }} />}
            label="Dung lượng lưu trữ"
            detail={`${formatStorage(storageUsed)} / ${formatStorage(storageLimit)} (${Math.round(clampPercent(storagePercent))}%)`}
            percent={storagePercent}
          />
          <UsageItem
            icon={<AutoAwesomeOutlined sx={{ color: "#6366f1", fontSize: 16 }} />}
            label="Hạn mức AI Credits"
            detail={`${(aiRemaining || 0).toLocaleString("vi-VN")} Credits còn lại (${Math.round(clampPercent(aiPercent))}%)`}
            percent={aiPercent}
            unlimited={aiLimit === null}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
