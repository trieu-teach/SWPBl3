import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Person,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Google,
  VerifiedUser,
  Shield,
  RocketLaunch,
  CheckCircle,
} from "@mui/icons-material";
import { useAuth } from "../../features/auth/AuthProvider.jsx";
import { getAuthenticatedHomeRoute } from "../../lib/routes";
import { firebaseErrorMessage } from "../../lib/authService";
import "./Login.css";
import "./Register.css";

const BRAND_FEATURES = [
  {
    icon: <RocketLaunch sx={{ fontSize: 16 }} />,
    color: "#818cf8",
    bg: "rgba(99,102,241,0.15)",
    text: "Tạo tài khoản miễn phí — không cần thẻ tín dụng",
  },
  {
    icon: <Shield sx={{ fontSize: 16 }} />,
    color: "#34d399",
    bg: "rgba(52,211,153,0.15)",
    text: "Bảo mật enterprise — dữ liệu được mã hóa đầu cuối",
  },
  {
    icon: <VerifiedUser sx={{ fontSize: 16 }} />,
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.15)",
    text: "Đăng nhập an toàn — hỗ trợ xác thực hai yếu tố (2FA)",
  },
];

export default function Register() {
  const navigate = useNavigate();
  const { signUp, signInGoogle, refreshUser } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null); // { email } after register

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!fullName.trim()) {
      setError("Vui lòng nhập họ và tên.");
      return;
    }
    if (!email) {
      setError("Vui lòng nhập email.");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (!acceptedTerms) {
      setError("Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.");
      return;
    }
    setLoading(true);
    try {
      const result = await signUp({
        email,
        password,
        fullName: fullName.trim(),
        acceptedTerms: true,
      });
      setSuccess({ email: result?.email || email });
    } catch (err) {
      setError(firebaseErrorMessage(err, "Đăng ký thất bại. Vui lòng thử lại."));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await signInGoogle({
        fullName: fullName.trim() || undefined,
        acceptedTerms: true,
      });
      const refreshed = await refreshUser();
      navigate(
        getAuthenticatedHomeRoute(refreshed?.role || data?.role || "USER"),
        { replace: true }
      );
    } catch (err) {
      setError(firebaseErrorMessage(err, "Đăng ký Google thất bại."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="bx-auth">
      {/* ── HEADER ── */}
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
          <Button component={Link} to="/login" className="bx-header-login-btn">
            Đăng nhập
          </Button>
        </Box>
      </Box>

      <Box className="bx-layout">
        {/* LEFT — Branding */}
        <Box className="bx-panel-left">
          <Box className="bx-panel-dots" aria-hidden />
          <Box className="bx-panel-content">
            <Box className="bx-panel-logo">
              <Box className="bx-panel-logo-icon">D</Box>
              <Typography className="bx-panel-logo-text">DocuMind</Typography>
            </Box>

            <Typography variant="h3" className="bx-panel-heading">
              Bắt đầu miễn phí,{" "}
              <em>không giới hạn.</em>
            </Typography>

            <Typography className="bx-panel-desc">
              Tạo tài khoản trong 30 giây và bắt đầu hỏi AI trên tài liệu của bạn — không cần thẻ tín dụng.
            </Typography>

            <Box component="ul" className="bx-features">
              {BRAND_FEATURES.map((f, i) => (
                <Box component="li" className="bx-feature-item" key={i}>
                  <Box className="bx-feature-icon" sx={{ background: f.bg, color: f.color }}>
                    {f.icon}
                  </Box>
                  <Typography className="bx-feature-text">{f.text}</Typography>
                </Box>
              ))}
            </Box>

            <Box className="bx-panel-footer">
              <Shield sx={{ fontSize: 13, color: "#34d399" }} />
              Dữ liệu được mã hóa và bảo mật theo tiêu chuẩn enterprise.
            </Box>
          </Box>
        </Box>

        {/* RIGHT — Form */}
        <Box className="bx-panel-right">
          <Box className="bx-form-card">
            {success ? (
              <Box className="bx-verify-banner">
                <CheckCircle sx={{ fontSize: 48, color: "#34d399" }} />
                <Typography variant="h5" className="bx-form-title" sx={{ mt: 2 }}>
                  Kiểm tra email của bạn
                </Typography>
                <Typography className="bx-form-sub" sx={{ mt: 1, mb: 3 }}>
                  Một liên kết xác thực đã được gửi tới <b>{success.email}</b>.
                  Vui lòng mở email và bấm vào liên kết để kích hoạt tài khoản,
                  sau đó quay lại trang Đăng nhập.
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
                  Đi tới trang đăng nhập
                </Button>
              </Box>
            ) : (
              <>
                <Box className="bx-form-head">
                  <Typography variant="h3" className="bx-form-title">
                    Tạo tài khoản
                  </Typography>
                  <Typography className="bx-form-sub">
                    Nhanh chóng và hoàn toàn miễn phí.
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" className="bx-form-alert">
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="bx-form-stack">
                  <TextField
                    fullWidth
                    placeholder="Họ và tên"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    required
                    disabled={loading}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person className="bx-input-icon" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <TextField
                    type="email"
                    fullWidth
                    placeholder="Email"
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

                  <TextField
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    placeholder="Mật khẩu (tối thiểu 6 ký tự)"
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
                            <IconButton
                              onClick={() => setShowPassword((s) => !s)}
                              edge="end"
                              aria-label="Hiện/ẩn mật khẩu"
                              className="bx-input-action"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        size="small"
                        className="bx-check"
                      />
                    }
                    label={
                      <Typography variant="body2" className="bx-terms-text">
                        Tôi đồng ý với{" "}
                        <Link to="/terms" className="bx-form-link">
                          Điều khoản
                        </Link>{" "}
                        và{" "}
                        <Link to="/privacy" className="bx-form-link">
                          Chính sách bảo mật
                        </Link>
                        .
                      </Typography>
                    }
                  />

                  <Button
                    type="submit"
                    fullWidth
                    size="large"
                    variant="contained"
                    disableElevation
                    startIcon={
                      loading ? (
                        <CircularProgress size={18} sx={{ color: "#fff" }} />
                      ) : null
                    }
                    disabled={loading}
                    className="bx-submit-btn"
                  >
                    {loading ? "Đang tạo tài khoản…" : "Tạo tài khoản"}
                  </Button>

                  <Box className="bx-divider">
                    <span>hoặc</span>
                  </Box>

                  <Button
                    fullWidth
                    size="large"
                    variant="outlined"
                    disableElevation
                    onClick={handleGoogle}
                    disabled={loading}
                    startIcon={<Google sx={{ fontSize: 19 }} />}
                    className="bx-google-btn"
                  >
                    Đăng ký với Google
                  </Button>

                  <Typography className="bx-form-sub" sx={{ textAlign: "center" }}>
                    Đã có tài khoản?{" "}
                    <Link to="/login" className="bx-form-link">
                      Đăng nhập
                    </Link>
                  </Typography>
                </form>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}