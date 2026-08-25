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
import { getFileTypeColors, displayFileType, formatFileSize, ensureUniqueChartLabels, formatChartLabel } from "../../utils/admin-formatters.js";

const CustomTooltipContent = ({ active, payload, barColor }) => {
  if (!active || !payload?.length) return null;
  const { fullTitle, fileSize, fileType, ownerFullName, subjectName, visibility } = payload[0].payload;
  const colors = getFileTypeColors(fileType);

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
          mb: 0.5,
          wordBreak: "break-word",
          whiteSpace: "normal",
          lineHeight: 1.3,
        }}
      >
        {fullTitle}
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 0.5 }}>
        <Box
          sx={{
            height: 18,
            px: 0.75,
            borderRadius: 1,
            bgcolor: colors.bg,
            color: colors.main,
            fontWeight: 600,
            fontSize: "0.65rem",
            display: "flex",
            alignItems: "center",
          }}
        >
          {displayFileType({ fileType })}
        </Box>
        {visibility && (
          <Box
            sx={{
              height: 18,
              px: 0.75,
              borderRadius: 1,
              bgcolor: "action.hover",
              color: "text.secondary",
              fontSize: "0.65rem",
              display: "flex",
              alignItems: "center",
            }}
          >
            {visibility}
          </Box>
        )}
      </Box>
      {ownerFullName && (
        <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
          Tác giả: {ownerFullName}
        </Typography>
      )}
      {subjectName && (
        <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
          Môn: {subjectName}
        </Typography>
      )}
      <Box sx={{ mt: 0.75, pt: 0.75, borderTop: "1px solid", borderColor: "divider" }}>
        <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>
          <strong style={{ color: barColor }}>{formatFileSize(Number(fileSize))}</strong>
        </Typography>
      </Box>
    </Box>
  );
};

function formatXAxisTick(value) {
  const num = Number(value);
  if (num >= 1073741824) return (num / 1073741824).toFixed(1) + " GB";
  if (num >= 1048576) return (num / 1048576).toFixed(1) + " MB";
  if (num >= 1024) return (num / 1024).toFixed(1) + " KB";
  return num + " B";
}

export default function HeaviestDocumentsChart({
  data,
  loading,
  barColor = "#ef4444",
}) {
  const theme = useTheme();

  if (loading) {
    return (
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", gap: 3, mb: 2 }}>
          {[1, 2, 3].map((i) => (
            <Box key={i}>
              <Skeleton width={80} height={12} />
              <Skeleton width={70} height={28} sx={{ mt: 0.25 }} />
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
          Không có dữ liệu tài liệu
        </Typography>
        <Typography color="text.disabled" variant="caption" sx={{ mt: 0.5 }}>
          Thử thay đổi khoảng thời gian lọc
        </Typography>
      </Box>
    );
  }

  // Sort by fileSize descending for proper chart display
  const sortedData = [...data].sort((a, b) => Number(b.fileSize ?? 0) - Number(a.fileSize ?? 0));

  const chartData = sortedData.map((item, index) => ({
    ...item,
    fullTitle: item.title || "Tài liệu không tên",
    metricValue: Number(item.fileSize ?? 0),
    rank: index + 1,
  }));

  const chartDataWithLabels = ensureUniqueChartLabels(chartData, {
    labelKey: "shortTitle",
    rawKey: "title",
    fallbackLabel: "Tài liệu không tên",
    maxLength: 40,
  }).map((item) => {
    const label = item.shortTitle || item.title || "Tài liệu";
    const truncated = label.length > 15 ? label.slice(0, 15) + "..." : label;
    return {
      ...item,
      displayTitle: truncated,
    };
  });

  const totalSize = data.reduce((sum, item) => sum + Number(item.fileSize ?? 0), 0);
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
            {formatFileSize(totalSize)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: "0.65rem" }}>
            TÀI LIỆU
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
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: "0.65rem" }}>
            LỚN NHẤT
          </Typography>
          <Typography
            sx={{
              fontWeight: 700,
              color: barColor,
              fontSize: "1rem",
              lineHeight: 1.1,
            }}
          >
            {formatFileSize(maxValue)}
          </Typography>
        </Box>
      </Box>

      {/* Chart - scrollable container with dynamic height */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 200 }}>
        <ResponsiveContainer width="100%" height={Math.max(300, chartDataWithLabels.length * 35 + 60)}>
          <BarChart
            data={chartDataWithLabels}
            layout="vertical"
            margin={{ top: 5, right: 80, left: 10, bottom: 5 }}
            key={`bar-chart-${chartDataWithLabels.length}`}
            animationDuration={0}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.palette.divider}
              horizontal={false}
              vertical={true}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
              tickLine={false}
              axisLine={{ stroke: theme.palette.divider }}
              tickFormatter={(val) => formatFileSize(val)}
              domain={[0, Math.ceil(maxValue * 1.1)]}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="displayTitle"
              tick={{ fontSize: 11, fill: theme.palette.text.primary }}
              tickLine={false}
              axisLine={false}
              width={150}
              allowDuplicatedCategory={true}
            />
            <RechartsTooltip
              content={<CustomTooltipContent barColor={barColor} />}
              contentStyle={{ background: "transparent", border: "none", padding: 0 }}
              wrapperStyle={{ background: "transparent" }}
              cursor={{
                fill: "rgba(239, 68, 68, 0.08)",
                stroke: barColor,
                strokeWidth: 1,
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
                  fillOpacity={1 - index * 0.04}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
