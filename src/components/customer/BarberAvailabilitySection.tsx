import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import FiberManualRecordRoundedIcon from "@mui/icons-material/FiberManualRecordRounded";
import { alpha, Avatar, Box, Button, Card, IconButton, Stack, Typography } from "@mui/material";
import { AvailabilityStatus, BarberProfile, BookingItem } from "../../types";

export interface AvailabilitySlot {
  time: string;
  status: AvailabilityStatus;
  booking?: BookingItem;
}

interface BarberAvailabilitySectionProps {
  barber: BarberProfile;
  slots: AvailabilitySlot[];
  selectedTime: string | null;
  dayTitle: string;
  daySubtitle: string;
  workHoursLabel: string;
  priceLabel: string;
  canGoPrev: boolean;
  canGoNext: boolean;
  onBack: () => void;
  onPrevDay: () => void;
  onNextDay: () => void;
  onSelectTime: (time: string) => void;
  onOpenBookedSlot: (booking: BookingItem) => void;
  onContinue: () => void;
}

function LegendItem({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <Stack direction="row" spacing={0.45} alignItems="center">
      <FiberManualRecordRoundedIcon sx={{ fontSize: "0.8rem", color }} />
      <Typography variant="caption" sx={{ color: "#949bb0", fontSize: "0.76rem" }}>
        {label}
      </Typography>
    </Stack>
  );
}

function getSlotStyles(status: AvailabilityStatus, selected: boolean) {
  if (selected) {
    return {
      backgroundColor: "#0f0f0f",
      color: "#fff",
      border: "2px solid rgba(255,255,255,0.5)",
      boxShadow: "0 10px 18px rgba(17,17,17,0.18)",
      textDecoration: "none",
    };
  }

  if (status === "bo'sh") {
    return {
      backgroundColor: "#f7f8fc",
      color: "#0f0f0f",
      border: `1px solid ${alpha("#111111", 0.04)}`,
      textDecoration: "none",
    };
  }

  if (status === "ishlayapti") {
    return {
      backgroundColor: alpha("#5a7bd8", 0.1),
      color: "#3354b8",
      border: `1px solid ${alpha("#5a7bd8", 0.12)}`,
      textDecoration: "none",
    };
  }

  return {
    backgroundColor: "#f7f8fc",
    color: "#c6cbda",
    border: `1px solid ${alpha("#111111", 0.03)}`,
    textDecoration: "line-through",
  };
}

function formatTimeLabel(time: string) {
  const [rawHour, rawMinute] = time.split(":").map(Number);
  const suffix = rawHour >= 12 ? "PM" : "AM";
  const hour = rawHour % 12 || 12;
  return `${hour}:${String(rawMinute).padStart(2, "0")} ${suffix}`;
}

