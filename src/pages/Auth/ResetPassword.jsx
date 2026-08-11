import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Brightness4,
  Brightness7,
  Lock,
  CheckCircle,
} from "@mui/icons-material";
import { useColorMode } from "../../App.jsx";
import "./Login.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const { mode, toggle } = useColorMode();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const header = (
    <Box component="header" className="bx-header">
      <Link to="/" className="bx-header-logo">
        <Box className="bx-header-logo-icon">D</Box>
        <Typography className="bx-header-logo-text">DocuMind</Typography>
      </Link>
      <Box component="nav" className="bx-header-nav">
        <Link to="/" className="bx-header-nav-item">Trang chủ</Link>
        <Link to="/#features" className="bx-header-nav-item">Tính năng</Link>
        <Link to="/#pricing" className="bx-header-nav-item">Bảng giá</Link>
      </Box>
      <Box className="bx-header-actions">
        <Tooltip title={mode === "dark" ? "Chuyển nền sáng" : "Chuyển nền tối"}>
          <IconButton onClick={toggle} className="bx-theme-toggle">
            {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Tooltip>
        <Button component={Link} to="/register" className="bx-header-register-btn">
          Đăng ký
        </Button>
      </Box>
    </Box>
  );

  /* ── Invalid token ── */
  if (!token) {
    return (
      <Box className="bx-auth">
        {header}
        <Box className="bx-layout">
          <Box className="bx-panel-left">
            <Box className="bx-panel-dots" aria-hidden />
            <Box className="bx-panel-content">
              <Box className="bx-panel-logo">
                <Box className="bx-panel-logo-icon">D</Box>
                <Typography className="bx-panel-logo-text">DocuMind</Typography>
              </Box>
              <Typography variant="h3" className="bx-panel-heading">
                Liên kết <em>không hợp lệ.</em>
              </Typography>
              <Typography className="bx-panel-desc">
                Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu gửi lại.
              </Typography>
            </Box>
          </Box>
          <Box className="bx-panel-right">
            <Box className="bx-form-card">
              <Alert severity="error" className="bx-form-alert">
                Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
              </Alert>
              <Button
                component={Link}
                to="/forgot-password"
                fullWidth
                size="large"
                variant="contained"
                disableElevation
                className="bx-submit-btn"
                sx={{ mt: 2 }}
              >
                Yêu cầu đặt lại mật khẩu
              </Button>
              <Typography className="bx-form-sub" sx={{ textAlign: "center", mt: 1.5 }}>
                Nhớ mật khẩu?{" "}
                <Link to="/login" className="bx-form-link">Đăng nhập</Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!password) { setError("Vui lòng nhập mật khẩu mới."); return; }
    if (password.length < 8) { setError("Mật khẩu phải có ít nhất 8 ký tự."); return; }
    if (password !== confirmPassword) { setError("Mật khẩu xác nhận không khớp."); return; }
    setLoading(true);
    try {
      const { resetPassword } = await import("../../api/auth.api");
      await resetPassword(token, password, confirmPassword);
      setSuccess(true);
    } catch (err) {
      setError(err?.message || "Không thể đặt lại. Liên kết có thể đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="bx-auth">
      {header}

      <Box className="bx-layout">
        <Box className="bx-panel-left">
          <Box className="bx-panel-dots" aria-hidden />
          <Box className="bx-panel-content">
            <Box className="bx-panel-logo">
              <Box className="bx-panel-logo-icon">D</Box>
              <Typography className="bx-panel-logo-text">DocuMind</Typography>
            </Box>
            <Typography variant="h3" className="bx-panel-heading">
              Đặt mật khẩu <em>mới.</em>
            </Typography>
            <Typography className="bx-panel-desc">
              Chọn một mật khẩu mạnh và khác với mật khẩu cũ để bảo vệ tài khoản tốt nhất.
            </Typography>
          </Box>
        </Box>

        <Box className="bx-panel-right">
          <Box className="bx-form-card">
            <Box className="bx-form-head">
              <Typography variant="h3" className="bx-form-title">
                Đặt lại mật khẩu
              </Typography>
              <Typography className="bx-form-sub">
                Nhập mật khẩu mới cho tài khoản của bạn.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" className="bx-form-alert">
                {error}
              </Alert>
            )}

            {success ? (
              <Box sx={{ textAlign: "center", py: 1 }}>
                <CheckCircle sx={{ fontSize: 52, color: "#34d399", mb: 2 }} />
                <Typography sx={{ color: "#f1f5f9", fontWeight: 700, mb: 1 }}>
                  Đặt lại thành công!
                </Typography>
                <Typography className="bx-form-sub" sx={{ mb: 3 }}>
                  Mật khẩu đã được cập nhật. Đăng nhập ngay.
                </Typography>
                <Button
                  component={Link}
                  to="/login"
                  fullWidth
                  size="large"
                  variant="contained"
                  disableElevation
                  className="bx-submit-btn"
                >
                  Đăng nhập ngay
                </Button>
              </Box>
            ) : (
              <form onSubmit={handleSubmit} className="bx-form-stack">
                <TextField
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  placeholder="Mật khẩu mới"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock className="bx-input-icon" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" className="bx-input-action">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  type={showConfirm ? "text" : "password"}
                  fullWidth
                  placeholder="Xác nhận mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock className="bx-input-icon" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirm((s) => !s)} edge="end" className="bx-input-action">
                            {showConfirm ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  size="large"
                  variant="contained"
                  disableElevation
                  endIcon={
                    loading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : null
                  }
                  disabled={loading}
                  className="bx-submit-btn"
                >
                  {loading ? "Đang xử lý…" : "Đặt lại mật khẩu"}
                </Button>

                <Typography className="bx-form-sub" sx={{ textAlign: "center" }}>
                  Nhớ mật khẩu?{" "}
                  <Link to="/login" className="bx-form-link">Đăng nhập</Link>
                </Typography>
              </form>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
