import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Skeleton,
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
import { getFileTypeColors, displayFileType } from "../../utils/admin-formatters.js";

const CustomTooltipContent = ({ active, payload, barColor }) => {
  if (!active || !payload?.length) return null;
  const { fullTitle, downloadCount, saveCount, fileType, ownerFullName, subjectName, visibility, metricValue } = payload[0].payload;
  const colors = getFileTypeColors(fileType);
  
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 2,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        maxWidth: 320,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          color: "text.primary",
          display: "block",
          mb: 1,
          wordBreak: "break-word",
          whiteSpace: "normal",
          lineHeight: 1.4,
        }}
      >
        {fullTitle}
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
        <Chip
          label={displayFileType({ fileType })}
          size="small"
          sx={{ height: 20, fontSize: "0.7rem", bgcolor: colors.bg, color: colors.main, fontWeight: 600 }}
        />
        {visibility && (
          <Chip
            label={visibility}
            size="small"
            sx={{ height: 20, fontSize: "0.7rem", bgcolor: "#f3f4f6", color: "#6b7280" }}
          />
        )}
      </Box>
      {ownerFullName && (
        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.25 }}>
          Tác giả: {ownerFullName}
        </Typography>
      )}
      {subjectName && (
        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.25 }}>
          Môn: {subjectName}
        </Typography>
      )}
      <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid", borderColor: "divider" }}>
        <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>
          <strong style={{ color: barColor, fontSize: "1rem" }}>{metricValue}</strong> lượt
        </Typography>
      </Box>
    </Box>
  );
};

function formatXAxisTick(value) {
  const num = Number(value);
  if (Number.isInteger(num)) return num;
  return Math.round(num);
}

function truncateText(text, maxLength) {
  if (!text) return "Tài liệu không tên";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

function EmptyState({ message }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent
        sx={{
          height: 400,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="text.secondary" variant="body1">
          {message}
        </Typography>
        <Typography color="text.disabled" variant="body2" sx={{ mt: 0.5 }}>
          Thử thay đổi khoảng thời gian lọc
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function TopDocumentsChart({ 
  data, 
  loading, 
  metricKey, 
  metricLabel,
  barColor = "#6366f1",
}) {
  if (loading) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
            {[1, 2, 3].map((i) => (
              <Box key={i}>
                <Skeleton width={80} height={14} />
                <Skeleton width={60} height={32} sx={{ mt: 0.5 }} />
              </Box>
            ))}
          </Box>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rounded" width="100%" height={48} sx={{ mb: 1 }} />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState message="Không có dữ liệu tài liệu" />;
  }

  const chartData = data.map((item, index) => {
    const displayTitle = truncateText(item.title, 50);
    return {
      ...item,
      shortTitle: displayTitle,
      fullTitle: item.title || "Tài liệu không tên",
      metricValue: Math.round(Number(item[metricKey] ?? 0)),
      rank: index + 1,
    };
  });

  const totalValue = data.reduce((sum, item) => sum + Math.round(Number(item[metricKey] ?? 0)), 0);
  const maxValue = Math.max(...chartData.map((d) => d.metricValue));

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
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              TỔNG {metricLabel.toUpperCase()}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: barColor,
                fontSize: { xs: "1.75rem", md: "2.25rem" },
              }}
            >
              {totalValue.toLocaleString("vi-VN")}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              TÀI LIỆU
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                fontSize: { xs: "1.5rem", md: "2rem" },
              }}
            >
              {data.length}
            </Typography>
          </Box>
        </Box>

        {/* Chart - Full Width with more height */}
        <ResponsiveContainer width="100%" height={Math.max(400, chartData.length * 52)}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 8, right: 80, left: 8, bottom: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--mui-palette-divider)"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: "var(--mui-palette-text-secondary)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--mui-palette-divider)" }}
              tickFormatter={formatXAxisTick}
              domain={[0, Math.ceil(maxValue * 1.2)]}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="shortTitle"
              tick={{ fontSize: 12, fill: "var(--mui-palette-text.primary)" }}
              tickLine={false}
              axisLine={false}
              width={280}
            />
            <RechartsTooltip
              content={<CustomTooltipContent barColor={barColor} />}
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
              radius={[0, 6, 6, 0]}
              maxBarSize={36}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={barColor}
                  fillOpacity={1 - index * 0.05}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
