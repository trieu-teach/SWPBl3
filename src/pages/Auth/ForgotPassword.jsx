import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack,
  Email,
  VerifiedUser,
} from "@mui/icons-material";
import { forgotPassword } from "../../api/auth.api";
import "./Login.css";

/**
 * ForgotPassword - Trang yêu cầu đặt lại mật khẩu
 * 
 * Tính năng:
 * - Nhập email đã đăng ký
 * - Gửi email chứa liên kết đặt lại mật khẩu
 * - Hiển thị thông báo thành công
 * 
 * Layout: Split screen - trái là branding, phải là form
 */
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Vui lòng nhập địa chỉ email.");
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      const code = err?.code || "";
      let msg = "Không thể gửi yêu cầu. Vui lòng thử lại.";
      if (code === "auth/user-not-found") {
        msg = "Không tìm thấy tài khoản với email này.";
      } else if (code === "auth/invalid-email") {
        msg = "Email không hợp lệ.";
      } else if (code === "auth/too-many-requests") {
        msg = "Đã gửi quá nhiều yêu cầu. Vui lòng đợi vài phút.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="bx-auth">
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
          <Button component={Link} to="/register" className="bx-header-register-btn">
            Đăng ký
          </Button>
        </Box>
      </Box>

      <Box className="bx-layout">
        <Box className="bx-panel-left">
          <Box className="bx-panel-dots" aria-hidden />
          <Box className="bx-panel-content">
            <Box className="bx-panel-logo">
              <Box className="bx-panel-logo-icon">D</Box>
              <Typography className="bx-panel-logo-text">DocuMind</Typography>
            </Box>
            <Typography variant="h3" className="bx-panel-heading">
              Không nhớ mật khẩu?{" "}
              <em>Không sao cả.</em>
            </Typography>
            <Typography className="bx-panel-desc">
              Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu trong vài phút.
            </Typography>
            <Box className="bx-panel-footer">
              <VerifiedUser sx={{ fontSize: 13, color: "#34d399" }} />
              Liên kết đặt lại có hiệu lực trong 15 phút.
            </Box>
          </Box>
        </Box>

        <Box className="bx-panel-right">
          <Box className="bx-form-card">
            <Box className="bx-form-head">
              <Typography variant="h3" className="bx-form-title">
                Quên mật khẩu?
              </Typography>
              <Typography className="bx-form-sub">
                Nhập email đã đăng ký để nhận liên kết đặt lại.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" className="bx-form-alert">
                {error}
              </Alert>
            )}

            {success ? (
              <Alert severity="success" className="bx-form-alert">
                Đã gửi liên kết đặt lại mật khẩu đến <strong>{email}</strong>.
                Vui lòng kiểm tra hộp thư.
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="bx-form-stack">
                <TextField
                  type="email"
                  fullWidth
                  placeholder="Email đã đăng ký"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  disabled={loading}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email className="bx-input-icon" />
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
                  {loading ? "Đang gửi…" : "Gửi liên kết đặt lại"}
                </Button>

                <Typography className="bx-form-sub" sx={{ textAlign: "center" }}>
                  Nhớ mật khẩu?{" "}
                  <Link to="/login" className="bx-form-link">
                    Đăng nhập
                  </Link>
                </Typography>
              </form>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
