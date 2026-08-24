import AssessmentOutlined from "@mui/icons-material/AssessmentOutlined";
import BookmarkOutlined from "@mui/icons-material/BookmarkOutlined";
import DashboardOutlined from "@mui/icons-material/DashboardOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import FolderOpenOutlined from "@mui/icons-material/FolderOpenOutlined";
import HistoryOutlined from "@mui/icons-material/HistoryOutlined";
import GavelOutlined from "@mui/icons-material/GavelOutlined";
import LocalOfferOutlined from "@mui/icons-material/LocalOfferOutlined";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import ReportProblemOutlined from "@mui/icons-material/ReportProblemOutlined";
import ShoppingCartOutlined from "@mui/icons-material/ShoppingCartOutlined";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import UploadFileOutlined from "@mui/icons-material/UploadFileOutlined";

export const DRAWER_WIDTH = 280;
export const COLLAPSED_DRAWER_WIDTH = 88;
export const APP_HEADER_HEIGHT = 84;

const USER_NAVIGATION = [
  { label: "Thư viện", path: "/documents", icon: FolderOpenOutlined },
  {
    label: "Tải tài liệu",
    path: "/documents/upload",
    icon: UploadFileOutlined,
  },
  { label: "Khiếu nại", path: "/appeals", icon: GavelOutlined },
  { label: "Đã lưu", path: "/saved-documents", icon: BookmarkOutlined },
  { label: "Cộng đồng", path: "/community", icon: PeopleAltOutlined },
  {
    label: "Hỏi AI",
    eyebrow: "TRỢ LÝ HỌC TẬP",
    path: "/hoi-ai",
    icon: SmartToyOutlined,
    highlight: "ai",
  },
  {
    label: "Mua gói",
    eyebrow: "NÂNG CẤP",
    path: "/subscription",
    icon: ShoppingCartOutlined,
    highlight: "subscription",
  },
];

const ADMIN_NAVIGATION = [
  { label: "Tổng quan", path: "/admin/dashboard", icon: DashboardOutlined },
  { label: "Người dùng", path: "/admin/users", icon: PeopleAltOutlined },
  { label: "Tài liệu", path: "/admin/documents", icon: DescriptionOutlined },
  {
    label: "Gói dịch vụ",
    path: "/admin/subscription-plans",
    icon: LocalOfferOutlined,
  },
  {
    label: "Đăng ký gói",
    path: "/admin/subscriptions",
    icon: ShoppingCartOutlined,
  },
  {
    label: "Nhật ký kiểm tra",
    path: "/admin/audit-logs",
    icon: HistoryOutlined,
  },
  {
    label: "Nhật ký tải xuống",
    path: "/admin/download-logs",
    icon: DownloadOutlined,
  },
  { label: "Báo cáo", path: "/admin/reports", icon: AssessmentOutlined },
  {
    label: "Báo cáo vi phạm",
    path: "/admin/violation-reports",
    icon: ReportProblemOutlined,
  },
];

const MODERATOR_NAVIGATION = [
  {
    label: "Hàng chờ tài liệu",
    path: "/moderator/moderation",
    icon: FactCheckOutlined,
  },
  {
    label: "Khiếu nại",
    path: "/moderator/appeals",
    icon: GavelOutlined,
  },
  {
    label: "Báo cáo vi phạm",
    path: "/moderator/reports",
    icon: ReportProblemOutlined,
  },
];

const ROLE_CONFIG = {
  ADMIN: {
    accent: "#f97316",
    homePath: "/admin/dashboard",
    workspaceLabel: "Hệ thống quản trị",
    navigationLabel: "Quản trị",
    navigation: ADMIN_NAVIGATION,
  },
  MODERATOR: {
    accent: "#d97706",
    homePath: "/moderator/reports",
    workspaceLabel: "Không gian kiểm duyệt",
    navigationLabel: "Kiểm duyệt",
    navigation: MODERATOR_NAVIGATION,
  },
  USER: {
    accent: "#6366f1",
    homePath: "/documents",
    workspaceLabel: "Không gian học tập",
    navigationLabel: "Chính",
    navigation: USER_NAVIGATION,
  },
};

export function getRoleConfig(role) {
  return ROLE_CONFIG[role] || ROLE_CONFIG.USER;
}

export function isActivePath(currentPath, itemPath) {
  if (["/dashboard", "/admin/dashboard"].includes(itemPath)) {
    return currentPath === itemPath;
  }

  if (itemPath === "/documents") {
    const isUploadPath =
      currentPath === "/documents/upload" ||
      currentPath.startsWith("/documents/upload/");

    return (
      currentPath === "/documents" ||
      (currentPath.startsWith("/documents/") && !isUploadPath)
    );
  }

  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}
