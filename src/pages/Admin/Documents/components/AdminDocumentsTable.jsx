import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  IconButton,
  Pagination,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  CheckCircleOutlined,
  RefreshOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import {
  canAdminDecide,
  getAdminDocumentModeration,
  getAdminDocumentStatus,
} from "../utils/admin-document-status.js";

function formatSubmittedAt(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("vi-VN");
}

export default function AdminDocumentsTable({ admin }) {
  if (admin.error)
    return (
      <Alert
        severity="error"
        action={
          <Button
            color="inherit"
            startIcon={<RefreshOutlined />}
            onClick={admin.load}
          >
            Thử lại
          </Button>
        }
      >
        {admin.error}
      </Alert>
    );
  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography color="text.secondary">
          {admin.loading
            ? "Đang tải..."
            : `${admin.meta.totalItems || 0} tài liệu`}
        </Typography>
        {admin.loading && <CircularProgress size={20} />}
      </Box>
      <Card variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                <TableCell>
                  <TableSortLabel
                    active={admin.sort.sortBy === "title"}
                    direction={
                      admin.sort.sortBy === "title"
                        ? admin.sort.sortOrder
                        : "asc"
                    }
                    onClick={() => admin.toggleSort("title", "asc")}
                  >
                    Tài liệu
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={admin.sort.sortBy === "submittedAt"}
                    direction={
                      admin.sort.sortBy === "submittedAt"
                        ? admin.sort.sortOrder
                        : "desc"
                    }
                    onClick={() => admin.toggleSort("submittedAt", "desc")}
                  >
                    Ngày nộp
                  </TableSortLabel>
                </TableCell>
                <TableCell>Người đăng</TableCell>
                <TableCell>Quyền</TableCell>
                <TableCell>Kiểm duyệt</TableCell>
                <TableCell>Trạng thái</TableCell>
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
              {!admin.loading && admin.documents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography fontWeight={700}>
                      Không tìm thấy tài liệu
                    </Typography>
                    <Typography color="text.secondary">
                      Hãy thử bộ lọc khác.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {!admin.loading &&
                admin.documents.map((document) => {
                  const moderation = getAdminDocumentModeration(document);
                  const status = getAdminDocumentStatus(document.status);

                  return (
                    <TableRow key={document.id} hover>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography
                        fontWeight={700}
                        noWrap
                        title={document.title}
                      >
                        {document.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {document.fileName}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatSubmittedAt(document.submittedAt)}</TableCell>
                    <TableCell>
                      <Typography>{document.owner?.fullName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {document.owner?.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={
                          document.visibility === "PUBLIC"
                            ? "success"
                            : "secondary"
                        }
                        variant="outlined"
                        label={
                          document.visibility === "PUBLIC"
                            ? "Công khai"
                            : "Riêng tư"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={moderation.label}
                        color={moderation.color}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={status.label}
                        color={status.color}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Xem file">
                        <IconButton onClick={() => admin.openPreview(document)}>
                          <VisibilityOutlined />
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        title={
                          canAdminDecide(document)
                            ? "Chi tiết và kiểm duyệt"
                            : "Xem chi tiết"
                        }
                      >
                        <IconButton
                          color="primary"
                          onClick={() => admin.openDetail(document)}
                        >
                          <CheckCircleOutlined />
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
      {!admin.loading && admin.meta.totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            page={admin.page}
            count={admin.meta.totalPages}
            color="primary"
            onChange={(_event, value) => admin.setPage(value)}
          />
        </Box>
      )}
    </>
  );
}
