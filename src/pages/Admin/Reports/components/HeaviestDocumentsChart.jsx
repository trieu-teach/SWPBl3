import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
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
import { getFileTypeColors, displayFileType, formatFileSize } from "../../utils/admin-formatters.js";

const CustomTooltipContent = ({ active, payload, barColor }) => {
  if (!active || !payload?.length) return null;
  const {
    fullTitle,
    fileSize,
    fileType,
    ownerFullName,
    subjectName,
    visibility,
  } = payload[0].payload;
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
            sx={{
              height: 20,
              fontSize: "0.7rem",
              bgcolor: "action.hover",
              color: "text.secondary",
            }}
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
          <strong style={{ color: barColor, fontSize: "1rem" }}>{formatFileSize(Number(fileSize))}</strong>
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

export default function HeaviestDocumentsChart({
  data,
  loading,
  barColor = "#ef4444",
}) {
  const theme = useTheme();

  if (loading) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", gap: 3, mb: 3 }}>
            {[1, 2, 3].map((i) => (
              <Box key={i}>
                <Skeleton width={80} height={14} />
                <Skeleton width={100} height={32} sx={{ mt: 0.5 }} />
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
      metricValue: Number(item.fileSize ?? 0),
      rank: index + 1,
    };
  });

  const totalSize = data.reduce((sum, item) => sum + Number(item.fileSize ?? 0), 0);
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
              TỔNG DUNG LƯỢNG
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: barColor,
                fontSize: { xs: "1.75rem", md: "2.25rem" },
              }}
            >
              {formatFileSize(totalSize)}
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
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              FILE LỚN NHẤT
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: barColor,
                fontSize: { xs: "1.25rem", md: "1.5rem" },
              }}
            >
              {formatFileSize(maxValue)}
            </Typography>
          </Box>
        </Box>

        {/* Chart - Full Width with more height */}
        <ResponsiveContainer width="100%" height={Math.max(400, chartData.length * 52)}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 8, right: 100, left: 8, bottom: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.palette.divider}
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
              tickLine={false}
              axisLine={{ stroke: theme.palette.divider }}
              tickFormatter={formatXAxisTick}
              domain={[0, Math.ceil(maxValue * 1.2)]}
            />
            <YAxis
              type="category"
              dataKey="shortTitle"
              tick={{ fontSize: 12, fill: theme.palette.text.primary }}
              tickLine={false}
              axisLine={false}
              width={280}
            />
            <RechartsTooltip
              content={<CustomTooltipContent barColor={barColor} />}
              contentStyle={{ background: "transparent", border: "none", padding: 0 }}
              wrapperStyle={{ background: "transparent" }}
              cursor={{
                fill: "rgba(239, 68, 68, 0.08)",
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
