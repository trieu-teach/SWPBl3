import { Card, Typography } from "@mui/material";
import { GroupsOutlined } from "@mui/icons-material";

export default function CommunityEmptyState() {
  return (
    <Card variant="outlined" sx={{ py: 8, textAlign: "center", borderRadius: 3 }}>
      <GroupsOutlined sx={{ fontSize: 60, color: "text.disabled" }} />
      <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>
        Chưa có tài liệu phù hợp
      </Typography>
      <Typography color="text.secondary">
        Hãy thử từ khóa hoặc bộ lọc khác.
      </Typography>
    </Card>
  );
}
