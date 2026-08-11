import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Person,
  Lock,
  Visibility,
  VisibilityOff,
  Save,
  CheckCircle,
} from "@mui/icons-material";
import UserLayout from "../Layout/UserLayout.jsx";
import { useAuth } from "../../../features/auth/AuthProvider";
import { updateProfile, changePassword } from "../../../features/auth/auth.api";

export default function Profile() {
  const { user, refreshUser } = useAuth();

  // Tab state
  const [tab, setTab] = useState(0);

  // Profile fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess(false);
    if (!fullName.trim()) {
      setProfileError("Họ tên không được để trống.");
      return;
    }
    setProfileLoading(true);
    try {
      const updated = await updateProfile({ fullName: fullName.trim() });
      await refreshUser();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err?.message || "Không thể cập nhật thông tin.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);
    if (!currentPassword) {
      setPasswordError("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setPasswordLoading(true);
    try {
      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err) {
      setPasswordError(
        err?.message || "Không thể đổi mật khẩu. Vui lòng kiểm tra lại."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <UserLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          Hồ sơ cá nhân
        </Typography>
        <Typography sx={{ color: "var(--text-secondary)" }}>
          Quản lý thông tin tài khoản của bạn.
        </Typography>
      </Box>

      {/* Avatar banner */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 3,
          p: 2.5,
          borderRadius: "var(--radius-md)",
          background: "var(--bg-card)",
          border: "1px solid",
          borderColor: "var(--border-color)",
        }}
      >
        <Avatar
          sx={{
            width: 64,
            height: 64,
            fontSize: "1.5rem",
            fontWeight: 800,
            background: "var(--accent)",
            color: "#fff",
          }}
        >
          {initials}
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {user?.fullName || "Người dùng"}
          </Typography>
          <Typography sx={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            {user?.email}
          </Typography>
          <Typography
            sx={{
              display: "inline-block",
              mt: 0.5,
              px: 1,
              py: 0.2,
              borderRadius: "99px",
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              background:
                user?.role === "ADMIN"
                  ? "rgba(239, 68, 68, 0.15)"
                  : "rgba(99, 102, 241, 0.15)",
              color:
                user?.role === "ADMIN" ? "#f87171" : "#818cf8",
            }}
          >
            {user?.role === "ADMIN" ? "Quản trị viên" : "Người dùng"}
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Box
        sx={{
          borderBottom: "1px solid",
          borderColor: "var(--border-color)",
          mb: 3,
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              minHeight: 44,
              color: "var(--text-secondary)",
              "&.Mui-selected": {
                color: "var(--accent)",
              },
            },
            "& .MuiTabs-indicator": {
              background: "var(--accent)",
            },
          }}
        >
          <Tab icon={<Person sx={{ fontSize: 18 }} />} iconPosition="start" label="Thông tin cá nhân" />
          <Tab icon={<Lock sx={{ fontSize: 18 }} />} iconPosition="start" label="Đổi mật khẩu" />
        </Tabs>
      </Box>

      {/* Tab 0: Profile info */}
      {tab === 0 && (
        <Box
          component="form"
          onSubmit={handleProfileSubmit}
          sx={{
            maxWidth: 480,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {profileError && (
            <Alert severity="error" className="bx-form-alert">
              {profileError}
            </Alert>
          )}
          {profileSuccess && (
            <Alert severity="success" className="bx-form-alert">
              Cập nhật thông tin thành công!
            </Alert>
          )}

          <TextField
            label="Họ và tên"
            fullWidth
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={profileLoading}
          />

          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            disabled
            helperText="Email không thể thay đổi."
          />

          <Button
            type="submit"
            variant="contained"
            disableElevation
            startIcon={
              profileLoading ? (
                <CircularProgress size={16} sx={{ color: "#fff" }} />
              ) : (
                <Save />
              )
            }
            disabled={profileLoading}
            className="bx-submit-btn"
            sx={{ alignSelf: "flex-start", mt: 1 }}
          >
            Lưu thay đổi
          </Button>
        </Box>
      )}

      {/* Tab 1: Change password */}
      {tab === 1 && (
        <Box
          component="form"
          onSubmit={handlePasswordSubmit}
          sx={{
            maxWidth: 480,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {passwordError && (
            <Alert severity="error" className="bx-form-alert">
              {passwordError}
            </Alert>
          )}
          {passwordSuccess && (
            <Alert severity="success" className="bx-form-alert">
              Đổi mật khẩu thành công!
            </Alert>
          )}

          <TextField
            label="Mật khẩu hiện tại"
            type={showCurrent ? "text" : "password"}
            fullWidth
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            disabled={passwordLoading}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCurrent((s) => !s)}
                      edge="end"
                      size="small"
                    >
                      {showCurrent ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="Mật khẩu mới"
            type={showNew ? "text" : "password"}
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={passwordLoading}
            helperText="Ít nhất 8 ký tự."
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNew((s) => !s)}
                      edge="end"
                      size="small"
                    >
                      {showNew ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="Xác nhận mật khẩu mới"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={passwordLoading}
          />

          <Button
            type="submit"
            variant="contained"
            disableElevation
            startIcon={
              passwordLoading ? (
                <CircularProgress size={16} sx={{ color: "#fff" }} />
              ) : (
                <Lock />
              )
            }
            disabled={passwordLoading}
            className="bx-submit-btn"
            sx={{ alignSelf: "flex-start", mt: 1 }}
          >
            Đổi mật khẩu
          </Button>
        </Box>
      )}
    </UserLayout>
  );
}
