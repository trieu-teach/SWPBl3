import { Box, Card, CardContent, CircularProgress, Typography } from "@mui/material";
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

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 1.5,
        boxShadow: 3,
      }}
    >
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700} color="primary.main">
        {payload[0].value} tài liệu
      </Typography>
    </Box>
  );
};

export default function UploadStatsChart({ data, loading }) {
  if (loading) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ height: 280, display: "grid", placeItems: "center" }}>
          <CircularProgress size={28} />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ height: 280, display: "grid", placeItems: "center" }}>
          <Typography color="text.secondary" variant="body2">
            Không có dữ liệu thống kê upload
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    date: item.date ? formatDateShort(item.date) : item.period || item.label || "",
    uploads: Number(item.count ?? item.value ?? 0),
  }));

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ pb: "16px !important" }}>
        <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ mb: 0.5 }}>
          SỐ LƯỢNG UPLOAD
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 2, color: "primary.main" }}>
          {data.reduce((sum, item) => sum + Number(item.count ?? item.value ?? 0), 0).toLocaleString("vi-VN")}
          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            tài liệu
          </Typography>
        </Typography>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--mui-palette-divider)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "var(--mui-palette-text-secondary)" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--mui-palette-text-secondary)" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#6366f1", strokeWidth: 1, strokeDasharray: "4 2" }} />
            <Area
              type="monotone"
              dataKey="uploads"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#uploadGradient)"
              dot={false}
              activeDot={{ r: 5, fill: "#6366f1", stroke: "var(--mui-palette-background-paper)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
