import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  Grid,
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
  ExpandMoreOutlined,
  ContentCopyOutlined,
  CheckCircle,
  Cancel,
  FolderOutlined,
} from "@mui/icons-material";
import { useState } from "react";
import { formatDate } from "../../utils/admin-formatters.js";

const USER_ROLE_COLORS = {
  ADMIN: { bg: "#fee2e2", color: "#dc2626" },
  MODERATOR: { bg: "#fef3c7", color: "#d97706" },
  USER: { bg: "#d1fae5", color: "#059669" },
};

const RESULT_COLORS_MAP = {
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
  "Đã chặn": { bg: "#fee2e2", color: "#dc2626" },
  "Đã từ chối": { bg: "#fee2e2", color: "#dc2626" },
  "Đã hết hạn": { bg: "#f3f4f6", color: "#6b7280" },
  "Chưa kích hoạt": { bg: "#f3f4f6", color: "#6b7280" },
  "Đang chờ duyệt": { bg: "#fef3c7", color: "#d97706" },
  "Công khai": { bg: "#d1fae5", color: "#059669" },
  "Riêng tư": { bg: "#f3f4f6", color: "#6b7280" },
};

function getUserRoleConfig(role) {
  return USER_ROLE_COLORS[role?.toUpperCase()] || USER_ROLE_COLORS.USER;
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <IconButton size="small" onClick={handleCopy} sx={{ ml: 0.5, p: 0.5, borderRadius: "6px" }} aria-label="Sao chép">
      {copied ? (
        <Box component="span" sx={{ fontSize: "0.7rem", color: "#059669", fontWeight: 600 }}>
          ✓ Đã copy
        </Box>
      ) : (
        <ContentCopyOutlined sx={{ fontSize: 16, color: "text.disabled" }} />
      )}
    </IconButton>
  );
}

function SectionTitle({ icon, children }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      {icon && <Box sx={{ color: "#94a3b8", display: "flex" }}>{icon}</Box>}
      <Typography variant="subtitle2" sx={{ color: "text.secondary", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.75rem" }}>
        {children}
      </Typography>
    </Box>
  );
}

function BigCard({ children, highlight }) {
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: "16px",
        bgcolor: highlight ? "rgba(249,115,22,0.04)" : "background.paper",
        border: "2px solid",
        borderColor: highlight ? "rgba(249,115,22,0.15)" : "divider",
      }}
    >
      {children}
    </Box>
  );
}

