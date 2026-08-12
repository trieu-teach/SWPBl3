import {
  Alert,
  Box,
  Button,
  Card,
  MenuItem,
  Pagination,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { GroupsOutlined, SearchOutlined } from "@mui/icons-material";
import UserLayout from "../Layout/UserLayout.jsx";
import DocumentPreviewDialog from "../DocumentLibrary/components/DocumentPreviewDialog.jsx";
import CommunityCard from "./components/CommunityCard.jsx";
import useCommunityLibrary from "./hooks/useCommunityLibrary.js";

const gridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, 1fr)",
    xl: "repeat(3, 1fr)",
  },
  gap: 2,
};

export default function CommunityLibrary() {
  const community = useCommunityLibrary();
  return (
    <UserLayout>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        gap={{ xs: 2, sm: 3 }}
        alignItems={{ xs: "flex-start", sm: "center" }}
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
          <GroupsOutlined />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4" fontWeight={800}>
            Thư viện cộng đồng
          </Typography>
          <Typography color="text.secondary">
            Khám phá tài liệu học tập được chia sẻ bởi cộng đồng.
          </Typography>
        </Box>
      </Stack>

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
            {["pdf", "docx", "xlsx", "pptx"].map((type) => (
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
          <Button
            type="submit"
            variant="contained"
            startIcon={<SearchOutlined />}
          >
            Tìm
          </Button>
        </Box>
      </Card>

      {community.error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={community.load}>
              Thử lại
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {community.error}
        </Alert>
      )}
      <Typography fontWeight={700} sx={{ mb: 2 }}>
        {community.loading
          ? "Đang tải..."
          : `${community.meta.totalItems || 0} tài liệu công khai`}
      </Typography>

      {community.loading ? (
        <Box sx={gridSx}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={280} />
          ))}
        </Box>
      ) : community.documents.length === 0 ? (
        <Card
          variant="outlined"
          sx={{ py: 8, textAlign: "center", borderRadius: 3 }}
        >
          <GroupsOutlined sx={{ fontSize: 60, color: "text.disabled" }} />
          <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>
            Chưa có tài liệu phù hợp
          </Typography>
          <Typography color="text.secondary">
            Hãy thử từ khóa hoặc bộ lọc khác.
          </Typography>
        </Card>
      ) : (
        <Box sx={gridSx}>
          {community.documents.map((document) => (
            <CommunityCard
              key={document.id}
              document={document}
              actionId={community.actionId}
              onPreview={community.openPreview}
              onSave={community.toggleSave}
            />
          ))}
        </Box>
      )}

      {!community.loading && community.meta.totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            page={community.page}
            count={community.meta.totalPages}
            color="primary"
            onChange={(_, value) => community.setPage(value)}
          />
        </Box>
      )}
      <DocumentPreviewDialog
        preview={community.preview}
        onClose={community.closePreview}
      />
    </UserLayout>
  );
}
