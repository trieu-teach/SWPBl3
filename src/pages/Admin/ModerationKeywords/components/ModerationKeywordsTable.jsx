import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import RefreshOutlined from "@mui/icons-material/RefreshOutlined";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Skeleton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  getDomainLabel,
  getSeverityOption,
} from "../utils/moderation-keyword-options.js";

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default function ModerationKeywordsTable({ admin }) {
  if (admin.error) {
    return (
      <Alert
        severity="error"
        action={
          <Button
            color="inherit"
            startIcon={<RefreshOutlined />}
            onClick={admin.loadKeywords}
          >
            Thử lại
          </Button>
        }
      >
        {admin.error}
      </Alert>
    );
  }

  return (
    <>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {admin.loading
          ? "Đang tải..."
          : `${admin.keywords.length} / ${admin.totalKeywords} từ khóa`}
      </Typography>
      <Card variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                <TableCell>Từ khóa</TableCell>
                <TableCell>Nhóm nội dung</TableCell>
                <TableCell>Mức độ</TableCell>
                <TableCell>Kiểm tra không dấu</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Cập nhật</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {admin.loading &&
                Array.from({ length: 6 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={7}>
                      <Skeleton height={42} />
                    </TableCell>
                  </TableRow>
                ))}

              {!admin.loading && admin.keywords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography fontWeight={700}>
                      Không tìm thấy từ khóa
                    </Typography>
                    <Typography color="text.secondary">
                      Hãy thử thay đổi tìm kiếm hoặc bộ lọc trạng thái.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {!admin.loading &&
                admin.keywords.map((keyword) => {
                  const severity = getSeverityOption(keyword.severity);
                  return (
                    <TableRow key={keyword.id} hover>
                      <TableCell>
                        <Typography fontWeight={750}>
                          {keyword.keyword}
                        </Typography>
                      </TableCell>
                      <TableCell>{getDomainLabel(keyword.domain)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={severity.label}
                          color={severity.color}
                          variant={
                            keyword.severity === "CRITICAL"
                              ? "filled"
                              : "outlined"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={keyword.matchNoDiacritics ? "Có" : "Không"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Switch
                            size="small"
                            checked={Boolean(keyword.isActive)}
                            disabled={admin.saving}
                            onChange={() => admin.toggleKeyword(keyword)}
                            inputProps={{
                              "aria-label": `${keyword.isActive ? "Tạm ngừng" : "Kích hoạt"} ${keyword.keyword}`,
                            }}
                          />
                          <Typography variant="body2">
                            {keyword.isActive ? "Hoạt động" : "Tạm ngừng"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{formatDate(keyword.updatedAt)}</TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            color="primary"
                            onClick={() => admin.openEdit(keyword)}
                          >
                            <EditOutlined />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa vĩnh viễn">
                          <IconButton
                            color="error"
                            onClick={() => admin.setDeletingKeyword(keyword)}
                          >
                            <DeleteOutlineOutlined />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </>
  );
}
