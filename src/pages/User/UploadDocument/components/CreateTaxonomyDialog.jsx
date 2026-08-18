import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";

const EMPTY_FORM = { code: "", name: "", description: "" };

export default function CreateTaxonomyDialog({
  open,
  type,
  loading,
  error,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const isSubject = type === "subject";

  useEffect(() => {
    if (!open) setForm(EMPTY_FORM);
  }, [open]);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function submit(event) {
    event.preventDefault();
    onSubmit({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      ...(isSubject ? { code: form.code.trim() } : {}),
    });
  }

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {isSubject ? "Tạo môn học mới" : "Tạo danh mục mới"}
      </DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="create-taxonomy-form"
          spacing={2}
          onSubmit={submit}
          sx={{ pt: 1 }}
        >
          {error && <Alert severity="error">{error}</Alert>}
          {isSubject && (
            <TextField
              autoFocus
              required
              label="Mã môn học"
              value={form.code}
              onChange={(event) => updateField("code", event.target.value)}
              inputProps={{ minLength: 2, maxLength: 30 }}
              helperText="Ví dụ: SWE101"
            />
          )}
          <TextField
            autoFocus={!isSubject}
            required
            label={isSubject ? "Tên môn học" : "Tên danh mục"}
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            inputProps={{ minLength: 2, maxLength: 120 }}
          />
          <TextField
            label="Mô tả (không bắt buộc)"
            multiline
            minRows={3}
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            inputProps={{ maxLength: 1000 }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          type="submit"
          form="create-taxonomy-form"
          variant="contained"
          disabled={
            loading || !form.name.trim() || (isSubject && !form.code.trim())
          }
        >
          {loading ? "Đang tạo..." : "Tạo và chọn"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
