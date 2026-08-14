import { ArrowForward, AutoAwesome, MenuBook } from "@mui/icons-material";
import { Box, Button, Card, Chip, Container, Typography } from "@mui/material";
import { proofSources } from "../data/homepage-data.js";

export default function HeroSection({ onLogin }) {
  return (
    <Box component="section" className="hero" id="hero">
      <Container maxWidth="lg">
        <Box className="hero-grid">
          <Box className="hero-grid__copy">
            <Typography variant="h1" className="hero-title">
              Trợ lý AI cho{" "}
              <span className="gradient-text">toàn bộ thư viện</span> học tập
              của bạn.
            </Typography>
            <Typography className="hero-lede">
              Upload tài liệu, hỏi bằng tiếng Việt, nhận câu trả lời kèm
              citation dẫn về đúng trang. Không đoán mò — bạn kiểm chứng được
              ngay.
            </Typography>
            <Box className="hero-ctas">
              <Button
                size="large"
                variant="contained"
                disableElevation
                endIcon={<ArrowForward />}
                onClick={onLogin}
                className="primary-cta"
              >
                Tạo tài khoản miễn phí
              </Button>
              <Button
                size="large"
                variant="outlined"
                onClick={onLogin}
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
                        Skinner mô tả ba bước lập luận chính: kích thích, phản
                        hồi và củng cố <span className="citation">[1]</span>. Mô
                        hình này giải thích cách hành vi được hình thành qua
                        điều kiện hóa <span className="citation">[2]</span>.
                      </Typography>
                      <Box className="sources-block">
                        <Typography
                          variant="caption"
                          className="sources-title"
                          component="div"
                        >
                          NGUỒN THAM KHẢO
                        </Typography>
                        {proofSources.map((source) => (
                          <Box key={source} className="source-line">
                            <Box className="source-dot" component="span" />
                            <Typography variant="body2" component="span">
                              {source}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Box className="preview-input">
                <Typography
                  variant="body2"
                  className="preview-input-text"
                  component="div"
                >
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
  );
}
