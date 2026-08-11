import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
  Tooltip,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  ArrowForward,
  Brightness4,
  Brightness7,
  Email,
  Lock,
  Google,
  VerifiedUser,
  AutoAwesome,
  Speed,
  Person,
} from "@mui/icons-material";
import { useAuth } from "../../../features/auth/AuthProvider.jsx";
import { getAuthenticatedHomeRoute } from "../../../lib/routes";
import { useColorMode } from "../../../App.jsx";
import "./Login.css";

const BRAND_FEATURES = [
  {
    icon: <AutoAwesome sx={{ fontSize: 16 }} />,
    color: "#818cf8",
    bg: "rgba(99,102,241,0.15)",
    text: "AI thông minh — hỏi đáp tài liệu bằng ngôn ngữ tự nhiên",
  },
  {
    icon: <VerifiedUser sx={{ fontSize: 16 }} />,
    color: "#34d399",
    bg: "rgba(52,211,153,0.15)",
    text: "Trích dẫn nguồn chính xác — mỗi câu trả lời đều có [1] [2]",
  },
  {
    icon: <Speed sx={{ fontSize: 16 }} />,
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.15)",
    text: "Xử lý nhanh — tài liệu 80 MB được đánh chỉ mục trong vài giây",
  },
];

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { mode, toggle } = useColorMode();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }
    setLoading(true);
    try {
      const user = await login({ email, password });
      const from = searchParams.get("from");
      navigate(from || getAuthenticatedHomeRoute(user?.role || "USER"), {
        replace: true,
      });
    } catch (err) {
      setError(
        err?.message ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    setError("Đăng nhập bằng Google sẽ sớm được hỗ trợ.");
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
          <Button
            component={Link}
            to="/register"
            className="bx-header-register-btn"
          >
            Đăng ký
          </Button>
        </Box>
      </Box>

      {/* ── MAIN LAYOUT ── */}
      <Box className="bx-layout">
        {/* LEFT — Branding */}
        <Box className="bx-panel-left">
          <Box className="bx-panel-dots" aria-hidden />
          <Box className="bx-panel-content">
            <Typography variant="h3" className="bx-panel-heading">
              Tài liệu thông minh,{" "}
              <em>trả lời tức thì.</em>
            </Typography>

            <Typography className="bx-panel-desc">
              DocuMind biến kho tài liệu phức tạp thành nguồn kiến thức có thể
              truy vấn ngay lập tức — trích dẫn nguồn rõ ràng, bằng tiếng Việt.
            </Typography>

            <Box component="ul" className="bx-features">
              {BRAND_FEATURES.map((f, i) => (
                <Box component="li" className="bx-feature-item" key={i}>
                  <Box
                    className="bx-feature-icon"
                    sx={{ background: f.bg, color: f.color }}
                  >
                    {f.icon}
                  </Box>
                  <Typography className="bx-feature-text">{f.text}</Typography>
                </Box>
              ))}
            </Box>

            <Box className="bx-panel-footer">
              <VerifiedUser sx={{ fontSize: 13, color: "#34d399" }} />
              Dữ liệu được mã hóa và bảo mật theo tiêu chuẩn enterprise.
            </Box>
          </Box>
        </Box>

        {/* RIGHT — Form */}
        <Box className="bx-panel-right">
          <Box className="bx-form-card">
            <Box className="bx-form-head">
              <Box className="bx-form-avatar">
                <Person fontSize="medium" />
              </Box>
              <Typography variant="h3" className="bx-form-title">
                Chào mừng trở lại
              </Typography>
              <Typography className="bx-form-sub">
                Đăng nhập để tiếp tục sử dụng DocuMind.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" className="bx-form-alert">
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="bx-form-stack">
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
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
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

              <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                <Link to="/forgot-password" className="bx-small-link">
                  Quên mật khẩu?
                </Link>
              </Box>

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
                {loading ? "Đang xử lý…" : "Đăng nhập"}
              </Button>

              <Typography className="bx-form-sub" sx={{ textAlign: "center" }}>
                Chưa có tài khoản?{" "}
                <Link to="/register" className="bx-form-link">
                  Đăng ký ngay
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
