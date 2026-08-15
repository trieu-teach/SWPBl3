import {
  Bolt,
  ChatBubble,
  CloudUpload,
  Groups,
  Lightbulb,
  Lock,
  MenuBook,
  Psychology,
  School,
  Search,
  SmartToy,
  Terminal,
  TravelExplore,
} from "@mui/icons-material";

export const navItems = [
  { id: "workflow", label: "Cách hoạt động" },
  { id: "usecases", label: "Tình huống" },
  { id: "features", label: "Tính năng" },
  { id: "pricing", label: "Gói" },
  { id: "faq", label: "Hỏi đáp" },
];

export const workflow = [
  {
    Icon: CloudUpload,
    title: "1. Tải tài liệu",
    desc: "PDF, DOCX, PPTX, XLSX — kéo thả hoặc chọn tệp. Tối đa 80 MB mỗi tệp.",
    accent: "#6366f1",
  },
  {
    Icon: TravelExplore,
    title: "2. AI lập chỉ mục",
    desc: "AI đọc, tách đoạn, gắn embedding ngữ nghĩa — sẵn sàng để hỏi đáp.",
    accent: "#d97706",
  },
  {
    Icon: ChatBubble,
    title: "3. Hỏi & có nguồn",
    desc: "Đặt câu hỏi tự nhiên. Mỗi câu trả lời đều kèm citation [1] [2] dẫn về đoạn gốc.",
    accent: "#10b981",
  },
];

export const useCases = [
  {
    Icon: School,
    tag: "Sinh viên",
    title: "Ôn thi cuối kỳ nhanh gấp 3 lần",
    desc: "Hỏi AI trên slide bài giảng, giáo trình — nhận đúng trang có câu trả lời thay vì lật từng trang.",
  },
  {
    Icon: Psychology,
    tag: "Nghiên cứu sinh",
    title: "Đọc nhanh 30 bài báo một tuần",
    desc: "Tóm tắt nhiều paper cùng lúc, so sánh phương pháp luận, trích đoạn citation chính xác.",
  },
  {
    Icon: Terminal,
    tag: "Lập trình viên",
    title: "Tìm trong tài liệu kỹ thuật bằng tiếng Việt",
    desc: "Hỏi bằng tiếng Việt trên kho tài liệu tiếng Anh — AI dịch ngữ cảnh và trả lời đúng đoạn.",
  },
  {
    Icon: Lightbulb,
    tag: "Giảng viên",
    title: "Chuẩn bị bài giảng từ nhiều nguồn",
    desc: "Kết hợp giáo trình, paper, video transcript — AI tổng hợp thành outline có trích dẫn.",
  },
];

export const features = [
  {
    Icon: SmartToy,
    title: "AI có trích dẫn [1] [2]",
    desc: "Không đoán — mỗi đoạn đều có nguồn, click là mở đoạn gốc.",
    tone: "primary",
  },
  {
    Icon: Search,
    title: "Tìm kiếm ngữ nghĩa",
    desc: "AI hiểu ý đồ câu hỏi, không chỉ khớp từ khóa khô khan.",
    tone: "amber",
  },
  {
    Icon: MenuBook,
    title: "Thư viện có tổ chức",
    desc: "Phân loại theo môn học, danh mục và thẻ tùy ý. Tìm lại dễ dàng.",
    tone: "violet",
  },
  {
    Icon: Groups,
    title: "Cộng đồng công khai",
    desc: "Khám phá tài liệu từ sinh viên khác — lưu về thư viện cá nhân.",
    tone: "green",
  },
  {
    Icon: Lock,
    title: "Bảo mật theo vai trò",
    desc: "Riêng tư mặc định. Bạn quyết định khi nào công khai.",
    tone: "blue",
  },
  {
    Icon: Bolt,
    title: "Phản hồi theo thời gian thực",
    desc: "Streaming từng dòng — nhìn thấy AI đang đọc và tổng hợp.",
    tone: "rose",
  },
];

export const proofStats = [
  { value: "2.4k+", label: "Tài liệu đã lập chỉ mục" },
  { value: "120k+", label: "Câu hỏi đã trả lời" },
  { value: "98%", label: "Câu trả lời có trích dẫn" },
  { value: "4.9/5", label: "Đánh giá từ sinh viên" },
];

export const proofSources = [
  "[1] Skinner — Conditioning & Reinforcement, Ch. 4",
  "[2] Bandura — Social Learning Theory, p. 87",
];

export const securityItems = [
  "Tài liệu riêng tư mặc định — bạn quyết định công khai",
  "Firebase Auth — token bảo mật cho mỗi request",
  "Phân quyền theo vai trò (USER / ADMIN)",
  "Quản trị viên có thể ẩn tài liệu vi phạm",
];

export const testimonials = [
  {
    name: "Mai Anh",
    role: "SV năm 3 · ĐH KHTN",
    avatar: "MA",
    color: "linear-gradient(135deg, #ec4899, #f59e0b)",
    quote:
      "Trước đây ôn thi cuối kỳ mình đọc lại cả chục slide. Giờ chỉ cần hỏi AI — nó trả đúng trang có câu trả lời.",
  },
  {
    name: "Tuấn Khải",
    role: "SV năm 4 · ĐH Bách Khoa",
    avatar: "TK",
    color: "linear-gradient(135deg, #6366f1, #06b6d4)",
    quote:
      "Mình upload cả giáo trình tiếng Anh, hỏi bằng tiếng Việt — AI trả lời đúng nghĩa kèm nguyên văn tiếng Anh.",
  },
  {
    name: "Hà Linh",
    role: "Nghiên cứu sinh · ĐH Y Hà Nội",
    avatar: "HL",
    color: "linear-gradient(135deg, #10b981, #6366f1)",
    quote:
      "Đọc 30 paper một tuần không còn là ác mộng. Tóm tắt có citation giúp mình đối chiếu ngay được.",
  },
];

export const faqs = [
  {
    q: "DocuMind phù hợp với ai?",
    a: "Sinh viên, học sinh, nghiên cứu sinh, giảng viên — bất kỳ ai cần đọc nhiều tài liệu và muốn AI trả lời có nguồn trích dẫn rõ ràng.",
  },
  {
    q: "Câu trả lời AI có đáng tin không?",
    a: "Mỗi đoạn đều kèm citation [1], [2]… — click là mở đoạn gốc. Nếu AI không tìm thấy trong tài liệu, nó sẽ nói thẳng là không có.",
  },
  {
    q: "Dữ liệu của tôi có an toàn không?",
    a: "Tài liệu mặc định ở chế độ riêng tư, xác thực qua Firebase Auth, mọi request đều có token bảo mật. Bạn xóa là sạch hoàn toàn.",
  },
  {
    q: "Có cần cài đặt phần mềm không?",
    a: "Không. DocuMind chạy hoàn toàn trên trình duyệt — máy tính, tablet, điện thoại đều dùng được, dữ liệu đồng bộ tức thì.",
  },
  {
    q: "Tôi có thể dùng thử gói Student không?",
    a: "Có. Mỗi tài khoản mới được 7 ngày dùng thử Student miễn phí — không cần thẻ tín dụng, hủy bất kỳ lúc nào.",
  },
];
