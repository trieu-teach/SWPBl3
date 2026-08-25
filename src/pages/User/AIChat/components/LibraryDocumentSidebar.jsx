import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  CloseOutlined,
  DescriptionOutlined,
  SearchOutlined,
  UploadFileOutlined,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import {
  LIBRARY_DOCUMENT_LIMIT_MESSAGE,
  MAX_LIBRARY_DOCUMENTS,
} from "../../../../api/chat.constants.js";
import { filterLibraryDocumentsBySubjects } from "../chatContext.js";

const SIDEBAR_WIDTH = 328;
function isSelectable(document) {
  return document?.aiUsable === true;
}

function statusLabel(document) {
  if (document?.aiUsable) return "Sẵn sàng";
  if (document?.unavailableReason === "ACCESS_REVOKED") return "Đã thu hồi quyền";
  if (document?.qualityStatus === "UNREADABLE") return "Không thể đọc";
  if (document?.extractionStatus === "PROCESSING") return "Đang xử lý";
  if (document?.extractionStatus === "PENDING") return "Chờ xử lý";
  if (document?.extractionStatus === "FAILED") return "Trích xuất lỗi";
  return document?.unavailableReason || "Không khả dụng";
}

function DocumentRow({
  document,
  selected,
  onToggle,
  selectionLocked,
  selectionLimitReached,
  onPreviewDocument,
}) {
  const selectable = isSelectable(document);
  const selectionDisabled =
    selectionLocked ||
    (!selectable && !selected) ||
    (selectionLimitReached && !selected);
  const selectionTooltip = selectionLocked
    ? "Hãy tạo Chat mới để thay đổi tài liệu."
      : !selectable && !selected
        ? statusLabel(document)
        : "";
  const extension =
    document.fileName?.split(".").pop()?.toUpperCase() ||
    document.fileType?.split("/").pop()?.toUpperCase() ||
    "FILE";
  const accessLabel =
    document.accessType === "SAVED"
      ? "Đã lưu"
      : document.visibility === "PRIVATE"
        ? "Riêng tư"
        : "Cá nhân";

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
      <Tooltip title={selectionTooltip}>
        <Box component="span" sx={{ display: "inline-flex" }}>
          <Checkbox
            checked={selected}
            disabled={selectionDisabled}
            onChange={() => onToggle(document)}
            size="small"
            slotProps={{ input: { "aria-label": `Chọn ${document.title}` } }}
            sx={{ mt: 0.15, mr: 0.25, p: 0.75 }}
          />
        </Box>
      </Tooltip>
      <Box sx={{ minWidth: 0, flex: 1, mt: 0.45 }}>
        <Typography
          component="span"
          variant="body2"
          sx={{
            display: "block",
            fontWeight: 700,
            lineHeight: 1.35,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {document.title || "Tài liệu"}
        </Typography>
        <Stack
          direction="row"
          sx={{ minWidth: 0, mt: 0.25, alignItems: "center", gap: 0.65 }}
        >
          <Typography variant="caption" color="text.secondary">
            {extension}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {accessLabel}
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
      <IconButton
        size="small"
        onClick={() => onPreviewDocument?.(document.id, document.title)}
        aria-label={`Xem trước ${document.title}`}
        sx={{
          mt: 0.4,
          ml: 0.5,
          color: "text.secondary",
          "&:hover": { color: "primary.main" },
        }}
      >
        <DescriptionOutlined sx={{ fontSize: 18 }} />
      </IconButton>
    </ListItem>
  );
}

function DocumentSection({
  title,
  source,
  selectedIds,
  onToggle,
  selectionLocked,
  selectionLimitReached,
  onPreviewDocument,
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
        <Stack direction="row" sx={{ px: 2, py: 2, alignItems: "center", gap: 1 }}>
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
              onToggle={onToggle}
              selectionLocked={selectionLocked}
              selectionLimitReached={selectionLimitReached}
              onPreviewDocument={onPreviewDocument}
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
  scope,
  selectedDocuments,
  selectedSubjectIds,
  onToggleDocument,
  onChangeSubject,
  previewError,
  onClose,
  showCloseButton,
  selectionLocked,
  sourceLockedByConversation,
  onNewChat,
  onPreviewDocument,
}) {
  const selectedIds = new Set(
    Array.isArray(scope?.documentIds)
      ? scope.documentIds
      : selectedDocuments.map((document) => document.id),
  );
  const selectionLimitReached = selectedIds.size >= MAX_LIBRARY_DOCUMENTS;
  const subjectOptions = library.subjects;
  const subjectDocumentCounts = new Map();
  library.current.documents.forEach((document) => {
    if (!document?.subjectId) return;
    subjectDocumentCounts.set(
      document.subjectId,
      (subjectDocumentCounts.get(document.subjectId) ?? 0) + 1,
    );
  });
  const visibleSource = {
    ...library.current,
    documents: filterLibraryDocumentsBySubjects(
      library.current.documents,
      selectedSubjectIds,
    ),
  };
  const scopeLabelId = showCloseButton
    ? "ai-chat-subject-filter-label-mobile"
    : "ai-chat-subject-filter-label-desktop";

  function handleSubjectChange(event) {
    const value = Array.isArray(event.target.value) ? event.target.value : [];
    onChangeSubject?.(value.includes("__ALL__") ? [] : value);
  }

  function renderSubjectValue(selected) {
    if (!Array.isArray(selected) || selected.length === 0) {
      return "Tất cả môn học";
    }
    if (selected.length === 1) {
      return (
        subjectOptions.find((subject) => subject.id === selected[0])?.name ||
        "1 môn học"
      );
    }
    return `${selected.length} môn học đã chọn`;
  }

  return (
    <Stack
      sx={{
        width: { xs: "100vw", sm: SIDEBAR_WIDTH },
        maxWidth: "100vw",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <Stack
        direction="row"
        sx={{ px: 2, py: 1.1, flexShrink: 0, alignItems: "center", gap: 0.85 }}
      >
        <DescriptionOutlined color="action" />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Tài liệu
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {scope.label}
          </Typography>
        </Box>
        {showCloseButton && (
          <IconButton onClick={onClose} aria-label="Đóng danh sách tài liệu">
            <CloseOutlined />
          </IconButton>
        )}
      </Stack>

      <Box sx={{ px: 2, pb: 1.1 }}>
        <FormControl fullWidth size="small" disabled={selectionLocked}>
          <InputLabel id={scopeLabelId} shrink>
            Lọc theo môn học
          </InputLabel>
          <Select
            multiple
            displayEmpty
            notched
            labelId={scopeLabelId}
            value={selectedSubjectIds}
            label="Lọc theo môn học"
            onChange={handleSubjectChange}
            renderValue={renderSubjectValue}
            MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }}
          >
            <MenuItem value="__ALL__">
              <Checkbox checked={selectedSubjectIds.length === 0} size="small" />
              <ListItemText
                primary="Tất cả môn học"
                secondary={`${library.current.documents.length} tài liệu`}
              />
            </MenuItem>
            {library.subjectsLoading && (
              <MenuItem disabled>Đang tải môn học...</MenuItem>
            )}
            {subjectOptions.map((subject) => (
              <MenuItem key={subject.id} value={subject.id}>
                <Checkbox
                  checked={selectedSubjectIds.includes(subject.id)}
                  size="small"
                />
                <ListItemText
                  primary={subject.name || "Môn học"}
                  secondary={`${subjectDocumentCounts.get(subject.id) ?? 0} tài liệu`}
                  primaryTypographyProps={{ noWrap: true }}
                />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {library.subjectsError && (
          <Alert severity="warning" sx={{ mt: 0.75, py: 0, fontSize: "0.72rem" }}>
            Không thể tải danh sách môn học.
          </Alert>
        )}
      </Box>

      <Box component="form" onSubmit={library.applySearch} sx={{ px: 2, pb: 1.1 }}>
        <TextField
          fullWidth
          size="small"
          value={library.searchInput}
          onChange={(event) => library.setSearchInput(event.target.value)}
          placeholder="Tìm tài liệu..."
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <Box sx={{ px: 2, pb: 1.1 }}>
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={library.source}
          onChange={(_, value) => value && library.setSource(value)}
          aria-label="Nguồn tài liệu"
        >
          <ToggleButton value="all">Tất cả</ToggleButton>
          <ToggleButton value="owned">Cá nhân</ToggleButton>
          <ToggleButton value="saved">Đã lưu</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {(selectionLocked || previewError) && (
        <Box sx={{ px: 2, pb: 1.1 }}>
          {selectionLocked && (
            <Alert
              severity="info"
              sx={{ py: 0, fontSize: "0.72rem" }}
              action={
                sourceLockedByConversation ? (
                  <Button color="inherit" size="small" onClick={onNewChat}>
                    Chat mới
                  </Button>
                ) : undefined
              }
            >
              {sourceLockedByConversation
                ? "Tài liệu của cuộc chat đã được cố định. Hãy tạo Chat mới để thay đổi."
                : "Tạm thời không thể thay đổi tài liệu khi hệ thống đang xử lý."}
            </Alert>
          )}
          {previewError && (
            <Alert
              severity="error"
              sx={{
                mt: selectionLocked ? 0.75 : 0,
                py: 0,
                fontSize: "0.72rem",
              }}
            >
              {previewError}
            </Alert>
          )}
        </Box>
      )}

      {!selectionLocked && selectionLimitReached && (
        <Box sx={{ px: 2, pb: 1.1 }}>
          <Alert severity="info" sx={{ py: 0, fontSize: "0.72rem" }}>
            {LIBRARY_DOCUMENT_LIMIT_MESSAGE}
          </Alert>
        </Box>
      )}

      <Divider />

      <Box
        sx={{
          minHeight: 0,
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          overscrollBehaviorY: "contain",
        }}
      >
        <DocumentSection
          title={
            library.source === "owned"
              ? "Tài liệu cá nhân"
              : library.source === "saved"
                ? "Tài liệu đã lưu"
                : selectedSubjectIds.length > 0
                  ? "Tài liệu trong môn học"
                  : "Tất cả tài liệu cá nhân và đã lưu"
          }
          source={visibleSource}
          selectedIds={selectedIds}
          onToggle={onToggleDocument}
          selectionLocked={selectionLocked}
          selectionLimitReached={selectionLimitReached}
          onPreviewDocument={onPreviewDocument}
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
  scope,
  selectedDocuments = [],
  selectedSubjectIds = [],
  onToggleDocument,
  onChangeSubject,
  previewError = "",
  mobileOpen = false,
  onMobileClose,
  selectionLocked = false,
  sourceLockedByConversation = false,
  onNewChat,
  onPreviewDocument,
}) {
  const commonProps = {
    library,
    scope,
    selectedDocuments,
    selectedSubjectIds,
    onToggleDocument,
    onChangeSubject,
    previewError,
    selectionLocked,
    sourceLockedByConversation,
    onNewChat,
    onPreviewDocument,
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
