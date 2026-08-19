import { Box, Card, CardContent, Typography, Skeleton } from "@mui/material";
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
        p: 2,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        minWidth: 160,
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 700, color: "#6366f1" }}>
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
  if (loading) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", gap: 4, mb: 3 }}>
            {[1, 2, 3].map((i) => (
              <Box key={i}>
                <Skeleton width={100} height={16} />
                <Skeleton width={60} height={40} sx={{ mt: 0.5 }} />
              </Box>
            ))}
          </Box>
          <Skeleton variant="rounded" width="100%" height={350} />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent
          sx={{
            height: 350,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography color="text.secondary" variant="body1">
            Không có dữ liệu thống kê upload
          </Typography>
          <Typography color="text.disabled" variant="body2" sx={{ mt: 0.5 }}>
            Thử thay đổi khoảng thời gian lọc
          </Typography>
        </CardContent>
      </Card>
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
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        {/* Summary Stats */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: { xs: 3, md: 5 },
            mb: 4,
            pb: 3,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              TỔNG UPLOAD
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: "#6366f1",
                fontSize: { xs: "1.75rem", md: "2.25rem" },
              }}
            >
              {stats.total.toLocaleString("vi-VN")}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              TRUNG BÌNH / NGÀY
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                fontSize: { xs: "1.5rem", md: "2rem" },
              }}
            >
              {stats.average.toLocaleString("vi-VN")}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              NGÀY CAO NHẤT
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: "#10b981",
                fontSize: { xs: "1.25rem", md: "1.5rem" },
              }}
            >
              {stats.max.toLocaleString("vi-VN")}
              {stats.maxDate && (
                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  ({stats.maxDate})
                </Typography>
              )}
            </Typography>
          </Box>
        </Box>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData} margin={{ top: 10, right: 24, left: 8, bottom: 8 }}>
            <defs>
              <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="85%" stopColor="#6366f1" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--mui-palette-divider)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "var(--mui-palette-text-secondary)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--mui-palette-divider)" }}
              interval={tickInterval}
              tickMargin={10}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "var(--mui-palette-text-secondary)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => Math.round(value)}
              allowDecimals={false}
              domain={[0, yAxisDomain]}
              width={40}
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
              strokeWidth={2.5}
              fill="url(#uploadGradient)"
              dot={{ fill: "#6366f1", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 6, fill: "#6366f1", stroke: "var(--mui-palette-background-paper)", strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
