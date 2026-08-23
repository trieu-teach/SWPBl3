import { Box, Button, Card, MenuItem, Select, TextField } from "@mui/material";
import { SearchOutlined } from "@mui/icons-material";

const FILE_TYPES = ["PDF", "DOCX", "XLSX", "PPTX"];

export default function SavedDocumentsFilters({ saved }) {
  return (
    <Card variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3 }}>
      <Box
        component="form"
        onSubmit={saved.search}
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "minmax(0, 1fr) 170px 180px 180px auto",
          },
          gap: 1.5,
        }}
      >
        <TextField
          size="small"
          placeholder="Tìm tài liệu đã lưu..."
          value={saved.searchInput}
          onChange={(event) => saved.setSearchInput(event.target.value)}
        />
        <Select
          size="small"
          displayEmpty
          value={saved.filters.fileType}
          onChange={(event) =>
            saved.updateFilter("fileType", event.target.value)
          }
        >
          <MenuItem value="">Mọi loại tệp</MenuItem>
          {FILE_TYPES.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
        <Select
          size="small"
          displayEmpty
          value={saved.filters.aiStatus}
          onChange={(event) =>
            saved.updateFilter("aiStatus", event.target.value)
          }
        >
          <MenuItem value="">Mọi trạng thái</MenuItem>
          <MenuItem value="PENDING">Chờ xử lý</MenuItem>
          <MenuItem value="PROCESSING">Đang xử lý</MenuItem>
          <MenuItem value="COMPLETED">Sẵn sàng</MenuItem>
          <MenuItem value="FAILED">Xử lý lỗi</MenuItem>
        </Select>
        <Select
          size="small"
          value={saved.filters.sortBy}
          onChange={(event) =>
            saved.updateFilter("sortBy", event.target.value)
          }
        >
          <MenuItem value="savedAt">Lưu gần đây</MenuItem>
          <MenuItem value="createdAt">Tài liệu mới</MenuItem>
          <MenuItem value="title">Theo tiêu đề</MenuItem>
          <MenuItem value="fileSize">Theo dung lượng</MenuItem>
        </Select>
        <Button type="submit" variant="contained" startIcon={<SearchOutlined />}>
          Tìm
        </Button>
      </Box>
    </Card>
  );
}
