import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Pagination,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AccessTimeOutlined,
  CloseOutlined,
  DescriptionOutlined,
  DownloadOutlined,
  FolderOutlined,
  LockOutlined,
  PeopleOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import { useState } from "react";
import {
  formatDate,
  formatFileSize,
  formatRelativeTime,
  getFileTypeColors,
} from "../../utils/admin-formatters.js";

const ROLE_COLORS = {
  USER: { bg: "rgba(34, 197, 94, 0.1)", color: "#22c55e" },
  ADMIN: { bg: "rgba(239, 68, 68, 0.1)", color: "#ef4444" },
  MODERATOR: { bg: "rgba(234, 179, 8, 0.1)", color: "#eab308" },
};

const ROLE_LABELS = { USER: "User", ADMIN: "Admin", MODERATOR: "Mod" };

// ─── Empty State ──────────────────────────────────────────────────────────────

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
        <DownloadOutlined sx={{ fontSize: 24 }} />
      </Box>
      <Typography variant="body1" fontWeight={600} sx={{ mb: 0.5 }}>
        Không có bản ghi tải xuống
      </Typography>
      <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
        Không tìm thấy hoạt động tải xuống nào phù hợp.
      </Typography>
    </Box>
  );
}

// ─── Cell Components ───────────────────────────────────────────────────────────

function UserCell({ fullName, avatarUrl, role }) {
  const displayName = fullName || "Không xác định";
  const roleColors = ROLE_COLORS[role] || ROLE_COLORS.USER;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
      <Avatar
        src={avatarUrl || undefined}
        sx={{ width: 34, height: 34, fontSize: "0.75rem", bgcolor: "#6366f1", flexShrink: 0 }}
      >
        {displayName.charAt(0).toUpperCase()}
      </Avatar>
      <Box sx={{ minWidth: 0, overflow: "hidden" }}>
        <Tooltip title={fullName || ""} placement="top">
          <Typography variant="body2" sx={{ fontSize: "0.85rem", fontWeight: 500 }} noWrap>
            {displayName}
          </Typography>
        </Tooltip>
        {role && (
          <Chip
            label={ROLE_LABELS[role] || role}
            size="small"
            sx={{
              height: 16,
              fontSize: "0.65rem",
              fontWeight: 600,
              bgcolor: roleColors.bg,
              color: roleColors.color,
              borderRadius: "4px",
              mt: 0.25,
              "& .MuiChip-label": { px: 0.5 },
            }}
          />
        )}
      </Box>
    </Box>
  );
}

function DocumentCell({ title, fileType, fileSize }) {
  const fileColors = getFileTypeColors(fileType);
  const displayTitle = title || "Tài liệu đã xóa";
  const ext = fileType?.split("/")[1]?.toUpperCase() || null;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: "8px",
          bgcolor: fileColors.bg,
          color: fileColors.main,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <DescriptionOutlined sx={{ fontSize: 15 }} />
      </Box>
      <Box sx={{ minWidth: 0, overflow: "hidden" }}>
        <Tooltip title={title || "Tài liệu đã xóa"} placement="top">
          <Typography variant="body2" noWrap sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
            {displayTitle}
          </Typography>
        </Tooltip>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {ext && (
            <Typography variant="caption" sx={{ fontSize: "0.72rem", color: "text.disabled" }}>
              {ext}
            </Typography>
          )}
          {ext && fileSize && (
            <Typography variant="caption" sx={{ fontSize: "0.72rem", color: "text.disabled" }}>
              •
            </Typography>
          )}
          {fileSize && (
            <Typography variant="caption" sx={{ fontSize: "0.72rem", color: "text.disabled" }}>
              {formatFileSize(fileSize)}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

function VisibilityChip({ visibility }) {
  const isPublic = visibility === "PUBLIC";
  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Chip
        icon={isPublic ? <PeopleOutlined sx={{ fontSize: "14px !important" }} /> : <LockOutlined sx={{ fontSize: "14px !important" }} />}
        label={isPublic ? "Cộng đồng" : "Riêng tư"}
        size="small"
        sx={{
          height: 26,
          fontSize: "0.75rem",
          fontWeight: 500,
          bgcolor: isPublic ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
          color: isPublic ? "#22c55e" : "#ef4444",
          borderRadius: "6px",
          "& .MuiChip-icon": { color: "inherit" },
        }}
      />
    </Box>
  );
}

function SubjectCategoryCell({ subjectName, categoryName }) {
  if (!subjectName && !categoryName) {
    return <Typography variant="body2" color="text.disabled" sx={{ fontSize: "0.82rem" }}>—</Typography>;
  }
  return (
    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>
      {subjectName && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
          <FolderOutlined sx={{ fontSize: 13, color: "text.disabled", flexShrink: 0 }} />
          <Tooltip title={subjectName} placement="top">
            <Typography variant="body2" sx={{ fontSize: "0.82rem" }} noWrap>
              {subjectName}
            </Typography>
          </Tooltip>
        </Box>
      )}
      {categoryName && (
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem", pl: 2 }} noWrap>
          {categoryName}
        </Typography>
      )}
    </Box>
  );
}

function DownloadCountCell({ count }) {
  if (count === null || count === undefined) {
    return <Typography variant="body2" color="text.disabled" sx={{ fontSize: "0.82rem" }}>—</Typography>;
  }
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
      <DownloadOutlined sx={{ fontSize: 15, color: "text.disabled" }} />
      <Typography variant="body2" sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
        {count.toLocaleString("vi-VN")}
      </Typography>
    </Box>
  );
}

