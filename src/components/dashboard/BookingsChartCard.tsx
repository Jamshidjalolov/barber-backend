import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import {
  alpha,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { BarberBookingSummary } from "../../types";
import { SectionCard } from "../common/SectionCard";

const barberColors = ["#191919", "#d5a546", "#3aa66f", "#6d7486"];

interface BookingsChartCardProps {
  items: BarberBookingSummary[];
}

export function BookingsChartCard({ items }: BookingsChartCardProps) {
  const safeItems = items.length ? items : [{ name: "Hozircha yo'q", completed: 0, pending: 0 }];
  const maxValue = Math.max(1, ...safeItems.flatMap((item) => [item.completed, item.pending]));
  const totalCompleted = safeItems.reduce((sum, item) => sum + item.completed, 0);
  const totalPending = safeItems.reduce((sum, item) => sum + item.pending, 0);
  const bestBarber = [...safeItems].sort(
    (left, right) => right.completed - left.completed,
  )[0];

  return (
    <SectionCard sx={{ height: "100%" }}>
      <Stack spacing={1.6}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
        >
          <Stack spacing={0.38}>
            <Typography variant="h5" sx={{ fontSize: { xs: "1.08rem", md: "1.18rem" } }}>
              Bugungi navbatlar
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.84rem" }}>
              Har bir barberning bugungi navbatlari
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
            <Chip
              icon={<QueryStatsRoundedIcon />}
              label={`${totalCompleted + totalPending} ta jami`}
              size="small"
              sx={{
                height: 30,
                borderRadius: "999px",
                backgroundColor: alpha("#111111", 0.05),
                "& .MuiChip-label": { px: 1.1, fontWeight: 700 },
              }}
            />
            <Chip
              icon={<TrendingUpRoundedIcon />}
              label={`${bestBarber.name} oldinda`}
              size="small"
              sx={{
                height: 30,
                borderRadius: "999px",
                backgroundColor: alpha("#3aa66f", 0.12),
                color: "#1f7d4c",
                "& .MuiChip-label": { px: 1.1, fontWeight: 700 },
              }}
            />
          </Stack>
        </Stack>

        <Stack spacing={0.95}>
          {safeItems.map((item, index) => {
            const total = item.completed + item.pending;
            const avatarColor = barberColors[index % barberColors.length];

            return (
              <Card
                key={item.name}
                elevation={0}
                sx={{
                  borderRadius: "16px",
                  border: `1px solid ${alpha("#7a5d31", 0.08)}`,
                  background:
                    "linear-gradient(180deg, rgba(255,252,247,0.98) 0%, rgba(248,242,233,0.94) 100%)",
                  boxShadow: "0 10px 22px rgba(58, 44, 23, 0.04)",
                }}
              >
                <CardContent sx={{ p: 1.2, "&:last-child": { pb: 1.2 } }}>
                  <Stack spacing={1}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={0.9}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", sm: "center" }}
                    >
                      <Stack direction="row" spacing={0.9} alignItems="center">
                        <Avatar
                          sx={{
                            width: 38,
                            height: 38,
                            bgcolor: avatarColor,
                            color: "#fff",
                            borderRadius: "13px",
                            fontWeight: 700,
                            boxShadow: `0 10px 18px ${alpha(avatarColor, 0.16)}`,
                          }}
                        >
                          {item.name.slice(0, 1)}
                        </Avatar>

                        <Box>
                          <Typography variant="subtitle2" sx={{ fontSize: "0.95rem" }}>
                            {item.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary", fontSize: "0.76rem" }}
                          >
                            {total} ta navbat
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={0.55} flexWrap="wrap" useFlexGap>
                        <Chip
                          label={`${item.completed} tugagan`}
                          size="small"
                          sx={{
                            height: 26,
                            borderRadius: "999px",
                            backgroundColor: alpha("#3aa66f", 0.12),
                            color: "#1f7d4c",
                            "& .MuiChip-label": { px: 0.95, fontWeight: 700, fontSize: "0.75rem" },
                          }}
                        />
                        <Chip
                          label={`${item.pending} kutilmoqda`}
                          size="small"
                          sx={{
                            height: 26,
                            borderRadius: "999px",
                            backgroundColor: alpha("#d5a546", 0.13),
                            color: "#916c12",
                            "& .MuiChip-label": { px: 0.95, fontWeight: 700, fontSize: "0.75rem" },
                          }}
                        />
                      </Stack>
                    </Stack>

                    <Stack spacing={0.8}>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.4 }}>
                          <Typography variant="caption" color="text.secondary">
                            Tugagan navbatlar
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.completed} ta
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={maxValue ? (item.completed / maxValue) * 100 : 0}
                          sx={{
                            height: 8,
                            borderRadius: "999px",
                            backgroundColor: alpha("#3aa66f", 0.12),
                            "& .MuiLinearProgress-bar": {
                              borderRadius: "999px",
                              background:
                                "linear-gradient(90deg, rgba(58,166,111,0.74) 0%, rgba(32,125,76,1) 100%)",
                            },
                          }}
                        />
                      </Box>

                      <Box>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.4 }}>
                          <Typography variant="caption" color="text.secondary">
                            Kutilayotgan navbatlar
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.pending} ta
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={maxValue ? (item.pending / maxValue) * 100 : 0}
                          sx={{
                            height: 8,
                            borderRadius: "999px",
                            backgroundColor: alpha("#d5a546", 0.12),
                            "& .MuiLinearProgress-bar": {
                              borderRadius: "999px",
                              background:
                                "linear-gradient(90deg, rgba(240,201,107,0.85) 0%, rgba(213,165,70,1) 100%)",
                            },
                          }}
                        />
                      </Box>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>

        <Stack direction="row" spacing={0.75} alignItems="center">
          <ScheduleRoundedIcon sx={{ fontSize: "0.95rem", color: "#8f6a0c" }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.82rem" }}>
            Bugun eng ko&apos;p navbatni {bestBarber.name} tugatgan.
          </Typography>
        </Stack>
      </Stack>
    </SectionCard>
  );
}
