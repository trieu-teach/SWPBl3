import {
  Box,
  Button,
  FormControl,
  FormLabel,
  IconButton,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import { useState } from "react";
import { useAuth } from "../../../../features/auth/AuthProvider.jsx";
import DocumentTagInput from "./DocumentTagInput.jsx";
import CreateTaxonomyDialog from "./CreateTaxonomyDialog.jsx";
import DeleteSubjectCategoryDialog from "./DeleteSubjectCategoryDialog.jsx";

export default function DocumentMetadataForm({ upload }) {
  const { user } = useAuth();
  const [subjectMenuOpen, setSubjectMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);

  function deleteButton(type, item, closeMenu) {
    if (!item.ownerId || item.ownerId !== user?.id) return null;
    return (
      <IconButton
        size="small"
        color="error"
        aria-label={`Xóa ${type === "subject" ? "môn học" : "danh mục"} ${item.name}`}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          closeMenu();
          upload.openDeleteDialog(type, item);
        }}
        sx={{ ml: 1 }}
      >
        <DeleteOutlineOutlined fontSize="small" />
      </IconButton>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 750, mb: 2 }}>
        2. Thông tin tài liệu
      </Typography>
      <Stack spacing={2.5}>
        <TextField
          label="Tiêu đề"
          required
          value={upload.title}
          onChange={(event) => upload.updateField("title", event.target.value)}
          inputProps={{ maxLength: 200 }}
          helperText={`${upload.title.length}/200 ký tự`}
        />
        <TextField
          label="Mô tả"
          multiline
          minRows={3}
          value={upload.description}
          onChange={(event) =>
            upload.updateField("description", event.target.value)
          }
          inputProps={{ maxLength: 2000 }}
          helperText={`${upload.description.length}/2000 ký tự`}
        />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <Stack spacing={1}>
            <FormControl required disabled={upload.loadingOptions}>
              <FormLabel sx={{ mb: 0.75 }}>Môn học</FormLabel>
              <Select
                value={upload.subjectId}
                displayEmpty
                renderValue={(selectedId) => {
                  const selected = upload.subjects.find(
                    (item) => item.id === selectedId,
                  );
                  if (!selected) return "Chọn môn học";
                  return `${selected.name}${selected.code ? ` (${selected.code})` : ""}`;
                }}
                open={subjectMenuOpen}
                onOpen={() => setSubjectMenuOpen(true)}
                onClose={() => setSubjectMenuOpen(false)}
                onChange={(event) =>
                  upload.updateField("subjectId", event.target.value)
                }
              >
                <MenuItem value="" disabled>
                  {upload.loadingOptions ? "Đang tải..." : "Chọn môn học"}
                </MenuItem>
                {upload.subjects.map((item) => (
                  <MenuItem
                    key={item.id}
                    value={item.id}
                    sx={{ display: "flex", gap: 1 }}
                  >
                    <ListItemText
                      primary={`${item.name}${item.code ? ` (${item.code})` : ""}`}
                    />
                    {deleteButton("subject", item, () =>
                      setSubjectMenuOpen(false),
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              size="small"
              sx={{ alignSelf: "flex-start" }}
              onClick={() => upload.openTaxonomyDialog("subject")}
            >
              + Tạo môn học mới
            </Button>
          </Stack>
          <Stack spacing={1}>
            <FormControl required disabled={!upload.subjectId}>
              <FormLabel sx={{ mb: 0.75 }}>Danh mục</FormLabel>
              <Select
                value={upload.categoryId}
                displayEmpty
                renderValue={(selectedId) =>
                  upload.categories.find((item) => item.id === selectedId)
                    ?.name || "Chọn danh mục"
                }
                open={categoryMenuOpen}
                onOpen={() => setCategoryMenuOpen(true)}
                onClose={() => setCategoryMenuOpen(false)}
                onChange={(event) =>
                  upload.updateField("categoryId", event.target.value)
                }
              >
                <MenuItem value="" disabled>
                  {upload.subjectId ? "Chọn danh mục" : "Chọn môn học trước"}
                </MenuItem>
                {upload.categories.map((item) => (
                  <MenuItem
                    key={item.id}
                    value={item.id}
                    sx={{ display: "flex", gap: 1 }}
                  >
                    <ListItemText primary={item.name} />
                    {deleteButton("category", item, () =>
                      setCategoryMenuOpen(false),
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              size="small"
              sx={{ alignSelf: "flex-start" }}
              disabled={!upload.subjectId}
              onClick={() => upload.openTaxonomyDialog("category")}
            >
              + Tạo danh mục mới
            </Button>
          </Stack>
        </Box>
        <DocumentTagInput
          value={upload.tagInput}
          tags={upload.tags}
          onChange={upload.setTagInput}
          onAdd={upload.addTag}
          onRemove={upload.removeTag}
        />
      </Stack>
      <CreateTaxonomyDialog
        open={Boolean(upload.taxonomyDialog)}
        type={upload.taxonomyDialog}
        loading={upload.creatingTaxonomy}
        error={upload.taxonomyError}
        onClose={upload.closeTaxonomyDialog}
        onSubmit={upload.submitTaxonomy}
      />
      <DeleteSubjectCategoryDialog upload={upload} />
    </Paper>
  );
}
