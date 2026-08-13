import {
  Box,
  Divider,
  Drawer,
  IconButton,
  Typography,
} from "@mui/material";
import {
  CloseOutlined,
  AccessTimeOutlined,
  PersonOutlined,
  DescriptionOutlined,
  BadgeOutlined,
  HistoryOutlined,
} from "@mui/icons-material";
import { formatDate } from "../../utils/admin-formatters.js";

const SectionLabel = ({ children }) => (
  <Typography
    variant="caption"
    color="text.secondary"
    sx={{
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      fontSize: "0.65rem",
    }}
  >
    {children}
  </Typography>
);

const MetadataViewer = ({ data }) => {
  if (!data) return null;
  const entries = Object.entries(data);
  if (entries.length === 0) return null;

  return (
    <Box>
      <Box sx={{ mb: 1.5 }}>
        <SectionLabel>Dữ liệu bổ sung</SectionLabel>
      </Box>
      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {entries.map(([key, val], index) => (
          <Box
            key={key}
            sx={{
              display: "flex",
              gap: 1.5,
              px: 2,
              py: 1.25,
              bgcolor: index % 2 === 0 ? "transparent" : "action.hover",
              borderBottom: index < entries.length - 1 ? "1px solid" : "none",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontFamily: "monospace",
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "text.secondary",
                minWidth: 90,
                flexShrink: 0,
              }}
            >
              {key}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "monospace",
                fontSize: "0.72rem",
                color: "text.primary",
                wordBreak: "break-all",
              }}
            >
              {typeof val === "object" ? JSON.stringify(val) : String(val ?? "—")}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default function AuditLogDetailDrawer({ log, onClose }) {
  const open = Boolean(log);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100vw", sm: 460 },
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          borderRadius: "20px 0 0 20px",
        },
      }}
    >
      {log && (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <Box
            sx={{
              px: 3,
              py: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid",
              borderColor: "divider",
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)",
                }}
              >
                <HistoryOutlined sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="body1" fontWeight={700}>
                  Chi tiết nhật ký
                </Typography>
                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{ fontFamily: "monospace", fontSize: "0.65rem" }}
                >
                  {log.id?.slice(0, 24)}...
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                ml: 1,
                bgcolor: "action.hover",
                "&:hover": { bgcolor: "action.selected" },
              }}
            >
              <CloseOutlined />
            </IconButton>
          </Box>

          {/* Body */}
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              px: 3,
              py: 3,
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
            }}
          >
            {/* Thời gian - hero card */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: "16px",
                bgcolor: "action.hover",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <AccessTimeOutlined sx={{ fontSize: 16, color: "#f97316" }} />
                <SectionLabel>Thời gian</SectionLabel>
              </Box>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ fontSize: "1.1rem", letterSpacing: "-0.01em" }}
              >
                {formatDate(log.createdAt)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {new Date(log.createdAt).toLocaleString("vi-VN", {
                  weekday: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </Typography>
            </Box>

            {/* Hành động */}
            <Box
              sx={{
                p: 2,
                borderRadius: "16px",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <BadgeOutlined sx={{ fontSize: 16, color: "#f97316" }} />
                <SectionLabel>Hành động</SectionLabel>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "monospace",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  color: "#f97316",
                }}
              >
                {log.action}
              </Typography>
            </Box>

            {/* Người thực hiện */}
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <PersonOutlined sx={{ fontSize: 16, color: "#6366f1" }} />
                <SectionLabel>Người thực hiện</SectionLabel>
              </Box>
              <Box
                sx={{
                  p: 2,
                  borderRadius: "16px",
                  border: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    bgcolor: "#6366f1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    flexShrink: 0,
                  }}
                >
                  <PersonOutlined sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {log.userId || "Hệ thống"}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ fontFamily: "monospace", fontSize: "0.7rem" }}
                  >
                    {log.userId ? `ID: ${log.userId.slice(0, 16)}...` : "Tác động tự động hoặc nền tảng"}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Đối tượng */}
            {(log.targetType || log.targetId) && (
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <DescriptionOutlined sx={{ fontSize: 16, color: "#10b981" }} />
                  <SectionLabel>Đối tượng</SectionLabel>
                </Box>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "16px",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  {log.targetType && (
                    <Box sx={{ mb: log.targetId ? 1.5 : 0 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                        Loại
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {log.targetType}
                      </Typography>
                    </Box>
                  )}
                  {log.targetId && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                        ID
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "monospace",
                          fontWeight: 500,
                          fontSize: "0.82rem",
                          wordBreak: "break-all",
                        }}
                      >
                        {log.targetId}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* Metadata */}
            {log.metadata && (
              <>
                <Divider />
                <MetadataViewer data={log.metadata} />
              </>
            )}
          </Box>
        </Box>
      )}
    </Drawer>
  );
}