// ─── Detail Dialog ─────────────────────────────────────────────────────────────

function DetailDialog({ log, open, onClose }) {
  if (!log) return null;

  const fileColors = getFileTypeColors(log.fileType);
  const isPublic = log.visibility === "PUBLIC";
  const roleLabels = { USER: "Người dùng", ADMIN: "Quản trị viên", MODERATOR: "Kiểm duyệt viên" };

  const infoItems = [
    {
      label: "Tóm tắt",
      value: log.summary || "—",
      color: "#f97316",
      bgColor: "rgba(249, 115, 22, 0.1)",
      fullWidth: true,
    },
    {
      label: "Người tải",
      value: log.userFullName || "Không xác định",
      sub: log.userEmail,
      tag: log.userRole ? roleLabels[log.userRole] : null,
      color: "#6366f1",
      bgColor: "rgba(99, 102, 241, 0.1)",
    },
    {
      label: "Vai trò",
      value: log.userRole ? roleLabels[log.userRole] : "—",
      color: ROLE_COLORS[log.userRole]?.color || "#6366f1",
      bgColor: ROLE_COLORS[log.userRole]?.bg || "rgba(99, 102, 241, 0.1)",
    },
    {
      label: "Tài liệu",
      value: log.documentTitle || "Tài liệu đã xóa",
      sub: log.fileType ? log.fileType.split("/")[1]?.toUpperCase() : null,
      color: fileColors?.main || "#6366f1",
      bgColor: fileColors?.bg || "rgba(99, 102, 241, 0.1)",
    },
    {
      label: "Kích thước",
      value: log.fileSize ? formatFileSize(log.fileSize) : "—",
      color: "#059669",
      bgColor: "rgba(5, 150, 105, 0.1)",
    },
    {
      label: "Phạm vi",
      value: isPublic ? "Cộng đồng" : "Riêng tư",
      color: isPublic ? "#22c55e" : "#ef4444",
      bgColor: isPublic ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
    },
    {
      label: "Môn học",
      value: log.subjectName || "—",
      color: "#8b5cf6",
      bgColor: "rgba(139, 92, 246, 0.1)",
    },
    {
      label: "Danh mục",
      value: log.categoryName || "—",
      color: "#8b5cf6",
      bgColor: "rgba(139, 92, 246, 0.1)",
    },
    {
      label: "Lượt tải",
      value: log.documentDownloadCount != null ? log.documentDownloadCount.toLocaleString("vi-VN") : "—",
      color: "#f97316",
      bgColor: "rgba(249, 115, 22, 0.1)",
    },
    {
      label: "Thời gian",
      value: log.downloadedAt ? formatDate(log.downloadedAt) : "—",
      sub: log.downloadedAt ? formatRelativeTime(log.downloadedAt) : null,
      color: "#0891b2",
      bgColor: "rgba(8, 145, 178, 0.1)",
    },
    {
      label: "User ID",
      value: log.userId ? `${log.userId.slice(0, 16)}...` : "—",
      mono: true,
      color: "#64748b",
      bgColor: "rgba(100, 116, 139, 0.1)",
    },
    {
      label: "Document ID",
      value: log.documentId ? `${log.documentId.slice(0, 16)}...` : "—",
      mono: true,
      color: "#64748b",
      bgColor: "rgba(100, 116, 139, 0.1)",
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden" } }}
    >
      <Box
        sx={{
          background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
          px: 3,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <DownloadOutlined sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="body1" fontWeight={700} sx={{ color: "white" }}>
              Chi tiết tải xuống
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)", fontFamily: "monospace", fontSize: "0.7rem" }}>
              #{log.id?.slice(0, 8)}...
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: "white" }}>
          <CloseOutlined />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 2,
            }}
          >
            {infoItems.map(({ label, value, sub, tag, color, bgColor, fullWidth, mono }) => (
              <Box
                key={label}
                sx={{
                  p: 2,
                  borderRadius: "12px",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  gridColumn: fullWidth ? "1 / -1" : undefined,
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: color,
                    boxShadow: `0 0 0 3px ${bgColor}`,
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      fontSize: "0.65rem",
                    }}
                  >
                    {label}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ fontSize: "0.9rem", mb: sub || tag ? 0.25 : 0, fontFamily: mono ? "monospace" : undefined }}
                >
                  {value}
                </Typography>
                {(sub || tag) && (
                  <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", flexWrap: "wrap" }}>
                    {sub && (
                      <Typography variant="caption" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                        {sub}
                      </Typography>
                    )}
                    {sub && tag && (
                      <Typography variant="caption" sx={{ fontSize: "0.75rem", color: "text.disabled" }}>•</Typography>
                    )}
                    {tag && (
                      <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: 600, color }}>
                        {tag}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Table Component ───────────────────────────────────────────────────────

export default function DownloadLogTable({ download }) {
  const { logs, loading, error, total, page, pageCount } = download;
  const [selectedLog, setSelectedLog] = useState(null);

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button size="small" startIcon={<DownloadOutlined />} onClick={download.retry}>
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
      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {loading ? (
            <CircularProgress size={14} />
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
                Tổng cộng
              </Typography>
              <Box
                sx={{
                  bgcolor: "#f97316",
                  color: "white",
                  borderRadius: "6px",
                  px: 1,
                  py: 0.25,
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  lineHeight: 1.6,
                }}
              >
                {total}
              </Box>
            </>
          )}
        </Box>
        {pageCount > 1 && (
          <Typography variant="caption" color="text.disabled">
            Trang {page} / {pageCount}
          </Typography>
        )}
      </Box>

      {/* Table Card — full width */}
      <Card
        sx={{
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
        }}
      >
        {/* Header — CSS Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1.6fr 2.4fr 1.2fr 1.4fr 0.7fr 1.2fr 0.5fr",
            columnGap: 2,
            alignItems: "center",
            px: 2.5,
            py: 1.5,
            borderBottom: "2px solid",
            borderColor: "divider",
            bgcolor: "#fafafa",
          }}
        >
          {/* Người tải */}
          <Box sx={{ gridColumn: 1 }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.06em", textTransform: "uppercase", fontSize: "0.68rem" }}>
              Người tải
            </Typography>
          </Box>

          {/* Tài liệu */}
          <Box sx={{ gridColumn: 2 }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.06em", textTransform: "uppercase", fontSize: "0.68rem" }}>
              Tài liệu
            </Typography>
          </Box>

          {/* Phạm vi */}
          <Box sx={{ gridColumn: 3, display: "flex", justifyContent: "center" }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.06em", textTransform: "uppercase", fontSize: "0.68rem" }}>
              Phạm vi
            </Typography>
          </Box>

          {/* Môn / Danh mục */}
          <Box sx={{ gridColumn: 4, pl: 0.25 }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.06em", textTransform: "uppercase", fontSize: "0.68rem" }}>
              Môn / Danh mục
            </Typography>
          </Box>

          {/* Lượt tải */}
          <Box sx={{ gridColumn: 5, textAlign: "center" }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.06em", textTransform: "uppercase", fontSize: "0.68rem" }}>
              Lượt tải
            </Typography>
          </Box>

          {/* Thời gian */}
          <Box sx={{ gridColumn: 6 }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.06em", textTransform: "uppercase", fontSize: "0.68rem" }}>
              Thời gian
            </Typography>
          </Box>

          {/* Tác vụ */}
          <Box sx={{ gridColumn: 7, textAlign: "center" }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.06em", textTransform: "uppercase", fontSize: "0.68rem" }}>
              Tác vụ
            </Typography>
          </Box>
        </Box>

        {/* Loading skeleton */}
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <Box
              key={i}
              sx={{
                display: "grid",
                gridTemplateColumns: "1.6fr 2.4fr 1.2fr 1.4fr 0.7fr 1.2fr 0.5fr",
                columnGap: 2,
                alignItems: "center",
                px: 2.5,
                py: 1.75,
                borderBottom: "1px solid",
                borderColor: "divider",
                "&:last-child": { borderBottom: 0 },
              }}
            >
              <Box sx={{ gridColumn: 1 }}>
                <Box sx={{ height: 12, width: "80%", borderRadius: 1, bgcolor: "action.hover" }} />
              </Box>
              <Box sx={{ gridColumn: 2 }}>
                <Box sx={{ height: 12, width: "90%", borderRadius: 1, bgcolor: "action.hover" }} />
              </Box>
              <Box sx={{ gridColumn: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Box sx={{ height: 12, width: 60, borderRadius: 1, bgcolor: "action.hover" }} />
              </Box>
              <Box sx={{ gridColumn: 4 }}>
                <Box sx={{ height: 12, width: "90%", borderRadius: 1, bgcolor: "action.hover" }} />
              </Box>
              <Box sx={{ gridColumn: 5, display: "flex", justifyContent: "center" }}>
                <Box sx={{ height: 12, width: 24, borderRadius: 1, bgcolor: "action.hover" }} />
              </Box>
              <Box sx={{ gridColumn: 6 }}>
                <Box sx={{ height: 12, width: "80%", borderRadius: 1, bgcolor: "action.hover" }} />
              </Box>
              <Box sx={{ gridColumn: 7, display: "flex", justifyContent: "center" }}>
                <Box sx={{ height: 12, width: 20, borderRadius: 1, bgcolor: "action.hover" }} />
              </Box>
            </Box>
          ))}

        {/* Empty state */}
        {!loading && logs.length === 0 && <EmptyState />}

        {/* Data rows — CSS Grid */}
        {!loading &&
          logs.map((log) => (
            <Box
              key={log.id}
              sx={{
                display: "grid",
                gridTemplateColumns: "1.6fr 2.4fr 1.2fr 1.4fr 0.7fr 1.2fr 0.5fr",
                columnGap: 2,
                alignItems: "center",
                px: 2.5,
                py: 1.75,
                borderBottom: "1px solid",
                borderColor: "divider",
                "&:hover": { bgcolor: "action.hover" },
                "&:last-child": { borderBottom: 0 },
                minHeight: 68,
              }}
            >
              {/* Người tải */}
              <Box sx={{ gridColumn: 1, overflow: "hidden" }}>
                <UserCell
                  fullName={log.userFullName}
                  avatarUrl={log.userAvatarUrl}
                  role={log.userRole}
                />
              </Box>

              {/* Tài liệu */}
              <Box sx={{ gridColumn: 2, overflow: "hidden" }}>
                <DocumentCell
                  title={log.documentTitle}
                  fileType={log.fileType}
                  fileSize={log.fileSize}
                />
              </Box>

              {/* Phạm vi */}
              <Box sx={{ gridColumn: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <VisibilityChip visibility={log.visibility} />
              </Box>

              {/* Môn / Danh mục */}
              <Box sx={{ gridColumn: 4, overflow: "hidden" }}>
                <SubjectCategoryCell
                  subjectName={log.subjectName}
                  categoryName={log.categoryName}
                />
              </Box>

              {/* Lượt tải */}
              <Box sx={{ gridColumn: 5, display: "flex", justifyContent: "center" }}>
                <DownloadCountCell count={log.documentDownloadCount} />
              </Box>

              {/* Thời gian */}
              <Box sx={{ gridColumn: 6, overflow: "hidden" }}>
                <Tooltip title={formatDate(log.downloadedAt)} placement="top">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <AccessTimeOutlined sx={{ fontSize: 15, color: "text.disabled", flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ fontSize: "0.82rem" }}>
                      {formatRelativeTime(log.downloadedAt)}
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>

              {/* Tác vụ */}
              <Box sx={{ gridColumn: 7, display: "flex", justifyContent: "center" }}>
                <Tooltip title="Xem chi tiết">
                  <IconButton
                    size="small"
                    onClick={() => setSelectedLog(log)}
                    sx={{
                      color: "#6366f1",
                      bgcolor: "rgba(99, 102, 241, 0.08)",
                      width: 34,
                      height: 34,
                      "&:hover": { bgcolor: "rgba(99, 102, 241, 0.15)" },
                    }}
                  >
                    <VisibilityOutlined sx={{ fontSize: 17 }} />
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
            onChange={(_, v) => download.setPage(v)}
            shape="rounded"
            color="primary"
            size="medium"
          />
        </Box>
      )}

      <DetailDialog log={selectedLog} open={Boolean(selectedLog)} onClose={() => setSelectedLog(null)} />
    </>
  );
}
