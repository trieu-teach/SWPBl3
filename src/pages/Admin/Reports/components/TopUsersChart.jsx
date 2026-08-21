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
import { formatFileSize } from "../../utils/admin-formatters.js";

const CustomTooltipContent = ({ active, payload, showStorage }) => {
  if (!active || !payload?.length) return null;
  const { fullName, email, documentCount, storageUsedBytes, rank } = payload[0].payload;

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
          mb: 0.5,
        }}
      >
        {fullName}
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
        {email}
      </Typography>
      <Box sx={{ mt: 1.5, pt: 1, borderTop: "1px solid", borderColor: "divider" }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          <strong style={{ color: "#6366f1", fontSize: "1.1rem" }}>{documentCount}</strong> tài liệu
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

function truncateText(text, maxLength) {
  if (!text) return "Không có tên";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

function EmptyState({ message }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent
        sx={{
          height: 300,
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

export default function TopUsersChart({
  data,
  loading,
  metricKey = "documentCount",
  metricLabel = "tài liệu",
  barColor = "#6366f1",
  showStorage = false,
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
    return <EmptyState message="Không có dữ liệu người dùng" />;
  }

  const chartData = data.map((item, index) => ({
    ...item,
    shortName: truncateText(item.fullName, 35),
    fullName: item.fullName || "Người dùng không tên",
    metricValue: Math.round(Number(item[metricKey] ?? 0)),
    rank: index + 1,
  }));

  const totalValue = data.reduce((sum, item) => sum + Math.round(Number(item[metricKey] ?? 0)), 0);
  const totalStorage = showStorage
    ? data.reduce((sum, item) => sum + Number(item.storageUsedBytes ?? 0), 0)
    : 0;
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
              NGƯỜI DÙNG
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
          {showStorage && totalStorage > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                TỔNG DUNG LƯỢNG
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  fontSize: { xs: "1.25rem", md: "1.5rem" },
                }}
              >
                {formatFileSize(totalStorage)}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={Math.max(300, chartData.length * 52)}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 8, right: 80, left: 8, bottom: 8 }}
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
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="shortName"
              tick={{ fontSize: 12, fill: theme.palette.text.primary }}
              tickLine={false}
              axisLine={false}
              width={200}
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

        {/* Storage Column for Top Uploaders */}
        {showStorage && (
          <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Chi tiết dung lượng tài liệu
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {chartData.slice(0, 5).map((item, index) => (
                <Box
                  key={item.userId || index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 1.5,
                    bgcolor: "action.hover",
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Chip
                      label={`#${index + 1}`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        bgcolor: barColor,
                        color: "white",
                      }}
                    />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.fullName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatFileSize(Number(item.storageUsedBytes ?? 0))}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.documentCount} tài liệu
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
