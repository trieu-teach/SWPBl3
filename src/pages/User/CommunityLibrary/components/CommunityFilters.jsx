import { Box, Button, Card, MenuItem, Select, TextField } from "@mui/material";
import { SearchOutlined } from "@mui/icons-material";

const FILE_TYPES = ["pdf", "docx", "xlsx", "pptx"];

export default function CommunityFilters({ community }) {
  return (
    <Card variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3 }}>
      <Box
        component="form"
        onSubmit={community.search}
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "minmax(0, 1fr) 180px 190px auto",
          },
          gap: 1.5,
        }}
      >
        <TextField
          size="small"
          placeholder="Tìm tài liệu, môn học, tag..."
          value={community.searchInput}
          onChange={(event) => community.setSearchInput(event.target.value)}
        />
        <Select
          size="small"
          displayEmpty
          value={community.filters.fileType}
          onChange={(event) =>
            community.updateFilter("fileType", event.target.value)
          }
        >
          <MenuItem value="">Mọi loại tệp</MenuItem>
          {FILE_TYPES.map((type) => (
            <MenuItem key={type} value={type}>
              {type.toUpperCase()}
            </MenuItem>
          ))}
        </Select>
        <Select
          size="small"
          value={community.filters.sortBy}
          onChange={(event) =>
            community.updateFilter("sortBy", event.target.value)
          }
        >
          <MenuItem value="createdAt">Mới nhất</MenuItem>
          <MenuItem value="downloadCount">Tải nhiều nhất</MenuItem>
          <MenuItem value="saveCount">Lưu nhiều nhất</MenuItem>
          <MenuItem value="viewCount">Xem nhiều nhất</MenuItem>
        </Select>
        <Button type="submit" variant="contained" startIcon={<SearchOutlined />}>
          Tìm
        </Button>
      </Box>
    </Card>
  );
}
