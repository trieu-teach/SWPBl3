import {
  Alert,
  AlertTitle,
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
  USER: "#22c55e",
  ADMIN: "#ef4444",
  MODERATOR: "#eab308",
};

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

function UserCell({ fullName, avatarUrl, role, roleLabel }) {
  const displayName = fullName || "Không xác định";
  const roleColor = ROLE_COLORS[role] || ROLE_COLORS.USER;
  const displayRole = roleLabel || role;
  const isSystemUser = !role && !roleLabel;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
      <Avatar
        src={avatarUrl || undefined}
        sx={{ width: 34, height: 34, fontSize: "0.75rem", bgcolor: "primary.main", flexShrink: 0 }}
      >
        {displayName.charAt(0).toUpperCase()}
      </Avatar>
      <Box sx={{ minWidth: 0, overflow: "hidden" }}>
        <Tooltip title={fullName || ""} placement="top">
          <Typography variant="body2" sx={{ fontSize: "0.85rem", fontWeight: 500 }} noWrap>
            {displayName}
          </Typography>
        </Tooltip>
        {!isSystemUser && (
          <Chip
            label={displayRole}
            size="small"
            sx={{
              height: 16,
              fontSize: "0.65rem",
              fontWeight: 600,
              bgcolor: alpha(roleColor, 0.12),
              color: roleColor,
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
          bgcolor: (theme) => alpha(fileColors.main || theme.palette.primary.main, 0.12),
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
        sx={(theme) => {
          const color = isPublic
            ? theme.palette.success.main
            : theme.palette.text.secondary;
          return {
            height: 26,
            fontSize: "0.75rem",
            fontWeight: 500,
            bgcolor: isPublic ? alpha(color, 0.12) : theme.palette.action.hover,
            color,
            borderRadius: "6px",
            "& .MuiChip-icon": { color: "inherit" },
          };
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
      tag: log.userRoleLabel,
      color: "#6366f1",
      bgColor: "rgba(99, 102, 241, 0.1)",
    },
    {
      label: "Vai trò",
      value: log.userRoleLabel || "—",
      color: ROLE_COLORS[log.userRole] || "#6366f1",
      bgColor: alpha(ROLE_COLORS[log.userRole] || "#6366f1", 0.1),
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
        <IconButton
          size="small"
          onClick={onClose}
          aria-label="Đóng chi tiết tải xuống"
          sx={{ color: "white" }}
        >
          <CloseOutlined />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
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
                  bgcolor: "secondary.main",
                  color: "secondary.contrastText",
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

      <Card variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer
          tabIndex={0}
          aria-label="Bảng nhật ký tải xuống, có thể cuộn ngang"
          sx={{ width: "100%", overflowX: "auto" }}
        >
          <Table aria-label="Nhật ký tải xuống" size="small" sx={{ minWidth: 1180 }}>
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
                <TableCell sx={{ minWidth: 180 }}>Người tải</TableCell>
                <TableCell sx={{ minWidth: 250 }}>Tài liệu</TableCell>
                <TableCell align="center" sx={{ minWidth: 130 }}>Phạm vi</TableCell>
                <TableCell sx={{ minWidth: 190 }}>Môn / Danh mục</TableCell>
                <TableCell align="center" sx={{ minWidth: 100 }}>Lượt tải</TableCell>
                <TableCell sx={{ minWidth: 160 }}>Thời gian</TableCell>
                <TableCell align="right" sx={{ minWidth: 90 }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading &&
                Array.from({ length: 6 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton height={38} /></TableCell>
                    <TableCell><Skeleton height={38} /></TableCell>
                    <TableCell align="center"><Skeleton width={80} height={28} sx={{ mx: "auto" }} /></TableCell>
                    <TableCell><Skeleton height={28} /></TableCell>
                    <TableCell align="center"><Skeleton width={36} height={24} sx={{ mx: "auto" }} /></TableCell>
                    <TableCell><Skeleton height={24} /></TableCell>
                    <TableCell align="right"><Skeleton width={34} height={34} sx={{ ml: "auto" }} /></TableCell>
                  </TableRow>
                ))}

              {!loading && logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ p: 0 }}>
                    <EmptyState />
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                logs.map((log) => (
                  <TableRow key={log.id} hover sx={{ height: 68 }}>
                    <TableCell>
                      <UserCell
                        fullName={log.userFullName}
                        avatarUrl={log.userAvatarUrl}
                        role={log.userRole}
                        roleLabel={log.userRoleLabel}
                      />
                    </TableCell>
                    <TableCell>
                      <DocumentCell
                        title={log.documentTitle}
                        fileType={log.fileType}
                        fileSize={log.fileSize}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <VisibilityChip visibility={log.visibility} />
                    </TableCell>
                    <TableCell>
                      <SubjectCategoryCell
                        subjectName={log.subjectName}
                        categoryName={log.categoryName}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <DownloadCountCell count={log.documentDownloadCount} />
                    </TableCell>
                    <TableCell>
                      <Tooltip title={formatDate(log.downloadedAt)} placement="top">
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, whiteSpace: "nowrap" }}>
                          <AccessTimeOutlined sx={{ fontSize: 15, color: "text.disabled", flexShrink: 0 }} />
                          <Typography variant="body2" sx={{ fontSize: "0.82rem" }}>
                            {formatRelativeTime(log.downloadedAt)}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          size="small"
                          aria-label={`Xem chi tiết lượt tải ${log.documentTitle || "tài liệu"}`}
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
