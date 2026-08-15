import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
} from "@mui/material";

const EMPTY_FORM = {
  code: "",
  name: "",
  price: "",
  checkoutPrice: "",
  durationDays: "30",
  rank: "",
  storageLimitMb: "",
  uploadLimit: "",
  aiChatLimit: "",
  isActive: true,
};

const NUMBER_FIELDS = [
  "price",
  "durationDays",
  "rank",
  "storageLimitMb",
  "uploadLimit",
];

export default function SubscriptionPlanFormDialog({
  open,
  plan,
  loading,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      plan
        ? {
            code: plan.code,
            name: plan.name,
            price: String(plan.price),
            checkoutPrice: plan.checkoutPrice ?? "",
            durationDays: String(plan.durationDays),
            rank: String(plan.rank),
            storageLimitMb: String(plan.storageLimitMb),
            uploadLimit: String(plan.uploadLimit),
            aiChatLimit: plan.aiChatLimit ?? "",
            isActive: plan.isActive,
          }
        : EMPTY_FORM,
    );
  }, [open, plan]);

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function submit(event) {
    event.preventDefault();
    const nextErrors = {};

    if (
      !plan &&
      !/^[A-Z][A-Z0-9_]{1,31}$/.test(form.code.trim().toUpperCase())
    ) {
      nextErrors.code = "Mã gồm 2–32 ký tự in hoa, số hoặc dấu gạch dưới.";
    }
    if (!form.name.trim()) nextErrors.name = "Vui lòng nhập tên gói.";

    NUMBER_FIELDS.forEach((field) => {
      if (form[field] === "" || Number(form[field]) < 0) {
        nextErrors[field] = "Giá trị phải là số nguyên không âm.";
      }
    });

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      checkoutPrice:
        form.checkoutPrice === "" ? null : Number(form.checkoutPrice),
      durationDays: Number(form.durationDays),
      rank: Number(form.rank),
      storageLimitMb: Number(form.storageLimitMb),
      uploadLimit: Number(form.uploadLimit),
      aiChatLimit: form.aiChatLimit === "" ? null : Number(form.aiChatLimit),
      isActive: form.isActive,
    };

    if (!plan) payload.code = form.code.trim().toUpperCase();
    onSubmit(payload);
  }

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="md"
    >
      <form onSubmit={submit}>
        <DialogTitle>{plan ? "Chỉnh sửa gói" : "Tạo gói mới"}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Mã gói"
                value={form.code}
                disabled={Boolean(plan)}
                onChange={(event) =>
                  update("code", event.target.value.toUpperCase())
                }
                error={Boolean(errors.code)}
                helperText={
                  errors.code ||
                  (plan ? "Không thể đổi mã sau khi tạo." : "Ví dụ: GOLD")
                }
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tên gói"
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                error={Boolean(errors.name)}
                helperText={errors.name}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Giá niêm yết (VND)"
                type="number"
                value={form.price}
                onChange={(event) => update("price", event.target.value)}
                error={Boolean(errors.price)}
                helperText={errors.price}
                inputProps={{ min: 0, step: 1 }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Giá thanh toán (VND)"
                type="number"
                value={form.checkoutPrice}
                onChange={(event) =>
                  update("checkoutPrice", event.target.value)
                }
                helperText="Để trống nếu dùng giá niêm yết."
                inputProps={{ min: 0, step: 1 }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Thời hạn (ngày)"
                type="number"
                value={form.durationDays}
                onChange={(event) => update("durationDays", event.target.value)}
                error={Boolean(errors.durationDays)}
                helperText={errors.durationDays || "Nhập 0 nếu không giới hạn."}
                inputProps={{ min: 0, step: 1 }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Thứ hạng"
                type="number"
                value={form.rank}
                onChange={(event) => update("rank", event.target.value)}
                error={Boolean(errors.rank)}
                helperText={
                  errors.rank || "Mỗi gói phải có thứ hạng khác nhau."
                }
                inputProps={{ min: 0, step: 1 }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Dung lượng (MB)"
                type="number"
                value={form.storageLimitMb}
                onChange={(event) =>
                  update("storageLimitMb", event.target.value)
                }
                error={Boolean(errors.storageLimitMb)}
                helperText={errors.storageLimitMb}
                inputProps={{ min: 0, step: 1 }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Giới hạn upload"
                type="number"
                value={form.uploadLimit}
                onChange={(event) => update("uploadLimit", event.target.value)}
                error={Boolean(errors.uploadLimit)}
                helperText={errors.uploadLimit}
                inputProps={{ min: 0, step: 1 }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Giới hạn chat AI"
                type="number"
                value={form.aiChatLimit}
                onChange={(event) => update("aiChatLimit", event.target.value)}
                helperText="Để trống nếu không giới hạn."
                inputProps={{ min: 0, step: 1 }}
                fullWidth
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
                label="Cho phép người dùng đăng ký gói này"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Đang lưu..." : plan ? "Lưu thay đổi" : "Tạo gói"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
