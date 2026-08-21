import { Box, Button, Card, MenuItem, TextField } from "@mui/material";
import { RefreshOutlined, SearchOutlined } from "@mui/icons-material";

export default function AdminDocumentsFilters({ admin }) {
  return (
    <Card variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3 }}>
      <Box
        component="form"
        onSubmit={admin.search}
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "minmax(220px,1fr) repeat(2,minmax(150px,180px)) auto auto",
          },
          gap: 1.25,
        }}
      >
        <TextField
          size="small"
          placeholder="Tên tài liệu, người đăng, môn học..."
          value={admin.searchInput}
          onChange={(event) => admin.setSearchInput(event.target.value)}
        />
        <TextField
          select
          size="small"
          label="Xử lý AI"
          value={admin.filters.aiStatus}
          onChange={(event) =>
            admin.updateFilter("aiStatus", event.target.value)
          }
        >
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="PENDING">Chờ xử lý</MenuItem>
          <MenuItem value="PROCESSING">Đang xử lý</MenuItem>
          <MenuItem value="COMPLETED">Hoàn tất</MenuItem>
          <MenuItem value="FAILED">Lỗi</MenuItem>
          <MenuItem value="MOCKED">Mô phỏng</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Cờ kiểm duyệt"
          value={admin.filters.moderationFlag}
          onChange={(event) =>
            admin.updateFilter("moderationFlag", event.target.value)
          }
        >
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="NORMAL">Bình thường</MenuItem>
          <MenuItem value="FLAGGED">Có cảnh báo</MenuItem>
          <MenuItem value="SCAN_FAILED">Quét thất bại</MenuItem>
        </TextField>
        <Button
          type="submit"
          variant="contained"
          startIcon={<SearchOutlined />}
        >
          Tìm
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshOutlined />}
          onClick={admin.resetFilters}
        >
          Đặt lại
        </Button>
      </Box>
    </Card>
  );
}
