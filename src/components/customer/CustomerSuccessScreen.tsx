import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import {
  alpha,
  Avatar,
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { ReactNode } from "react";
import { BarberProfile, CustomerProfile } from "../../types";

interface CustomerSuccessScreenProps {
  barber: BarberProfile;
  customer: CustomerProfile;
  bookingId: string;
  dateLabel: string;
  timeLabel: string;
  onBookAnother: () => void;
  onShare: () => void;
}

export function CustomerSuccessScreen({
  barber,
  customer,
  bookingId,
  dateLabel,
  timeLabel,
  onBookAnother,
  onShare,
}: CustomerSuccessScreenProps) {
  return (
    <Stack spacing={2.2}>
      <Stack spacing={1.1} alignItems="center" textAlign="center">
        <Box sx={{ position: "relative" }}>
          <Box
            sx={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              bgcolor: "#0f0f0f",
              color: "#fff",
            }}
          >
            <CheckRoundedIcon sx={{ fontSize: "3rem" }} />
          </Box>

          <Box
            sx={{
              position: "absolute",
              right: -4,
              bottom: 4,
              width: 28,
              height: 28,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              bgcolor: "#16d46b",
              color: "#fff",
            }}
          >
            <ContentCutRoundedIcon sx={{ fontSize: "0.92rem" }} />
          </Box>
        </Box>

        <Typography variant="h4" sx={{ fontSize: { xs: "2rem", sm: "2.15rem" } }}>
          Hammasi tayyor
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Navbatingiz tasdiqlandi
        </Typography>
      </Stack>

      <Box
        sx={{
          p: { xs: 1.3, md: 1.55 },
          borderRadius: "24px",
          backgroundColor: "#f8f9fd",
          border: `1px solid ${alpha("#111111", 0.05)}`,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 240px" },
            gap: 1.5,
            alignItems: "start",
          }}
        >
          <Stack spacing={1.1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#9aa2ba",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight: 700,
                  }}
                >
                  Booking ID
                </Typography>
                <Typography variant="h6" sx={{ mt: 0.2 }}>
                  #{bookingId}
                </Typography>
              </Box>

              <Chip
                label="Tasdiqlandi"
                size="small"
                sx={{
                  height: 32,
                  borderRadius: "999px",
                  backgroundColor: alpha("#3aa66f", 0.16),
                  color: "#1f7d4c",
                  "& .MuiChip-label": { px: 1.2, fontWeight: 700 },
                }}
              />
            </Stack>

            <Box sx={{ height: 1, bgcolor: alpha("#111111", 0.06) }} />

            <Stack direction="row" spacing={0.9} alignItems="center">
              <Avatar
                variant="rounded"
                src={barber.photoUrl}
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "15px",
                  bgcolor: barber.avatarColor,
                  fontWeight: 800,
                }}
              >
                {barber.initials}
              </Avatar>
              <Box>
                <Typography variant="subtitle1">{barber.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {barber.specialty}
                </Typography>
              </Box>
            </Stack>
          </Stack>

          <Stack spacing={1}>
            <InfoPill icon={<CalendarTodayRoundedIcon />} label={dateLabel} />
            <InfoPill icon={<ScheduleRoundedIcon />} label={timeLabel} />
            <Box
              sx={{
                px: 1.05,
                py: 0.95,
                borderRadius: "16px",
                backgroundColor: "#fff",
              }}
            >
              <Typography variant="caption" sx={{ color: "#9aa2ba" }}>
                Mijoz
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 0.18 }}>
                {customer.name}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
        Booking ID ni saqlab qo&apos;ying yoki ulashing
      </Typography>

      <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
        <Button
          fullWidth
          variant="contained"
          onClick={onBookAnother}
          sx={{ minHeight: 56, borderRadius: "18px", fontSize: "1rem" }}
        >
          Yana navbat band qilish
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<IosShareRoundedIcon />}
          onClick={onShare}
          sx={{ minHeight: 52, borderRadius: "18px", fontSize: "0.96rem" }}
        >
          Tafsilotni ulashish
        </Button>
      </Stack>
    </Stack>
  );
}

function InfoPill({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <Stack
      direction="row"
      spacing={0.8}
      alignItems="center"
      sx={{
        px: 1.05,
        py: 0.95,
        borderRadius: "16px",
        backgroundColor: "#fff",
      }}
    >
      <Box sx={{ color: "#9aa2ba", display: "grid", placeItems: "center" }}>{icon}</Box>
      <Typography variant="body2" sx={{ fontSize: "0.98rem", color: "#1f2430" }}>
        {label}
      </Typography>
    </Stack>
  );
}
