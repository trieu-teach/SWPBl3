import { Box, Skeleton } from "@mui/material";
import SavedDocumentCard from "./SavedDocumentCard.jsx";
import SavedDocumentsEmptyState from "./SavedDocumentsEmptyState.jsx";

const gridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, 1fr)",
    xl: "repeat(3, 1fr)",
  },
  gap: 2,
};

export default function SavedDocumentsGrid({ saved }) {
  if (saved.loading) {
    return (
      <Box sx={gridSx}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} variant="rounded" height={285} />
        ))}
      </Box>
    );
  }

  if (saved.documents.length === 0) return <SavedDocumentsEmptyState />;

  return (
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
  );
}
