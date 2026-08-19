import {
  Box,
  Card,
  CardContent,
  Typography,
  Skeleton,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import AssessmentOutlined from "@mui/icons-material/AssessmentOutlined";

const PLAN_COLORS = {
  FREE: "#94a3b8",
  STUDENT: "#8b5cf6",
  PRO: "#f97316",
};

const DEFAULT_COLORS = ["#8b5cf6", "#f97316", "#06b6d4", "#22c55e", "#f59e0b", "#94a3b8"];

const CustomTooltipContent = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value, revenue, percent } = payload[0].payload;
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 2,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        minWidth: 160,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", display: "block", mb: 0.5 }}>
        {name}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.primary" }}>
        <strong style={{ color: "#8b5cf6" }}>{value}</strong> lượt mua
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
        <strong style={{ color: "#6b7280" }}>{(percent * 100).toFixed(1)}%</strong> tổng
      </Typography>
      {revenue > 0 && (
        <Box sx={{ mt: 0.5, pt: 0.5, borderTop: "1px solid", borderColor: "divider" }}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            <strong style={{ color: "#22c55e" }}>{revenue.toLocaleString("vi-VN")}đ</strong> doanh thu
          </Typography>
        </Box>
      )}
    </Box>
  );
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.08) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={13}
      fontWeight={700}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const renderLegend = ({ payload }) => (
  <Box
    sx={{
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 3,
      mt: 2,
      px: 2,
    }}
  >
    {payload.map((entry, index) => (
      <Box key={`legend-${index}`} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            bgcolor: entry.color,
          }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {entry.value}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
          {entry.payload?.value || 0}
        </Typography>
      </Box>
    ))}
  </Box>
);

function LoadingState() {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", gap: 4, mb: 3 }}>
          {[1, 2].map((i) => (
            <Box key={i}>
              <Skeleton width={100} height={14} />
              <Skeleton width={80} height={40} sx={{ mt: 0.5 }} />
            </Box>
          ))}
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 280 }}>
          <Skeleton variant="circular" width={200} height={200} />
        </Box>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent
        sx={{
          py: 6,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            bgcolor: "grey.100",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
          }}
        >
          <AssessmentOutlined sx={{ fontSize: 36, color: "grey.400" }} />
        </Box>
        <Typography variant="h6" sx={{ color: "text.secondary", fontWeight: 600 }}>
          Chưa có dữ liệu subscription
        </Typography>
        <Typography variant="body2" sx={{ color: "text.disabled", mt: 0.5, maxWidth: 280 }}>
          Không có lượt mua nào trong khoảng thời gian đã chọn
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function SubscriptionPieChart({ data, loading }) {
  if (loading) {
    return <LoadingState />;
  }

  const plans = data?.plans || [];
  const totals = data?.totals || {};

  if (!plans.length || totals.purchaseCount === 0) {
    return <EmptyState />;
  }

  const chartData = plans.map((plan) => ({
    name: plan.name || plan.code,
    code: plan.code,
    value: plan.purchaseCount || 0,
    revenue: plan.revenue || 0,
  }));

  const totalRevenue = plans.reduce((sum, p) => sum + (p.revenue || 0), 0);

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        {/* Summary Stats */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: { xs: 3, md: 5 },
            mb: 3,
            pb: 3,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
              TỔNG LƯỢT MUA
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: "#8b5cf6",
                fontSize: { xs: "1.75rem", md: "2.25rem" },
              }}
            >
              {totals.purchaseCount.toLocaleString("vi-VN")}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
              TỔNG DOANH THU
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#22c55e",
                fontSize: { xs: "1.5rem", md: "2rem" },
              }}
            >
              {totalRevenue.toLocaleString("vi-VN")}đ
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
              SỐ GÓI
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                fontSize: { xs: "1.5rem", md: "2rem" },
              }}
            >
              {plans.length}
            </Typography>
          </Box>
        </Box>

        {/* Pie Chart */}
        <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 3, alignItems: "center" }}>
          <ResponsiveContainer width={plans.length <= 3 ? 300 : "100%"} height={280}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
                labelLine={false}
                label={renderCustomLabel}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PLAN_COLORS[entry.code] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip 
                content={<CustomTooltipContent />}
                contentStyle={{ background: "transparent", border: "none", padding: 0 }}
                wrapperStyle={{ background: "transparent" }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend & Details */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {chartData.map((plan, index) => {
                const color = PLAN_COLORS[plan.code] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
                const percent = totals.purchaseCount > 0 ? (plan.value / totals.purchaseCount * 100) : 0;
                return (
                  <Box
                    key={plan.code}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "grey.50",
                      border: "1px solid",
                      borderColor: "divider",
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: "grey.100",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          bgcolor: color,
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                        {plan.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {percent.toFixed(1)}%
                      </Typography>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: color }}>
                          {plan.value}
                        </Typography>
                        {plan.revenue > 0 && (
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            {plan.revenue.toLocaleString("vi-VN")}đ
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
