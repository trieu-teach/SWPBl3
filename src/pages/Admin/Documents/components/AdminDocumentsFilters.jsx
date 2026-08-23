import { Box, Button, Card, MenuItem, TextField } from "@mui/material";
import { RefreshOutlined, SearchOutlined } from "@mui/icons-material";
import {
  DOCUMENT_MODERATION_FLAG,
  DOCUMENT_MODERATION_STATUS,
} from "../../../../lib/moderation.js";

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
            md: "repeat(2,minmax(0,1fr))",
            xl: "minmax(220px,1fr) repeat(6,minmax(130px,160px)) auto auto",
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
          label="Quyền riêng tư"
          value={admin.filters.visibility}
          onChange={(event) =>
            admin.updateFilter("visibility", event.target.value)
          }
        >
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="PUBLIC">Công khai</MenuItem>
          <MenuItem value="PRIVATE">Riêng tư</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Kiểm duyệt"
          value={admin.filters.moderationStatus}
          onChange={(event) =>
            admin.updateFilter("moderationStatus", event.target.value)
          }
        >
          <MenuItem value="">Tất cả</MenuItem>
          {Object.entries(DOCUMENT_MODERATION_STATUS).map(
            ([value, presentation]) => (
              <MenuItem key={value} value={value}>
                {presentation.label}
              </MenuItem>
            ),
          )}
        </TextField>
        <TextField
          select
          size="small"
          label="Cờ máy quét"
          value={admin.filters.moderationFlag}
          onChange={(event) =>
            admin.updateFilter("moderationFlag", event.target.value)
          }
        >
          <MenuItem value="">Tất cả</MenuItem>
          {Object.entries(DOCUMENT_MODERATION_FLAG).map(
            ([value, presentation]) => (
              <MenuItem key={value} value={value}>
                {presentation.label}
              </MenuItem>
            ),
          )}
        </TextField>
        <TextField
          select
          size="small"
          label="Nhóm kiểm duyệt"
          value={admin.filters.moderationBucket}
          onChange={(event) =>
            admin.updateFilter("moderationBucket", event.target.value)
          }
        >
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="NEEDS_ACTION">Cần xử lý</MenuItem>
          <MenuItem value="REVIEWED">Đã xem xét</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Tài liệu"
          value={admin.filters.status}
          onChange={(event) => admin.updateFilter("status", event.target.value)}
        >
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="ACTIVE">Hoạt động</MenuItem>
          <MenuItem value="HIDDEN">Đã ẩn</MenuItem>
        </TextField>
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
