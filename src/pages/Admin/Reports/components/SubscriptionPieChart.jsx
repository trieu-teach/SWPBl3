import {
  Box,
  Typography,
  Skeleton,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
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
        p: 1.5,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        minWidth: 140,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", display: "block", mb: 0.25 }}>
        {name}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.primary" }}>
        <strong style={{ color: "#8b5cf6" }}>{value}</strong> lượt mua
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
        <strong>{(percent * 100).toFixed(1)}%</strong> tổng
      </Typography>
      {revenue > 0 && (
        <Box sx={{ mt: 0.5, pt: 0.5, borderTop: "1px solid", borderColor: "divider" }}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            <strong style={{ color: "#22c55e" }}>{revenue.toLocaleString("vi-VN")}đ</strong>
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
      fontSize={11}
      fontWeight={700}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function SubscriptionPieChart({ data, loading }) {
  if (loading) {
    return (
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", gap: 3, mb: 2 }}>
          {[1, 2].map((i) => (
            <Box key={i}>
              <Skeleton width={80} height={12} />
              <Skeleton width={60} height={32} sx={{ mt: 0.25 }} />
            </Box>
          ))}
        </Box>
        <Box sx={{ flex: 1, display: "flex", gap: 2 }}>
          <Skeleton variant="circular" width={140} height={140} sx={{ mx: "auto" }} />
          <Box sx={{ flex: 1 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" width="100%" height={40} sx={{ mb: 1 }} />
            ))}
          </Box>
        </Box>
      </Box>
    );
  }

  const plans = data?.plans || [];
  const totals = data?.totals || {};

  if (!plans.length || totals.purchaseCount === 0) {
    return (
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 4 }}>
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            bgcolor: "action.hover",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
          }}
        >
          <AssessmentOutlined sx={{ fontSize: 28, color: "grey.400" }} />
        </Box>
        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
          Chưa có dữ liệu subscription
        </Typography>
        <Typography variant="caption" sx={{ color: "text.disabled", mt: 0.5, textAlign: "center" }}>
          Không có lượt mua nào trong khoảng thời gian đã chọn
        </Typography>
      </Box>
    );
  }

  const chartData = plans.map((plan) => ({
    name: plan.name || plan.code,
    code: plan.code,
    value: plan.purchaseCount || 0,
    revenue: plan.revenue || 0,
  }));

  const totalRevenue = plans.reduce((sum, p) => sum + (p.revenue || 0), 0);

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      {/* Summary Stats */}
      <Box
        sx={{
          display: "flex",
          gap: { xs: 2, md: 3 },
          mb: 2,
          pb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500, fontSize: "0.65rem" }}>
            TỔNG LƯỢT MUA
          </Typography>
          <Typography
            sx={{
              fontWeight: 800,
              color: "#8b5cf6",
              fontSize: "1.5rem",
              lineHeight: 1.1,
            }}
          >
            {totals.purchaseCount.toLocaleString("vi-VN")}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500, fontSize: "0.65rem" }}>
            DOANH THU
          </Typography>
          <Typography
            sx={{
              fontWeight: 700,
              color: "#22c55e",
              fontSize: "1.25rem",
              lineHeight: 1.1,
            }}
          >
            {totalRevenue.toLocaleString("vi-VN")}đ
          </Typography>
        </Box>
      </Box>

      {/* Donut + Legend */}
      <Box
        sx={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
          alignItems: "center",
          minHeight: 180,
        }}
      >
        {/* Donut Chart */}
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                labelLine={false}
                label={renderCustomLabel}
                key={`pie-chart-${data?.length || 0}`}
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
        </Box>

        {/* Legend Cards */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
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
                  p: 1,
                  borderRadius: 1.5,
                  bgcolor: "action.hover",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, flex: 1 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: color,
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, color: "text.primary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  >
                    {plan.name}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {percent.toFixed(1)}%
                  </Typography>
                  <Box sx={{ textAlign: "right", minWidth: 40 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: color }}>
                      {plan.value}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
