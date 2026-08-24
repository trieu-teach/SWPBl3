import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  Switch,
  TextField,
} from "@mui/material";
import {
  DOMAIN_OPTIONS,
  SEVERITY_OPTIONS,
} from "../utils/moderation-keyword-options.js";

const EMPTY_FORM = {
  keyword: "",
  severity: "LOW",
  domain: "KHAC",
  matchNoDiacritics: false,
  isActive: true,
};

export default function ModerationKeywordFormDialog({
  open,
  keyword,
  loading,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(
      keyword
        ? {
            keyword: keyword.keyword || "",
            severity: keyword.severity || "LOW",
            domain: keyword.domain || "KHAC",
            matchNoDiacritics: Boolean(keyword.matchNoDiacritics),
            isActive: Boolean(keyword.isActive),
          }
        : EMPTY_FORM,
    );
  }, [open, keyword]);

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    if (name === "keyword") setError("");
  }

  function submit(event) {
    event.preventDefault();
    const normalizedKeyword = form.keyword.trim();

    if (normalizedKeyword.length < 2) {
      setError("Từ khóa phải có ít nhất 2 ký tự.");
      return;
    }
    if (normalizedKeyword.length > 100) {
      setError("Từ khóa không được vượt quá 100 ký tự.");
      return;
    }

    onSubmit({ ...form, keyword: normalizedKeyword });
  }

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <form onSubmit={submit}>
        <DialogTitle>
          {keyword ? "Chỉnh sửa từ khóa" : "Thêm từ khóa kiểm duyệt"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                label="Từ khóa"
                value={form.keyword}
                onChange={(event) => update("keyword", event.target.value)}
                error={Boolean(error)}
                helperText={error || "Từ 2 đến 100 ký tự."}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Nhóm nội dung"
                value={form.domain}
                onChange={(event) => update("domain", event.target.value)}
                fullWidth
              >
                {DOMAIN_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Mức độ"
                value={form.severity}
                onChange={(event) => update("severity", event.target.value)}
                fullWidth
              >
                {SEVERITY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                Chỉ bật kiểm tra không dấu với cụm từ đủ rõ nghĩa để tránh phát
                hiện nhầm những từ thông thường.
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.matchNoDiacritics}
                    onChange={(event) =>
                      update("matchNoDiacritics", event.target.checked)
                    }
                  />
                }
                label="Phát hiện cả phiên bản không dấu"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isActive}
                    onChange={(event) =>
                      update("isActive", event.target.checked)
                    }
                  />
                }
                label="Áp dụng từ khóa khi quét tài liệu"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading
              ? "Đang lưu..."
              : keyword
                ? "Lưu thay đổi"
                : "Thêm từ khóa"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
