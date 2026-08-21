import {
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Typography,
} from "@mui/material";

const roleLabels = {
  USER: "Người dùng",
  MODERATOR: "Kiểm duyệt viên",
  ADMIN: "Quản trị viên",
};
const statusLabels = {
  ACTIVE: "Hoạt động",
  BLOCKED: "Đã khóa",
  INACTIVE: "Chưa xác minh",
  HIDDEN: "Đã ẩn",
  DELETED: "Đã xóa",
};

function Distribution({ title, items, nameKey, labels = {} }) {
  const max = Math.max(...items.map((item) => item.count), 1);
  return (
    <Card variant="outlined" sx={{ borderRadius: 4 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={750} mb={2}>
          {title}
        </Typography>
        <Box sx={{ display: "grid", gap: 2 }}>
          {items.length === 0 && (
            <Typography color="text.secondary">Chưa có dữ liệu.</Typography>
          )}
          {items.map((item) => {
            const name = item[nameKey];
            return (
              <Box key={name}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                    mb: 0.75,
                  }}
                >
                  <Typography noWrap>{labels[name] || name}</Typography>
                  <Chip size="small" label={item.count} />
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(item.count / max) * 100}
                  sx={{ height: 7, borderRadius: 4 }}
                />
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}

export default function StatisticsBreakdown({ statistics }) {
  const subjects = (statistics?.documents?.bySubject || [])
    .slice()
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  const categories = (statistics?.documents?.byCategory || [])
    .slice()
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "repeat(2, 1fr)" },
        gap: 2,
      }}
    >
      <Distribution
        title="Người dùng theo vai trò"
        items={statistics?.users?.byRole || []}
        nameKey="role"
        labels={roleLabels}
      />
      <Distribution
        title="Người dùng theo trạng thái"
        items={statistics?.users?.byStatus || []}
        nameKey="status"
        labels={statusLabels}
      />
      <Distribution
        title="Tài liệu theo trạng thái"
        items={statistics?.documents?.byStatus || []}
        nameKey="status"
        labels={statusLabels}
      />
      <Distribution
        title="Tài liệu theo môn học"
        items={subjects}
        nameKey="name"
      />
      <Distribution
        title="Tài liệu theo danh mục"
        items={categories}
        nameKey="name"
      />
    </Box>
  );
}
