import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  LinearProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  ArrowForward,
  Person,
  Email,
  Lock,
  Google,
  CheckCircle,
  Cancel,
  VerifiedUser,
  Shield,
  RocketLaunch,
} from "@mui/icons-material";
import { useAuth } from "../../features/auth/AuthProvider.jsx";
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

function getPasswordChecks(pwd) {
  return [
    { label: "Ít nhất 8 ký tự", pass: pwd.length >= 8 },
    { label: "Có chữ hoa", pass: /[A-Z]/.test(pwd) },
    { label: "Có chữ thường", pass: /[a-z]/.test(pwd) },
    { label: "Có chữ số", pass: /[0-9]/.test(pwd) },
  ];
}

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const checks = useMemo(() => getPasswordChecks(password), [password]);
  const passedChecks = checks.filter((c) => c.pass).length;
  const passwordStrength = (passedChecks / checks.length) * 100;
  const strengthLabel =
    passedChecks <= 1
      ? "Yếu"
      : passedChecks === 2
        ? "Trung bình"
        : passedChecks === 3
          ? "Khá"
          : "Mạnh";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!fullName.trim()) {
      setError("Vui lòng nhập họ và tên.");
      return;
    }
    if (passedChecks < 3) {
      setError("Mật khẩu chưa đủ mạnh — hãy đáp ứng ít nhất 3 tiêu chí.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (!acceptedTerms) {
      setError("Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.");
      return;
    }
    setLoading(true);
    try {
      await register({
        fullName: fullName.trim(),
        email,
        password,
        confirmPassword,
        acceptedTerms,
      });
      setSuccess(true);
    } catch (err) {
      setError(err?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    setError("Đăng ký bằng Google sẽ sớm được hỗ trợ.");
  };

  /* ── Success state ── */
  if (success) {
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
            <Button component={Link} to="/login" className="bx-header-login-btn">
              Đăng nhập
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
                Sẵn sàng khám phá{" "}
                <em>kho tài liệu thông minh.</em>
              </Typography>
              <Typography className="bx-panel-desc">
                Cảm ơn bạn đã đăng ký. Kiểm tra email để kích hoạt tài khoản và bắt đầu trải nghiệm DocuMind ngay hôm nay.
              </Typography>
            </Box>
          </Box>

          <Box className="bx-panel-right">
            <Box className="bx-form-card" sx={{ textAlign: "center" }}>
              <Box className="bx-success-mark">
                <CheckCircle sx={{ fontSize: 34 }} />
              </Box>
              <Typography variant="h3" className="bx-form-title" sx={{ mt: 1 }}>
                Kiểm tra email
              </Typography>
              <Typography className="bx-success-desc">
                DocuMind đã gửi liên kết kích hoạt đến{" "}
                <strong>{email}</strong>. Tài khoản chỉ có thể đăng nhập sau khi
                bạn xác thực email.
              </Typography>
              <Button
                variant="contained"
                size="large"
                fullWidth
                disableElevation
                onClick={() => navigate("/login")}
                endIcon={<ArrowForward />}
                className="bx-submit-btn"
                sx={{ mt: 1 }}
              >
                Về trang đăng nhập
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

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
                placeholder="Mật khẩu (tối thiểu 8 ký tự)"
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

              {/* Password strength */}
              {password && (
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography className="bx-strength-label">
                      Độ mạnh: <strong>{strengthLabel}</strong>
                    </Typography>
                    <Typography className="bx-strength-count">
                      {passedChecks}/{checks.length}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={passwordStrength}
                    className={`bx-strength-bar bx-strength-${passedChecks}`}
                  />
                  <Stack spacing={0.5} mt={1}>
                    {checks.map((c) => (
                      <Stack
                        key={c.label}
                        direction="row"
                        spacing={0.75}
                        alignItems="center"
                        className={`bx-strength-row ${c.pass ? "is-pass" : ""}`}
                      >
                        {c.pass ? (
                          <CheckCircle sx={{ fontSize: 13 }} />
                        ) : (
                          <Cancel sx={{ fontSize: 13 }} />
                        )}
                        <span>{c.label}</span>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              )}

              <TextField
                type={showPassword ? "text" : "password"}
                fullWidth
                placeholder="Xác nhận mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                disabled={loading}
                error={Boolean(confirmPassword) && password !== confirmPassword}
                helperText={
                  Boolean(confirmPassword) && password !== confirmPassword
                    ? "Mật khẩu không khớp"
                    : " "
                }
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock className="bx-input-icon" />
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
                endIcon={
                  loading ? (
                    <CircularProgress size={18} sx={{ color: "#fff" }} />
                  ) : (
                    <ArrowForward />
                  )
                }
                disabled={loading}
                className="bx-submit-btn"
              >
                {loading ? "Đang tạo tài khoản…" : "Tạo tài khoản"}
              </Button>

              <Typography className="bx-form-sub" sx={{ textAlign: "center" }}>
                Đã có tài khoản?{" "}
                <Link to="/login" className="bx-form-link">
                  Đăng nhập
                </Link>
              </Typography>
            </form>

            <Box className="bx-divider">
              <span>hoặc</span>
            </Box>

            <Button
              fullWidth
              size="large"
              variant="outlined"
              disableElevation
              onClick={handleGoogle}
              startIcon={<Google sx={{ fontSize: 19 }} />}
              className="bx-google-btn"
            >
              Tiếp tục với Google
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
