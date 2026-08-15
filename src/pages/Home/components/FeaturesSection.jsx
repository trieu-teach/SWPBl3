import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Typography,
} from "@mui/material";
import { CheckCircle as CheckIcon } from "@mui/icons-material";
import { features, securityItems } from "../data/homepage-data.js";

export default function FeaturesSection() {
  return (
    <>
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
            {features.map((feature) => (
              <Card key={feature.title} className="bento-feature" elevation={0}>
                <CardContent>
                  <Box className={`bento-mark bento-mark--${feature.tone}`}>
                    <feature.Icon />
                  </Box>
                  <Typography className="bento-feature-title" component="div">
                    {feature.title}
                  </Typography>
                  <Typography className="bento-feature-desc" component="div">
                    {feature.desc}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>
      <Box component="section" className="security section-pad">
        <Container maxWidth="lg">
          <Box className="security-grid">
            <Box className="security-grid__copy">
              <Chip
                label="BẢO MẬT"
                size="small"
                className="eyebrow-chip amber"
              />
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
                  {securityItems.map((line) => (
                    <Box key={line} className="security-line">
                      <Box className="check-circle">
                        <CheckIcon
                          sx={{ fontSize: 16, color: "var(--green)" }}
                        />
                      </Box>
                      <Typography
                        className="security-line-text"
                        component="div"
                      >
                        {line}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
