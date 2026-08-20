import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  CloseOutlined,
  DescriptionOutlined,
  SearchOutlined,
  UploadFileOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { MAX_SELECTED_DOCUMENTS } from "../../../../api/chat.api.js";

const SIDEBAR_WIDTH = 328;
const SELECTABLE_AI_STATUSES = new Set(["COMPLETED", "MOCKED"]);

function isSelectable(document) {
  return (
    document?.status === "ACTIVE" &&
    SELECTABLE_AI_STATUSES.has(document?.aiStatus)
  );
}

function statusLabel(document) {
  if (document?.status !== "ACTIVE") return "Không khả dụng";
  if (document?.aiStatus === "PROCESSING") return "Đang xử lý";
  if (document?.aiStatus === "PENDING") return "Chờ xử lý";
  if (document?.aiStatus === "FAILED") return "Không khả dụng cho AI";
  if (document?.aiStatus === "MOCKED") return "Dữ liệu mẫu";
  return document?.aiStatus === "COMPLETED" ? "Sẵn sàng" : "Chưa sẵn sàng";
}

function DocumentRow({
  document,
  selected,
  selectionLimitReached,
  onToggle,
  onPreview,
  previewing,
}) {
  const selectable = isSelectable(document);
  const selectionDisabled =
    (!selectable && !selected) || (!selected && selectionLimitReached);
  const extension =
    document.fileName?.split(".").pop()?.toUpperCase() || "FILE";

  return (
    <ListItem
      disableGutters
      sx={{
        mx: 1,
        my: 0.25,
        px: 0.75,
        py: 0.65,
        width: "auto",
        alignItems: "flex-start",
        borderRadius: 1.5,
        bgcolor: selected ? "action.selected" : "transparent",
        transition: "background-color 120ms ease",
        "&:hover": { bgcolor: selected ? "action.selected" : "action.hover" },
      }}
    >
      <Checkbox
        checked={selected}
        disabled={selectionDisabled}
        onChange={() => onToggle(document)}
        size="small"
        inputProps={{ "aria-label": `Chọn ${document.title}` }}
        sx={{ mt: 0.15, mr: 0.25, p: 0.75 }}
      />
      <DescriptionOutlined
        sx={{ mt: 0.85, mr: 0.9, fontSize: 18, color: "text.secondary" }}
      />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Button
          fullWidth
          variant="text"
          color="inherit"
          onClick={() => onPreview(document)}
          disabled={previewing}
          sx={{
            minWidth: 0,
            maxWidth: "100%",
            justifyContent: "flex-start",
            px: 0,
            py: 0.25,
            fontSize: "0.82rem",
            fontWeight: 700,
            lineHeight: 1.35,
            textAlign: "left",
            textTransform: "none",
          }}
        >
          <Typography
            component="span"
            variant="body2"
            noWrap
            sx={{ display: "block", minWidth: 0, width: "100%" }}
          >
            {document.title || document.fileName || "Tài liệu"}
          </Typography>
        </Button>
        <Stack
          direction="row"
          alignItems="center"
          gap={0.65}
          sx={{ minWidth: 0, mt: 0.25 }}
        >
          <Typography variant="caption" color="text.secondary">
            {extension}
          </Typography>
          <Chip
            label={statusLabel(document)}
            size="small"
            color={selectable ? "success" : "default"}
            variant="filled"
            sx={{
              height: 19,
              maxWidth: 150,
              fontSize: "0.64rem",
              bgcolor: selectable
                ? "rgba(46, 125, 50, 0.08)"
                : "action.hover",
              color: selectable ? "success.dark" : "text.secondary",
              "& .MuiChip-label": { px: 0.75 },
            }}
          />
        </Stack>
      </Box>
      <Tooltip title="Xem tài liệu">
        <span>
          <IconButton
            size="small"
            onClick={() => onPreview(document)}
            disabled={previewing}
            aria-label={`Xem ${document.title}`}
            sx={{ ml: 0.25, mt: 0.15 }}
          >
            {previewing ? (
              <CircularProgress size={17} />
            ) : (
              <VisibilityOutlined sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        </span>
      </Tooltip>
    </ListItem>
  );
}

function DocumentSection({
  title,
  source,
  selectedIds,
  selectionLimitReached,
  onToggle,
  onPreview,
  previewingDocumentId,
}) {
  return (
    <Box component="section" sx={{ py: 0.75 }}>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ display: "block", px: 2, pb: 0.25, fontWeight: 800 }}
      >
        {title}
      </Typography>

      {source.loading && source.documents.length === 0 && (
        <Stack direction="row" alignItems="center" gap={1} sx={{ px: 2, py: 2 }}>
          <CircularProgress size={17} />
          <Typography variant="caption" color="text.secondary">
            Đang tải tài liệu...
          </Typography>
        </Stack>
      )}

      {source.error && source.documents.length === 0 && (
        <Alert severity="error" sx={{ mx: 1.5, my: 1, fontSize: "0.75rem" }}>
          Không thể tải {title.toLowerCase()}.
        </Alert>
      )}

      {!source.loading && !source.error && source.documents.length === 0 && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", px: 2, py: 1.5 }}
        >
          Chưa có tài liệu.
        </Typography>
      )}

      {source.documents.length > 0 && (
        <List dense disablePadding>
          {source.documents.map((document) => (
            <DocumentRow
              key={document.id}
              document={document}
              selected={selectedIds.has(document.id)}
              selectionLimitReached={selectionLimitReached}
              onToggle={onToggle}
              onPreview={onPreview}
              previewing={previewingDocumentId === document.id}
            />
          ))}
        </List>
      )}

      {source.hasMore && (
        <Box sx={{ px: 2, pt: 0.5 }}>
          <Button
            fullWidth
            size="small"
            onClick={source.loadMore}
            disabled={source.loadingMore}
            startIcon={
              source.loadingMore ? <CircularProgress size={15} /> : undefined
            }
          >
            {source.loadingMore ? "Đang tải..." : "Tải thêm"}
          </Button>
        </Box>
      )}
    </Box>
  );
}

