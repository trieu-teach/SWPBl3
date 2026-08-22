import {
  Box,
  Typography,
  Skeleton,
  useTheme,
} from "@mui/material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatDateShort } from "../../utils/admin-formatters.js";

const CustomTooltipContent = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
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
      <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 0.25 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color: "#6366f1" }}>
        {payload[0]?.value?.toLocaleString("vi-VN")} tài liệu
      </Typography>
    </Box>
  );
};

function calculateTickInterval(dataLength) {
  if (dataLength <= 7) return 0;
  if (dataLength <= 14) return 1;
  if (dataLength <= 30) return 2;
  if (dataLength <= 60) return 4;
  if (dataLength <= 90) return 7;
  return Math.floor(dataLength / 10);
}

function calculateStats(data) {
  if (!data || data.length === 0) {
    return { total: 0, average: 0, max: 0, maxDate: null };
  }
  
  const values = data.map(item => Number(item.count ?? item.value ?? 0));
  const total = values.reduce((sum, v) => sum + v, 0);
  const average = Math.round(total / data.length);
  const max = Math.max(...values);
  const maxItem = data.find(item => Number(item.count ?? item.value ?? 0) === max);
  
  return {
    total,
    average,
    max,
    maxDate: maxItem?.date ? formatDateShort(maxItem.date) : null,
  };
}

export default function UploadStatsChart({ data, loading }) {
  const theme = useTheme();

  if (loading) {
    return (
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
          {[1, 2, 3].map((i) => (
            <Box key={i}>
              <Skeleton width={80} height={12} />
              <Skeleton width={50} height={32} sx={{ mt: 0.25 }} />
            </Box>
          ))}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="rounded" width="100%" height="100%" />
        </Box>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 4 }}>
        <Typography color="text.secondary" variant="body2">
          Không có dữ liệu thống kê upload
        </Typography>
        <Typography color="text.disabled" variant="caption" sx={{ mt: 0.5 }}>
          Thử thay đổi khoảng thời gian lọc
        </Typography>
      </Box>
    );
  }

  const stats = calculateStats(data);
  const chartData = data.map((item) => ({
    date: item.date ? formatDateShort(item.date) : item.period || item.label || "",
    uploads: Math.round(Number(item.count ?? item.value ?? 0)),
    rawDate: item.date,
  }));

  const maxValue = Math.max(...chartData.map((d) => d.uploads));
  const tickInterval = calculateTickInterval(chartData.length);
  const yAxisDomain = Math.ceil(maxValue * 1.2);

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      {/* Summary Stats */}
      <Box
        sx={{
          display: "flex",
          gap: { xs: 2, md: 4 },
          mb: 2,
          pb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: "0.65rem" }}>
            TỔNG UPLOAD
          </Typography>
          <Typography
            sx={{
              fontWeight: 800,
              color: "#6366f1",
              fontSize: "1.5rem",
              lineHeight: 1.1,
            }}
          >
            {stats.total.toLocaleString("vi-VN")}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: "0.65rem" }}>
            TRUNG BÌNH / NGÀY
          </Typography>
          <Typography
            sx={{
              fontWeight: 700,
              color: "text.primary",
              fontSize: "1.25rem",
              lineHeight: 1.1,
            }}
          >
            {stats.average.toLocaleString("vi-VN")}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: "0.65rem" }}>
            NGÀY CAO NHẤT
          </Typography>
          <Typography
            sx={{
              fontWeight: 700,
              color: "#10b981",
              fontSize: "1rem",
              lineHeight: 1.1,
              display: "flex",
              alignItems: "baseline",
              gap: 0.5,
            }}
          >
            {stats.max.toLocaleString("vi-VN")}
            {stats.maxDate && (
              <Typography component="span" variant="caption" color="text.secondary" sx={{ fontWeight: 400 }}>
                ({stats.maxDate})
              </Typography>
            )}
          </Typography>
        </Box>
      </Box>

      {/* Chart - stretches to fill available space */}
      <Box sx={{ flex: 1, minHeight: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={chartData} 
            margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
            key={`area-chart-${data?.length || 0}`}
          >
            <defs>
              <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="85%" stopColor="#6366f1" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.palette.divider}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
              tickLine={false}
              axisLine={{ stroke: theme.palette.divider }}
              interval={tickInterval}
              tickMargin={6}
            />
            <YAxis
              tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => Math.round(value)}
              allowDecimals={false}
              domain={[0, yAxisDomain]}
              width={36}
            />
            <Tooltip
              content={<CustomTooltipContent />}
              contentStyle={{ background: "transparent", border: "none", padding: 0 }}
              wrapperStyle={{ background: "transparent" }}
              cursor={{
                stroke: "#6366f1",
                strokeWidth: 1.5,
                strokeDasharray: "4 2",
                strokeOpacity: 0.5,
              }}
            />
            <Area
              type="monotone"
              dataKey="uploads"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#uploadGradient)"
              dot={{ fill: "#6366f1", strokeWidth: 0, r: 2 }}
              activeDot={{
                r: 5,
                fill: "#6366f1",
                stroke: theme.palette.background.paper,
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
