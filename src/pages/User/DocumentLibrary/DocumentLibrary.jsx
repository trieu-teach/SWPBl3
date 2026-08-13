import { Alert, Button, Stack, Typography } from "@mui/material";
import { GridViewOutlined } from "@mui/icons-material";
import UserLayout from "../Layout/UserLayout.jsx";
import DocumentFilters from "./components/DocumentFilters.jsx";
import DocumentGrid from "./components/DocumentGrid.jsx";
import DocumentLibraryHeader from "./components/DocumentLibraryHeader.jsx";
import DocumentPreviewDialog from "./components/DocumentPreviewDialog.jsx";
import useDocumentLibrary from "./hooks/useDocumentLibrary.js";

export default function DocumentLibrary() {
  const library = useDocumentLibrary();

  return (
    <UserLayout>
      <DocumentLibraryHeader />
      <DocumentFilters library={library} />

      {library.error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={library.loadDocuments}>
              Thử lại
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {library.error}
        </Alert>
      )}

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={3}
        sx={{ width: "100%", mb: 2 }}
      >
        <Typography sx={{ flex: 1, fontWeight: 700 }}>
          {library.loading ? "Đang tải..." : `${library.total} tài liệu`}
        </Typography>
        <GridViewOutlined color="action" sx={{ flexShrink: 0 }} />
      </Stack>

      <DocumentGrid library={library} />
      <DocumentPreviewDialog
        preview={library.preview}
        onClose={library.closePreview}
      />
    </UserLayout>
  );
}
