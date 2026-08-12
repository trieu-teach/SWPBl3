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
import { BookmarkOutlined, SearchOutlined } from "@mui/icons-material";
import UserLayout from "../Layout/UserLayout.jsx";
import DocumentPreviewDialog from "../DocumentLibrary/components/DocumentPreviewDialog.jsx";
import SavedDocumentCard from "./components/SavedDocumentCard.jsx";
import useSavedDocuments from "./hooks/useSavedDocuments.js";

const gridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, 1fr)",
    xl: "repeat(3, 1fr)",
  },
  gap: 2,
};

export default function SavedDocuments() {
  const saved = useSavedDocuments();
  return (
    <UserLayout>
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
            {["PDF", "DOCX", "XLSX", "PPTX"].map((type) => (
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
          <Button
            type="submit"
            variant="contained"
            startIcon={<SearchOutlined />}
          >
            Tìm
          </Button>
        </Box>
      </Card>
      {saved.error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={saved.load}>
              Thử lại
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {saved.error}
        </Alert>
      )}
      <Typography fontWeight={700} sx={{ mb: 2 }}>
        {saved.loading
          ? "Đang tải..."
          : `${saved.meta.totalItems || 0} tài liệu đã lưu`}
      </Typography>
      {saved.loading ? (
        <Box sx={gridSx}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={285} />
          ))}
        </Box>
      ) : saved.documents.length === 0 ? (
        <Card
          variant="outlined"
          sx={{ py: 8, textAlign: "center", borderRadius: 3 }}
        >
          <BookmarkOutlined sx={{ fontSize: 60, color: "text.disabled" }} />
          <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>
            Bạn chưa lưu tài liệu nào
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Khám phá thư viện cộng đồng và lưu tài liệu hữu ích.
          </Typography>
          <Button href="/community" variant="contained">
            Đến cộng đồng
          </Button>
        </Card>
      ) : (
        <Box sx={gridSx}>
          {saved.documents.map((document) => (
            <SavedDocumentCard
              key={document.id}
              document={document}
              actionId={saved.actionId}
              onOpen={saved.openDocument}
              onRemove={saved.removeSaved}
            />
          ))}
        </Box>
      )}
      {!saved.loading && saved.meta.totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            page={saved.page}
            count={saved.meta.totalPages}
            color="primary"
            onChange={(_, value) => saved.setPage(value)}
          />
        </Box>
      )}
      <DocumentPreviewDialog
        preview={saved.preview}
        onClose={saved.closePreview}
      />
    </UserLayout>
  );
}
