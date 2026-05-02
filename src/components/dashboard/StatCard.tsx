import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import { alpha, Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { ElementType } from "react";
import { StatMetric } from "../../types";

interface StatCardProps {
  item: StatMetric;
  icon: ElementType;
}

const toneStyles = {
  dark: {
    background:
      "linear-gradient(135deg, rgba(139,92,246,0.96) 0%, rgba(34,211,238,0.72) 100%)",
    color: "#ffffff",
    borderColor: alpha("#67e8f9", 0.28),
    iconBg: alpha("#ffffff", 0.14),
    noteColor: alpha("#ffffff", 0.78),
  },
  light: {
    background:
      "linear-gradient(180deg, rgba(21,21,36,0.9) 0%, rgba(13,14,27,0.78) 100%)",
    color: "#f8fafc",
    borderColor: alpha("#c4b5fd", 0.14),
    iconBg: alpha("#8b5cf6", 0.16),
    noteColor: "#aab2c8",
  },
  success: {
    background:
      "linear-gradient(180deg, rgba(16,35,32,0.92) 0%, rgba(11,24,25,0.78) 100%)",
    color: "#dcfce7",
    borderColor: alpha("#34d399", 0.2),
    iconBg: alpha("#34d399", 0.14),
    noteColor: "#86efac",
  },
  warning: {
    background:
      "linear-gradient(180deg, rgba(45,32,16,0.92) 0%, rgba(28,19,12,0.8) 100%)",
    color: "#fef3c7",
    borderColor: alpha("#f6c85f", 0.24),
    iconBg: alpha("#f6c85f", 0.14),
    noteColor: "#fde68a",
  },
} as const;

export function StatCard({ item, icon: Icon }: StatCardProps) {
  const styles = toneStyles[item.tone];

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.01 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: "20px",
        border: `1px solid ${styles.borderColor}`,
        background: styles.background,
        color: styles.color,
        boxShadow:
          item.tone === "dark"
            ? `0 22px 42px ${alpha("#8b5cf6", 0.26)}`
            : "0 18px 38px rgba(0, 0, 0, 0.22)",
        backdropFilter: "blur(18px)",
        overflow: "hidden",
        position: "relative",
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(120deg, rgba(255,255,255,0.1), transparent 38%)",
          opacity: item.tone === "dark" ? 0.8 : 0.35,
          pointerEvents: "none",
        },
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
