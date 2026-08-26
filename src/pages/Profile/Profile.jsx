import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Person,
  Save,
  Email,
  CalendarMonth,
  Shield,
  CameraAlt,
  CheckCircle,
  Close,
  Visibility,
  VisibilityOff,
  Lock,
} from "@mui/icons-material";
import UserLayout from "../User/Layout/UserLayout.jsx";
import { useAuth } from "../../features/auth/AuthProvider.jsx";
import { updateProfile } from "../../api/auth.api";
import { changePassword, firebaseErrorMessage } from "../../lib/authService";

function formatDate(dateString) {
  if (!dateString) return "Chưa có";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Profile - Trang hồ sơ cá nhân
 * 
 * Tính năng:
 * - Hiển thị thông tin user (avatar, name, email, role, stats)
 * - Chỉnh sửa họ tên
 * - Đổi mật khẩu (với dialog xác thực)
 * 
 * Sử dụng UserLayout với header navigation
 */
export default function Profile() {
  const { user, refreshUser } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Change password state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
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
      await updateProfile({ fullName: fullName.trim() });
      await refreshUser();
      setProfileSuccess(true);
      setIsEditing(false);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err?.message || "Không thể cập nhật thông tin.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleOpenPasswordDialog = () => {
    setPasswordError("");
    setPasswordSuccess(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordDialogOpen(true);
  };

  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
    setPasswordError("");
    setPasswordSuccess(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (!currentPassword) {
      setPasswordError("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }
    if (!newPassword) {
      setPasswordError("Vui lòng nhập mật khẩu mới.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError("Mật khẩu mới phải khác mật khẩu hiện tại.");
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordSuccess(true);
      setTimeout(() => {
        handleClosePasswordDialog();
      }, 1500);
    } catch (err) {
      setPasswordError(firebaseErrorMessage(err, "Không thể đổi mật khẩu. Vui lòng thử lại."));
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

  const roleColors = {
    ADMIN: { bg: "rgba(239, 68, 68, 0.12)", color: "#f87171" },
    MODERATOR: { bg: "rgba(245, 158, 11, 0.12)", color: "#fbbf24" },
    USER: { bg: "rgba(99, 102, 241, 0.12)", color: "#818cf8" },
  };
  const roleStyle = roleColors[user?.role] || roleColors.USER;

  const roleLabels = {
    ADMIN: "Quản trị viên",
    MODERATOR: "Điều hành viên",
    USER: "Người dùng",
  };

  return (
    <UserLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          Hồ sơ cá nhân
        </Typography>
        <Typography sx={{ color: "var(--text-secondary)" }}>
          Quản lý thông tin tài khoản của bạn.
        </Typography>
      </Box>

      {/* Hero Section */}
      <Card
        sx={{
          mb: 4,
          borderRadius: "var(--radius-lg)",
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)",
          color: "white",
          position: "relative",
          overflow: "visible",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 3,
              flexWrap: "wrap",
            }}
          >
            {/* Avatar */}
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={user?.avatarUrl || undefined}
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: "2.5rem",
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                  border: "4px solid rgba(255,255,255,0.3)",
                  boxShadow: "0 8px 32px rgba(99, 102, 241, 0.4)",
                }}
              >
                {initials}
              </Avatar>
              <Box
                sx={{
                  position: "absolute",
                  bottom: 4,
                  right: 4,
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "3px solid #1e1b4b",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                  "&:hover": { transform: "scale(1.1)" },
                }}
              >
                <CameraAlt sx={{ fontSize: 18, color: "white" }} />
              </Box>
            </Box>

            {/* User Info */}
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {user?.fullName || "Người dùng"}
                </Typography>
                <Chip
                  label={roleLabels[user?.role] || "Người dùng"}
                  size="small"
                  sx={{
                    bgcolor: roleStyle.bg,
                    color: roleStyle.color,
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    height: 26,
                  }}
                />
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, opacity: 0.9 }}>
                <Email sx={{ fontSize: 16 }} />
                <Typography sx={{ fontSize: "0.95rem" }}>{user?.email}</Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, opacity: 0.9 }}>
                <CalendarMonth sx={{ fontSize: 16 }} />
                <Typography sx={{ fontSize: "0.95rem" }}>
                  Tham gia: {formatDate(user?.createdAt)}
                </Typography>
              </Box>
            </Box>

            {/* Stats */}
            <Box
              sx={{
                display: "flex",
                gap: 3,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <Typography sx={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1 }}>
                  {user?.stats?.documents || 0}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", opacity: 0.8 }}>Tài liệu</Typography>
              </Box>
              <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,0.2)" }} />
              <Box sx={{ textAlign: "center" }}>
                <Typography sx={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1 }}>
                  {user?.stats?.saved || 0}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", opacity: 0.8 }}>Đã lưu</Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card sx={{ borderRadius: "var(--radius-lg)", mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  bgcolor: "rgba(99, 102, 241, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Person sx={{ color: "primary.main", fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Thông tin cá nhân
                </Typography>
                <Typography sx={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  Cập nhật thông tin hồ sơ của bạn
                </Typography>
              </Box>
            </Box>
            {!isEditing && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => setIsEditing(true)}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Chỉnh sửa
              </Button>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box
            component="form"
            onSubmit={handleProfileSubmit}
            sx={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 3 }}
          >
            {profileError && (
              <Alert severity="error" className="bx-form-alert" sx={{ borderRadius: "var(--radius-sm)" }}>
                {profileError}
              </Alert>
            )}
            {profileSuccess && (
              <Alert
                severity="success"
                className="bx-form-alert"
                icon={<CheckCircle fontSize="inherit" />}
                sx={{ borderRadius: "var(--radius-sm)" }}
              >
                Cập nhật thông tin thành công!
              </Alert>
            )}

            <Box>
              <Typography sx={{ fontWeight: 600, mb: 1, fontSize: "0.9rem" }}>
                Họ và tên
              </Typography>
              <TextField
                fullWidth
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={profileLoading || !isEditing}
                placeholder="Nhập họ và tên của bạn"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "var(--radius-md)",
                  },
                }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 600, mb: 1, fontSize: "0.9rem" }}>
                Email
              </Typography>
              <TextField
                fullWidth
                type="email"
                value={email}
                disabled
                placeholder="Email của bạn"
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: "var(--text-secondary)", fontSize: 20 }} />,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "var(--radius-md)",
                  },
                  "& .Mui-disabled": {
                    bgcolor: "action.disabledBackground",
                  },
                }}
              />
              <Typography sx={{ fontSize: "0.8rem", color: "var(--text-secondary)", mt: 0.5 }}>
                Email không thể thay đổi.
              </Typography>
            </Box>

            {isEditing && (
              <Box sx={{ display: "flex", gap: 2, pt: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disableElevation
                  startIcon={profileLoading ? <CircularProgress size={16} color="inherit" /> : <Save />}
                  disabled={profileLoading}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  {profileLoading ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setIsEditing(false);
                    setFullName(user?.fullName || "");
                    setProfileError("");
                  }}
                  disabled={profileLoading}
                  sx={{ textTransform: "none", fontWeight: 600, px: 3, borderRadius: "var(--radius-md)" }}
                >
                  Hủy
                </Button>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Account Security Card */}
      <Card sx={{ borderRadius: "var(--radius-lg)" }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                bgcolor: "rgba(245, 158, 11, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Shield sx={{ color: "#f59e0b", fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Bảo mật tài khoản
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Quản lý mật khẩu và bảo mật
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                borderRadius: "var(--radius-md)",
                bgcolor: "action.hover",
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 600, mb: 0.25 }}>Mật khẩu</Typography>
                <Typography sx={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  Thay đổi mật khẩu của bạn
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={handleOpenPasswordDialog}
                startIcon={<Lock sx={{ fontSize: 16 }} />}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Đổi mật khẩu
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={!passwordLoading ? handleClosePasswordDialog : undefined}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "var(--radius-lg)",
            p: 1,
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "10px",
                background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Lock sx={{ color: "white", fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {passwordSuccess ? "Thành công!" : "Đổi mật khẩu"}
              </Typography>
              {!passwordSuccess && (
                <Typography sx={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  Cập nhật mật khẩu mới cho tài khoản
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton
            onClick={handleClosePasswordDialog}
            disabled={passwordLoading}
            size="small"
            sx={{ color: "var(--text-secondary)" }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          {passwordSuccess ? (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  bgcolor: "rgba(34, 197, 94, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2,
                }}
              >
                <CheckCircle sx={{ fontSize: 36, color: "#22c55e" }} />
              </Box>
              <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                Đổi mật khẩu thành công!
              </Typography>
              <Typography sx={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                Mật khẩu của bạn đã được cập nhật.
              </Typography>
            </Box>
          ) : (
            <Box
              component="form"
              onSubmit={handleChangePassword}
              sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}
            >
              {passwordError && (
                <Alert
                  severity="error"
                  sx={{ borderRadius: "var(--radius-md)", py: 0.5 }}
                >
                  {passwordError}
                </Alert>
              )}

              <Box>
                <Typography sx={{ fontWeight: 600, mb: 1, fontSize: "0.9rem" }}>
                  Mật khẩu hiện tại
                </Typography>
                <TextField
                  fullWidth
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={passwordLoading}
                  placeholder="Nhập mật khẩu hiện tại"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: "var(--text-secondary)", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          edge="end"
                          size="small"
                        >
                          {showCurrentPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "var(--radius-md)",
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography sx={{ fontWeight: 600, mb: 1, fontSize: "0.9rem" }}>
                  Mật khẩu mới
                </Typography>
                <TextField
                  fullWidth
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={passwordLoading}
                  placeholder="Ít nhất 6 ký tự"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: "var(--text-secondary)", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                          size="small"
                        >
                          {showNewPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "var(--radius-md)",
                    },
                  }}
                />
                <Typography sx={{ fontSize: "0.8rem", color: "var(--text-secondary)", mt: 0.5 }}>
                  Tối thiểu 6 ký tự
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ fontWeight: 600, mb: 1, fontSize: "0.9rem" }}>
                  Xác nhận mật khẩu mới
                </Typography>
                <TextField
                  fullWidth
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={passwordLoading}
                  placeholder="Nhập lại mật khẩu mới"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: "var(--text-secondary)", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "var(--radius-md)",
                    },
                  }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>

        {!passwordSuccess && (
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleClosePasswordDialog}
              disabled={passwordLoading}
              sx={{ textTransform: "none", fontWeight: 600, borderRadius: "var(--radius-md)", flex: 1 }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleChangePassword}
              disabled={passwordLoading}
              startIcon={passwordLoading ? <CircularProgress size={16} color="inherit" /> : <Lock />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "var(--radius-md)",
                flex: 1,
                background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)",
                },
              }}
            >
              {passwordLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </UserLayout>
  );
}
