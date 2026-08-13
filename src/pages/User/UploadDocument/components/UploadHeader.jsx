import { Typography } from "@mui/material";

export default function UploadHeader() {
  return (
    <>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.75 }}>
        Tải tài liệu
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Thêm tài liệu vào thư viện để lưu trữ, tìm kiếm và hỏi đáp cùng AI.
      </Typography>
    </>
  );
}
