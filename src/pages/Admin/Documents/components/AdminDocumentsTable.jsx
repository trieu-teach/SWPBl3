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
  Tooltip,
  Typography,
} from "@mui/material";
import {
  CheckCircleOutlined,
  RefreshOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";

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
                <TableCell>Tài liệu</TableCell>
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
                    <TableCell colSpan={6}>
                      <Skeleton height={42} />
                    </TableCell>
                  </TableRow>
                ))}
              {!admin.loading && admin.documents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
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
                admin.documents.map((document) => (
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
                    <TableCell>
                      <Typography>{document.owner?.fullName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {document.owner?.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
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
                        label={
                          document.moderationStatus === "APPROVED"
                            ? "Đã duyệt"
                            : document.moderationStatus === "REJECTED"
                              ? "Từ chối"
                              : "Chờ duyệt"
                        }
                        color={
                          document.moderationStatus === "APPROVED"
                            ? "success"
                            : document.moderationStatus === "REJECTED"
                              ? "error"
                              : "warning"
                        }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={
                          document.status === "HIDDEN" ? "Đã ẩn" : "Hoạt động"
                        }
                        color={
                          document.status === "HIDDEN" ? "error" : "success"
                        }
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
                          document.moderationStatus === "PENDING"
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
                ))}
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
