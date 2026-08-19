import { Box, Button, Card, MenuItem, TextField } from "@mui/material";
import { RefreshOutlined, SearchOutlined } from "@mui/icons-material";

export default function AdminUsersFilters({ adminUsers }) {
  return (
    <Card variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3 }}>
      <Box
        component="form"
        onSubmit={adminUsers.search}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 180px 180px auto auto" },
          gap: 1.5,
        }}
      >
        <TextField
          size="small"
          placeholder="Tìm theo tên hoặc email..."
          value={adminUsers.searchInput}
          onChange={(event) => adminUsers.setSearchInput(event.target.value)}
        />
        <TextField
          select
          size="small"
          label="Vai trò"
          value={adminUsers.filters.role}
          onChange={(event) =>
            adminUsers.updateFilter("role", event.target.value)
          }
        >
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="USER">Người dùng</MenuItem>
          <MenuItem value="MODERATOR">Kiểm duyệt viên</MenuItem>
          <MenuItem value="ADMIN">Quản trị viên</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Trạng thái"
          value={adminUsers.filters.status}
          onChange={(event) =>
            adminUsers.updateFilter("status", event.target.value)
          }
        >
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="ACTIVE">Hoạt động</MenuItem>
          <MenuItem value="BLOCKED">Đã khóa</MenuItem>
          <MenuItem value="INACTIVE">Chưa xác minh</MenuItem>
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
          onClick={adminUsers.resetFilters}
          startIcon={<RefreshOutlined />}
        >
          Đặt lại
        </Button>
      </Box>
    </Card>
  );
}
