import { ArrowForward, Star } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Typography,
} from "@mui/material";
import { proofStats, testimonials } from "../data/homepage-data.js";

export default function ProofSection({ onLogin }) {
  return (
    <>
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
                <Typography
                  variant="h3"
                  className="proof-title"
                  sx={{ mt: 2 }}
                  component="div"
                >
                  Học nhanh hơn. Tin được. Kiểm chứng được.
                </Typography>
                <Typography
                  className="proof-desc"
                  sx={{ mt: 2 }}
                  component="div"
                >
                  DocuMind không đưa ra câu trả lời chung chung — nó đọc tài
                  liệu của bạn rồi trả lời đúng trang. Bạn có thể mở citation
                  bất kỳ lúc nào để đối chiếu.
                </Typography>
                <Box className="proof-grid__actions">
                  <Button
                    variant="contained"
                    disableElevation
                    onClick={onLogin}
                    endIcon={<ArrowForward />}
                    className="primary-cta"
                  >
                    Trải nghiệm ngay
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={onLogin}
                    className="secondary-cta"
                  >
                    Đăng nhập
                  </Button>
                </Box>
              </Box>
              <Box className="proof-grid__stats">
                {proofStats.map((stat) => (
                  <Box className="stat-tile" key={stat.label}>
                    <Typography className="stat-value" component="div">
                      {stat.value}
                    </Typography>
                    <Typography className="stat-label" component="div">
                      {stat.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Card>
        </Container>
      </Box>
      <Box component="section" className="testimonials section-pad">
        <Container maxWidth="lg">
          <Box className="section-head section-head--center">
            <Chip
              label="ĐÁNH GIÁ"
              size="small"
              className="eyebrow-chip amber"
            />
            <Typography variant="h2" className="section-title">
              Sinh viên nói gì về DocuMind?
            </Typography>
          </Box>
          <Box className="three-grid">
            {testimonials.map((item) => (
              <Card className="testimonial-card" elevation={0} key={item.name}>
                <CardContent>
                  <Box className="testimonial-stars">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        sx={{ color: "#f59e0b", fontSize: 18 }}
                      />
                    ))}
                  </Box>
                  <Typography className="testimonial-quote" component="div">
                    &quot;{item.quote}&quot;
                  </Typography>
                  <Box className="testimonial-author">
                    <Avatar sx={{ background: item.color, fontWeight: 700 }}>
                      {item.avatar}
                    </Avatar>
                    <Box>
                      <Typography className="testimonial-name" component="div">
                        {item.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        className="testimonial-role"
                        component="div"
                      >
                        {item.role}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>
    </>
  );
}
