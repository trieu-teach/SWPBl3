import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import {
  DescriptionOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import {
  displayFileType,
  formatDate,
  getFileTypeColors,
} from "../../DocumentLibrary/utils/document-formatters.js";

function DocumentListLoading() {
  return (
    <Stack spacing={1.5}>
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} variant="rounded" height={116} />
      ))}
    </Stack>
  );
}

function ContributorDocumentItem({ document, onPreview, previewing }) {
  const fileColors = getFileTypeColors(document);

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box
          sx={{
            width: 42,
            height: 42,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            borderRadius: 2,
            bgcolor: fileColors.soft,
            color: fileColors.main,
          }}
        >
          <DescriptionOutlined />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography fontWeight={750} noWrap title={document.title}>
              {document.title}
            </Typography>
            <Chip
              size="small"
              label={displayFileType(document)}
              sx={{
                flexShrink: 0,
                bgcolor: fileColors.soft,
                color: fileColors.main,
                fontWeight: 700,
              }}
            />
          </Stack>

          <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.5 }}>
            {document.subject?.name || "Chưa phân môn"}
            {document.category?.name ? ` · ${document.category.name}` : ""}
          </Typography>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
            sx={{ mt: 1.25 }}
          >
            <Typography variant="caption" color="text.secondary">
              {formatDate(document.createdAt)} · {document.viewCount || 0} lượt xem
            </Typography>
            {onPreview && (
              <Button
                size="small"
                startIcon={
                  previewing ? (
                    <CircularProgress size={14} />
                  ) : (
                    <VisibilityOutlined />
                  )
                }
                disabled={previewing}
                onClick={() => onPreview(document)}
              >
                Xem
              </Button>
            )}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}

export default function ContributorDocumentList({
  contributor,
  onPreview,
  actionId,
}) {
  if (contributor.documentsLoading) return <DocumentListLoading />;

  if (contributor.documents.length === 0) {
    return (
      <Box
        sx={{
          py: 5,
          px: 2,
          textAlign: "center",
          border: "1px dashed",
          borderColor: "divider",
          borderRadius: 2.5,
        }}
      >
        <DescriptionOutlined color="disabled" sx={{ fontSize: 42 }} />
        <Typography fontWeight={700} sx={{ mt: 1 }}>
          Chưa có tài liệu công khai
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Người chia sẻ này hiện không còn tài liệu để hiển thị.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Stack spacing={1.5}>
        {contributor.documents.map((document) => (
          <ContributorDocumentItem
            key={document.id}
            document={document}
            onPreview={onPreview}
            previewing={actionId === `preview-${document.id}`}
          />
        ))}
      </Stack>

      {contributor.meta.totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2.5 }}>
          <Pagination
            size="small"
            color="primary"
            page={contributor.page}
            count={contributor.meta.totalPages}
            onChange={(_event, nextPage) => contributor.changePage(nextPage)}
          />
        </Box>
      )}
    </>
  );
}
