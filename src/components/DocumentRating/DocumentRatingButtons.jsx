import { useState } from "react";
import {
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ThumbUpOutlined from "@mui/icons-material/ThumbUpOutlined";
import ThumbUpRounded from "@mui/icons-material/ThumbUpRounded";
import ThumbDownOutlined from "@mui/icons-material/ThumbDownOutlined";
import ThumbDownRounded from "@mui/icons-material/ThumbDownRounded";
import { useRateDocument } from "../../hooks/useRating.js";
import { useToast } from "../Toast/ToastProvider.jsx";

export default function DocumentRatingButtons({
  documentId,
  initialUserRating = null,
  helpfulRating = null,
  totalRatings = null,
  showStats = false,
  size = "small",
  onRatingChanged,
}) {
  const toast = useToast();
  const { rateDocument, loading } = useRateDocument();
  const [userRating, setUserRating] = useState(initialUserRating);

  async function handleRate(isHelpful) {
    if (!documentId || loading) return;

    const previousRating = userRating;
    setUserRating(isHelpful);

    try {
      await rateDocument({ documentId, isHelpful });
      toast.success(
        isHelpful
          ? "Đã đánh giá tài liệu là hữu ích."
          : "Đã gửi phản hồi đánh giá.",
      );
      if (typeof onRatingChanged === "function") {
        onRatingChanged({ documentId, isHelpful });
      }
    } catch (err) {
      setUserRating(previousRating);
      const message =
        err?.message ||
        "Tài liệu này không tồn tại, đã bị xóa hoặc đang ở chế độ riêng tư.";
      toast.error(message);
    }
  }

  const isSmall = size === "small";
  const iconSize = isSmall ? 16 : 20;

  return (
    <Stack direction="row" alignItems="center" spacing={0.75}>
      {showStats && helpfulRating !== null && helpfulRating !== undefined && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 600, mr: 0.5 }}
        >
          {Math.round(helpfulRating * 100)}% hữu ích
          {totalRatings ? ` (${totalRatings})` : ""}
        </Typography>
      )}

      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
        <Tooltip title="Tài liệu hữu ích">
          <span>
            <IconButton
              size={size}
              onClick={() => handleRate(true)}
              disabled={loading}
              aria-label="Đánh giá tài liệu hữu ích"
              sx={{
                p: isSmall ? 0.5 : 1,
                color: userRating === true ? "primary.main" : "text.secondary",
                bgcolor:
                  userRating === true ? "action.selected" : "transparent",
                "&:hover": {
                  bgcolor: "action.hover",
                  color:
                    userRating === true ? "primary.main" : "primary.light",
                },
              }}
            >
              {loading && userRating === true ? (
                <CircularProgress size={iconSize} />
              ) : userRating === true ? (
                <ThumbUpRounded sx={{ fontSize: iconSize }} />
              ) : (
                <ThumbUpOutlined sx={{ fontSize: iconSize }} />
              )}
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Tài liệu không hữu ích">
          <span>
            <IconButton
              size={size}
              onClick={() => handleRate(false)}
              disabled={loading}
              aria-label="Đánh giá tài liệu không hữu ích"
              sx={{
                p: isSmall ? 0.5 : 1,
                color: userRating === false ? "error.main" : "text.secondary",
                bgcolor:
                  userRating === false ? "action.selected" : "transparent",
                "&:hover": {
                  bgcolor: "action.hover",
                  color:
                    userRating === false ? "error.main" : "error.light",
                },
              }}
            >
              {loading && userRating === false ? (
                <CircularProgress size={iconSize} />
              ) : userRating === false ? (
                <ThumbDownRounded sx={{ fontSize: iconSize }} />
              ) : (
                <ThumbDownOutlined sx={{ fontSize: iconSize }} />
              )}
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Stack>
  );
}
