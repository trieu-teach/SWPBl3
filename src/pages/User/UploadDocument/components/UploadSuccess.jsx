import { Button, Paper, Stack, Typography } from "@mui/material";
import { CheckCircleOutlined } from "@mui/icons-material";
import { Link } from "react-router-dom";

export default function UploadSuccess({ document, fallbackTitle, onReset }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        maxWidth: 720,
        mx: "auto",
        mt: 5,
        p: { xs: 3, md: 6 },
        borderRadius: 4,
        textAlign: "center",
      }}
    >
      <CheckCircleOutlined
        sx={{ fontSize: 72, color: "success.main", mb: 2 }}
      />
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        Tải tài liệu thành công
      </Typography>
      <Typography color="text.secondary">
        “{document.title || fallbackTitle}” đã được lưu. Hệ thống đang trích
        xuất nội dung cho tìm kiếm và AI.
      </Typography>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        justifyContent="center"
        sx={{ mt: 4 }}
      >
        <Button component={Link} to="/documents" variant="contained">
          Đến thư viện
        </Button>
        <Button variant="outlined" onClick={onReset}>
          Tải thêm tài liệu
        </Button>
      </Stack>
    </Paper>
  );
}
