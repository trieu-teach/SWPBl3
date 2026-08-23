import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Card,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArrowBackIosNewOutlined,
  ArrowForwardIosOutlined,
  CloudDownloadOutlined,
  EmojiEventsOutlined,
  StarRounded,
} from "@mui/icons-material";
import { useTopRatedDocuments } from "../../hooks/useRating.js";
import TopRatedDocumentCard from "./TopRatedDocumentCard.jsx";

const gridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, 1fr)",
    md: "repeat(3, 1fr)",
  },
  gap: 2.5,
};

export default function TopRatedDocumentsWidget({
  title = "Tài liệu đánh giá cao nhất",
  initialSortBy = "rating",
  limit = 6,
  onPreview,
  showControls = true,
  variant = "paper", // "paper" | "plain"
}) {
  const {
    items,
    meta,
    loading,
    error,
    page,
    sortBy,
    setSortBy,
    nextPage,
    prevPage,
    reload,
  } = useTopRatedDocuments({
    page: 1,
    limit,
    sortBy: initialSortBy,
  });

  const Wrapper = variant === "paper" ? Paper : Box;
  const wrapperProps =
    variant === "paper"
      ? {
          variant: "outlined",
          sx: { p: { xs: 2, md: 3 }, borderRadius: 3, mb: 4 },
        }
      : { sx: { mb: 4 } };

  return (
    <Wrapper {...wrapperProps}>
      {/* Header section with Title, SortBy and Pagination buttons */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              display: "grid",
              placeItems: "center",
              borderRadius: 2,
              bgcolor: "warning.soft",
              color: "warning.main",
            }}
          >
            <EmojiEventsOutlined />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800}>
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {meta.totalItems > 0
                ? `${meta.totalItems} tài liệu nổi bật trong cộng đồng`
                : "Các tài liệu được cộng đồng bình chọn hữu ích nhất"}
            </Typography>
          </Box>
        </Stack>

        {showControls && (
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            flexWrap="wrap"
            sx={{ width: { xs: "100%", sm: "auto" }, justifyContent: "space-between" }}
          >
            {/* SortBy Switch */}
            <ButtonGroup size="small" variant="outlined">
              <Button
                variant={sortBy === "rating" ? "contained" : "outlined"}
                startIcon={<StarRounded sx={{ fontSize: 16 }} />}
                onClick={() => setSortBy("rating")}
              >
                Điểm đánh giá
              </Button>
              <Button
                variant={sortBy === "downloadCount" ? "contained" : "outlined"}
                startIcon={<CloudDownloadOutlined sx={{ fontSize: 16 }} />}
                onClick={() => setSortBy("downloadCount")}
              >
                Lượt tải
              </Button>
            </ButtonGroup>

            {/* Pagination Next / Prev */}
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
                {meta.page}/{meta.totalPages || 1}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                disabled={!meta.hasPrevious && page <= 1}
                onClick={prevPage}
                aria-label="Trang trước"
                sx={{ minWidth: 36, px: 1 }}
              >
                <ArrowBackIosNewOutlined sx={{ fontSize: 12 }} />
              </Button>
              <Button
                size="small"
                variant="outlined"
                disabled={!meta.hasNext && page >= (meta.totalPages || 1)}
                onClick={nextPage}
                aria-label="Trang tiếp theo"
                sx={{ minWidth: 36, px: 1 }}
              >
                <ArrowForwardIosOutlined sx={{ fontSize: 12 }} />
              </Button>
            </Stack>
          </Stack>
        )}
      </Stack>

      {/* Error state */}
      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={reload}>
              Thử lại
            </Button>
          }
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <Box sx={gridSx}>
          {Array.from({ length: limit }).map((_, index) => (
            <Card key={index} variant="outlined" sx={{ borderRadius: 3, p: 2.5, height: 200 }}>
              <Stack spacing={1.5}>
                <Skeleton variant="rounded" width={40} height={40} />
                <Skeleton variant="text" width="80%" height={28} />
                <Skeleton variant="text" width="40%" height={20} />
                <Skeleton variant="rounded" width="100%" height={32} sx={{ mt: 2 }} />
              </Stack>
            </Card>
          ))}
        </Box>
      ) : items.length === 0 ? (
        <Box
          sx={{
            py: 5,
            textAlign: "center",
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 3,
          }}
        >
          <Typography color="text.secondary">
            Chưa có tài liệu nổi bật nào được xếp hạng.
          </Typography>
        </Box>
      ) : (
        <Box sx={gridSx}>
          {items.map((document) => (
            <TopRatedDocumentCard
              key={document.id}
              document={document}
              onPreview={onPreview}
            />
          ))}
        </Box>
      )}
    </Wrapper>
  );
}
