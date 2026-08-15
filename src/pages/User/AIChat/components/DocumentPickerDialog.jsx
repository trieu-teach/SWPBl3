import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import FolderOpenOutlined from "@mui/icons-material/FolderOpenOutlined";
import { getDocuments } from "../../../../api/documents.api.js";
import { normalizeDocumentList } from "../../DocumentLibrary/utils/document-formatters.js";
import { MAX_SELECTED_DOCUMENTS } from "../../../../api/chat.api.js";

const PAGE_LIMIT = 10;

function usePickerDocuments(open) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);

  const query = useMemo(
    () => ({
      search: searchKeyword,
      ownerOnly: true,
      page,
      limit: PAGE_LIMIT,
      sortBy: "createdAt",
      sortOrder: "desc",
    }),
    [searchKeyword, page],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const raw = await getDocuments(query);
      const result = normalizeDocumentList(raw);
      setDocuments(result.items);
      const total = Number(
        result.meta.totalItems ?? result.meta.total ?? result.items.length,
      );
      setPageCount(
        Number(result.meta.totalPages ?? Math.max(1, Math.ceil(total / PAGE_LIMIT))),
      );
    } catch {
      setError("Không thể tải danh sách tài liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  // Load when dialog opens or query changes
  useEffect(() => {
    if (!open) return;
    load();
  }, [open, load]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchInput("");
      setSearchKeyword("");
      setPage(1);
    }
  }, [open]);

  function applySearch(event) {
    event.preventDefault();
    setPage(1);
    setSearchKeyword(searchInput.trim());
  }

  return {
    documents,
    loading,
    error,
    searchInput,
    setSearchInput,
    page,
    setPage,
    pageCount,
    applySearch,
    reload: load,
  };
}

