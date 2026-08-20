import {
  Box,
  Button,
  Card,
  CardContent,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { SearchOutlined } from "@mui/icons-material";

export default function DocumentFilters({ library }) {
  const { filters, subjects, categories } = library;
  const selectProps = (name) => ({
    size: "small",
    displayEmpty: true,
    value: filters[name],
    onChange: (event) => library.updateFilter(name, event.target.value),
  });

  return (
    <Card variant="outlined" sx={{ mb: 3, borderRadius: 3 }}>
      <CardContent>
        <Box
          component="form"
          onSubmit={library.applySearch}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            gap: 1,
            mb: 2,
          }}
        >
          <TextField
            fullWidth
            size="small"
            value={library.searchInput}
            onChange={(event) => library.setSearchInput(event.target.value)}
            placeholder="Tìm theo tên tài liệu..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined />
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{
              minWidth: { sm: 120 },
              width: { xs: "100%", sm: "auto" },
              height: 40,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Tìm kiếm
          </Button>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(5, 1fr)",
            },
            gap: 1.5,
          }}
        >
          <Select {...selectProps("subjectId")}>
            <MenuItem value="">Tất cả môn học</MenuItem>
            {subjects.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
          <Select {...selectProps("categoryId")} disabled={!filters.subjectId}>
            <MenuItem value="">Tất cả danh mục</MenuItem>
            {categories.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
          <Select {...selectProps("fileType")}>
            <MenuItem value="">Mọi loại tệp</MenuItem>
            {["PDF", "DOCX", "PPTX", "XLSX"].map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
          <Select {...selectProps("visibility")}>
            <MenuItem value="">Mọi quyền xem</MenuItem>
            <MenuItem value="PRIVATE">Riêng tư</MenuItem>
            <MenuItem value="PUBLIC">Công khai</MenuItem>
          </Select>
          <Select {...selectProps("aiStatus")}>
            <MenuItem value="">Mọi trạng thái AI</MenuItem>
            <MenuItem value="PENDING">Chờ xử lý</MenuItem>
            <MenuItem value="PROCESSING">Đang xử lý</MenuItem>
            <MenuItem value="COMPLETED">Sẵn sàng</MenuItem>
            <MenuItem value="FAILED">Xử lý lỗi</MenuItem>
          </Select>
        </Box>
        <Button size="small" onClick={library.resetFilters} sx={{ mt: 1.5 }}>
          Xóa bộ lọc
        </Button>
      </CardContent>
    </Card>
  );
}
