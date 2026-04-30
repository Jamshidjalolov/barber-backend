import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import EditCalendarRoundedIcon from "@mui/icons-material/EditCalendarRounded";
import FmdGoodRoundedIcon from "@mui/icons-material/FmdGoodRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import RadioButtonCheckedRoundedIcon from "@mui/icons-material/RadioButtonCheckedRounded";
import { alpha, Avatar, Badge, Box, Button, Chip, IconButton, Stack, Typography } from "@mui/material";
import { BarberProfile, BookingItem } from "../../types";

interface BarberWorkspaceHeroProps {
  barber: BarberProfile;
  dateLabel: string;
  pendingCount: number;
  activeDiscountCount: number;
  latestBooking: BookingItem | null;
  onOpenDiscounts: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export function BarberWorkspaceHero({
  barber,
  dateLabel,
  pendingCount,
  activeDiscountCount,
  latestBooking,
  onOpenDiscounts,
  onOpenSettings,
  onLogout,
}: BarberWorkspaceHeroProps) {
  return (
    <Box
      sx={{
        p: { xs: 1.45, md: 1.8, xl: 2.1 },
        borderRadius: "28px",
        background:
          "linear-gradient(135deg, rgba(255,250,244,0.98) 0%, rgba(248,242,232,0.92) 100%)",
        border: `1px solid ${alpha("#111111", 0.06)}`,
        boxShadow: "0 24px 60px rgba(17,17,17,0.06)",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 320px" },
          gap: { xs: 2, lg: 2.4 },
          alignItems: "center",
        }}
      >
        <Stack spacing={1.4}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Avatar
                variant="rounded"
                src={barber.photoUrl}
                sx={{
                  width: 74,
                  height: 74,
                  borderRadius: "24px",
                  bgcolor: barber.avatarColor,
                  boxShadow: `0 18px 34px ${alpha(barber.avatarColor, 0.18)}`,
                }}
              >
                {barber.initials}
              </Avatar>

              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.84rem" }}>
                  Ish paneli
                </Typography>
                <Typography
                  variant="h3"
                  sx={{ mt: 0.15, fontSize: { xs: "1.75rem", lg: "2rem" } }}
                >
                  {barber.name.split(" ")[0]}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.15 }}>
                  {barber.specialty}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
              <Button
                onClick={onOpenDiscounts}
                variant="contained"
                startIcon={<LocalOfferRoundedIcon sx={{ fontSize: "1rem" }} />}
                sx={{
                  minHeight: 40,
                  px: 1.55,
                  borderRadius: "14px",
                  textTransform: "none",
                  fontWeight: 800,
                  boxShadow: "none",
                  backgroundColor: "#111111",
                  "&:hover": {
                    backgroundColor: "#232323",
                    boxShadow: "none",
                  },
                }}
              >
                {activeDiscountCount > 0
                  ? `Skidka ${activeDiscountCount}`
                  : "Skidka"}
              </Button>
              <IconButton
                onClick={onOpenSettings}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "14px",
                  color: "#111111",
                  backgroundColor: "#fff",
                  border: `1px solid ${alpha("#111111", 0.06)}`,
                  "&:hover": {
                    backgroundColor: alpha("#111111", 0.04),
                  },
                }}
              >
                <EditCalendarRoundedIcon sx={{ fontSize: "1.1rem" }} />
              </IconButton>
              <Chip
                icon={<RadioButtonCheckedRoundedIcon sx={{ fontSize: "0.8rem !important" }} />}
                label="Realtime"
                size="small"
                sx={{
                  height: 31,
                  borderRadius: "999px",
                  color: "#1f7d4c",
                  backgroundColor: alpha("#3aa66f", 0.12),
                  "& .MuiChip-icon": { color: "#2f9d62" },
                  "& .MuiChip-label": { px: 1, fontWeight: 700 },
                }}
              />

              <IconButton
                onClick={onLogout}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "14px",
                  color: "#111111",
                  backgroundColor: "#fff",
                  border: `1px solid ${alpha("#111111", 0.06)}`,
                  "&:hover": {
                    backgroundColor: alpha("#111111", 0.04),
                  },
                }}
              >
                <LogoutRoundedIcon sx={{ fontSize: "1.1rem" }} />
              </IconButton>
            </Stack>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
          >
          <Stack direction="row" spacing={0.8} alignItems="center">
            <CalendarTodayRoundedIcon sx={{ fontSize: "1rem", color: "#8d95a8" }} />
            <Typography variant="body1" color="text.secondary">
              {dateLabel}
            </Typography>
          </Stack>

            <Stack direction="row" spacing={0.8} alignItems="center">
              <Badge
                badgeContent={pendingCount}
                color="warning"
                sx={{
                  "& .MuiBadge-badge": {
                    fontWeight: 700,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "14px",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: alpha("#111111", 0.04),
                    color: "#111111",
                  }}
                >
                  <NotificationsRoundedIcon sx={{ fontSize: "1.1rem" }} />
                </Box>
              </Badge>
              <Typography variant="body2" color="text.secondary">
                Kutilayotganlar
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        <Box
          sx={{
            p: 1.5,
            borderRadius: "24px",
            backgroundColor: alpha("#ffffff", 0.72),
            border: `1px solid ${alpha("#111111", 0.05)}`,
          }}
        >
            <Typography variant="subtitle2" sx={{ color: "#8d95a8", mb: 0.65 }}>
              Oxirgi bron
            </Typography>

            <Stack direction="row" spacing={0.7} alignItems="center" sx={{ mb: 1 }}>
              <Chip
                size="small"
                label={`${barber.workStartTime} - ${barber.workEndTime}`}
                sx={{
                  height: 28,
                  borderRadius: "999px",
                  backgroundColor: alpha("#111111", 0.05),
                  "& .MuiChip-label": { px: 1, fontWeight: 700 },
                }}
              />
              {barber.address ? (
                <Stack direction="row" spacing={0.4} alignItems="center" sx={{ minWidth: 0 }}>
                  <FmdGoodRoundedIcon sx={{ fontSize: "0.92rem", color: "#8d95a8" }} />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {barber.address}
                  </Typography>
                </Stack>
              ) : null}
            </Stack>

          {latestBooking ? (
            <Stack spacing={1.1}>
              <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="center">
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h6">{latestBooking.customer}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {latestBooking.service}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={latestBooking.time}
                  sx={{
                    backgroundColor: alpha("#111111", 0.06),
                    "& .MuiChip-label": { px: 1.05 },
                  }}
                />
              </Stack>

              <Typography variant="body2" color="text.secondary">
                Jadvalda ko'rinadi
              </Typography>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Hozircha yangi bron yo'q
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
