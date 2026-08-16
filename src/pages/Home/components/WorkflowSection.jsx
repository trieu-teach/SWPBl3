import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Typography,
} from "@mui/material";
import { workflow } from "../data/homepage-data.js";

export default function WorkflowSection() {
  return (
    <Box component="section" className="workflow section-pad" id="workflow">
      <Container maxWidth="lg">
        <Box className="section-head">
          <Chip label="CÁCH HOẠT ĐỘNG" size="small" className="eyebrow-chip" />
          <Typography variant="h2" className="section-title">
            Ba bước. Không cần đọc hướng dẫn.
          </Typography>
          <Typography className="section-sub">
            Upload tài liệu, để AI đọc và lập chỉ mục, sau đó hỏi bất kỳ điều
            gì. Câu trả lời luôn có nguồn — bạn click là tới đoạn gốc.
          </Typography>
        </Box>
        <Box className="three-grid">
          {workflow.map((step, index) => (
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
                  BƯỚC {String(index + 1).padStart(2, "0")}
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
  );
}
