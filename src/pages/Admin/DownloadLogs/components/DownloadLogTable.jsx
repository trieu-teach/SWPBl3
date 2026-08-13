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
  AccessTimeOutlined,
  CloseOutlined,
  DescriptionOutlined,
  DownloadOutlined,
  InfoOutlined,
  PersonOutlined,
  RefreshOutlined,
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

export default function DownloadLogTable({ download }) {
  const { logs, loading, error, total, page, pageCount } = download;
  const [detailLog, setDetailLog] = useState(null);

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
                Hiển thị
              </Typography>
              <Chip label={logs.length} size="small" sx={{ fontWeight: 700, height: 22, fontSize: "0.75rem" }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                / {total} bản ghi
              </Typography>
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
            gridTemplateColumns: "50px 120px 1fr 1fr 70px",
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
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "0.65rem", textAlign: "center" }}>Chi tiết</Typography>
        </Box>

        {/* Loading skeleton */}
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <Box
              key={i}
              sx={{
                display: "grid",
                gridTemplateColumns: "50px 120px 1fr 1fr 70px",
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
            const doc = log.document;
            const user = log.user;
            const fileColors = getFileTypeColors(doc?.fileType);

            return (
              <Box
                key={log.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "50px 120px 1fr 1fr 70px",
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

                {/* Người dùng */}
                {user ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      src={user.avatarUrl || undefined}
                      sx={{ width: 28, height: 28, fontSize: "0.7rem", bgcolor: "#6366f1" }}
                    >
                      <PersonOutlined sx={{ fontSize: 14 }} />
                    </Avatar>
                    <Typography variant="body2" sx={{ fontSize: "0.8rem", fontWeight: 500 }} noWrap>
                      {user.fullName || user.email?.split("@")[0] || "—"}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.disabled" sx={{ fontStyle: "italic", fontSize: "0.75rem" }}>
                    Không xác định
                  </Typography>
                )}

                {/* Tài liệu */}
                {doc ? (
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
                      <Typography variant="body2" noWrap sx={{ fontSize: "0.8rem", fontWeight: 500 }} title={doc.title}>
                        {doc.title}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                        <Typography sx={{ fontSize: "0.62rem", fontWeight: 600, color: fileColors.main }}>
                          {displayFileType(doc)}
                        </Typography>
                        {doc.fileSize && (
                          <Typography variant="caption" color="text.disabled">
                            {formatFileSize(doc.fileSize)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.disabled" sx={{ fontStyle: "italic", fontSize: "0.75rem" }}>
                    Tài liệu đã xóa
                  </Typography>
                )}

                {/* Chi tiết */}
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Tooltip title="Xem chi tiết">
                    <IconButton
                      size="small"
                      onClick={() => setDetailLog(log)}
                      sx={{
                        color: "#f97316",
                        bgcolor: "rgba(249, 115, 22, 0.08)",
                        "&:hover": {
                          bgcolor: "rgba(249, 115, 22, 0.15)",
                        },
                      }}
                    >
                      <InfoOutlined sx={{ fontSize: 16 }} />
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

      <DownloadLogDetailDialog log={detailLog} onClose={() => setDetailLog(null)} />
    </>
  );
}

function DownloadLogDetailDialog({ log, onClose }) {
  if (!log) return null;
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1300,
      }}
      onClick={onClose}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          bgcolor: "background.paper",
          borderRadius: "20px",
          width: "100%",
          maxWidth: 480,
          maxHeight: "80vh",
          overflow: "hidden",
          boxShadow: 24,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
              <DownloadOutlined sx={{ fontSize: 18 }} />
            </Box>
            <Typography variant="body1" fontWeight={700}>Chi tiết tải xuống</Typography>
          </Box>
          <IconButton size="small" onClick={onClose}>
            <CloseOutlined />
          </IconButton>
        </Box>
        <Box sx={{ p: 2.5, overflowY: "auto" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              { label: "ID bản ghi", value: log.id },
              { label: "User ID", value: log.userId },
              { label: "Document ID", value: log.documentId },
              { label: "Thời gian", value: formatDate(log.downloadedAt) },
            ].map(({ label, value }) => (
              <Box key={label} sx={{ display: "flex", gap: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 110, fontWeight: 600, fontSize: "0.82rem" }}>
                  {label}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: value?.length > 30 ? "monospace" : "inherit", fontSize: "0.82rem", wordBreak: "break-all" }}>
                  {value || "—"}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
