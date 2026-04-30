import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { alpha, Box, Button, LinearProgress, Stack, Typography } from "@mui/material";
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
          backgroundColor: "#fff",
          border: `1px solid ${alpha("#111111", 0.06)}`,
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
              background: "linear-gradient(90deg, #111111 0%, #2f2f2f 100%)",
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
          background: "linear-gradient(180deg, #161616 0%, #0e0e0e 100%)",
          color: "#fff",
          borderColor: alpha("#111111", 0.08),
        }
      : tone === "accepted"
        ? {
            background: "linear-gradient(180deg, rgba(238,246,255,1) 0%, rgba(248,251,255,1) 100%)",
            color: "#102117",
            borderColor: alpha("#5a7bd8", 0.14),
          }
      : tone === "success"
        ? {
            background: "linear-gradient(180deg, rgba(229,252,238,1) 0%, rgba(241,255,247,1) 100%)",
            color: "#102117",
            borderColor: alpha("#39a96b", 0.12),
          }
        : {
            background: "linear-gradient(180deg, rgba(255,245,245,1) 0%, rgba(255,250,250,1) 100%)",
            color: "#111111",
            borderColor: alpha("#d96868", 0.16),
          };

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: "24px",
        border: `1px solid ${styles.borderColor}`,
        color: styles.color,
        background: styles.background,
        boxShadow: "0 18px 34px rgba(17,17,17,0.04)",
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
                ? alpha("#5a7bd8", 0.1)
                : tone === "rejected"
                  ? alpha("#d96868", 0.1)
                  : alpha("#111111", 0.05),
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
                ? "#9a5a5a"
                : "#798196",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}
