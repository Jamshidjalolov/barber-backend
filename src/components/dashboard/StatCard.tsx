import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import { alpha, Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { ElementType } from "react";
import { StatMetric } from "../../types";

interface StatCardProps {
  item: StatMetric;
  icon: ElementType;
}

const toneStyles = {
  dark: {
    background:
      "linear-gradient(180deg, rgba(17,17,17,1) 0%, rgba(31,31,31,1) 100%)",
    color: "#ffffff",
    borderColor: alpha("#111111", 0.2),
    iconBg: alpha("#ffffff", 0.08),
    noteColor: alpha("#ffffff", 0.68),
  },
  light: {
    background:
      "linear-gradient(180deg, rgba(255,252,247,0.98) 0%, rgba(247,240,229,0.96) 100%)",
    color: "#161616",
    borderColor: alpha("#7a5d31", 0.1),
    iconBg: alpha("#d5a546", 0.1),
    noteColor: "#786d5c",
  },
  success: {
    background:
      "linear-gradient(180deg, rgba(239,250,243,1) 0%, rgba(228,244,234,1) 100%)",
    color: "#133123",
    borderColor: alpha("#3aa66f", 0.16),
    iconBg: alpha("#3aa66f", 0.1),
    noteColor: "#5f7b69",
  },
  warning: {
    background:
      "linear-gradient(180deg, rgba(255,247,223,1) 0%, rgba(255,239,197,1) 100%)",
    color: "#3c2d12",
    borderColor: alpha("#d6a622", 0.18),
    iconBg: alpha("#d6a622", 0.11),
    noteColor: "#7f7255",
  },
} as const;

export function StatCard({ item, icon: Icon }: StatCardProps) {
  const styles = toneStyles[item.tone];

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: "16px",
        border: `1px solid ${styles.borderColor}`,
        background: styles.background,
        color: styles.color,
        boxShadow:
          item.tone === "dark"
            ? "0 14px 28px rgba(17, 17, 17, 0.1)"
            : "0 10px 20px rgba(58, 44, 23, 0.04)",
      }}
    >
      <CardContent sx={{ p: 1.35, "&:last-child": { pb: 1.35 } }}>
        <Stack spacing={1.05} height="100%">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "11px",
                display: "grid",
                placeItems: "center",
                backgroundColor: styles.iconBg,
              }}
            >
              <Icon sx={{ fontSize: "1rem" }} />
            </Box>
            <ArrowOutwardRoundedIcon sx={{ fontSize: "1rem", opacity: 0.38 }} />
          </Stack>

          <Box>
            <Typography variant="h3" sx={{ mb: 0.35, fontSize: { xs: "1.55rem", md: "1.72rem" } }}>
              {item.value}
            </Typography>
            <Typography variant="h6" sx={{ mb: 0.24, fontSize: "0.92rem", lineHeight: 1.2 }}>
              {item.title}
            </Typography>
            <Typography variant="body2" sx={{ color: styles.noteColor, fontSize: "0.76rem" }}>
              {item.note}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
