import { Box, Skeleton } from "@mui/material";
import CommunityCard from "./CommunityCard.jsx";
import CommunityEmptyState from "./CommunityEmptyState.jsx";

const gridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, 1fr)",
    xl: "repeat(3, 1fr)",
  },
  gap: 2,
};

export default function CommunityDocumentGrid({ community }) {
  if (community.loading) {
    return (
      <Box sx={gridSx}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} variant="rounded" height={280} />
        ))}
      </Box>
    );
  }

  if (community.documents.length === 0) return <CommunityEmptyState />;

  return (
    <Box sx={gridSx}>
      {community.documents.map((document) => (
        <CommunityCard
          key={document.id}
          document={document}
          actionId={community.actionId}
          onPreview={community.openPreview}
          onDownload={community.downloadDocument}
          onSave={community.toggleSave}
          onReport={community.openReport}
        />
      ))}
    </Box>
  );
}
