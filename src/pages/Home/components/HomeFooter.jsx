import { Avatar, Box, Container, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import Logo from "../../../components/Logo/Logo.jsx";
import { navItems } from "../data/homepage-data.js";

export default function HomeFooter() {
  return (
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
              {["#6366f1", "#f59e0b", "#10b981"].map((color) => (
                <Avatar
                  key={color}
                  sx={{
                    width: 24,
                    height: 24,
                    bgcolor: color,
                    border: "2px solid var(--bg-elev)",
                  }}
                />
              ))}
            </Box>
          </Box>
          <Box className="footer-col">
            <Typography className="footer-title">Sản phẩm</Typography>
            <Box className="footer-col__list">
              {navItems.map((item) => (
                <a key={item.id} href={`#${item.id}`} className="footer-link">
                  {item.label}
                </a>
              ))}
            </Box>
          </Box>
          <Box className="footer-col">
            <Typography className="footer-title">Bắt đầu</Typography>
            <Box className="footer-col__list">
              <Link to="/login" className="footer-link">
                Đăng nhập
              </Link>
              <Link to="/register" className="footer-link">
                Tạo tài khoản
              </Link>
              <a href="#pricing" className="footer-link">
                Bảng giá
              </a>
              <a href="#faq" className="footer-link">
                Hỏi đáp
              </a>
            </Box>
          </Box>
        </Box>
        <Typography className="footer-bottom" align="center" component="div">
          © {new Date().getFullYear()} DocuMind. Source-grounded AI for serious
          learners.
        </Typography>
      </Container>
    </Box>
  );
}
