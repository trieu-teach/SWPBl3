import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Typography,
} from "@mui/material";
import { useCases } from "../data/homepage-data.js";

export default function UseCasesSection() {
  return (
    <Box component="section" className="usecases section-pad" id="usecases">
      <Container maxWidth="lg">
        <Box className="section-head">
          <Chip label="TÌNH HUỐNG" size="small" className="eyebrow-chip" />
          <Typography variant="h2" className="section-title">
            Một trợ lý — bốn cách dùng khác nhau
          </Typography>
          <Typography className="section-sub">
            Không phải mọi người cần cùng một thứ. DocuMind thích nghi theo mục
            tiêu học tập của bạn.
          </Typography>
        </Box>
        <Box className="four-grid">
          {useCases.map((item) => (
            <Card className="usecase-card" elevation={0} key={item.title}>
              <CardContent>
                <Box className="usecase-icon">
                  <item.Icon />
                </Box>
                <Chip
                  label={item.tag.toUpperCase()}
                  size="small"
                  className="usecase-tag"
                />
                <Typography className="usecase-title" component="div">
                  {item.title}
                </Typography>
                <Typography className="usecase-desc" component="div">
                  {item.desc}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
