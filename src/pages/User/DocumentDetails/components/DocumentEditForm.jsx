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
import { SaveOutlined } from "@mui/icons-material";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import { useState } from "react";
import { useAuth } from "../../../../features/auth/AuthProvider.jsx";
import DeleteSubjectCategoryDialog from "../../UploadDocument/components/DeleteSubjectCategoryDialog.jsx";

export default function DocumentEditForm({ details }) {
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
          details.openDeleteDialog(type, item);
        }}
        sx={{ ml: 1 }}
      >
        <DeleteOutlineOutlined fontSize="small" />
      </IconButton>
    );
  }

  return (
    <Paper
      component="form"
      onSubmit={details.save}
      variant="outlined"
      sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}
    >
      <Typography variant="h6" fontWeight={750} sx={{ mb: 2 }}>
        Thông tin tài liệu
      </Typography>
      <Stack spacing={2.5}>
        <TextField
          required
          label="Tiêu đề"
          value={details.form.title}
          onChange={(event) => details.updateField("title", event.target.value)}
          inputProps={{ maxLength: 200 }}
        />
        <TextField
          label="Mô tả"
          multiline
          minRows={4}
          value={details.form.description}
          onChange={(event) =>
            details.updateField("description", event.target.value)
          }
          inputProps={{ maxLength: 2000 }}
        />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <FormControl required>
            <FormLabel sx={{ mb: 0.75 }}>Môn học</FormLabel>
            <Select
              value={details.form.subjectId}
              open={subjectMenuOpen}
              onOpen={() => setSubjectMenuOpen(true)}
              onClose={() => setSubjectMenuOpen(false)}
              renderValue={(selectedId) => {
                const selected = details.subjects.find(
                  (item) => item.id === selectedId,
                );
                if (!selected) return "Chọn môn học";
                return `${selected.name}${selected.code ? ` (${selected.code})` : ""}`;
              }}
              onChange={(event) =>
                details.updateField("subjectId", event.target.value)
              }
            >
              {details.subjects.map((item) => (
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
          <FormControl required disabled={!details.form.subjectId}>
            <FormLabel sx={{ mb: 0.75 }}>Danh mục</FormLabel>
            <Select
              value={details.form.categoryId}
              open={categoryMenuOpen}
              onOpen={() => setCategoryMenuOpen(true)}
              onClose={() => setCategoryMenuOpen(false)}
              renderValue={(selectedId) =>
                details.categories.find((item) => item.id === selectedId)
                  ?.name || "Chọn danh mục"
              }
              onChange={(event) =>
                details.updateField("categoryId", event.target.value)
              }
            >
              {details.categories.map((item) => (
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
        </Box>
        <Button
          type="submit"
          variant="contained"
          startIcon={<SaveOutlined />}
          disabled={details.saving}
          sx={{ alignSelf: "flex-start" }}
        >
          {details.saving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </Stack>
      <DeleteSubjectCategoryDialog upload={details} />
    </Paper>
  );
}
