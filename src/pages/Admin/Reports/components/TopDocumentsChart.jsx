import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  Chip,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getFileTypeColors, displayFileType } from "../../utils/admin-formatters.js";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { title, downloadCount, saveCount, fileType } = payload[0].payload;
  const colors = getFileTypeColors(fileType);
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 1.5,
        boxShadow: 3,
        maxWidth: 220,
      }}
    >
      <Typography
        variant="caption"
        fontWeight={700}
        sx={{
          display: "block",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: 200,
        }}
      >
        {title}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
        <Chip
          label={displayFileType({ fileType })}
          size="small"
          sx={{ height: 16, fontSize: "0.6rem", bgcolor: colors.bg, color: colors.main }}
        />
      </Box>
      {downloadCount !== undefined && (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
          <strong style={{ color: "#6366f1" }}>{downloadCount}</strong> lượt tải
        </Typography>
      )}
      {saveCount !== undefined && (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
          <strong style={{ color: "#10b981" }}>{saveCount}</strong> lượt lưu
        </Typography>
      )}
    </Box>
  );
};

const CustomLabel = (props) => {
  const { x, y, width, height, value } = props;
  if (!value) return null;
  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={700}
    >
      {value}
    </text>
  );
};

export default function TopDocumentsChart({ data, loading, title, metricKey }) {
  if (loading) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ height: 300, display: "grid", placeItems: "center" }}>
          <CircularProgress size={28} />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ height: 300, display: "grid", placeItems: "center" }}>
          <Typography color="text.secondary" variant="body2">
            Không có dữ liệu
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const metricLabel = metricKey === "downloadCount" ? "lượt tải" : "lượt lưu";
  const barColor = metricKey === "downloadCount" ? "#6366f1" : "#10b981";
  const gradientId = metricKey === "downloadCount" ? "barGradient1" : "barGradient2";

  const chartData = data.map((item, index) => ({
    ...item,
    shortTitle:
      item.title?.length > 22
        ? item.title.slice(0, 20) + "..."
        : item.title || `Tài liệu #${index + 1}`,
    rank: index + 1,
  }));

  const maxValue = Math.max(...chartData.map((d) => Number(d[metricKey] ?? 0)));

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ pb: "16px !important" }}>
        <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 2, color: barColor }}>
          {data.reduce((sum, item) => sum + Number(item[metricKey] ?? 0), 0).toLocaleString("vi-VN")}
          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            {metricLabel}
          </Typography>
        </Typography>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 12, left: 4, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--mui-palette-divider)"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "var(--mui-palette-text-secondary)" }}
              tickLine={false}
              axisLine={false}
              domain={[0, maxValue * 1.1]}
            />
            <YAxis
              type="category"
              dataKey="shortTitle"
              tick={{ fontSize: 11, fill: "var(--mui-palette-text-secondary)" }}
              tickLine={false}
              axisLine={false}
              width={130}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--mui-palette-action-hover)" }} />
            <Bar dataKey={metricKey} radius={[0, 6, 6, 0]} label={<CustomLabel />} maxBarSize={36}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={barColor}
                  fillOpacity={1 - index * 0.07}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
