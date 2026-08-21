import { Box, Chip, LinearProgress, Typography } from "@mui/material";

function formatStorage(megabytes = 0) {
  const value = Number(megabytes) || 0;
  if (value >= 1024) {
    return `${(value / 1024).toLocaleString("vi-VN", {
      maximumFractionDigits: 1,
    })} GB`;
  }
  return `${value.toLocaleString("vi-VN")} MB`;
}

function UsageRow({ label, value, percent }) {
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
        <Typography sx={{ fontSize: "0.68rem", color: "text.secondary" }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: "0.68rem", fontWeight: 600 }}>
          {value}
        </Typography>
      </Box>
      {percent != null && (
        <LinearProgress
          variant="determinate"
          value={Math.min(100, Math.max(0, Number(percent) || 0))}
          sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
        />
      )}
    </Box>
  );
}

export default function SubscriptionSummary({ subscription }) {
  if (!subscription) return null;

  const storageUsed = subscription.storageUsedMb || 0;
  const storageLimit = subscription.storageLimitMb || 0;
  const storagePercent =
    subscription.storageUsagePercent ??
    (storageLimit > 0 ? (storageUsed / storageLimit) * 100 : 0);
  const aiUsed = subscription.aiCreditsUsed ?? subscription.aiChatsUsed ?? 0;
  const aiLimit = subscription.aiCreditLimit ?? subscription.aiChatLimit;
  const aiPercent =
    subscription.aiUsagePercent ??
    (aiLimit ? (aiUsed / aiLimit) * 100 : null);
  const expiresAt = subscription.expiresAt
    ? new Date(subscription.expiresAt).toLocaleDateString("vi-VN")
    : "Không thời hạn";

  return (
    <Box
      sx={{
        py: 1.25,
        mb: 0.75,
        borderTop: "1px solid",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
          Gói hiện tại
        </Typography>
        <Chip
          label={subscription.plan || subscription.planName || "FREE"}
          size="small"
          color="primary"
          sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700 }}
        />
      </Box>

      <Box sx={{ display: "grid", gap: 1 }}>
        <UsageRow
          label="Dung lượng"
          value={`${formatStorage(storageUsed)} / ${formatStorage(storageLimit)}`}
          percent={storagePercent}
        />
        <UsageRow
          label="AI đã dùng"
          value={`${Number(aiUsed).toLocaleString("vi-VN")} / ${
            aiLimit == null ? "∞" : Number(aiLimit).toLocaleString("vi-VN")
          }`}
          percent={aiPercent}
        />
      </Box>

      <Typography
        sx={{ mt: 1, fontSize: "0.65rem", color: "text.secondary" }}
      >
        Hết hạn: {expiresAt}
      </Typography>
    </Box>
  );
}
