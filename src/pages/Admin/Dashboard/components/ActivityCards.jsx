import { ArrowDownward, ArrowUpward, Remove } from "@mui/icons-material";
import { Box, Card, CardContent, Chip, Typography } from "@mui/material";

function Trend({ metric }) {
  const delta = metric?.delta || 0;
  const Icon = delta > 0 ? ArrowUpward : delta < 0 ? ArrowDownward : Remove;
  const color = delta > 0 ? "success" : delta < 0 ? "error" : "default";
  const label =
    metric?.deltaPct == null
      ? "Chưa có kỳ trước"
      : `${Math.abs(metric.deltaPct).toFixed(1)}% so với kỳ trước`;
  return (
    <Chip
      size="small"
      color={color}
      variant="outlined"
      icon={<Icon />}
      label={label}
    />
  );
}

export default function ActivityCards({ activity }) {
  const items = [
    [
      "Người dùng mới",
      activity?.newUsers30d,
      false,
      `${activity?.newUsers7d || 0} trong 7 ngày`,
    ],
    ["Tài liệu mới", activity?.newDocuments30d],
    ["Lượt tải", activity?.downloads30d],
    ["Doanh thu", activity?.revenue30d, true],
  ];
  return (
    <Box>
      <Typography variant="h6" fontWeight={750} mb={2}>
        Hoạt động 30 ngày
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            xl: "repeat(4, 1fr)",
          },
          gap: 2,
        }}
      >
        {items.map(([label, metric, money, note]) => (
          <Card key={label} variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {label}
              </Typography>
              <Typography variant="h5" fontWeight={800} my={1}>
                {money
                  ? `${Number(metric?.value || 0).toLocaleString("vi-VN")} ₫`
                  : Number(metric?.value || 0).toLocaleString("vi-VN")}
              </Typography>
              <Trend metric={metric} />
              {note && (
                <Typography
                  display="block"
                  variant="caption"
                  color="text.secondary"
                  mt={1}
                >
                  {note}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
