import { KeyboardArrowDown } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import { faqs } from "../data/homepage-data.js";

export default function FaqSection({ openFaq, setOpenFaq }) {
  return (
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
              <Link to="/login" className="inline-link">
                Đăng nhập
              </Link>{" "}
              hoặc{" "}
              <Link to="/register" className="inline-link">
                tạo tài khoản
              </Link>{" "}
              rồi vào trang hỗ trợ.
            </Typography>
          </Box>
          <Box className="faq-grid__list">
            {faqs.map((faq, index) => (
              <Card
                key={faq.q}
                className={`faq-item ${openFaq === index ? "is-open" : ""}`}
                elevation={0}
                onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
              >
                <CardContent>
                  <Box className="faq-row">
                    <Typography className="faq-question" component="div">
                      {faq.q}
                    </Typography>
                    <KeyboardArrowDown
                      className={`faq-icon ${openFaq === index ? "rotate" : ""}`}
                    />
                  </Box>
                  <Box
                    className={`faq-answer ${openFaq === index ? "open" : ""}`}
                  >
                    <Typography color="text.secondary">{faq.a}</Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