export default function AuditLogDetailDialog({ log, onClose }) {
  const open = Boolean(log);
  const [expandedTech, setExpandedTech] = useState(false);

  const userRoleConfig = log?.userRole ? getUserRoleConfig(log.userRole) : null;
  const resultLabel = log?.resultLabel || log?.result || "—";
  const resultConfig = RESULT_COLORS_MAP[resultLabel] || { bg: "#f3f4f6", color: "#6b7280" };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="audit-dialog-title"
      PaperProps={{
        sx: {
          borderRadius: "24px",
          boxShadow: "0 25px 60px -10px rgba(0,0,0,0.3)",
          maxHeight: "92vh",
        },
      }}
      slotProps={{
        backdrop: {
          sx: { bgcolor: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" },
        },
      }}
    >
      {log && (
        <>
          {/* Header */}
          <Box
            sx={{
              px: 4,
              py: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "2px solid",
              borderColor: "divider",
              bgcolor: "rgba(249,115,22,0.02)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  boxShadow: "0 8px 24px rgba(249,115,22,0.3)",
                }}
              >
                <HistoryOutlined sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography id="audit-dialog-title" variant="h5" fontWeight={700} sx={{ fontSize: "1.35rem", color: "#1e293b" }}>
                  Chi tiết nhật ký kiểm tra
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                  <Typography variant="caption" color="text.disabled" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                    {log.id}
                  </Typography>
                  <CopyButton text={log.id} />
                </Box>
              </Box>
            </Box>
            <IconButton onClick={onClose} aria-label="Đóng" size="large">
              <CloseOutlined />
            </IconButton>
          </Box>

          {/* Body */}
          <DialogContent
            sx={{
              px: 4,
              py: 3,
              display: "flex",
              flexDirection: "column",
              gap: 3,
              "&::-webkit-scrollbar": { width: 8 },
              "&::-webkit-scrollbar-thumb": { bgcolor: "divider", borderRadius: 4 },
            }}
          >
            {/* Row 1: Thời gian + Hành động */}
            <Grid container spacing={3}>
              {/* Thời gian */}
              <Grid item xs={12} md={5}>
                <BigCard highlight>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: "14px",
                        bgcolor: "#fff7ed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <AccessTimeOutlined sx={{ fontSize: 26, color: "#f97316" }} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                        Thời gian thực hiện
                      </Typography>
                      <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.1rem", color: "#1e293b" }}>
                        {formatDate(log.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                </BigCard>
              </Grid>

              {/* Hành động & Kết quả */}
              <Grid item xs={12} md={7}>
                <BigCard>
                  <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <Box>
                      <SectionTitle icon={<BadgeOutlined sx={{ fontSize: 18 }} />}>Hành động</SectionTitle>
                      <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.25rem", color: "#1e293b", mb: 0.5 }}>
                        {log.actionLabel || log.action}
                      </Typography>
                      {log.action && log.actionLabel && log.action !== log.actionLabel && (
                        <Typography variant="caption" color="text.disabled" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                          {log.action}
                        </Typography>
                      )}
                    </Box>
                    {resultLabel && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          px: 2,
                          py: 1,
                          borderRadius: "12px",
                          bgcolor: resultConfig.bg,
                        }}
                      >
                        {resultConfig.color === "#059669" || resultConfig.color === "#0891b2" ? (
                          <CheckCircle sx={{ fontSize: 20, color: resultConfig.color }} />
                        ) : (
                          <Cancel sx={{ fontSize: 20, color: resultConfig.color }} />
                        )}
                        <Typography variant="body2" sx={{ fontWeight: 700, color: resultConfig.color, fontSize: "0.9rem" }}>
                          {resultLabel}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </BigCard>
              </Grid>
            </Grid>

            {/* Row 2: Người thực hiện */}
            <BigCard>
              <SectionTitle icon={<PersonOutlined sx={{ fontSize: 18 }} />}>Người thực hiện</SectionTitle>
              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                {log.userAvatarUrl ? (
                  <Avatar src={log.userAvatarUrl} alt={log.userFullName || "Avatar"} sx={{ width: 64, height: 64, borderRadius: "14px" }} />
                ) : (
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: "14px",
                      bgcolor: "#6366f1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                    }}
                  >
                    <PersonOutlined sx={{ fontSize: 32 }} />
                  </Box>
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.15rem", color: "#1e293b" }}>
                    {log.userFullName || log.userEmail || "Hệ thống"}
                  </Typography>
                  {log.userEmail && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.9rem", mt: 0.25 }}>
                      {log.userEmail}
                    </Typography>
                  )}
                  <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                    <Typography variant="caption" color="text.disabled" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                      ID: {log.userId}
                    </Typography>
                    <CopyButton text={log.userId} />
                  </Box>
                </Box>
                {log.userRoleLabel && (
                  <Chip
                    label={log.userRoleLabel}
                    size="small"
                    sx={{
                      height: 32,
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      bgcolor: userRoleConfig.bg,
                      color: userRoleConfig.color,
                      borderRadius: "8px",
                      px: 1,
                    }}
                  />
                )}
              </Box>
            </BigCard>

            {/* Row 3: Đối tượng + Tóm tắt */}
            <Grid container spacing={3}>
              {/* Đối tượng */}
              {(log.targetType || log.targetId || log.targetName) && (
                <Grid item xs={12} md={6}>
                  <BigCard>
                    <SectionTitle icon={<FolderOutlined sx={{ fontSize: 18 }} />}>Đối tượng</SectionTitle>
                    {log.targetName && (
                      <Typography variant="body1" fontWeight={600} sx={{ fontSize: "1rem", color: "#1e293b", mb: 1.5 }}>
                        {log.targetName}
                      </Typography>
                    )}
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                      {log.targetType && (
                        <Chip
                          label={`Loại: ${log.targetType}`}
                          size="small"
                          sx={{
                            height: 28,
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            bgcolor: "#d1fae5",
                            color: "#059669",
                            borderRadius: "8px",
                          }}
                        />
                      )}
                      {log.targetId && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Chip
                            label={`ID: ${log.targetId.slice(0, 12)}...`}
                            size="small"
                            onClick={() => {}}
                            sx={{
                              height: 28,
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              bgcolor: "#f1f5f9",
                              color: "#475569",
                              borderRadius: "8px",
                              cursor: "pointer",
                            }}
                          />
                          <CopyButton text={log.targetId} />
                        </Box>
                      )}
                    </Box>
                  </BigCard>
                </Grid>
              )}

              {/* Tóm tắt */}
              {log.summary && (
                <Grid item xs={12} md={log.targetType || log.targetId || log.targetName ? 6 : 12}>
                  <BigCard>
                    <SectionTitle icon={<DescriptionOutlined sx={{ fontSize: 18 }} />}>Tóm tắt</SectionTitle>
                    <Typography variant="body1" sx={{ fontSize: "0.95rem", lineHeight: 1.7, color: "#475569" }}>
                      {log.summary}
                    </Typography>
                  </BigCard>
                </Grid>
              )}
            </Grid>

            {/* Row 4: Chi tiết bổ sung */}
            {log.details && (log.details.reason || (log.details.changedFields && log.details.changedFields.length > 0)) && (
              <BigCard>
                <SectionTitle icon={<BadgeOutlined sx={{ fontSize: 18 }} />}>Chi tiết bổ sung</SectionTitle>
                {log.details.reason && (
                  <Box sx={{ mb: log.details.changedFields?.length ? 2 : 0 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem", fontWeight: 600, mb: 0.5 }}>
                      Lý do
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: "0.95rem", color: "#1e293b" }}>
                      {log.details.reason}
                    </Typography>
                  </Box>
                )}
                {log.details.changedFields && log.details.changedFields.length > 0 && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem", fontWeight: 600, mb: 1 }}>
                      Các trường thay đổi
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {log.details.changedFields.map((field, idx) => (
                        <Chip
                          key={idx}
                          label={field}
                          size="small"
                          sx={{
                            height: 28,
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            bgcolor: "#e0e7ff",
                            color: "#4338ca",
                            borderRadius: "8px",
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </BigCard>
            )}

            <Divider sx={{ my: 1 }} />

            {/* Thông tin kỹ thuật */}
            <Accordion
              expanded={expandedTech}
              onChange={() => setExpandedTech(!expandedTech)}
              sx={{
                "&:before": { display: "none" },
                boxShadow: "none",
                border: "2px solid",
                borderColor: "divider",
                borderRadius: "16px !important",
                "&.Mui-expanded": { borderRadius: "16px !important", mb: 0 },
                bgcolor: "transparent",
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreOutlined sx={{ fontSize: 24 }} />}
                sx={{ px: 2.5, py: 1, minHeight: 56, "& .MuiAccordionSummary-content": { my: 1 } }}
              >
                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ fontSize: "0.85rem", textTransform: "uppercase" }}>
                  Thông tin kỹ thuật
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2.5, pb: 2.5 }}>
                <BigCard>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600, display: "block", mb: 0.5 }}>
                        Log ID
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                        <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem", wordBreak: "break-all", flex: 1 }}>
                          {log.id}
                        </Typography>
                        <CopyButton text={log.id} />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600, display: "block", mb: 0.5 }}>
                        Created At (ISO)
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                        {log.createdAt}
                      </Typography>
                    </Grid>
                    {log.metadata && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 600, display: "block", mb: 1 }}>
                          Metadata
                        </Typography>
                        <Box
                          component="pre"
                          sx={{
                            p: 2,
                            bgcolor: "#f8fafc",
                            borderRadius: "10px",
                            fontSize: "0.75rem",
                            fontFamily: "monospace",
                            overflow: "auto",
                            maxHeight: 150,
                            m: 0,
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          {JSON.stringify(log.metadata, null, 2)}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </BigCard>
              </AccordionDetails>
            </Accordion>
          </DialogContent>

          {/* Footer */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", px: 4, py: 2.5, borderTop: "2px solid", borderColor: "divider" }}>
            <Button variant="contained" onClick={onClose} sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 700, px: 4, py: 1.25, fontSize: "0.95rem", bgcolor: "#1e293b", "&:hover": { bgcolor: "#334155" } }}>
              Đóng
            </Button>
          </Box>
        </>
      )}
    </Dialog>
  );
}
