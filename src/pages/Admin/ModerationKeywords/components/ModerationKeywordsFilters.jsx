import SearchOutlined from "@mui/icons-material/SearchOutlined";
import {
  Card,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";

export default function ModerationKeywordsFilters({ admin }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, p: 2, mb: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <TextField
          value={admin.search}
          onChange={(event) => admin.setSearch(event.target.value)}
          placeholder="Tìm theo từ khóa, nhóm hoặc mức độ..."
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          label="Trạng thái"
          value={admin.statusFilter}
          onChange={(event) => admin.setStatusFilter(event.target.value)}
          sx={{ minWidth: { xs: "100%", md: 220 } }}
        >
          <MenuItem value="">Tất cả trạng thái</MenuItem>
          <MenuItem value="true">Đang hoạt động</MenuItem>
          <MenuItem value="false">Tạm ngừng</MenuItem>
        </TextField>
      </Stack>
    </Card>
  );
}
