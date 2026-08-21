import ChatBubbleOutlineOutlined from "@mui/icons-material/ChatBubbleOutlineOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import StorageOutlined from "@mui/icons-material/StorageOutlined";
import { Box, Card, CardContent, Skeleton, Typography } from "@mui/material";
import { formatFileSize } from "../../utils/admin-formatters.js";

const cards = [
  ["Người dùng", "totalUsers", PeopleAltOutlined, "#7c3aed", "#ede9fe"],
  ["Tài liệu", "totalDocuments", DescriptionOutlined, "#2563eb", "#dbeafe"],
  ["Dung lượng", "storageUsedBytes", StorageOutlined, "#0891b2", "#cffafe"],
  [
    "Lượt hỏi AI",
    "totalChats",
    ChatBubbleOutlineOutlined,
    "#059669",
    "#d1fae5",
  ],
  ["Lượt tải", "totalDownloads", DownloadOutlined, "#ea580c", "#ffedd5"],
];

export default function SummaryCards({ pulse, loading }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          xl: "repeat(5, 1fr)",
        },
        gap: 2,
      }}
    >
      {cards.map(([label, field, Icon, color, background]) => (
        <Card key={field} variant="outlined" sx={{ borderRadius: 4 }}>
          <CardContent
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2.5,
            }}
          >
            <Box minWidth={0}>
              <Typography
                color="text.secondary"
                variant="body2"
                fontWeight={600}
              >
                {label}
              </Typography>
              {loading ? (
                <Skeleton width={72} height={42} />
              ) : (
                <Typography variant="h5" fontWeight={800} noWrap>
                  {field === "storageUsedBytes"
                    ? formatFileSize(pulse?.[field] || 0)
                    : Number(pulse?.[field] || 0).toLocaleString("vi-VN")}
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 3,
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                color,
                bgcolor: background,
              }}
            >
              <Icon />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
