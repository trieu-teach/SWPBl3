import {
  Alert,
  AlertTitle,
  Avatar,
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
import { alpha } from "@mui/material/styles";
import {
  AccessTimeOutlined,
  PersonOutlined,
  InfoOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import { useState } from "react";
import { formatRelativeFull } from "../../utils/admin-formatters.js";
import AuditLogDetailDialog from "./AuditLogDetailDialog.jsx";

const ROLE_TONES = {
  ADMIN: "error",
  MODERATOR: "warning",
  USER: "success",
};

function getToneStyles(theme, tone) {
  if (!tone || !theme.palette[tone]) {
    return {
      bgcolor: theme.palette.action.hover,
      color: theme.palette.text.secondary,
    };
  }

  const color = theme.palette[tone].main;
  return { bgcolor: alpha(color, 0.12), color };
}

const RESULT_TONES = {
  "Đã đăng nhập": "success",
  "Đã kích hoạt": "success",
  "Đã tải lên": "success",
  "Đã xóa": "success",
  "Đã ẩn": "success",
  "Đã lưu": "success",
  "Đã bỏ lưu": "default",
  "Đã kiểm duyệt": "success",
  "Đã xử lý": "success",
  "Đã bác bỏ": "error",
  "Đã cập nhật": "info",
  "Đã tạo": "info",
  "Đã thanh toán": "success",
  "Đã hoàn tiền": "warning",
  "Đã áp dụng hoàn tiền": "warning",
  "Đã duyệt": "success",
  "Đang hoạt động": "success",
  "Đã chặn": "error",
  "Đã từ chối": "error",
  "Đã hết hạn": "default",
  "Chưa kích hoạt": "default",
  "Đang chờ duyệt": "warning",
  "Công khai": "success",
  "Riêng tư": "default",
  "Vai trò người dùng": "info",
  "Vai trò quản trị": "error",
  "Vai trò kiểm duyệt": "warning",
};

function UserAvatar({ log }) {
  const avatarUrl = log.userAvatarUrl;
  const fullName = log.userFullName || log.userEmail || "";
  const initial = fullName.charAt(0).toUpperCase() || "?";

  return (
    <Tooltip title={fullName || log.userEmail || "Người dùng"} placement="top">
      <Avatar
        src={avatarUrl}
        alt={fullName ? `Avatar của ${fullName}` : "Avatar người dùng hệ thống"}
        sx={{
          width: 32,
          height: 32,
          fontSize: "0.75rem",
          bgcolor: avatarUrl ? "transparent" : "primary.main",
        }}
      >
        {!avatarUrl && initial}
      </Avatar>
    </Tooltip>
  );
}

function RoleBadge({ role, roleLabel }) {
  const tone = ROLE_TONES[role?.toUpperCase()] || "default";
  const displayLabel = roleLabel || role || "—";
  
  if (!role && !roleLabel) {
    return null;
  }
  
  return (
    <Chip
      label={displayLabel}
      size="small"
      sx={(theme) => ({
        ...getToneStyles(theme, tone),
        fontWeight: 600,
        fontSize: "0.65rem",
        height: 20,
        maxWidth: 80,
        "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" },
      })}
    />
  );
}

function UserCell({ log }) {
  const displayName = log.userFullName || "Đã xóa";

  if (!log.userId && !log.userFullName) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Avatar sx={{ width: 28, height: 28, bgcolor: "action.disabledBackground" }}>
          <PersonOutlined sx={{ fontSize: 14 }} />
        </Avatar>
        <Typography variant="body2" color="text.disabled" sx={{ fontSize: "0.8rem" }}>
          Hệ thống
        </Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <UserAvatar log={log} />
      <Box>
        <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8rem" }}>
          {displayName}
        </Typography>
        <RoleBadge role={log.userRole} roleLabel={log.userRoleLabel} />
      </Box>
    </Box>
  );
}

function ResultBadge({ result, resultLabel }) {
  const label = resultLabel || result || "—";
  const tone = RESULT_TONES[label] || "default";

  return (
    <Box>
      <Chip
        label={label}
        size="small"
        sx={(theme) => ({
          ...getToneStyles(theme, tone),
          fontWeight: 600,
          fontSize: "0.65rem",
          height: 22,
          maxWidth: 120,
          borderRadius: "6px",
          "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" },
        })}
      />
    </Box>
  );
}

