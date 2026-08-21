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
          {icon}
          <Typography fontWeight={700}>{label}</Typography>
        </Box>
        {unlimited ? (
          <Chip label="Không giới hạn" size="small" color="success" />
        ) : (
          <Typography
            variant="body2"
            color={isWarning ? "warning.main" : "text.secondary"}
            textAlign="right"
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
          sx={{ height: 8, borderRadius: 999 }}
        />
      )}
    </Box>
  );
}

export default function SubscriptionUsageCard({ subscription }) {
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

  return (
    <Card
      variant="outlined"
      sx={{ mb: 4, borderRadius: "var(--radius-md)", bgcolor: "var(--bg-card)" }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 2,
            flexWrap: "wrap",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircleOutline color="success" />
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Gói {subscription.planName || subscription.plan}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hiệu lực đến {formatDate(subscription.expiresAt)}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={subscription.plan || "FREE"}
            color={subscription.plan === "FREE" ? "default" : "primary"}
            size="small"
          />
        </Box>

        <Stack spacing={3}>
          <UsageItem
            icon={<StorageOutlined color="primary" fontSize="small" />}
            label="Dung lượng lưu trữ"
            detail={`${formatStorage(storageUsed)} / ${formatStorage(storageLimit)} (${Math.round(clampPercent(storagePercent))}%)`}
            percent={storagePercent}
          />
          <UsageItem
            icon={<AutoAwesomeOutlined color="primary" fontSize="small" />}
            label="Hạn mức AI Credits"
            detail={`${(aiRemaining || 0).toLocaleString("vi-VN")} Credits còn lại (${Math.round(clampPercent(aiPercent))}% đã dùng)`}
            percent={aiPercent}
            unlimited={aiLimit === null}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
