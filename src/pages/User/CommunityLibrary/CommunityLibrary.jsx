import { Alert, Box, Button, Pagination, Typography } from "@mui/material";
import UserLayout from "../Layout/UserLayout.jsx";
import DocumentPreviewDialog from "../DocumentLibrary/components/DocumentPreviewDialog.jsx";
import CommunityDocumentGrid from "./components/CommunityDocumentGrid.jsx";
import CommunityFilters from "./components/CommunityFilters.jsx";
import CommunityHeader from "./components/CommunityHeader.jsx";
import ReportDocumentDialog from "./components/ReportDocumentDialog.jsx";
import TopRatedDocumentsSection from "./components/TopRatedDocumentsSection.jsx";
import useCommunityLibrary from "./hooks/useCommunityLibrary.js";

export default function CommunityLibrary() {
  const community = useCommunityLibrary();

  return (
    <UserLayout>
      <CommunityHeader />
      <TopRatedDocumentsSection
        limit={3}
        onPreview={community.openPreview}
        onSave={community.toggleSave}
        actionId={community.actionId}
      />
      <CommunityFilters community={community} />

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

      <CommunityDocumentGrid community={community} />

      {!community.loading && community.meta.totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            page={community.page}
            count={community.meta.totalPages}
            color="primary"
            onChange={(_event, value) => community.setPage(value)}
          />
        </Box>
      )}

      <DocumentPreviewDialog
        preview={community.preview}
        onClose={community.closePreview}
      />
      <ReportDocumentDialog
        document={community.reportTarget}
        loading={community.reporting}
        error={community.reportError}
        onClose={community.closeReport}
        onSubmit={community.submitReport}
      />
    </UserLayout>
  );
}
