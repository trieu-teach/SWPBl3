import { Box, Button, Stack, Typography } from "@mui/material";
import { UploadFileOutlined } from "@mui/icons-material";
import { Link } from "react-router-dom";

export default function DocumentLibraryHeader() {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "stretch", sm: "flex-start" }}
      gap={{ xs: 2.5, sm: 5 }}
      sx={{ mb: 4 }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          Thư viện tài liệu
        </Typography>
        <Typography color="text.secondary">
          Quản lý và truy cập tài liệu học tập của bạn.
        </Typography>
      </Box>
      <Button
        component={Link}
        to="/documents/upload"
        variant="contained"
        startIcon={<UploadFileOutlined />}
        sx={{ flexShrink: 0, minHeight: 48, px: 2.5 }}
      >
        Tải tài liệu
      </Button>
    </Stack>
  );
}
