import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AutoAwesomeOutlined,
  CloudDownloadOutlined,
  DescriptionOutlined,
  PersonOutlineOutlined,
  StarRounded,
  ThumbUpAltOutlined,
} from "@mui/icons-material";
import {
  displayFileType,
  formatDate,
  getFileTypeColors,
} from "../../pages/User/DocumentLibrary/utils/document-formatters.js";
import DocumentRatingButtons from "../DocumentRating/DocumentRatingButtons.jsx";

export default function TopRatedDocumentCard({ document, onPreview }) {
  const fileColors = getFileTypeColors(document);
  const ownerName =
    document.ownerPublicName ||
    document.owner?.fullName ||
    "Tác giả ẩn danh";
  const avatarUrl = document.ownerAvatarUrl || document.owner?.avatarUrl;

  const helpfulPercent =
    document.helpfulRating !== undefined && document.helpfulRating !== null
      ? Math.round(Number(document.helpfulRating) * 100)
      : null;

  const relevancePercent =
    document.relevanceScore !== undefined && document.relevanceScore !== null
      ? Math.round(Number(document.relevanceScore) * 100)
      : null;

  const totalVotes =
    document.ratingCount ?? document.totalRatings ?? 0;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          boxShadow: (theme) => theme.shadows[3],
          borderColor: "primary.main",
        },
      }}
    >
      <CardContent sx={{ flex: 1, p: 2.5, display: "flex", flexDirection: "column" }}>
        {/* Header: File Icon & Type & Helpful Badge */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
          sx={{ width: "100%" }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              display: "grid",
              placeItems: "center",
              borderRadius: 2,
              bgcolor: fileColors.soft,
              color: fileColors.main,
              flexShrink: 0,
            }}
          >
            <DescriptionOutlined />
          </Box>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: "auto" }}>
            {helpfulPercent !== null && (
              <Chip
                size="small"
                icon={<ThumbUpAltOutlined sx={{ fontSize: "14px !important" }} />}
                label={`${helpfulPercent}%`}
                color={helpfulPercent >= 80 ? "success" : "primary"}
                variant="filled"
                sx={{ fontWeight: 700, fontSize: "0.75rem" }}
              />
            )}
            <Chip
              size="small"
              label={displayFileType(document)}
              sx={{
                bgcolor: fileColors.soft,
                color: fileColors.main,
                fontWeight: 700,
                fontSize: "0.75rem",
              }}
            />
          </Stack>
        </Stack>

        {/* Title */}
        <Typography
          variant="subtitle1"
          fontWeight={750}
          title={document.title}
          onClick={() => onPreview && onPreview(document)}
          sx={{
            mt: 2,
            lineHeight: 1.35,
            cursor: onPreview ? "pointer" : "default",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            "&:hover": onPreview ? { color: "primary.main" } : {},
          }}
        >
          {document.title}
        </Typography>

        {/* Author info with Fallback Avatar */}
        <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mt: 2 }}>
          <Avatar
            src={avatarUrl || undefined}
            alt={ownerName}
            sx={{
              width: 28,
              height: 28,
              fontSize: "0.8rem",
              bgcolor: "primary.light",
              color: "primary.contrastText",
            }}
          >
            {avatarUrl ? null : ownerName[0]?.toUpperCase() || (
              <PersonOutlineOutlined sx={{ fontSize: 16 }} />
            )}
          </Avatar>
          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
            sx={{ fontWeight: 600, fontSize: "0.85rem" }}
          >
            {ownerName}
          </Typography>
        </Stack>

        {/* Metrics Grid */}
        <Box
          sx={{
            mt: "auto",
            pt: 2,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={1}
          >
            <Tooltip title="Lượt tải về">
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <CloudDownloadOutlined sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {document.downloadCount || 0}
                </Typography>
              </Stack>
            </Tooltip>

            {totalVotes > 0 && (
              <Tooltip title="Tổng số lượt đánh giá">
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <StarRounded sx={{ fontSize: 16, color: "warning.main" }} />
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {totalVotes} lượt
                  </Typography>
                </Stack>
              </Tooltip>
            )}

            {relevancePercent !== null && (
              <Tooltip title="Độ liên quan trích dẫn AI">
                <Chip
                  size="small"
                  variant="outlined"
                  icon={<AutoAwesomeOutlined sx={{ fontSize: "13px !important" }} />}
                  label={`${relevancePercent}% AI`}
                  sx={{
                    height: 22,
                    fontSize: "0.7rem",
                    borderColor: "primary.light",
                    color: "primary.main",
                  }}
                />
              </Tooltip>
            )}
          </Stack>

          {/* Quick Rate & Date Footer */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mt: 1.5, pt: 1, borderTop: "1px dashed", borderColor: "divider" }}
          >
            <Typography variant="caption" color="text.secondary">
              {formatDate(document.createdAt)}
            </Typography>
            <DocumentRatingButtons
              documentId={document.id}
              helpfulRating={document.helpfulRating}
              totalRatings={totalVotes}
              size="small"
            />
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
