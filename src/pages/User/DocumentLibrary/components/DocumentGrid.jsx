import {
  Box,
  Button,
  Card,
  Pagination,
  Skeleton,
  Typography,
} from "@mui/material";
import { FolderOpenOutlined } from "@mui/icons-material";
import { Link } from "react-router-dom";
import DocumentCard from "./DocumentCard.jsx";

const gridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, 1fr)",
    xl: "repeat(3, 1fr)",
  },
  gap: 2,
};

export default function DocumentGrid({ library }) {
  if (library.loading) {
    return (
      <Box sx={gridSx}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} variant="rounded" height={265} />
        ))}
      </Box>
    );
  }

  if (library.documents.length === 0) {
    return (
      <Card
        variant="outlined"
        sx={{ py: 8, textAlign: "center", borderRadius: 3 }}
      >
        <FolderOpenOutlined
          sx={{ fontSize: 64, color: "text.disabled", mb: 1 }}
        />
        <Typography variant="h6" fontWeight={700}>
          Chưa có tài liệu phù hợp
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Tải tài liệu đầu tiên hoặc thay đổi bộ lọc tìm kiếm.
        </Typography>
        <Button component={Link} to="/documents/upload" variant="contained">
          Tải tài liệu
        </Button>
      </Card>
    );
  }

  return (
    <>
      <Box sx={gridSx}>
        {library.documents.map((document) => (
          <DocumentCard
            key={document.id}
            document={document}
            actionId={library.actionId}
            onOpen={library.openDocument}
          />
        ))}
      </Box>
      {library.pageCount > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            page={library.page}
            count={library.pageCount}
            color="primary"
            onChange={(_, value) => library.setPage(value)}
          />
        </Box>
      )}
    </>
  );
}
