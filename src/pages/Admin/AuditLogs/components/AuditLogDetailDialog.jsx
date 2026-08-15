import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";
import { formatDate } from "../../utils/admin-formatters.js";

export default function AuditLogDetailDialog({ log, onClose }) {
  if (!log) return null;

  const rows = [
    { label: "ID bản ghi", value: log.id },
    { label: "Hành động", value: log.action },
    { label: "Loại đối tượng", value: log.targetType },
    { label: "ID đối tượng", value: log.targetId },
    { label: "User ID", value: log.userId },
    { label: "Thời gian", value: formatDate(log.createdAt) },
  ];

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="body1" fontWeight={700}>
          Chi tiết nhật ký
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {rows.map(({ label, value }) => (
            <Box key={label} sx={{ display: "flex", gap: 2 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ minWidth: 130, fontWeight: 600 }}
              >
                {label}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: value && value.length > 30 ? "monospace" : "inherit",
                  fontSize: value && value.length > 30 ? "0.75rem" : "0.875rem",
                  wordBreak: "break-all",
                }}
              >
                {value || "—"}
              </Typography>
            </Box>
          ))}
          {log.metadata && (
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 600, mb: 0.5 }}
              >
                Metadata
              </Typography>
              <Box
                component="pre"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "action.hover",
                  fontSize: "0.75rem",
                  fontFamily: "monospace",
                  overflow: "auto",
                  maxHeight: 200,
                  m: 0,
                }}
              >
                {JSON.stringify(log.metadata, null, 2)}
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
