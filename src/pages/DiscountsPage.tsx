import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import PercentRoundedIcon from "@mui/icons-material/PercentRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import {
  alpha,
  Box,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { ReactNode, useMemo, useState } from "react";
import { PageHeader } from "../components/common/PageHeader";
import { DiscountItem } from "../types";
import { formatUzbekReadableDate, formatUzbekReadableIsoDate } from "../utils/date";

interface DiscountsPageProps {
  items: DiscountItem[];
  onDeleteDiscount: (discountId: string) => Promise<void>;
}

function formatTimeRange(item: DiscountItem) {
  return `${item.startTime} - ${item.endTime}`;
}

function buildStatus(item: DiscountItem) {
  const now = Date.now();
  const startsAt = new Date(item.startsAt).getTime();
  const endsAt = new Date(item.endsAt).getTime();

  if (startsAt > now) {
    return {
      label: "Kutilmoqda",
      color: "#8f6a0c",
      bg: alpha("#d5a546", 0.14),
    };
  }

  if (endsAt < now) {
    return {
      label: "Tugagan",
      color: "#6d7486",
      bg: alpha("#111111", 0.06),
    };
  }

  return {
    label: "Faol",
    color: "#207a49",
    bg: alpha("#3aa66f", 0.12),
  };
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Box
      sx={{
        p: 1.35,
        borderRadius: "18px",
        border: `1px solid ${alpha("#111111", 0.05)}`,
        background: "linear-gradient(180deg, rgba(255,252,247,0.98) 0%, rgba(248,242,232,0.95) 100%)",
      }}
    >
      <Stack direction="row" spacing={0.95} alignItems="center">
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "12px",
            display: "grid",
            placeItems: "center",
            color: "#a37a22",
            backgroundColor: alpha("#d5a546", 0.14),
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="caption" sx={{ color: "#8d95a8" }}>
            {label}
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 0.15 }}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

export function DiscountsPage({ items, onDeleteDiscount }: DiscountsPageProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sortedItems = useMemo(
    () =>
      [...items].sort((left, right) =>
        `${right.date}${right.startTime}`.localeCompare(`${left.date}${left.startTime}`),
      ),
    [items],
  );

  const counts = useMemo(() => {
    const now = Date.now();
    return sortedItems.reduce(
      (accumulator, item) => {
        const startsAt = new Date(item.startsAt).getTime();
        const endsAt = new Date(item.endsAt).getTime();

        accumulator.total += 1;
        if (startsAt > now) {
          accumulator.upcoming += 1;
        } else if (endsAt < now) {
          accumulator.finished += 1;
        } else {
          accumulator.active += 1;
        }
        return accumulator;
      },
      { total: 0, active: 0, upcoming: 0, finished: 0 },
    );
  }, [sortedItems]);

  const handleDelete = async (discountId: string) => {
    try {
      setDeletingId(discountId);
      await onDeleteDiscount(discountId);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Stack spacing={2.2}>
      <PageHeader
        title="Skidkalar"
        subtitle="Qaysi barber qachon va necha foiz chegirma qo'yganini shu yerda kuzatasiz."
        icon={<LocalOfferRoundedIcon sx={{ fontSize: "1.2rem" }} />}
        eyebrow="Admin paneli"
        meta={formatUzbekReadableDate(new Date())}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", xl: "repeat(4, minmax(0, 1fr))" },
          gap: 1.2,
        }}
      >
        <StatTile
          icon={<PercentRoundedIcon sx={{ fontSize: "1rem" }} />}
          label="Jami"
          value={`${counts.total} ta`}
        />
        <StatTile
          icon={<CheckCircleRoundedIcon sx={{ fontSize: "1rem" }} />}
          label="Faol"
          value={`${counts.active} ta`}
        />
        <StatTile
          icon={<TrendingUpRoundedIcon sx={{ fontSize: "1rem" }} />}
          label="Kutilayotgan"
          value={`${counts.upcoming} ta`}
        />
        <StatTile
          icon={<HistoryRoundedIcon sx={{ fontSize: "1rem" }} />}
          label="Tugagan"
          value={`${counts.finished} ta`}
        />
      </Box>

      {sortedItems.length ? (
        <Stack spacing={1.15}>
          {sortedItems.map((item) => {
            const status = buildStatus(item);

            return (
              <Box
                key={item.id}
                sx={{
                  p: 1.35,
                  borderRadius: "22px",
                  backgroundColor: "#fff",
                  border: `1px solid ${alpha("#111111", 0.05)}`,
                  boxShadow: "0 12px 28px rgba(17,17,17,0.04)",
                }}
              >
                <Stack spacing={1.15}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Typography variant="h6" sx={{ fontSize: "1rem" }}>
                          {item.title}
                        </Typography>
                        <Chip
                          size="small"
                          label={`${item.percent}%`}
                          sx={{
                            height: 26,
                            borderRadius: "999px",
                            backgroundColor: alpha("#3aa66f", 0.12),
                            color: "#207a49",
                            "& .MuiChip-label": { px: 1, fontWeight: 800 },
                          }}
                        />
                        <Chip
                          size="small"
                          label={status.label}
                          sx={{
                            height: 26,
                            borderRadius: "999px",
                            backgroundColor: status.bg,
                            color: status.color,
                            "& .MuiChip-label": { px: 1, fontWeight: 700 },
                          }}
                        />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
                        {item.barberName}
                        {item.description ? ` - ${item.description}` : ""}
                      </Typography>
                    </Box>

                    <IconButton
                      onClick={() => void handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: "12px",
                        border: `1px solid ${alpha("#b65b5b", 0.18)}`,
                        color: "#b65b5b",
                      }}
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Stack>

                  <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                    <Chip
                      icon={<ScheduleRoundedIcon sx={{ fontSize: "0.95rem !important" }} />}
                      label={formatTimeRange(item)}
                      sx={{
                        height: 30,
                        borderRadius: "999px",
                        backgroundColor: alpha("#111111", 0.05),
                        "& .MuiChip-label": { px: 1.05, fontWeight: 700 },
                      }}
                    />
                    <Chip
                      label={formatUzbekReadableIsoDate(item.date)}
                      sx={{
                        height: 30,
                        borderRadius: "999px",
                        backgroundColor: alpha("#d5a546", 0.1),
                        color: "#8f6a0c",
                        "& .MuiChip-label": { px: 1.05, fontWeight: 700 },
                      }}
                    />
                  </Stack>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      ) : (
        <Box
          sx={{
            p: 2,
            borderRadius: "24px",
            border: `1px dashed ${alpha("#111111", 0.12)}`,
            backgroundColor: alpha("#111111", 0.02),
            color: "text.secondary",
          }}
        >
          Hozircha skidka yo'q.
        </Box>
      )}
    </Stack>
  );
}
