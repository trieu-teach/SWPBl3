import {
  Box,
  Typography,
  Skeleton,
  useTheme,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatFileSize, ensureUniqueChartLabels } from "../../utils/admin-formatters.js";
import { WrappedTick } from "./ChartLabelComponents.jsx";

const CustomTooltipContent = ({ active, payload, showStorage }) => {
  if (!active || !payload?.length) return null;
  const { fullName, email, documentCount, storageUsedBytes } = payload[0].payload;

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 1.5,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        maxWidth: 280,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          color: "text.primary",
          display: "block",
          mb: 0.25,
        }}
      >
        {fullName}
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
        {email}
      </Typography>
      <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid", borderColor: "divider" }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          <strong style={{ color: "#6366f1" }}>{documentCount}</strong> tài liệu
        </Typography>
        {showStorage && storageUsedBytes != null && (
          <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.25, display: "block" }}>
            Tổng dung lượng: {formatFileSize(Number(storageUsedBytes))}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

function formatXAxisTick(value) {
  const num = Number(value);
  if (Number.isInteger(num)) return num;
  return Math.round(num);
}

export default function TopUsersChart({
  data,
  loading,
  metricKey = "documentCount",
  barColor = "#6366f1",
  showStorage = false,
}) {
  const theme = useTheme();

  if (loading) {
    return (
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", gap: 3, mb: 2 }}>
          {[1, 2, 3].map((i) => (
            <Box key={i}>
              <Skeleton width={60} height={12} />
              <Skeleton width={50} height={28} sx={{ mt: 0.25 }} />
            </Box>
          ))}
        </Box>
        <Box sx={{ flex: 1 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rounded" width="100%" height={36} sx={{ mb: 0.75 }} />
          ))}
        </Box>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 4 }}>
        <Typography color="text.secondary" variant="body2">
          Không có dữ liệu người dùng
        </Typography>
        <Typography color="text.disabled" variant="caption" sx={{ mt: 0.5 }}>
          Thử thay đổi khoảng thời gian lọc
        </Typography>
      </Box>
    );
  }

  const chartData = data.map((item) => ({
    ...item,
    fullName: item.fullName || "Người dùng không tên",
    metricValue: Math.round(Number(item[metricKey] ?? 0)),
  }));

  const chartDataWithLabels = ensureUniqueChartLabels(chartData, {
    labelKey: "shortName",
    rawKey: "fullName",
    fallbackLabel: "Người dùng không tên",
    maxLength: 30,
  });
  const totalValue = data.reduce((sum, item) => sum + Math.round(Number(item[metricKey] ?? 0)), 0);
  const totalStorage = showStorage
    ? data.reduce((sum, item) => sum + Number(item.storageUsedBytes ?? 0), 0)
    : 0;
  const maxValue = Math.max(...chartDataWithLabels.map((d) => d.metricValue));

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
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: "0.65rem" }}>
            TỔNG
          </Typography>
          <Typography
            sx={{
              fontWeight: 800,
              color: barColor,
              fontSize: "1.5rem",
              lineHeight: 1.1,
            }}
          >
            {totalValue.toLocaleString("vi-VN")}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: "0.65rem" }}>
            NGƯỜI DÙNG
          </Typography>
          <Typography
            sx={{
              fontWeight: 700,
              color: "text.primary",
              fontSize: "1.25rem",
              lineHeight: 1.1,
            }}
          >
            {data.length}
          </Typography>
        </Box>
        {showStorage && totalStorage > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: "0.65rem" }}>
              DUNG LƯỢNG
            </Typography>
            <Typography
              sx={{
                fontWeight: 700,
                color: "text.primary",
                fontSize: "1rem",
                lineHeight: 1.1,
              }}
            >
              {formatFileSize(totalStorage)}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Chart - stretches to fill available space */}
      <Box sx={{ flex: 1, minHeight: Math.max(160, chartDataWithLabels.length * 36 + 40) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartDataWithLabels}
            layout="vertical"
            margin={{ top: 8, right: 70, left: 12, bottom: 8 }}
            key={`bar-chart-${data?.length || 0}`}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.palette.divider}
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
              tickLine={false}
              axisLine={{ stroke: theme.palette.divider }}
              tickFormatter={formatXAxisTick}
              domain={[0, Math.ceil(maxValue * 1.2)]}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="shortName"
              tickLine={false}
              axisLine={false}
              width={200}
              tickMargin={12}
              tick={<WrappedTick width={200} fontSize={11} color={theme.palette.text.primary} />}
            />
            <RechartsTooltip
              content={<CustomTooltipContent showStorage={showStorage} />}
              contentStyle={{ background: "transparent", border: "none", padding: 0 }}
              wrapperStyle={{ background: "transparent" }}
              cursor={{
                fill: "rgba(99, 102, 241, 0.08)",
                stroke: barColor,
                strokeWidth: 0.5,
                strokeOpacity: 0.3,
              }}
            />
            <Bar
              dataKey="metricValue"
              radius={[0, 4, 4, 0]}
              maxBarSize={28}
            >
              {chartDataWithLabels.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={barColor}
                  fillOpacity={1 - index * 0.05}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Storage Details for Top Uploaders */}
      {showStorage && (
        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid", borderColor: "divider", flexShrink: 0 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 1 }}>
            Chi tiết dung lượng
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {chartDataWithLabels.slice(0, 5).map((item, index) => (
              <Box
                key={item.userId || index}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 1,
                  bgcolor: "action.hover",
                  borderRadius: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0, flex: 1 }}>
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      bgcolor: barColor,
                      color: "white",
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.fullName}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right", flexShrink: 0, ml: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {formatFileSize(Number(item.storageUsedBytes ?? 0))}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
