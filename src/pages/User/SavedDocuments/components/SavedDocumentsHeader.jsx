import { Box, Stack, Typography } from "@mui/material";
import { BookmarkOutlined } from "@mui/icons-material";

export default function SavedDocumentsHeader() {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      gap={3}
      alignItems={{ sm: "center" }}
      sx={{ mb: 4 }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          display: "grid",
          placeItems: "center",
          borderRadius: 3,
          bgcolor: "primary.main",
          color: "primary.contrastText",
        }}
      >
        <BookmarkOutlined />
      </Box>
      <Box>
        <Typography variant="h4" fontWeight={800}>
          Tài liệu đã lưu
        </Typography>
        <Typography color="text.secondary">
          Những tài liệu cộng đồng bạn muốn xem lại sau.
        </Typography>
      </Box>
    </Stack>
  );
}
