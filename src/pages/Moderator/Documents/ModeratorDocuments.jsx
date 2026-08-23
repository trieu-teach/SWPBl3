import {
  Alert,
  Box,
  Button,
  Card,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import RefreshOutlined from "@mui/icons-material/RefreshOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import ModeratorLayout from "../Layout/ModeratorLayout.jsx";
import ModeratorDecisionDialog from "./components/ModeratorDecisionDialog.jsx";
import ModeratorDocumentDetailDialog from "./components/ModeratorDocumentDetailDialog.jsx";
import ModeratorDocumentPreviewDialog from "./components/ModeratorDocumentPreviewDialog.jsx";
import ModeratorDocumentsTable from "./components/ModeratorDocumentsTable.jsx";
import useModeratorDocuments from "./hooks/useModeratorDocuments.js";

export default function ModeratorDocuments() {
  const moderation = useModeratorDocuments();

  return (
    <ModeratorLayout>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={2}
        sx={{ mb: 3 }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2.5,
            display: "grid",
            placeItems: "center",
            bgcolor: "warning.main",
            color: "warning.contrastText",
          }}
        >
          <FactCheckOutlined />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Hàng chờ tài liệu
          </Typography>
          <Typography color="text.secondary">
            Nhận xử lý, xem nội dung và đưa ra quyết định kiểm duyệt.
          </Typography>
        </Box>
      </Stack>

      <Card variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Box
          component="form"
          onSubmit={moderation.search}
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "minmax(240px, 1fr) auto auto" },
            gap: 1.25,
          }}
        >
          <TextField
            size="small"
            placeholder="Tìm tên tài liệu, người đăng, môn học..."
            value={moderation.searchInput}
            onChange={(event) => moderation.setSearchInput(event.target.value)}
          />
          <Button type="submit" variant="contained" startIcon={<SearchOutlined />}>
            Tìm
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshOutlined />}
            onClick={moderation.resetSearch}
          >
            Đặt lại
          </Button>
        </Box>
      </Card>

      {moderation.error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={moderation.load}>
              Thử lại
            </Button>
          }
          sx={{ mb: 2 }}
        >
          {moderation.error}
        </Alert>
      )}

      <Typography sx={{ mb: 1.5 }}>
        {moderation.meta.totalItems || 0} tài liệu cần xử lý
      </Typography>
      <ModeratorDocumentsTable moderation={moderation} />

      {!moderation.loading && moderation.meta.totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            page={moderation.page}
            count={moderation.meta.totalPages}
            color="primary"
            onChange={(_event, value) => moderation.setPage(value)}
          />
        </Box>
      )}

      <ModeratorDocumentDetailDialog moderation={moderation} />
      <ModeratorDecisionDialog moderation={moderation} />
      <ModeratorDocumentPreviewDialog
        preview={moderation.preview}
        onClose={() => moderation.setPreview(null)}
      />
    </ModeratorLayout>
  );
}
