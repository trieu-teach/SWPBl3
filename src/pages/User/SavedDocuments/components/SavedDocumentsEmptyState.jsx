import { Button, Card, Typography } from "@mui/material";
import { BookmarkOutlined } from "@mui/icons-material";
import { Link } from "react-router-dom";

export default function SavedDocumentsEmptyState() {
  return (
    <Card variant="outlined" sx={{ py: 8, textAlign: "center", borderRadius: 3 }}>
      <BookmarkOutlined sx={{ fontSize: 60, color: "text.disabled" }} />
      <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>
        Bạn chưa lưu tài liệu nào
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Khám phá thư viện cộng đồng và lưu tài liệu hữu ích.
      </Typography>
      <Button component={Link} to="/community" variant="contained">
        Đến cộng đồng
      </Button>
    </Card>
  );
}