function ActionBadge({ log }) {
  const label = log.actionLabel || log.action || "Hành động khác";
  return (
    <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.78rem" }}>
      {label}
    </Typography>
  );
}

function EmptyState() {
  return (
    <Box sx={{ py: 8, textAlign: "center" }} role="status">
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          bgcolor: "action.hover",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 2,
          color: "text.disabled",
        }}
      >
        <InfoOutlined sx={{ fontSize: 24 }} />
      </Box>
      <Typography variant="body1" fontWeight={600} sx={{ mb: 0.5 }}>
        Không có bản ghi nào
      </Typography>
      <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
        Không tìm thấy nhật ký hoạt động phù hợp.
      </Typography>
    </Box>
  );
}

export default function AuditLogTable({ audit }) {
  const { logs, loading, error, total, page, pageCount } = audit;
  const [selectedLog, setSelectedLog] = useState(null);

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button size="small" startIcon={<VisibilityOutlined />} onClick={audit.retry}>
            Thử lại
          </Button>
        }
        sx={{ borderRadius: 3 }}
      >
        <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
        {error}
      </Alert>
    );
  }

  return (
    <>
      {/* Stats bar */}
      <Box
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}
        role="status"
        aria-live="polite"
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {loading ? (
            <CircularProgress size={14} />
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                Tổng cộng
              </Typography>
              <Chip label={total} size="small" sx={{ fontWeight: 700, height: 22, fontSize: "0.75rem" }} />
            </>
          )}
        </Box>
        {pageCount > 1 && (
          <Typography variant="caption" color="text.disabled">
            Trang {page} / {pageCount}
          </Typography>
        )}
      </Box>

      <Card variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer
          tabIndex={0}
          aria-label="Bảng nhật ký kiểm tra, có thể cuộn ngang"
          sx={{ width: "100%", overflowX: "auto" }}
        >
          <Table aria-label="Nhật ký kiểm tra" size="small" sx={{ minWidth: 860 }}>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: "action.hover",
                  "& .MuiTableCell-root": {
                    py: 1.5,
                    color: "text.secondary",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  },
                }}
              >
                <TableCell sx={{ minWidth: 190 }}>Người thực hiện</TableCell>
                <TableCell sx={{ minWidth: 210 }}>Hành động</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Kết quả</TableCell>
                <TableCell sx={{ minWidth: 180 }}>Thời gian</TableCell>
                <TableCell align="right" sx={{ minWidth: 90 }}>
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading &&
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton height={36} /></TableCell>
                    <TableCell><Skeleton height={24} /></TableCell>
                    <TableCell><Skeleton width={90} height={28} /></TableCell>
                    <TableCell><Skeleton height={24} /></TableCell>
                    <TableCell align="right"><Skeleton width={34} height={34} sx={{ ml: "auto" }} /></TableCell>
                  </TableRow>
                ))}

              {!loading && logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ p: 0 }}>
                    <EmptyState />
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell><UserCell log={log} /></TableCell>
                    <TableCell><ActionBadge log={log} /></TableCell>
                    <TableCell>
                      <ResultBadge result={log.result} resultLabel={log.resultLabel} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, whiteSpace: "nowrap" }}>
                        <AccessTimeOutlined sx={{ fontSize: 14, color: "text.disabled" }} />
                        <Typography variant="body2" sx={{ fontSize: "0.82rem" }}>
                          {formatRelativeFull(log.createdAt)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          size="small"
                          aria-label={`Xem chi tiết nhật ký của ${log.userFullName || "người dùng"}`}
                          onClick={() => setSelectedLog(log)}
                          sx={{
                            color: "primary.main",
                            bgcolor: "action.selected",
                            width: 34,
                            height: 34,
                            "&:hover": { bgcolor: "action.hover" },
                          }}
                        >
                          <VisibilityOutlined sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {pageCount > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination page={page} count={pageCount} onChange={(_, v) => audit.setPage(v)} shape="rounded" color="primary" />
        </Box>
      )}

      <AuditLogDetailDialog log={selectedLog} onClose={() => setSelectedLog(null)} />
    </>
  );
}
