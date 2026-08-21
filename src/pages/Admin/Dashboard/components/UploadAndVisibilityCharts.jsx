import { Box, Card, CardContent, Typography, useTheme } from "@mui/material";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const colors = ["#10b981", "#8b5cf6"];

export default function UploadAndVisibilityCharts({ uploads, visibility }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
        gap: 2,
      }}
    >
      <Card variant="outlined" sx={{ borderRadius: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={750}>
            Tài liệu tải lên
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            30 ngày gần nhất
          </Typography>
          <Box sx={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={uploads} margin={{ left: -20, right: 10 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={theme.palette.divider}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                  axisLine={{ stroke: theme.palette.divider }}
                  tickLine={{ stroke: theme.palette.divider }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    borderColor: theme.palette.divider,
                    borderRadius: 8,
                    color: theme.palette.text.primary,
                  }}
                  labelStyle={{ color: theme.palette.text.secondary }}
                  itemStyle={{ color: theme.palette.text.primary }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Tài liệu"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fill="#6366f133"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>
      <Card variant="outlined" sx={{ borderRadius: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={750}>
            Quyền tài liệu
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Công khai và riêng tư
          </Typography>
          <Box sx={{ height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={visibility}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                >
                  {visibility.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    borderColor: theme.palette.divider,
                    borderRadius: 8,
                    color: theme.palette.text.primary,
                  }}
                  itemStyle={{ color: theme.palette.text.primary }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            {visibility.map((item, index) => (
              <Typography
                key={item.name}
                variant="body2"
                sx={{ color: colors[index % colors.length] }}
              >
                {item.name}: <b>{item.value}</b>
              </Typography>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
