import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  BookmarkBorderOutlined,
  BookmarkOutlined,
  CloudDownloadOutlined,
  DescriptionOutlined,
  PersonOutlineOutlined,
  ThumbUpAltOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import {
  displayFileType,
  formatDate,
  getFileTypeColors,
} from "../../DocumentLibrary/utils/document-formatters.js";
import DocumentRatingButtons from "./DocumentRatingButtons.jsx";

const rankColors = {
  1: { color: "#b45309", background: "rgba(245, 158, 11, 0.16)" },
  2: { color: "#64748b", background: "rgba(148, 163, 184, 0.16)" },
  3: { color: "#a16207", background: "rgba(180, 83, 9, 0.13)" },
};

export default function TopRatedDocumentCard({
  document,
  rank,
  onPreview,
  onSave,
  actionId,
  onContributorClick,
}) {
  const [isSaved, setIsSaved] = useState(Boolean(document.saved));
  const fileColors = getFileTypeColors(document);
  const ownerName =
    document.ownerPublicName ||
    document.owner?.fullName ||
    "Tác giả ẩn danh";
  const avatarUrl = document.ownerAvatarUrl || document.owner?.avatarUrl;
  const canOpenContributor = Boolean(
    document.ownerId && onContributorClick,
  );

  const helpfulPercent =
    document.helpfulRating !== undefined && document.helpfulRating !== null
      ? Math.round(Number(document.helpfulRating) * 100)
      : null;

  const totalVotes =
    document.ratingCount ?? document.totalRatings ?? 0;
  const rankColor = rankColors[rank] || rankColors[3];
  const isSaving = actionId === `save-${document.id}`;

  useEffect(() => {
    setIsSaved(Boolean(document.saved));
  }, [document.saved]);

  async function handleSave() {
    if (!onSave || isSaving) return;
    const succeeded = await onSave({ ...document, saved: isSaved });
    if (succeeded) setIsSaved((current) => !current);
  }

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
            {rank && (
              <Chip
                size="small"
                label={`#${rank}`}
                sx={{
                  color: rankColor.color,
                  bgcolor: rankColor.background,
                  fontWeight: 800,
                }}
              />
            )}
            {helpfulPercent !== null && (
              <Chip
                size="small"
                icon={<ThumbUpAltOutlined sx={{ fontSize: "14px !important" }} />}
                label={`${helpfulPercent}% đánh giá cao`}
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
        <ButtonBase
          disabled={!canOpenContributor}
          aria-label={
            canOpenContributor
              ? `Xem hồ sơ cộng đồng của ${ownerName}`
              : undefined
          }
          onClick={() => onContributorClick?.(document.ownerId)}
          sx={{
            mt: 2,
            p: 0.5,
            mx: -0.5,
            width: "calc(100% + 8px)",
            minWidth: 0,
            display: "flex",
            justifyContent: "flex-start",
            gap: 1.25,
            borderRadius: 2,
            textAlign: "left",
            "&:hover": canOpenContributor
              ? { bgcolor: "action.hover", color: "primary.main" }
              : {},
            "&.Mui-focusVisible": {
              outline: "2px solid",
              outlineColor: "primary.main",
              outlineOffset: 2,
            },
          }}
        >
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
        </ButtonBase>

        {/* Metrics Grid */}
        <Box
          sx={{
            mt: "auto",
            pt: 2,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              rowGap: 1.25,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.75}
              sx={{ whiteSpace: "nowrap" }}
            >
              <ThumbUpAltOutlined sx={{ fontSize: 16, color: "success.main" }} />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {helpfulPercent ?? 0}% đánh giá cao · {totalVotes} đánh giá
              </Typography>
            </Stack>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                ml: 2.5,
                pl: 2.5,
                borderLeft: "1px solid",
                borderColor: "divider",
                whiteSpace: "nowrap",
              }}
            >
              <Tooltip title="Lượt tải về">
                <CloudDownloadOutlined sx={{ fontSize: 16, color: "text.secondary" }} />
              </Tooltip>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {document.downloadCount || 0} lượt tải
              </Typography>
            </Box>
          </Box>

          {/* Quick Rate & Date Footer */}
          <Stack
            direction="row"
            alignItems="center"
            sx={{
              mt: 1.5,
              pt: 1.25,
              gap: 3,
              borderTop: "1px dashed",
              borderColor: "divider",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {formatDate(document.createdAt)}
            </Typography>
            <DocumentRatingButtons
              documentId={document.id}
              initialUserRating={document.userRating ?? null}
              helpfulRating={document.helpfulRating}
              totalRatings={totalVotes}
              size="small"
            />
          </Stack>
        </Box>
      </CardContent>
      <CardActions
        sx={{
          px: 2.5,
          py: 1.25,
          gap: 0.5,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Button
          size="small"
          startIcon={<VisibilityOutlined />}
          onClick={() => onPreview?.(document)}
          disabled={!onPreview || actionId === `preview-${document.id}`}
        >
          Xem
        </Button>

        {!document.owned && onSave && (
          <Button
            size="small"
            startIcon={
              isSaving ? (
                <CircularProgress size={16} />
              ) : isSaved ? (
                <BookmarkOutlined />
              ) : (
                <BookmarkBorderOutlined />
              )
            }
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaved ? "Bỏ lưu" : "Lưu"}
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