function SidebarContent({
  library,
  selectedDocuments,
  onToggleDocument,
  onPreviewDocument,
  previewingDocumentId,
  previewError,
  onClose,
  showCloseButton,
}) {
  const selectedIds = new Set(
    selectedDocuments.map((document) => document.id),
  );
  const selectionLimitReached =
    selectedIds.size >= MAX_SELECTED_DOCUMENTS;

  return (
    <Stack
      sx={{
        width: { xs: "100vw", sm: SIDEBAR_WIDTH },
        maxWidth: "100vw",
        height: "100%",
        minHeight: 0,
        bgcolor: "background.paper",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        gap={0.85}
        sx={{ px: 2, py: 1.1, flexShrink: 0 }}
      >
        <DescriptionOutlined color="action" />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Tài liệu
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {selectedIds.size}/{MAX_SELECTED_DOCUMENTS} đã chọn
          </Typography>
        </Box>
        {showCloseButton && (
          <IconButton onClick={onClose} aria-label="Đóng danh sách tài liệu">
            <CloseOutlined />
          </IconButton>
        )}
      </Stack>

      <Box component="form" onSubmit={library.applySearch} sx={{ px: 2, pb: 1.1 }}>
        <TextField
          fullWidth
          size="small"
          value={library.searchInput}
          onChange={(event) => library.setSearchInput(event.target.value)}
          placeholder="Tìm tài liệu..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {(selectionLimitReached || previewError) && (
        <Box sx={{ px: 2, pb: 1.1 }}>
          {selectionLimitReached && (
            <Alert severity="info" sx={{ py: 0, fontSize: "0.72rem" }}>
              Đã chọn tối đa {MAX_SELECTED_DOCUMENTS} tài liệu.
            </Alert>
          )}
          {previewError && (
            <Alert
              severity="error"
              sx={{
                mt: selectionLimitReached ? 0.75 : 0,
                py: 0,
                fontSize: "0.72rem",
              }}
            >
              {previewError}
            </Alert>
          )}
        </Box>
      )}

      <Divider />

      <Box sx={{ minHeight: 0, flex: 1, overflowY: "auto" }}>
        <DocumentSection
          title="Tài liệu của tôi"
          source={library.owned}
          selectedIds={selectedIds}
          selectionLimitReached={selectionLimitReached}
          onToggle={onToggleDocument}
          onPreview={onPreviewDocument}
          previewingDocumentId={previewingDocumentId}
        />
        <Divider />
        <DocumentSection
          title="Đã lưu"
          source={library.saved}
          selectedIds={selectedIds}
          selectionLimitReached={selectionLimitReached}
          onToggle={onToggleDocument}
          onPreview={onPreviewDocument}
          previewingDocumentId={previewingDocumentId}
        />
      </Box>

      <Divider />
      <Box sx={{ p: 1.25, flexShrink: 0 }}>
        <Button
          fullWidth
          component={Link}
          to="/documents/upload"
          variant="outlined"
          startIcon={<UploadFileOutlined />}
          onClick={onClose}
        >
          Tải tài liệu
        </Button>
      </Box>
    </Stack>
  );
}

export default function LibraryDocumentSidebar({
  library,
  selectedDocuments = [],
  onToggleDocument,
  onPreviewDocument,
  previewingDocumentId = null,
  previewError = "",
  mobileOpen = false,
  onMobileClose,
}) {
  const commonProps = {
    library,
    selectedDocuments,
    onToggleDocument,
    onPreviewDocument,
    previewingDocumentId,
    previewError,
  };

  return (
    <>
      <Box
        component="aside"
        sx={{
          display: { xs: "none", lg: "block" },
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          minHeight: 0,
          overflow: "hidden",
          borderRight: "1px solid",
          borderColor: "divider",
        }}
      >
        <SidebarContent {...commonProps} showCloseButton={false} />
      </Box>

      <Drawer
        anchor="left"
        variant="temporary"
        open={Boolean(mobileOpen)}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": {
            width: { xs: "100vw", sm: SIDEBAR_WIDTH },
            maxWidth: "100vw",
            boxSizing: "border-box",
            overflow: "hidden",
          },
        }}
      >
        <SidebarContent
          {...commonProps}
          showCloseButton
          onClose={onMobileClose}
        />
      </Drawer>
    </>
  );
}
