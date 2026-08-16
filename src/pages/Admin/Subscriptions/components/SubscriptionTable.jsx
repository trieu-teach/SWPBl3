import { RefreshOutlined, VisibilityOutlined } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Pagination,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

const dateTime = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
});

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateTime.format(date);
}

export default function SubscriptionTable({ admin }) {
  if (admin.error) {
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
  }

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Người dùng đang sử dụng gói trả phí
        </Typography>
        <Typography color="text.secondary">
          {admin.loading
            ? "Đang tải..."
            : `${(admin.meta.totalItems || 0).toLocaleString("vi-VN")} người dùng`}
        </Typography>
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                <TableCell>Người dùng</TableCell>
                <TableCell>Gói</TableCell>
                <TableCell>Ngày mua</TableCell>
                <TableCell>Ngày hết hạn</TableCell>
                <TableCell>Mã giao dịch</TableCell>
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

              {!admin.loading && admin.purchases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography fontWeight={700}>
                      Không tìm thấy đăng ký
                    </Typography>
                    <Typography color="text.secondary">
                      Hiện chưa có người dùng phù hợp với bộ lọc.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {!admin.loading &&
                admin.purchases.map((purchase) => (
                  <TableRow
                    key={`${purchase.userId}-${purchase.planCode}`}
                    hover
                  >
                    <TableCell>
                      <Typography fontWeight={700}>
                        {purchase.fullName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {purchase.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color="primary"
                        label={`${purchase.planName} (${purchase.planCode})`}
                      />
                    </TableCell>
                    <TableCell>{formatDate(purchase.purchasedAt)}</TableCell>
                    <TableCell>{formatDate(purchase.expiresAt)}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "monospace", wordBreak: "break-all" }}
                      >
                        {purchase.transactionCode || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<VisibilityOutlined />}
                        onClick={() => admin.openDetail(purchase)}
                      >
                        Chi tiết
                      </Button>
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
