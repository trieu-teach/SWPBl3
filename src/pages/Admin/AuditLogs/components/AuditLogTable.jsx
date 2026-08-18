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

function RoleBadge({ role }) {
  const style = getRoleStyle(role);
  return (
    <Chip
      label={role || "—"}
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
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 160 }}>
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
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 160 }}>
      <UserAvatar log={log} />
      <Box>
        <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8rem" }}>
          {displayName}
        </Typography>
        <RoleBadge role={log.userRole} />
      </Box>
    </Box>
  );
}

function ResultBadge({ result }) {
  const label = result || "—";
  const isBlocked = result === "BLOCKED" || result === "HIDDEN" || result === "REJECTED";
  const isActive = result === "ACTIVE" || result === "APPROVED" || result === "PAID";
  const color = isBlocked ? "#dc2626" : isActive ? "#059669" : "#6b7280";
  const bg = isBlocked ? "#fee2e2" : isActive ? "#d1fae5" : "#f3f4f6";

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        backgroundColor: bg,
        color: color,
        fontWeight: 600,
        fontSize: "0.65rem",
        height: 20,
        maxWidth: 80,
        "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" },
      }}
    />
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

      {/* Table */}
      <Card sx={{ borderRadius: "16px", overflow: "hidden", border: "1px solid", borderColor: "divider", boxShadow: "none" }}>
        {/* Header */}
        <Box
          component="header"
          sx={{
            display: "grid",
            gridTemplateColumns: "2fr 2fr 1fr 2fr 48px",
            gap: 2,
            px: 2,
            py: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "#fafafa",
          }}
        >
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "0.65rem" }}>
            Người thực hiện
          </Typography>
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "0.65rem" }}>
            Hành động
          </Typography>
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "0.65rem" }}>
            Kết quả
          </Typography>
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "0.65rem" }}>
            Thời gian
          </Typography>
          <Box />
        </Box>

        {/* Loading skeleton */}
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <Box
              key={i}
              sx={{
                display: "grid",
                gridTemplateColumns: "2fr 2fr 1fr 2fr 48px",
                gap: 2,
                px: 2,
                py: 1.5,
                borderBottom: "1px solid",
                borderColor: "divider",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: "action.hover" }} />
                <Box>
                  <Box sx={{ height: 12, width: 100, borderRadius: 1, bgcolor: "action.hover", mb: 0.5 }} />
                  <Box sx={{ height: 10, width: 50, borderRadius: 1, bgcolor: "action.hover" }} />
                </Box>
              </Box>
              <Box sx={{ height: 20, width: 120, borderRadius: 2, bgcolor: "action.hover" }} />
              <Box sx={{ height: 20, width: 60, borderRadius: 2, bgcolor: "action.hover" }} />
              <Box sx={{ height: 12, width: 100, borderRadius: 1, bgcolor: "action.hover" }} />
              <Box sx={{ height: 28, width: 28, borderRadius: 1, bgcolor: "action.hover", mx: "auto" }} />
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
                gridTemplateColumns: "2fr 2fr 1fr 2fr 48px",
                gap: 2,
                px: 2,
                py: 1.5,
                borderBottom: "1px solid",
                borderColor: "divider",
                cursor: "pointer",
                "&:hover": { bgcolor: "action.hover" },
                "&:last-child": { borderBottom: 0 },
                alignItems: "center",
              }}
              onClick={() => setSelectedLog(log)}
            >
              <UserCell log={log} />
              <ActionBadge log={log} />
              <ResultBadge result={log.result} />
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <AccessTimeOutlined sx={{ fontSize: 14, color: "text.disabled" }} />
                <Typography variant="body2" sx={{ fontSize: "0.78rem" }}>
                  {formatRelativeFull(log.createdAt)}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Tooltip title="Xem chi tiết">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLog(log);
                    }}
                    sx={{ color: "#6366f1", bgcolor: "rgba(99,102,241,0.08)", "&:hover": { bgcolor: "rgba(99,102,241,0.15)" } }}
                  >
                    <VisibilityOutlined sx={{ fontSize: 18 }} />
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