export default function DocumentPickerDialog({
  open,
  onClose,
  selectedDocuments = [],
  onApply,
}) {
  // Temporary selection — separate from real context until Apply
  const [tempSelected, setTempSelected] = useState([]);

  // Sync temp with real selection when dialog opens
  useEffect(() => {
    if (open) {
      setTempSelected(selectedDocuments.map((d) => ({ id: d.id, title: d.title })));
    }
  }, [open, selectedDocuments]);

  const picker = usePickerDocuments(open);

  function toggleDocument(doc) {
    setTempSelected((current) => {
      const exists = current.some((d) => d.id === doc.id);
      if (exists) return current.filter((d) => d.id !== doc.id);
      if (current.length >= MAX_SELECTED_DOCUMENTS) return current;
      return [...current, { id: doc.id, title: doc.title }];
    });
  }

  function isSelected(id) {
    return tempSelected.some((d) => d.id === id);
  }

  function handleApply() {
    onApply(tempSelected);
    onClose();
  }

  function handleCancel() {
    onClose();
    // tempSelected discarded — real context unchanged
  }

  const tempCount = tempSelected.length;
  const atLimit = tempCount >= MAX_SELECTED_DOCUMENTS;

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          height: { xs: "100dvh", sm: "auto" },
          maxHeight: { xs: "100dvh", sm: "80dvh" },
          display: "flex",
          flexDirection: "column",
        },
      }}
      sx={{
        "& .MuiDialog-container": { alignItems: { xs: "flex-end", sm: "center" } },
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Chọn tài liệu
            </Typography>
            <Typography variant="caption" color="text.secondary">
              AI sẽ trả lời dựa trên các tài liệu đã chọn · Tối đa{" "}
              {MAX_SELECTED_DOCUMENTS}
            </Typography>
          </Box>
          <IconButton onClick={handleCancel} aria-label="Đóng">
            <CloseOutlined />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      {/* Search bar */}
      <Box
        sx={{ px: { xs: 2, sm: 3 }, py: 1.5, flexShrink: 0 }}
        component="form"
        onSubmit={picker.applySearch}
      >
        <TextField
          fullWidth
          size="small"
          value={picker.searchInput}
          onChange={(e) => picker.setSearchInput(e.target.value)}
          placeholder="Tìm theo tên tài liệu..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: picker.loading ? (
              <InputAdornment position="end">
                <CircularProgress size={16} />
              </InputAdornment>
            ) : null,
          }}
          sx={{ "& .MuiInputBase-root": { borderRadius: 2 } }}
        />
      </Box>

      {/* Limit warning */}
      {atLimit && (
        <Alert severity="warning" sx={{ mx: { xs: 2, sm: 3 }, mb: 0.5, py: 0.5 }}>
          Đã chọn tối đa {MAX_SELECTED_DOCUMENTS} tài liệu.
        </Alert>
      )}

      {/* Document list */}
      <DialogContent sx={{ p: 0, flex: 1, minHeight: 0, overflowY: "auto" }}>
        {picker.error && (
          <Stack alignItems="center" sx={{ py: 4, px: 3 }} spacing={1.5}>
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={picker.reload}>
                  Thử lại
                </Button>
              }
              sx={{ width: "100%" }}
            >
              {picker.error}
            </Alert>
          </Stack>
        )}

        {!picker.error && !picker.loading && picker.documents.length === 0 && (
          <Stack alignItems="center" sx={{ py: 6 }} spacing={1}>
            <FolderOpenOutlined sx={{ fontSize: 48, color: "text.disabled" }} />
            <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
              Không tìm thấy tài liệu
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Thử từ khóa khác hoặc tải tài liệu lên thư viện.
            </Typography>
          </Stack>
        )}

        {!picker.error && (
          <List disablePadding>
            {picker.loading && picker.documents.length === 0
              ? Array.from({ length: 5 }).map((_, i) => (
                  <ListItem key={i} divider sx={{ py: 1.5, px: { xs: 2, sm: 3 } }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: 0.5,
                          bgcolor: "action.hover",
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            height: 14,
                            bgcolor: "action.hover",
                            borderRadius: 1,
                            width: "60%",
                            mb: 0.75,
                          }}
                        />
                      }
                      secondary={
                        <Box
                          sx={{
                            height: 12,
                            bgcolor: "action.hover",
                            borderRadius: 1,
                            width: "35%",
                          }}
                        />
                      }
                    />
                  </ListItem>
                ))
              : picker.documents.map((doc) => {
                  const selected = isSelected(doc.id);
                  const disabled = !selected && atLimit;
                  const ext = doc.fileName?.split(".").pop()?.toUpperCase() || "FILE";
                  const isReady = doc.aiStatus === "COMPLETED";

                  return (
                    <ListItem
                      key={doc.id}
                      disablePadding
                      divider
                      secondaryAction={
                        !isReady ? (
                          <Chip
                            label="Chưa sẵn sàng"
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ fontSize: "0.7rem" }}
                          />
                        ) : null
                      }
                    >
                      <ListItemButton
                        onClick={() => !disabled && toggleDocument(doc)}
                        disabled={disabled && !selected}
                        sx={{
                          px: { xs: 2, sm: 3 },
                          py: 1.25,
                          opacity: disabled ? 0.5 : 1,
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Checkbox
                            edge="start"
                            checked={selected}
                            tabIndex={-1}
                            disableRipple
                            size="small"
                          />
                        </ListItemIcon>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <DescriptionOutlined
                            sx={{ fontSize: "1.1rem", color: "text.secondary" }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, lineHeight: 1.4 }}
                              noWrap
                            >
                              {doc.title}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              component="span"
                            >
                              {ext}
                              {doc.subject?.name ? ` · ${doc.subject.name}` : ""}
                            </Typography>
                          }
                          sx={{ pr: isReady ? 0 : 12 }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
          </List>
        )}

        {/* Pagination */}
        {picker.pageCount > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <Pagination
              page={picker.page}
              count={picker.pageCount}
              size="small"
              color="primary"
              onChange={(_, value) => picker.setPage(value)}
            />
          </Box>
        )}
      </DialogContent>

      <Divider />

      {/* Footer actions */}
      <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 1.5, gap: 1 }}>
        {tempCount > 0 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ flex: 1, fontWeight: 600 }}
          >
            Đã chọn {tempCount} / {MAX_SELECTED_DOCUMENTS}
          </Typography>
        )}
        <Button onClick={handleCancel}>Hủy</Button>
        <Button variant="contained" onClick={handleApply}>
          {tempCount > 0 ? `Áp dụng (${tempCount})` : "Áp dụng"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
