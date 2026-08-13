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
  AutoAwesomeOutlined,
  BookmarkOutlined,
  ChevronRightOutlined,
  DeleteOutlined,
  DescriptionOutlined,
  DownloadOutlined,
  EditOutlined,
  InfoOutlined,
  LockOutlined,
  LockOpenOutlined,
  LoginOutlined,
  LogoutOutlined,
  PersonAddOutlined,
  PersonOutlined,
  RefreshOutlined,
  SyncOutlined,
  UploadOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import { useState } from "react";
import { formatRelativeFull, getActionConfig } from "../../utils/admin-formatters.js";
import AuditLogDetailDrawer from "./AuditLogDetailDrawer.jsx";

const ACTION_ICONS = {
  Login: LoginOutlined,
  Logout: LogoutOutlined,
  Refresh: SyncOutlined,
  Edit: EditOutlined,
  Block: LockOutlined,
  CheckCircle: LockOpenOutlined,
  AdminPanelSettings: LockOpenOutlined,
  UploadFile: UploadOutlined,
  Delete: DeleteOutlined,
  Visibility: VisibilityOutlined,
  Download: DownloadOutlined,
  Bookmark: BookmarkOutlined,
  AutoAwesome: AutoAwesomeOutlined,
  PersonAdd: PersonAddOutlined,
  Error: InfoOutlined,
  Info: InfoOutlined,
};

function ActionBadge({ action }) {
  const cfg = getActionConfig(action);
  const IconComponent = ACTION_ICONS[cfg.Icon] || InfoOutlined;

  return (
    <Chip
      icon={<IconComponent sx={{ fontSize: 14 }} />}
      label={cfg.label}
      size="small"
      sx={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        fontWeight: 600,
        fontSize: "0.7rem",
        height: 26,
        border: `1px solid ${cfg.border || cfg.bg}`,
        "& .MuiChip-icon": {
          color: cfg.color,
        },
      }}
    />
  );
}

function UserCell({ userId, fullName }) {
  if (!userId) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Avatar sx={{ width: 28, height: 28, bgcolor: "action.disabledBackground" }}>
          <AutoAwesomeOutlined sx={{ fontSize: 14 }} />
        </Avatar>
        <Typography variant="body2" color="text.disabled" sx={{ fontSize: "0.8rem" }}>
          Hệ thống
        </Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Avatar sx={{ width: 28, height: 28, bgcolor: "#6366f1", fontSize: "0.7rem" }}>
        {fullName ? fullName.charAt(0).toUpperCase() : <PersonOutlined sx={{ fontSize: 14 }} />}
      </Avatar>
      <Typography variant="body2" fontWeight={500} sx={{ fontSize: "0.8rem" }}>
        {fullName || userId.slice(0, 8) + "..."}
      </Typography>
    </Box>
  );
}

function TargetCell({ log }) {
  const type = log.targetType || null;
  const id = log.targetId;

  if (!id) return <Typography variant="body2" color="text.disabled">—</Typography>;

  const IconComponent = type?.toLowerCase().includes("document") ? DescriptionOutlined : PersonOutlined;

  return (
    <Tooltip title={`${type}: ${id}`} placement="top">
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <IconComponent sx={{ fontSize: 16, color: "text.disabled" }} />
        <Typography
          variant="body2"
          sx={{
            fontFamily: "monospace",
            fontSize: "0.72rem",
            maxWidth: 100,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {id.slice(0, 12)}...
        </Typography>
      </Box>
    </Tooltip>
  );
}

function EmptyState() {
  return (
    <Box sx={{ py: 8, textAlign: "center" }}>
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
          <Button size="small" startIcon={<RefreshOutlined />} onClick={audit.retry}>
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
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
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
      <Card
        sx={{
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 120px 120px 50px",
            px: 2,
            py: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "#fafafa",
          }}
        >
          {["Người thực hiện", "Đối tượng", "Hành động", "Thời gian", ""].map((label) => (
            <Typography
              key={label}
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              sx={{ letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "0.65rem" }}
            >
              {label}
            </Typography>
          ))}
        </Box>

        {/* Loading skeleton */}
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <Box
              key={i}
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 120px 120px 50px",
                px: 2,
                py: 1.5,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              {[80, 80, 70, 60, 30].map((w, j) => (
                <Box
                  key={j}
                  sx={{
                    height: 14,
                    width: w,
                    borderRadius: 1,
                    bgcolor: "action.hover",
                  }}
                />
              ))}
            </Box>
          ))}

        {/* Empty state */}
        {!loading && logs.length === 0 && <EmptyState />}

        {/* Data rows */}
        {!loading &&
          logs.map((log) => (
            <Box
              key={log.id}
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 120px 120px 50px",
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
              {/* Người thực hiện */}
              <UserCell userId={log.userId} />

              {/* Đối tượng */}
              <TargetCell log={log} />

              {/* Hành động */}
              <ActionBadge action={log.action} />

              {/* Thời gian */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <AccessTimeOutlined sx={{ fontSize: 14, color: "text.disabled" }} />
                <Typography variant="body2" sx={{ fontSize: "0.78rem" }}>
                  {formatRelativeFull(log.createdAt)}
                </Typography>
              </Box>

              {/* Nút chi tiết */}
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Tooltip title="Xem chi tiết">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLog(log);
                    }}
                    sx={{
                      color: "#f97316",
                      bgcolor: "rgba(249, 115, 22, 0.08)",
                      "&:hover": {
                        bgcolor: "rgba(249, 115, 22, 0.15)",
                      },
                    }}
                  >
                    <ChevronRightOutlined sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))}
      </Card>

      {/* Pagination */}
      {pageCount > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            page={page}
            count={pageCount}
            onChange={(_, v) => audit.setPage(v)}
            shape="rounded"
            color="primary"
            size="medium"
          />
        </Box>
      )}

      <AuditLogDetailDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />
    </>
  );
}
