import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import { getModeratorDocumentStatus } from "../utils/moderator-document-status.js";

export default function ModeratorDocumentsTable({ moderation }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
      {moderation.loading ? (
        <Box
          sx={{
            minHeight: 240,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            textAlign: "center",
          }}
        >
          <CircularProgress size={30} />
          <Typography color="text.secondary">Đang tải hàng chờ...</Typography>
        </Box>
      ) : moderation.documents.length === 0 ? (
        <Box
          sx={{
            minHeight: 240,
            px: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            textAlign: "center",
          }}
        >
          <FactCheckOutlined color="disabled" sx={{ fontSize: 48 }} />
          <Typography fontWeight={750}>Không có tài liệu cần xử lý</Typography>
          <Typography color="text.secondary">
            Hàng chờ sẽ tự cập nhật khi có tài liệu mới hoặc khi bạn tìm lại.
          </Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table sx={{ minWidth: 880 }}>
            <TableHead>
              <TableRow>
                <TableCell>Tài liệu</TableCell>
                <TableCell>Người đăng</TableCell>
                <TableCell>Phát hiện</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Gửi lúc</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {moderation.documents.map((document) => {
                const status = getModeratorDocumentStatus(
                  document.moderationStatus,
                );
                const keywords = Array.isArray(document.matchedKeywords)
                  ? document.matchedKeywords
                  : [];

                return (
                  <TableRow key={document.id} hover>
                    <TableCell>
                      <Typography fontWeight={700}>{document.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {document.fileName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {document.owner?.fullName || "—"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {document.owner?.email || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                        {keywords.length ? (
                          keywords.slice(0, 2).map((keyword) => (
                            <Chip key={keyword} size="small" label={keyword} />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Không có từ khóa
                          </Typography>
                        )}
                        {keywords.length > 2 && (
                          <Chip size="small" label={`+${keywords.length - 2}`} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={status.label} color={status.color} />
                    </TableCell>
                    <TableCell>
                      {new Date(
                        document.submittedAt || document.createdAt,
                      ).toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        onClick={() => moderation.openDetail(document)}
                      >
                        Xem xét
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}
