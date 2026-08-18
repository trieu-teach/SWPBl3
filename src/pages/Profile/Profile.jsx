import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Avatar, Alert, CircularProgress, Card, CardContent, Divider, Chip } from "@mui/material";
import {
  Person,
  Save,
  Email,
  CalendarMonth,
  Shield,
  CameraAlt,
  CheckCircle,
} from "@mui/icons-material";
import UserLayout from "../User/Layout/UserLayout.jsx";
import { useAuth } from "../../features/auth/AuthProvider.jsx";
import { getProfile, updateProfile } from "../../api/auth.api";

function formatDate(dateString) {
  if (!dateString) return "Chưa có";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function Profile() {
  const { user, refreshUser } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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
              <Button variant="outlined" size="small" sx={{ textTransform: "none", fontWeight: 600 }}>
                Đổi mật khẩu
              </Button>
            </Box>

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
                <Typography sx={{ fontWeight: 600, mb: 0.25 }}>Xác thực hai yếu tố</Typography>
                <Typography sx={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  Bảo vệ tài khoản với 2FA
                </Typography>
              </Box>
              <Chip label="Chưa bật" size="small" sx={{ fontWeight: 600 }} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </UserLayout>
  );
}
