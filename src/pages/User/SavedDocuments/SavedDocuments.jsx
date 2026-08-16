import { Alert, Box, Button, Pagination, Typography } from "@mui/material";
import UserLayout from "../Layout/UserLayout.jsx";
import DocumentPreviewDialog from "../DocumentLibrary/components/DocumentPreviewDialog.jsx";
import SavedDocumentsFilters from "./components/SavedDocumentsFilters.jsx";
import SavedDocumentsGrid from "./components/SavedDocumentsGrid.jsx";
import SavedDocumentsHeader from "./components/SavedDocumentsHeader.jsx";
import useSavedDocuments from "./hooks/useSavedDocuments.js";

export default function SavedDocuments() {
  const saved = useSavedDocuments();

  return (
    <UserLayout>
      <SavedDocumentsHeader />
      <SavedDocumentsFilters saved={saved} />

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

      <SavedDocumentsGrid saved={saved} />

      {!saved.loading && saved.meta.totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            page={saved.page}
            count={saved.meta.totalPages}
            color="primary"
            onChange={(_event, value) => saved.setPage(value)}
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
