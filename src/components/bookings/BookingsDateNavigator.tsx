import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import { alpha, Box, Chip, IconButton, Stack, Typography } from "@mui/material";
import { SectionCard } from "../common/SectionCard";

interface BookingsDateNavigatorProps {
  label: string;
  total: number;
  done: number;
  pending: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function BookingsDateNavigator({
  label,
  total,
  done,
  pending,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
}: BookingsDateNavigatorProps) {
  return (
    <SectionCard sx={{ px: { xs: 2, md: 2.5 }, py: { xs: 1.5, md: 1.75 } }}>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", lg: "center" }}
        justifyContent="space-between"
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="stretch"
          sx={{ width: { xs: "100%", lg: "auto" } }}
        >
          <IconButton
            onClick={onPrev}
            disabled={!canGoPrev}
            sx={{
              width: 44,
              height: 44,
              borderRadius: "14px",
              border: `1px solid ${alpha("#121212", 0.1)}`,
            }}
          >
            <ChevronLeftRoundedIcon />
          </IconButton>

          <Stack
            direction="row"
            spacing={1.25}
            alignItems="center"
            sx={{
              flex: 1,
              minWidth: 0,
              px: { xs: 1, md: 1.5 },
              py: 1,
              borderRadius: "16px",
              justifyContent: { xs: "center", sm: "flex-start" },
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "12px",
                display: "grid",
                placeItems: "center",
                backgroundColor: alpha("#111111", 0.05),
                color: "text.secondary",
              }}
            >
              <EventRoundedIcon fontSize="small" />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: "0.98rem", sm: "1rem", md: "1.15rem" },
                textAlign: { xs: "center", sm: "left" },
                lineHeight: 1.3,
              }}
            >
              {label}
            </Typography>
          </Stack>

          <IconButton
            onClick={onNext}
            disabled={!canGoNext}
            sx={{
              width: 44,
              height: 44,
              borderRadius: "14px",
              border: `1px solid ${alpha("#121212", 0.1)}`,
            }}
          >
            <ChevronRightRoundedIcon />
          </IconButton>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip label={`${total} jami`} sx={{ bgcolor: alpha("#111111", 0.05) }} />
          <Chip
            label={`${done} tugallangan`}
            sx={{ bgcolor: alpha("#3aa66f", 0.12), color: "#1f7d4c" }}
          />
          <Chip
            label={`${pending} kutilayotgan`}
            sx={{ bgcolor: alpha("#d6a622", 0.12), color: "#9a7410" }}
          />
        </Stack>
      </Stack>
    </SectionCard>
  );
}
