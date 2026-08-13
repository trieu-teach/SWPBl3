import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  AppBar,
  Toolbar,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  AutoAwesome,
  ArrowForward,
  Menu as MenuIcon,
  Close,
  CloudUpload,
  TravelExplore,
  ChatBubble,
  MenuBook,
  Search,
  Groups,
  Shield,
  KeyboardArrowDown,
  CheckCircle,
  SmartToy,
  Bolt,
  Lock,
  Star,
  Lightbulb,
  Psychology,
  School,
  Terminal,
  RocketLaunch,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import ColorModeToggle from "../../components/ColorModeToggle/ColorModeToggle.jsx";
import Logo from "../../components/Logo/Logo.jsx";
import "./Homepage.css";

/* ------------------------------------------------------------------ */
/*  Data
/* ------------------------------------------------------------------ */
const navItems = [
  { id: "workflow", label: "Cách hoạt động" },
  { id: "usecases", label: "Tình huống" },
  { id: "features", label: "Tính năng" },
  { id: "pricing", label: "Gói" },
  { id: "faq", label: "Hỏi đáp" },
];

const workflow = [
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

const useCases = [
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

const features = [
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

const proofStats = [
  { value: "2.4k+", label: "Tài liệu đã lập chỉ mục" },
  { value: "120k+", label: "Câu hỏi đã trả lời" },
  { value: "98%", label: "Câu trả lời có trích dẫn" },
  { value: "4.9/5", label: "Đánh giá từ sinh viên" },
];

const proofSources = [
  "[1] Skinner — Conditioning & Reinforcement, Ch. 4",
  "[2] Bandura — Social Learning Theory, p. 87",
];

const testimonials = [
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

const plans = [
  {
    name: "Free",
    price: "0",
    period: "mãi mãi",
    highlight: false,
    features: [
      "100 MB dung lượng",
      "20 câu hỏi AI / tháng",
      "Trích dẫn [1] [2]",
      "Cộng đồng công khai",
    ],
    cta: "Bắt đầu miễn phí",
  },
  {
    name: "Student",
    price: "49.000",
    period: "đ / tháng",
    highlight: true,
    badge: "Phổ biến nhất",
    features: [
      "2 GB dung lượng",
      "Câu hỏi AI không giới hạn",
      "Hỏi trên nhiều tài liệu cùng lúc",
      "Xuất PDF có citation",
      "Hỗ trợ ưu tiên 24h",
    ],
    cta: "Nâng cấp Student",
  },
  {
    name: "Pro",
    price: "149.000",
    period: "đ / tháng",
    highlight: false,
    features: [
      "20 GB dung lượng",
      "Mọi tính năng của Student",
      "API & webhook",
      "SLA 99.9% · hỗ trợ 1h",
      "Phân tích nâng cao",
    ],
    cta: "Dùng thử Pro",
  },
];

const faqs = [
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

/* ------------------------------------------------------------------ */
/*  Page
/* ------------------------------------------------------------------ */
export default function Homepage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [openFaq, setOpenFaq] = useState(0);
  const [billing, setBilling] = useState("monthly");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const scrollPos = window.scrollY + 140;
      let current = "";
      for (const item of navItems) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            current = item.id;
            break;
          }
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const priceFor = useMemo(
    () => (p) =>
      billing === "yearly" && p.price !== "0"
        ? Math.round(
            (parseInt(p.price.replace(/\./g, ""), 10) * 12 * 0.8) / 12
          ).toLocaleString("vi-VN")
        : p.price,
    [billing]
  );

  return (
    <Box className="homepage">
      {/* ============================ HEADER ============================ */}
      <AppBar
        position="sticky"
        elevation={0}
        className={`homepage-header ${scrolled ? "is-scrolled" : ""}`}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters className="header-toolbar">
            <Link to="/" className="brand">
              <Logo size={36} variant="header" />
            </Link>

            <Box className="desktop-nav" sx={{ display: "flex" }}>
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`nav-link ${activeSection === item.id ? "active" : ""}`}
                >
                  {item.label}
                </a>
              ))}
            </Box>

            <Box className="header-actions" sx={{ display: "flex" }}>
              <Button
                variant="text"
                color="inherit"
                onClick={() => navigate("/login")}
                className="login-btn"
              >
                Đăng nhập
              </Button>
              <ColorModeToggle />
              <Button
                variant="contained"
                disableElevation
                onClick={() => navigate("/login")}
                endIcon={<ArrowForward />}
                className="cta-btn"
              >
                Bắt đầu miễn phí
              </Button>
              <IconButton
                onClick={() => setMobileOpen(true)}
                className="menu-btn"
                aria-label="Mở menu"
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { width: 280 } }}
      >
        <Box p={2}>
          <Box className="row-between" sx={{ display: "flex", mb: 2 }}>
            <Typography fontWeight={700}>Menu</Typography>
            <IconButton onClick={() => setMobileOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          <List>
            {navItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  component="a"
                  href={`#${item.id}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Box className="col-gap" sx={{ display: "flex", flexDirection: "column" }}>
            <Button variant="outlined" fullWidth onClick={() => navigate("/login")}>
              Đăng nhập
            </Button>
            <Button variant="contained" fullWidth onClick={() => navigate("/login")}>
              Bắt đầu miễn phí
            </Button>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <ColorModeToggle />
            </Box>
          </Box>
        </Box>
      </Drawer>

      {/* ============================ HERO ============================ */}
      <Box component="section" className="hero" id="hero">
        <Container maxWidth="lg">
          <Box className="hero-grid">
            <Box className="hero-grid__copy">
              <Typography variant="h1" className="hero-title">
                Trợ lý AI cho{" "}
                <span className="gradient-text">toàn bộ thư viện</span>{" "}
                học tập của bạn.
              </Typography>
              <Typography className="hero-lede">
                Upload tài liệu, hỏi bằng tiếng Việt, nhận câu trả lời kèm
                citation dẫn về đúng trang. Không đoán mò — bạn kiểm chứng
                được ngay.
              </Typography>
              <Box className="hero-ctas">
                <Button
                  size="large"
                  variant="contained"
                  disableElevation
                  endIcon={<ArrowForward />}
                  onClick={() => navigate("/login")}
                  className="primary-cta"
                >
                  Tạo tài khoản miễn phí
                </Button>
                <Button
                  size="large"
                  variant="outlined"
                  onClick={() => navigate("/login")}
                  className="secondary-cta"
                >
                  Đã có tài khoản
                </Button>
              </Box>
            </Box>

            <Box className="hero-grid__preview">
              <Card className="hero-preview" elevation={0}>
                <Box className="preview-kicker">
                  <Box className="preview-kicker__left">
                    <Box className="dot-live" />
                    <Typography variant="caption" className="preview-kicker-text">
                      DOCUMIND · SOURCE VIEW
                    </Typography>
                  </Box>
                  <Chip label="AI READY" size="small" className="ai-chip" />
                </Box>

                <Box className="preview-filebar">
                  <Box className="file-icon">
                    <MenuBook sx={{ color: "#fff" }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography className="file-title" component="div">
                      Skinner — Conditioning.pdf
                    </Typography>
                    <Typography className="file-meta" component="div">
                      Psychology 101 · 24 trang
                    </Typography>
                  </Box>
                  <Box className="more-dots">•••</Box>
                </Box>

                <Box className="preview-chat">
                  <Box className="bubble user">
                    Các bước lập luận của Skinner là gì?
                  </Box>
                  <Box className="bubble ai">
                    <Box className="chat-row">
                      <Box className="ai-mark">
                        <AutoAwesome sx={{ fontSize: 14, color: "#fff" }} />
                      </Box>
                      <Box>
                        <Typography className="ai-text" component="div">
                          Skinner mô tả ba bước lập luận chính: kích thích,
                          phản hồi và củng cố{" "}
                          <span className="citation">[1]</span>. Mô hình này
                          giải thích cách hành vi được hình thành qua điều
                          kiện hóa{" "}
                          <span className="citation">[2]</span>.
                        </Typography>
                        <Box className="sources-block">
                          <Typography variant="caption" className="sources-title" component="div">
                            NGUỒN THAM KHẢO
                          </Typography>
                          {proofSources.map((src) => (
                            <Box key={src} className="source-line">
                              <Box className="source-dot" component="span" />
                              <Typography variant="body2" component="span">
                                {src}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <Box className="preview-input">
                  <Typography variant="body2" className="preview-input-text" component="div">
                    Đặt câu hỏi tiếp theo…
                  </Typography>
                  <Box className="preview-send">
                    <ArrowForward sx={{ fontSize: 18, color: "#fff" }} />
                  </Box>
                </Box>
              </Card>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ============================ WORKFLOW ============================ */}
      <Box component="section" className="workflow section-pad" id="workflow">
        <Container maxWidth="lg">
          <Box className="section-head">
            <Chip label="CÁCH HOẠT ĐỘNG" size="small" className="eyebrow-chip" />
            <Typography variant="h2" className="section-title">
              Ba bước. Không cần đọc hướng dẫn.
            </Typography>
            <Typography className="section-sub">
              Upload tài liệu, để AI đọc và lập chỉ mục, sau đó hỏi bất kỳ
              điều gì. Câu trả lời luôn có nguồn — bạn click là tới đoạn gốc.
            </Typography>
          </Box>

          <Box className="three-grid">
            {workflow.map((step, i) => (
              <Card className="workflow-card" elevation={0} key={step.title}>
                <CardContent>
                  <Box
                    className="workflow-icon"
                    sx={{
                      background: `linear-gradient(135deg, ${step.accent} 0%, #0b1020 100%)`,
                    }}
                  >
                    <step.Icon sx={{ color: "#fff" }} />
                  </Box>
                  <Typography className="workflow-step-no" component="div">
                    BƯỚC {String(i + 1).padStart(2, "0")}
                  </Typography>
                  <Typography className="workflow-title" component="div">
                    {step.title}
                  </Typography>
                  <Typography className="workflow-desc" component="div">
                    {step.desc}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ============================ TÌNH HUỐNG ============================ */}
      <Box component="section" className="usecases section-pad" id="usecases">
        <Container maxWidth="lg">
          <Box className="section-head">
            <Chip label="TÌNH HUỐNG" size="small" className="eyebrow-chip" />
            <Typography variant="h2" className="section-title">
              Một trợ lý — bốn cách dùng khác nhau
            </Typography>
            <Typography className="section-sub">
              Không phải mọi người cần cùng một thứ. DocuMind thích nghi theo
              mục tiêu học tập của bạn.
            </Typography>
          </Box>

          <Box className="four-grid">
            {useCases.map((uc) => (
              <Card className="usecase-card" elevation={0} key={uc.title}>
                <CardContent>
                  <Box className="usecase-icon">
                    <uc.Icon />
                  </Box>
                  <Chip
                    label={uc.tag.toUpperCase()}
                    size="small"
                    className="usecase-tag"
                  />
                  <Typography className="usecase-title" component="div">
                    {uc.title}
                  </Typography>
                  <Typography className="usecase-desc" component="div">
                    {uc.desc}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ============================ FEATURES BENTO ============================ */}
      <Box component="section" className="features section-pad" id="features">
        <Container maxWidth="lg">
          <Box className="section-head">
            <Chip label="TÍNH NĂNG" size="small" className="eyebrow-chip" />
            <Typography variant="h2" className="section-title">
              Mọi thứ bạn cần để học sâu hơn
            </Typography>
            <Typography className="section-sub">
              Thư viện có tổ chức, AI có trích dẫn, cộng đồng chia sẻ — tất cả
              trong một không gian duy nhất.
            </Typography>
          </Box>

          <Box className="bento-grid">
            {features.map((f) => (
              <Card
                key={f.title}
                className={`bento-feature bento-feature--${f.tone}`}
                elevation={0}
              >
                <CardContent>
                  <Box className={`bento-mark bento-mark--${f.tone}`}>
                    <f.Icon />
                  </Box>
                  <Typography className="bento-feature-title" component="div">
                    {f.title}
                  </Typography>
                  <Typography className="bento-feature-desc" component="div">
                    {f.desc}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ============================ PROOF / NUMBERS ============================ */}
      <Box component="section" className="proof section-pad" id="proof">
        <Container maxWidth="lg">
          <Card className="proof-card" elevation={0}>
            <Box className="proof-grid">
              <Box className="proof-grid__copy">
                <Chip
                  label="TRẢI NGHIỆM THỰC"
                  size="small"
                  className="eyebrow-chip amber"
                />
                <Typography variant="h3" className="proof-title" sx={{ mt: 2 }} component="div">
                  Học nhanh hơn. Tin được. Kiểm chứng được.
                </Typography>
                <Typography className="proof-desc" sx={{ mt: 2 }} component="div">
                  DocuMind không đưa ra câu trả lời "chung chung" — nó đọc tài
                  liệu của bạn rồi trả lời đúng trang. Bạn có thể mở citation
                  bất kỳ lúc nào để đối chiếu.
                </Typography>
                <Box className="proof-grid__actions">
                  <Button
                    variant="contained"
                    disableElevation
                    onClick={() => navigate("/login")}
                    endIcon={<ArrowForward />}
                    className="primary-cta"
                  >
                    Trải nghiệm ngay
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/login")}
                    className="secondary-cta"
                  >
                    Đăng nhập
                  </Button>
                </Box>
              </Box>
              <Box className="proof-grid__stats">
                {proofStats.map((s) => (
                  <Box className="stat-tile" key={s.label}>
                    <Typography className="stat-value" component="div">{s.value}</Typography>
                    <Typography className="stat-label" component="div">{s.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Card>
        </Container>
      </Box>

      {/* ============================ SECURITY ============================ */}
      <Box component="section" className="security section-pad">
        <Container maxWidth="lg">
          <Box className="security-grid">
            <Box className="security-grid__copy">
              <Chip label="BẢO MẬT" size="small" className="eyebrow-chip amber" />
              <Typography variant="h2" className="section-title">
                Dữ liệu của bạn — bạn kiểm soát.
              </Typography>
              <Typography className="section-sub">
                Riêng tư mặc định. Bạn chọn công khai khi sẵn sàng. Quản trị
                viên có thể ẩn tài liệu vi phạm quy chế.
              </Typography>
            </Box>
            <Box className="security-grid__list">
              <Card className="security-card" elevation={0}>
                <CardContent>
                  {[
                    "Tài liệu riêng tư mặc định — bạn quyết định công khai",
                    "Firebase Auth — token bảo mật cho mỗi request",
                    "Phân quyền theo vai trò (USER / ADMIN)",
                    "Quản trị viên có thể ẩn tài liệu vi phạm",
                  ].map((line) => (
                    <Box key={line} className="security-line">
                      <Box className="check-circle">
                        <CheckCircle sx={{ fontSize: 16, color: "var(--green)" }} />
                      </Box>
                      <Typography className="security-line-text" component="div">{line}</Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ============================ PRICING ============================ */}
      <Box component="section" className="pricing section-pad" id="pricing">
        <Container maxWidth="lg">
          <Box className="section-head section-head--center">
            <Chip label="BẢNG GIÁ" size="small" className="eyebrow-chip" />
            <Typography variant="h2" className="section-title">
              Chọn gói phù hợp với bạn
            </Typography>
            <Typography className="section-sub">
              Bắt đầu miễn phí. Nâng cấp bất kỳ lúc nào — không cần thẻ tín
              dụng cho 7 ngày đầu.
            </Typography>

            <Box className="billing-toggle">
              <FormControlLabel
                control={
                  <Switch
                    checked={billing === "yearly"}
                    onChange={(e) =>
                      setBilling(e.target.checked ? "yearly" : "monthly")
                    }
                  />
                }
                label={
                  <Box className="billing-toggle__label">
                    <Typography variant="body2" component="span">
                      Thanh toán theo năm
                    </Typography>
                    <Chip label="-20%" size="small" className="save-chip" />
                  </Box>
                }
              />
            </Box>
          </Box>

          <Box className="three-grid">
            {plans.map((p) => (
              <Card
                className={`plan-card ${p.highlight ? "is-highlight" : ""}`}
                elevation={0}
                key={p.name}
              >
                <CardContent>
                  {p.badge && (
                    <Chip label={p.badge} size="small" className="plan-badge" />
                  )}
                  <Typography className="plan-name" component="div">{p.name}</Typography>
                  <Box className="plan-price-row">
                    <Typography className="plan-price" component="span">
                      {priceFor(p)}
                    </Typography>
                    <Typography className="plan-period" component="span">{p.period}</Typography>
                  </Box>
                  <Divider sx={{ my: 2.5, borderColor: "var(--line)" }} />
                  <Box className="plan-features">
                    {p.features.map((f) => (
                      <Box key={f} className="plan-feat">
                        <CheckCircle sx={{ fontSize: 16, color: "var(--green)" }} />
                        <Typography variant="body2" className="plan-feat-text">{f}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Button
                    fullWidth
                    variant={p.highlight ? "contained" : "outlined"}
                    disableElevation={p.highlight}
                    className={p.highlight ? "primary-cta plan-cta" : "secondary-cta plan-cta"}
                    onClick={() => navigate("/login")}
                  >
                    {p.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ============================ TESTIMONIALS ============================ */}
      <Box component="section" className="testimonials section-pad">
        <Container maxWidth="lg">
          <Box className="section-head section-head--center">
            <Chip label="ĐÁNH GIÁ" size="small" className="eyebrow-chip amber" />
            <Typography variant="h2" className="section-title">
              Sinh viên nói gì về DocuMind?
            </Typography>
          </Box>

          <Box className="three-grid">
            {testimonials.map((t) => (
              <Card className="testimonial-card" elevation={0} key={t.name}>
                <CardContent>
                  <Box className="testimonial-stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} sx={{ color: "#f59e0b", fontSize: 18 }} />
                    ))}
                  </Box>
                  <Typography className="testimonial-quote" component="div">
                    "{t.quote}"
                  </Typography>
                  <Box className="testimonial-author">
                    <Avatar sx={{ background: t.color, fontWeight: 700 }}>
                      {t.avatar}
                    </Avatar>
                    <Box>
                      <Typography className="testimonial-name" component="div">{t.name}</Typography>
                      <Typography variant="caption" className="testimonial-role" component="div">
                        {t.role}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ============================ FAQ ============================ */}
      <Box component="section" className="faq section-pad" id="faq">
        <Container maxWidth="lg">
          <Box className="faq-grid">
            <Box className="faq-grid__intro">
              <Chip label="HỎI ĐÁP" size="small" className="eyebrow-chip" />
              <Typography variant="h3" className="section-title">
                Câu hỏi thường gặp
              </Typography>
              <Typography className="section-sub">
                Không thấy câu trả lời bạn cần?{" "}
                <Link to="/login" className="inline-link">Đăng nhập</Link> hoặc{" "}
                <Link to="/register" className="inline-link">tạo tài khoản</Link>{" "}
                rồi vào trang hỗ trợ.
              </Typography>
            </Box>
            <Box className="faq-grid__list">
              {faqs.map((faq, idx) => (
                <Card
                  key={faq.q}
                  className={`faq-item ${openFaq === idx ? "is-open" : ""}`}
                  elevation={0}
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                >
                  <CardContent>
                    <Box className="faq-row">
                      <Typography className="faq-question" component="div">{faq.q}</Typography>
                      <KeyboardArrowDown
                        className={`faq-icon ${openFaq === idx ? "rotate" : ""}`}
                      />
                    </Box>
                    <Box className={`faq-answer ${openFaq === idx ? "open" : ""}`}>
                      <Typography color="text.secondary">{faq.a}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ============================ FOOTER ============================ */}
      <Box component="footer" className="footer">
        <Container maxWidth="lg">
          <Box className="footer-grid">
            <Box className="footer-brand">
              <Box className="footer-brand__row">
                <Logo size={32} variant="header" />
              </Box>
              <Typography className="footer-text" component="div">
                Không gian học tập AI cho sinh viên, nghiên cứu sinh và giảng
                viên. Mọi câu trả lời đều có trích dẫn nguồn rõ ràng.
              </Typography>
              <Box className="footer-swatches">
                {["#6366f1", "#f59e0b", "#10b981"].map((c) => (
                  <Avatar
                    key={c}
                    sx={{
                      width: 24,
                      height: 24,
                      bgcolor: c,
                      border: "2px solid var(--bg-elev)",
                    }}
                  />
                ))}
              </Box>
            </Box>
            <Box className="footer-col">
              <Typography className="footer-title">Sản phẩm</Typography>
              <Box className="footer-col__list">
                {navItems.map((n) => (
                  <a key={n.id} href={`#${n.id}`} className="footer-link">{n.label}</a>
                ))}
              </Box>
            </Box>
            <Box className="footer-col">
              <Typography className="footer-title">Bắt đầu</Typography>
              <Box className="footer-col__list">
                <Link to="/login" className="footer-link">Đăng nhập</Link>
                <Link to="/register" className="footer-link">Tạo tài khoản</Link>
                <a href="#pricing" className="footer-link">Bảng giá</a>
                <a href="#faq" className="footer-link">Hỏi đáp</a>
              </Box>
            </Box>
          </Box>
          <Typography className="footer-bottom" align="center" component="div">
            © {new Date().getFullYear()} DocuMind. Source-grounded AI for serious learners.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
