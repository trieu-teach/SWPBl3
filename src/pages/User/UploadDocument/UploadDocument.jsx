import { Alert, Box, Stack } from "@mui/material";
import UserLayout from "../Layout/UserLayout.jsx";
import DocumentMetadataForm from "./components/DocumentMetadataForm.jsx";
import FileDropzone from "./components/FileDropzone.jsx";
import FilePreview from "./components/FilePreview.jsx";
import UploadHeader from "./components/UploadHeader.jsx";
import UploadSuccess from "./components/UploadSuccess.jsx";
import UploadSummary from "./components/UploadSummary.jsx";
import useDocumentUpload from "./hooks/useDocumentUpload.js";

export default function UploadDocument() {
  const upload = useDocumentUpload();

  if (upload.result) {
    return (
      <UserLayout>
        <UploadSuccess
          document={upload.result}
          fallbackTitle={upload.title}
          onReset={upload.reset}
        />
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <UploadHeader />
      {upload.optionsError && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {upload.optionsError}
        </Alert>
      )}
      <Box
        component="form"
        onSubmit={upload.submit}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 340px" },
          gap: 3,
        }}
      >
        <Stack spacing={3}>
          <FileDropzone
            file={upload.file}
            error={upload.fileError}
            onSelect={upload.selectFile}
            onRemove={upload.removeFile}
          />
          <FilePreview file={upload.file} />
          <DocumentMetadataForm upload={upload} />
        </Stack>
        <UploadSummary upload={upload} />
      </Box>
    </UserLayout>
  );
}
