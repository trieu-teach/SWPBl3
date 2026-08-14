import {
  Alert,
  AlertTitle,
  Avatar,
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
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
  InfoOutlined,
  PersonOutlined,
  RefreshOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import { useState } from "react";
import {
  formatDate,
  formatFileSize,
  formatRelativeTime,
  getFileTypeColors,
  displayFileType,
} from "../../utils/admin-formatters.js";

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

function UserCell({ userId, fullName, avatarUrl }) {
  const displayName = fullName || userId?.slice(0, 8) + "..." || "Không xác định";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Avatar
        src={avatarUrl || undefined}
        sx={{ width: 28, height: 28, fontSize: "0.7rem", bgcolor: "#6366f1" }}
      >
        {displayName.charAt(0).toUpperCase()}
      </Avatar>
      <Tooltip title={fullName || userId || ""} placement="top">
        <Typography variant="body2" sx={{ fontSize: "0.8rem", fontWeight: 500 }} noWrap>
          {displayName}
        </Typography>
      </Tooltip>
    </Box>
  );
}

function DocumentCell({ documentId, title, fileType, fileSize }) {
  if (!documentId) {
    return (
      <Typography variant="body2" color="text.disabled" sx={{ fontStyle: "italic", fontSize: "0.75rem" }}>
        Tài liệu đã xóa
      </Typography>
    );
  }

  const fileColors = getFileTypeColors(fileType);
  const displayTitle = title || documentId.slice(0, 12) + "...";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box
        sx={{
          width: 30,
          height: 30,
          display: "grid",
          placeItems: "center",
          borderRadius: "8px",
          bgcolor: fileColors.bg,
          color: fileColors.main,
          flexShrink: 0,
        }}
      >
        <DescriptionOutlined sx={{ fontSize: 14 }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Tooltip title={title || documentId} placement="top">
          <Typography variant="body2" noWrap sx={{ fontSize: "0.8rem", fontWeight: 500 }}>
            {displayTitle}
          </Typography>
        </Tooltip>
        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
          <Typography sx={{ fontSize: "0.62rem", fontWeight: 600, color: fileColors.main }}>
            {displayFileType({ fileType })}
          </Typography>
          {fileSize && (
            <Typography variant="caption" color="text.disabled">
              {formatFileSize(fileSize)}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

function DetailDialog({ log, open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <DownloadOutlined sx={{ fontSize: 18 }} />
          </Box>
          <Typography variant="body1" fontWeight={700}>Chi tiết tải xuống</Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {[
          { label: "ID bản ghi", value: log?.id, mono: true },
          { label: "Người dùng", value: log?.userFullName || log?.userId },
          { label: "Tài liệu", value: log?.documentTitle || log?.documentId },
          { label: "Loại file", value: log?.fileType?.toUpperCase() },
          { label: "Kích thước", value: log?.fileSize ? formatFileSize(log.fileSize) : null },
          { label: "Thời gian", value: log?.downloadedAt ? formatDate(log.downloadedAt) : null },
        ].map(({ label, value, mono }) => value && (
          <Box key={label} sx={{ display: "flex", gap: 2, py: 1.5, "&:not(:last-child)": { borderBottom: "1px solid", borderColor: "divider" } }}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120, fontWeight: 600, fontSize: "0.82rem" }}>
              {label}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: mono ? "monospace" : "inherit", fontSize: "0.82rem", wordBreak: "break-all", flex: 1 }}>
              {value}
            </Typography>
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  );
}

export default function DownloadLogTable({ download }) {
  const { logs, loading, error, total, page, pageCount } = download;
  const [selectedLog, setSelectedLog] = useState(null);

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button size="small" startIcon={<RefreshOutlined />} onClick={download.retry}>
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
              <Box
                sx={{
                  bgcolor: "#f97316",
                  color: "white",
                  borderRadius: "6px",
                  px: 1,
                  py: 0.25,
                  fontWeight: 700,
                  fontSize: "0.75rem",
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
            gridTemplateColumns: "50px 130px 1fr 1fr 60px",
            px: 2,
            py: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "#fafafa",
          }}
        >
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "0.65rem" }}>#</Typography>
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "0.65rem" }}>Thời gian</Typography>
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "0.65rem" }}>Người dùng</Typography>
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "0.65rem" }}>Tài liệu</Typography>
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "0.65rem", textAlign: "center" }}></Typography>
        </Box>

        {/* Loading skeleton */}
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <Box
              key={i}
              sx={{
                display: "grid",
                gridTemplateColumns: "50px 130px 1fr 1fr 60px",
                px: 2,
                py: 1.5,
                borderBottom: "1px solid",
                borderColor: "divider",
                "&:last-child": { borderBottom: 0 },
              }}
            >
              {[20, 80, 60, 50, 30].map((w, j) => (
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
          logs.map((log, index) => {
            const rowNum = (page - 1) * 20 + index + 1;

            return (
              <Box
                key={log.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "50px 130px 1fr 1fr 60px",
                  px: 2,
                  py: 1.5,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:hover": { bgcolor: "action.hover" },
                  "&:last-child": { borderBottom: 0 },
                  alignItems: "center",
                }}
              >
                {/* # */}
                <Typography variant="body2" color="text.disabled" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                  {rowNum}
                </Typography>

                {/* Thời gian */}
                <Tooltip title={formatDate(log.downloadedAt)} placement="top">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <AccessTimeOutlined sx={{ fontSize: 14, color: "text.disabled" }} />
                    <Typography variant="body2" sx={{ fontSize: "0.78rem" }}>
                      {formatRelativeTime(log.downloadedAt)}
                    </Typography>
                  </Box>
                </Tooltip>

                {/* Người dùng - flat fields from backend */}
                <UserCell
                  userId={log.userId}
                  fullName={log.userFullName}
                  avatarUrl={log.userAvatarUrl}
                />

                {/* Tài liệu - flat fields from backend */}
                <DocumentCell
                  documentId={log.documentId}
                  title={log.documentTitle}
                  fileType={log.fileType}
                  fileSize={log.fileSize}
                />

                {/* Chi tiết */}
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Tooltip title="Xem chi tiết">
                    <IconButton
                      size="small"
                      onClick={() => setSelectedLog(log)}
                      sx={{
                        color: "#6366f1",
                        bgcolor: "rgba(99, 102, 241, 0.08)",
                        "&:hover": {
                          bgcolor: "rgba(99, 102, 241, 0.15)",
                        },
                      }}
                    >
                      <VisibilityOutlined sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            );
          })}
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
