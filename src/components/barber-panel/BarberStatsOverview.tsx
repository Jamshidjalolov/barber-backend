import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { alpha, Box, Button, LinearProgress, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface BarberStatsOverviewProps {
  total: number;
  accepted: number;
  completed: number;
  rejected: number;
  progressValue: number;
  onOpenSchedule: () => void;
}

export function BarberStatsOverview({
  total,
  accepted,
  completed,
  rejected,
  progressValue,
  onOpenSchedule,
}: BarberStatsOverviewProps) {
  return (
    <Stack spacing={1.5}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            md: "repeat(4, minmax(0, 1fr))",
          },
          gap: 1.25,
        }}
      >
        <MetricCard
          icon={<ContentCutRoundedIcon sx={{ fontSize: "1.05rem" }} />}
          value={total}
          label="Bugungi navbat"
          tone="dark"
        />
        <MetricCard
          icon={<TaskAltRoundedIcon sx={{ fontSize: "1.05rem" }} />}
          value={accepted}
          label="Qabul qilingan"
          tone="accepted"
        />
        <MetricCard
          icon={<CheckCircleRoundedIcon sx={{ fontSize: "1.05rem" }} />}
          value={completed}
          label="Tugallangan"
          tone="success"
        />
        <MetricCard
          icon={<BlockRoundedIcon sx={{ fontSize: "1.05rem" }} />}
          value={rejected}
          label="Rad etilgan"
          tone="rejected"
        />
      </Box>

      <Box
        sx={{
          p: { xs: 1.5, md: 1.7 },
          borderRadius: "24px",
          background:
            "linear-gradient(180deg, rgba(19,20,34,0.86) 0%, rgba(10,11,22,0.72) 100%)",
          border: `1px solid ${alpha("#c4b5fd", 0.14)}`,
          boxShadow: "0 18px 42px rgba(0,0,0,0.22)",
          backdropFilter: "blur(18px)",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          sx={{ mb: 1.2 }}
        >
          <Stack spacing={0.3}>
            <Typography variant="h6">Bugungi progress</Typography>
            <Typography variant="body2" color="text.secondary">
              {completed}/{Math.max(total, 1)} tugallangan
            </Typography>
          </Stack>

          <Button
            variant="outlined"
            onClick={onOpenSchedule}
            sx={{
              minHeight: 42,
              borderRadius: "14px",
              alignSelf: { xs: "stretch", sm: "center" },
            }}
          >
            Jadvalga o&apos;tish
          </Button>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={progressValue}
          sx={{
            height: 10,
            "& .MuiLinearProgress-bar": {
              background: "linear-gradient(90deg, #8b5cf6 0%, #22d3ee 100%)",
            },
          }}
        />
      </Box>
    </Stack>
  );
}

function MetricCard({
  icon,
  value,
  label,
  tone,
}: {
  icon: ReactNode;
  value: number;
  label: string;
  tone: "dark" | "accepted" | "success" | "rejected";
}) {
  const styles =
    tone === "dark"
      ? {
          background:
            "linear-gradient(135deg, rgba(139,92,246,0.98) 0%, rgba(34,211,238,0.78) 100%)",
          color: "#fff",
          borderColor: alpha("#67e8f9", 0.28),
        }
      : tone === "accepted"
        ? {
            background:
              "linear-gradient(180deg, rgba(18,25,45,0.9) 0%, rgba(12,18,31,0.78) 100%)",
            color: "#dbeafe",
            borderColor: alpha("#60a5fa", 0.18),
          }
      : tone === "success"
        ? {
            background:
              "linear-gradient(180deg, rgba(16,35,32,0.9) 0%, rgba(11,24,25,0.78) 100%)",
            color: "#dcfce7",
            borderColor: alpha("#34d399", 0.2),
          }
        : {
            background:
              "linear-gradient(180deg, rgba(45,18,26,0.9) 0%, rgba(28,12,18,0.78) 100%)",
            color: "#ffe4e6",
            borderColor: alpha("#fb7185", 0.2),
          };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      viewport={{ once: true, amount: 0.24 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        p: 1.5,
        borderRadius: "24px",
        border: `1px solid ${styles.borderColor}`,
        color: styles.color,
        background: styles.background,
        boxShadow: "0 18px 42px rgba(0,0,0,0.24)",
        backdropFilter: "blur(18px)",
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "12px",
          display: "grid",
          placeItems: "center",
          bgcolor:
            tone === "dark"
              ? alpha("#ffffff", 0.08)
              : tone === "accepted"
                ? alpha("#60a5fa", 0.14)
                : tone === "rejected"
                  ? alpha("#fb7185", 0.14)
                  : alpha("#34d399", 0.14),
          color: "inherit",
          mb: 1.2,
        }}
      >
        {icon}
      </Box>

      <Typography variant="h3" sx={{ fontSize: { xs: "2rem", md: "2.1rem" }, mb: 0.25 }}>
        {value}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color:
            tone === "dark"
              ? alpha("#ffffff", 0.75)
              : tone === "rejected"
                ? "#fecdd3"
                : "#aab2c8",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}