export function BarberAvailabilitySection({
  barber,
  slots,
  selectedTime,
  dayTitle,
  daySubtitle,
  workHoursLabel,
  priceLabel,
  canGoPrev,
  canGoNext,
  onBack,
  onPrevDay,
  onNextDay,
  onSelectTime,
  onOpenBookedSlot,
  onContinue,
}: BarberAvailabilitySectionProps) {
  return (
    <Stack spacing={{ xs: 2.1, md: 2.35 }}>
      <Stack direction="row" spacing={0.7} alignItems="flex-start">
        <IconButton
          onClick={onBack}
          sx={{
            mt: -0.25,
            ml: -0.4,
            color: "#111111",
          }}
        >
          <ArrowBackRoundedIcon />
        </IconButton>

        <Box>
          <Typography variant="h5" sx={{ fontSize: { xs: "1.25rem", sm: "1.4rem" } }}>
            Vaqtni tanlang
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {barber.name}
          </Typography>
        </Box>
      </Stack>

      <Card
        elevation={0}
        sx={{
          borderRadius: "22px",
          border: `1px solid ${alpha("#111111", 0.06)}`,
          backgroundColor: "#f8f9fd",
        }}
      >
        <Stack
          direction={{ xs: "row", md: "row" }}
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
          sx={{ p: { xs: 1.2, md: 1.35 } }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar
              variant="rounded"
              src={barber.photoUrl}
              sx={{
                width: 54,
                height: 54,
                borderRadius: "16px",
                bgcolor: barber.avatarColor,
                fontWeight: 800,
              }}
            >
              {barber.initials}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontSize: "0.98rem" }}>
                {barber.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {barber.specialty}
              </Typography>
            </Box>
          </Stack>

          <Typography
            variant="caption"
            sx={{
              display: { xs: "none", md: "block" },
              color: "#8c93a7",
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            {workHoursLabel} | {priceLabel}
          </Typography>
        </Stack>
      </Card>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <IconButton
          onClick={onPrevDay}
          disabled={!canGoPrev}
          sx={{
            width: 42,
            height: 42,
            border: `1px solid ${alpha("#111111", 0.08)}`,
            backgroundColor: "#fff",
          }}
        >
          <ChevronLeftRoundedIcon />
        </IconButton>

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h6" sx={{ fontSize: "1.2rem" }}>
            {dayTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {daySubtitle}
          </Typography>
        </Box>

        <IconButton
          onClick={onNextDay}
          disabled={!canGoNext}
          sx={{
            width: 42,
            height: 42,
            border: `1px solid ${alpha("#111111", 0.08)}`,
            backgroundColor: "#fff",
          }}
        >
          <ChevronRightRoundedIcon />
        </IconButton>
      </Stack>

      <Typography
        variant="caption"
        sx={{
          color: "#9aa2ba",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 700,
        }}
      >
        Mavjud vaqtlar
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(3, minmax(0, 1fr))",
            md: "repeat(4, minmax(0, 1fr))",
            xl: "repeat(5, minmax(0, 1fr))",
          },
          gap: { xs: 0.95, md: 1.05 },
        }}
      >
        {slots.map((slot) => {
          const selected = slot.time === selectedTime;
          const canSelect = slot.status === "bo'sh";
          const canPreview = Boolean(slot.booking) && !canSelect;
          const styles = getSlotStyles(slot.status, selected);

          return (
            <Button
              key={slot.time}
              onClick={() => {
                if (canSelect) {
                  onSelectTime(slot.time);
                  return;
                }

                if (slot.booking) {
                  onOpenBookedSlot(slot.booking);
                }
              }}
              disabled={!canSelect && !canPreview && !selected}
              sx={{
                minHeight: { xs: 52, md: 56 },
                borderRadius: "16px",
                px: 0.85,
                fontSize: { xs: "0.92rem", sm: "0.95rem" },
                fontWeight: 800,
                lineHeight: 1,
                cursor: canPreview ? "pointer" : undefined,
                ...styles,
                "&:hover":
                  canSelect || canPreview
                    ? {
                        backgroundColor: selected
                          ? "#0f0f0f"
                          : slot.status === "bo'sh"
                            ? "#eff2f9"
                            : alpha("#111111", 0.06),
                      }
                    : undefined,
              }}
            >
              {formatTimeLabel(slot.time)}
            </Button>
          );
        })}
      </Box>

      <Stack direction="row" spacing={1.2} flexWrap="wrap" useFlexGap>
        <LegendItem label="Tanlangan" color="#0f0f0f" />
        <LegendItem label="Bo'sh" color="#d9dfe9" />
        <LegendItem label="Band" color="#eceff5" />
        <LegendItem label="Ishlayapti" color="#5a7bd8" />
      </Stack>

      <Box sx={{ pt: { xs: 1.5, sm: 2.2 }, display: "flex", justifyContent: { md: "flex-end" } }}>
        <Button
          fullWidth
          variant="contained"
          disabled={!selectedTime}
          onClick={onContinue}
          sx={{
            minHeight: 56,
            maxWidth: { md: 340 },
            borderRadius: "18px",
            fontSize: "1rem",
            boxShadow: "0 14px 26px rgba(17,17,17,0.14)",
          }}
        >
          {selectedTime ? `Davom etish - ${formatTimeLabel(selectedTime)}` : "Vaqt tanlang"}
        </Button>
      </Box>
    </Stack>
  );
}
