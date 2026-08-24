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
  TableSortLabel,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AccessTimeOutlined,
  PersonOutlined,
  InfoOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import { useState } from "react";
import { formatRelativeFull } from "../../utils/admin-formatters.js";
import AuditLogDetailDialog from "./AuditLogDetailDialog.jsx";

const ROLE_COLORS = {
  ADMIN: { bg: "#fee2e2", color: "#dc2626" },
  MODERATOR: { bg: "#fef3c7", color: "#d97706" },
  USER: { bg: "#d1fae5", color: "#059669" },
};

function getRoleStyle(role) {
  return ROLE_COLORS[role?.toUpperCase()] || { bg: "#f3f4f6", color: "#6b7280" };
}

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
          bgcolor: avatarUrl ? "transparent" : "#6366f1",
        }}
      >
        {!avatarUrl && initial}
      </Avatar>
    </Tooltip>
  );
}

function RoleBadge({ role, roleLabel }) {
  const style = getRoleStyle(role);
  const displayLabel = roleLabel || role || "—";
  
  if (!role && !roleLabel) {
    return null;
  }
  
  return (
    <Chip
      label={displayLabel}
      size="small"
      sx={{
        backgroundColor: style.bg,
        color: style.color,
        fontWeight: 600,
        fontSize: "0.65rem",
        height: 20,
        maxWidth: 80,
        "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" },
      }}
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

  const RESULT_COLORS = {
    // Thành công - xanh lá
    "Đã đăng nhập": { bg: "#d1fae5", color: "#059669" },
    "Đã kích hoạt": { bg: "#d1fae5", color: "#059669" },
    "Đã tải lên": { bg: "#d1fae5", color: "#059669" },
    "Đã xóa": { bg: "#d1fae5", color: "#059669" },
    "Đã ẩn": { bg: "#d1fae5", color: "#059669" },
    "Đã lưu": { bg: "#d1fae5", color: "#059669" },
    "Đã bỏ lưu": { bg: "#f3f4f6", color: "#6b7280" },
    "Đã kiểm duyệt": { bg: "#d1fae5", color: "#059669" },
    "Đã xử lý": { bg: "#d1fae5", color: "#059669" },
    "Đã bác bỏ": { bg: "#fee2e2", color: "#dc2626" },
    "Đã cập nhật": { bg: "#e0f2fe", color: "#0891b2" },
    "Đã tạo": { bg: "#e0f2fe", color: "#0891b2" },
    "Đã thanh toán": { bg: "#d1fae5", color: "#059669" },
    "Đã hoàn tiền": { bg: "#fef3c7", color: "#d97706" },
    "Đã áp dụng hoàn tiền": { bg: "#fef3c7", color: "#d97706" },
    "Đã duyệt": { bg: "#d1fae5", color: "#059669" },
    "Đang hoạt động": { bg: "#d1fae5", color: "#059669" },
    // Thất bại / Cảnh báo - đỏ / cam
    "Đã chặn": { bg: "#fee2e2", color: "#dc2626" },
    "Đã từ chối": { bg: "#fee2e2", color: "#dc2626" },
    "Đã hết hạn": { bg: "#f3f4f6", color: "#6b7280" },
    "Chưa kích hoạt": { bg: "#f3f4f6", color: "#6b7280" },
    "Đang chờ duyệt": { bg: "#fef3c7", color: "#d97706" },
    "Công khai": { bg: "#d1fae5", color: "#059669" },
    "Riêng tư": { bg: "#f3f4f6", color: "#6b7280" },
    "Vai trò người dùng": { bg: "#ede9fe", color: "#4f46e5" },
    "Vai trò quản trị": { bg: "#fee2e2", color: "#dc2626" },
    "Vai trò kiểm duyệt": { bg: "#fef3c7", color: "#d97706" },
  };

  const config = RESULT_COLORS[label] || { bg: "#f3f4f6", color: "#6b7280" };

  return (
    <Box>
      <Chip
        label={label}
        size="small"
        sx={{
          backgroundColor: config.bg,
          color: config.color,
          fontWeight: 600,
          fontSize: "0.65rem",
          height: 22,
          maxWidth: 120,
          borderRadius: "6px",
          "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" },
        }}
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
  const { logs, loading, error, total, page, pageCount, sortOrder } = audit;
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

      {/* Table */}
      <Card sx={{ borderRadius: "16px", overflow: "hidden", border: "1px solid", borderColor: "divider", boxShadow: "none" }}>
        {/* Header */}
        <Box
          component="header"
          sx={{
            display: "grid",
            gridTemplateColumns: "1.8fr 2fr 1.2fr 1.4fr 0.6fr",
            alignItems: "center",
            px: 2.5,
            py: 1.5,
            borderBottom: "2px solid",
            borderColor: "divider",
            bgcolor: "action.hover",
          }}
        >
          <Box sx={{ gridColumn: 1 }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.06em", textTransform: "uppercase", fontSize: "0.68rem" }}>
              Người thực hiện
            </Typography>
          </Box>
          <Box sx={{ gridColumn: 2 }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.06em", textTransform: "uppercase", fontSize: "0.68rem" }}>
              Hành động
            </Typography>
          </Box>
          <Box sx={{ gridColumn: 3 }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.06em", textTransform: "uppercase", fontSize: "0.68rem" }}>
              Kết quả
            </Typography>
          </Box>
          <Box sx={{ gridColumn: 4 }}>
            <TableSortLabel
              active
              direction={sortOrder}
              onClick={audit.toggleSort}
              sx={{
                color: "text.secondary",
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Thời gian
            </TableSortLabel>
          </Box>
          <Box sx={{ gridColumn: 5 }} />
        </Box>

        {/* Loading skeleton */}
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <Box
              key={i}
              sx={{
                display: "grid",
                gridTemplateColumns: "1.8fr 2fr 1.2fr 1.4fr 0.6fr",
                alignItems: "center",
                px: 2.5,
                py: 1.75,
                borderBottom: "1px solid",
                borderColor: "divider",
                "&:last-child": { borderBottom: 0 },
              }}
            >
              <Box sx={{ gridColumn: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  <Box sx={{ width: 34, height: 34, borderRadius: "50%", bgcolor: "action.hover" }} />
                  <Box>
                    <Box sx={{ height: 12, width: "80%", borderRadius: 1, bgcolor: "action.hover", mb: 0.5 }} />
                    <Box sx={{ height: 10, width: "50%", borderRadius: 1, bgcolor: "action.hover" }} />
                  </Box>
                </Box>
              </Box>
              <Box sx={{ gridColumn: 2 }}>
                <Box sx={{ height: 16, width: "70%", borderRadius: 1, bgcolor: "action.hover" }} />
              </Box>
              <Box sx={{ gridColumn: 3 }}>
                <Box sx={{ height: 22, width: 80, borderRadius: 2, bgcolor: "action.hover" }} />
              </Box>
              <Box sx={{ gridColumn: 4 }}>
                <Box sx={{ height: 12, width: "80%", borderRadius: 1, bgcolor: "action.hover" }} />
              </Box>
              <Box sx={{ gridColumn: 5, display: "flex", justifyContent: "center" }}>
                <Box sx={{ height: 28, width: 28, borderRadius: 1, bgcolor: "action.hover" }} />
              </Box>
            </Box>
          ))}

        {!loading && logs.length === 0 && <EmptyState />}

        {/* Data rows */}
        {!loading &&
          logs.map((log) => (
            <Box
              key={log.id}
              sx={{
                display: "grid",
                gridTemplateColumns: "1.8fr 2fr 1.2fr 1.4fr 0.6fr",
                alignItems: "center",
                px: 2.5,
                py: 1.75,
                borderBottom: "1px solid",
                borderColor: "divider",
                "&:hover": { bgcolor: "action.hover" },
                "&:last-child": { borderBottom: 0 },
              }}
            >
              <Box sx={{ gridColumn: 1, overflow: "hidden" }}>
                <UserCell log={log} />
              </Box>
              <Box sx={{ gridColumn: 2, overflow: "hidden" }}>
                <ActionBadge log={log} />
              </Box>
              <Box sx={{ gridColumn: 3, overflow: "hidden" }}>
                <ResultBadge result={log.result} resultLabel={log.resultLabel} />
              </Box>
              <Box sx={{ gridColumn: 4, display: "flex", alignItems: "center", gap: 0.75 }}>
                <AccessTimeOutlined sx={{ fontSize: 14, color: "text.disabled" }} />
                <Typography variant="body2" sx={{ fontSize: "0.82rem" }}>
                  {formatRelativeFull(log.createdAt)}
                </Typography>
              </Box>
              <Box sx={{ gridColumn: 5, display: "flex", justifyContent: "center" }}>
                <Tooltip title="Xem chi tiết">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLog(log);
                    }}
                    sx={{ color: "#6366f1", bgcolor: "rgba(99,102,241,0.08)", width: 34, height: 34, "&:hover": { bgcolor: "rgba(99,102,241,0.15)" } }}
                  >
                    <VisibilityOutlined sx={{ fontSize: 17 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))}
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
