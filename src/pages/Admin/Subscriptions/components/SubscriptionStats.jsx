import {
  AccountBalanceWalletOutlined,
  LocalOfferOutlined,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function StatCard({ icon, label, value, color = "primary.main" }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Box sx={{ color, mb: 1 }}>{icon}</Box>
        <Typography color="text.secondary">{label}</Typography>
        <Typography variant="h5" fontWeight={800} mt={0.5}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function SubscriptionStats({ stats }) {
  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
          gap: 2,
          mb: 2,
        }}
      >
        <StatCard
          icon={<AccountBalanceWalletOutlined fontSize="large" />}
          label="Tổng doanh thu"
          value={currency.format(stats.totals?.revenue || 0)}
          color="success.main"
        />
        <StatCard
          icon={<ShoppingCartOutlined fontSize="large" />}
          label="Tổng lượt mua thành công"
          value={(stats.totals?.purchaseCount || 0).toLocaleString("vi-VN")}
        />
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <LocalOfferOutlined color="primary" />
            <Typography variant="h6" fontWeight={700}>
              Thống kê theo gói
            </Typography>
          </Stack>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: 1.5,
            }}
          >
            {stats.plans?.map((plan) => (
              <Box
                key={plan.code}
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography fontWeight={700}>{plan.name}</Typography>
                  <Chip size="small" label={plan.code} />
                </Stack>
                <Typography variant="h6" fontWeight={800}>
                  {currency.format(plan.revenue)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {plan.purchaseCount.toLocaleString("vi-VN")} lượt mua
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </>
  );
}
