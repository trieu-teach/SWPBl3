import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  ArrowForward,
  Google,
  VerifiedUser,
  AutoAwesome,
  Speed,
  Email,
  Lock,
  Person,
} from "@mui/icons-material";
import { useAuth } from "../../features/auth/AuthProvider.jsx";
import { useToast } from "../../components/Toast/ToastProvider.jsx";
import { getAuthenticatedHomeRoute } from "../../lib/routes";
import { firebaseErrorMessage } from "../../lib/authService";
import Logo from "../../components/Logo/Logo.jsx";
import Header from "../../components/Header/Header.jsx";
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
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const { signIn, signInGoogle, refreshUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      const message = "Vui lòng nhập email và mật khẩu.";
      setError(message);
      toast.warning(message);
      return;
    }
    setLoading(true);
    try {
      const data = await signIn({ email, password });
      const refreshed = await refreshUser();
      const from = searchParams.get("from");
      toast.success("Đăng nhập thành công.");
      navigate(
        from ||
          getAuthenticatedHomeRoute(refreshed?.role || data?.role || "USER"),
        { replace: true },
      );
    } catch (err) {
      const message = firebaseErrorMessage(
        err,
        "Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.",
      );
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await signInGoogle({});
      const refreshed = await refreshUser();
      const from = searchParams.get("from");
      toast.success("Đăng nhập bằng Google thành công.");
      navigate(
        from ||
          getAuthenticatedHomeRoute(refreshed?.role || data?.role || "USER"),
        { replace: true },
      );
    } catch (err) {
      const message = firebaseErrorMessage(err, "Đăng nhập Google thất bại.");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="bx-auth">
      <Header />

      <Box className="bx-layout">
        <Box className="bx-panel-left">
          <Box className="bx-panel-dots" aria-hidden />
          <Box className="bx-panel-content">
            <Logo size={48} variant="authPanel" />

            <Typography variant="h3" className="bx-panel-heading">
              Tài liệu thông minh, <em>trả lời tức thì.</em>
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
                Tiếp tục với Google
              </Button>

              <Typography className="bx-form-sub" sx={{ textAlign: "center" }}>
                Chưa có tài khoản?{" "}
                <Link to="/register" className="bx-form-link">
                  Đăng ký ngay
                </Link>
              </Typography>
            </form>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
