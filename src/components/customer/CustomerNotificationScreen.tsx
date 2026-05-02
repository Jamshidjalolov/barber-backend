import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import RadioButtonCheckedRoundedIcon from "@mui/icons-material/RadioButtonCheckedRounded";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import { alpha, Avatar, Box, Button, Chip, IconButton, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { BarberProfile, BookingItem, BookingStatus } from "../../types";
import { BrandLogo } from "../common/BrandLogo";

interface CustomerNotificationScreenProps {
  barber: BarberProfile;
  booking: BookingItem;
  dateLabel: string;
  timeLabel: string;
  lastRefreshLabel?: string;
  isAutoRefreshing?: boolean;
  onShare: () => void;
  onBackHome?: () => void;
  onReset?: () => void;
}

export function CustomerNotificationScreen({
  barber,
  booking,
  dateLabel,
  timeLabel,
  lastRefreshLabel,
  isAutoRefreshing = false,
  onShare,
  onBackHome,
  onReset,
}: CustomerNotificationScreenProps) {
  const view = getNotificationView(booking.status);
  const timeline = getTimeline(booking.status);
  const originalPriceLabel = formatMoney(booking.originalPrice ?? booking.finalPrice ?? 0);
  const finalPriceLabel = formatMoney(booking.finalPrice ?? booking.originalPrice ?? 0);

  return (
    <Stack
      component={motion.div}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
      spacing={1.6}
    >
      <Box
        sx={{
          p: { xs: 1.2, sm: 1.45 },
          borderRadius: "26px",
          background:
            "linear-gradient(135deg, rgba(22,22,39,0.9) 0%, rgba(10,11,22,0.82) 56%, rgba(7,19,31,0.82) 100%)",
          border: `1px solid ${alpha("#c4b5fd", 0.15)}`,
          boxShadow: "0 24px 70px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.06)",
          backdropFilter: "blur(22px)",
        }}
      >
        <Stack spacing={1.2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box
              sx={{
                px: 0.75,
                py: 0.55,
                borderRadius: "16px",
                backgroundColor: alpha("#ffffff", 0.07),
                border: `1px solid ${alpha("#ffffff", 0.12)}`,
              }}
            >
              <BrandLogo badgeSize={40} tone="light" />
            </Box>

            <Stack direction="row" spacing={0.6}>
              {onBackHome ? (
                <IconButton
                  onClick={onBackHome}
                  sx={{
                    width: 36,
                    height: 36,
                    backgroundColor: alpha("#ffffff", 0.08),
                    border: `1px solid ${alpha("#ffffff", 0.12)}`,
                    "&:hover": { backgroundColor: alpha("#ffffff", 0.14) },
                  }}
                >
                  <HomeRoundedIcon sx={{ fontSize: "1.05rem" }} />
                </IconButton>
              ) : null}

              <IconButton
                onClick={onShare}
                sx={{
                  width: 36,
                  height: 36,
                  backgroundColor: alpha("#ffffff", 0.08),
                  border: `1px solid ${alpha("#ffffff", 0.12)}`,
                  "&:hover": { backgroundColor: alpha("#ffffff", 0.14) },
                }}
              >
                <IosShareRoundedIcon sx={{ fontSize: "1rem" }} />
              </IconButton>
            </Stack>
          </Stack>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.1}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "flex-end" }}
          >
            <Stack spacing={0.45}>
              <Typography
                variant="h4"
                sx={{
                  fontSize: { xs: "1.65rem", sm: "1.95rem" },
                  lineHeight: 1,
                  letterSpacing: 0,
                }}
              >
                {view.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {view.description}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              <Chip
                label={view.shortStatus}
                sx={{
                  height: 34,
                  borderRadius: "999px",
                  backgroundColor: view.badgeBg,
                  color: view.badgeColor,
                  "& .MuiChip-label": { px: 1.1, fontWeight: 700 },
                }}
              />
              <Chip
                icon={<RadioButtonCheckedRoundedIcon sx={{ fontSize: "0.8rem !important" }} />}
                label={isAutoRefreshing ? "Realtime" : "Yakunlangan"}
                sx={{
                  height: 34,
                  borderRadius: "999px",
                  color: isAutoRefreshing ? "#1f7d4c" : "#6f7787",
                  backgroundColor: alpha(isAutoRefreshing ? "#3aa66f" : "#111111", 0.08),
                  "& .MuiChip-icon": {
                    color: isAutoRefreshing ? "#2f9d62" : "#a0a6b6",
                  },
                  "& .MuiChip-label": { px: 1.05, fontWeight: 700 },
                }}
              />
            </Stack>
          </Stack>
        </Stack>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 240px" },
          gap: 1.4,
        }}
      >
        <Box
          sx={{
            p: { xs: 1.25, sm: 1.45 },
            borderRadius: "24px",
            background:
              "linear-gradient(180deg, rgba(19,20,34,0.86) 0%, rgba(10,11,22,0.72) 100%)",
            border: `1px solid ${alpha("#c4b5fd", 0.14)}`,
            boxShadow: "0 18px 42px rgba(0,0,0,0.22)",
            backdropFilter: "blur(18px)",
          }}
        >
          <Stack spacing={1.15}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#8d96ad",
                    textTransform: "uppercase",
                    letterSpacing: 0,
                    fontWeight: 700,
                  }}
                >
                  Bron ID
                </Typography>
                <Typography variant="h6" sx={{ mt: 0.15 }}>
                  #{booking.id.replace(/^WEB-/, "")}
                </Typography>
              </Box>

              {lastRefreshLabel ? (
                <Typography variant="caption" sx={{ color: "#8d95a8" }}>
                  {lastRefreshLabel}
                </Typography>
              ) : null}
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                p: 1,
                borderRadius: "18px",
                backgroundColor: alpha("#ffffff", 0.06),
                border: `1px solid ${alpha("#c4b5fd", 0.12)}`,
              }}
            >
              <Avatar
                variant="rounded"
                src={barber.photoUrl}
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "18px",
                  bgcolor: barber.avatarColor,
                  fontWeight: 800,
                }}
              >
                {barber.initials}
              </Avatar>

              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1">{barber.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {barber.specialty}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" flexWrap="wrap" gap={0.8}>
              <InfoPill icon={<CalendarTodayRoundedIcon />} label={dateLabel} />
              <InfoPill icon={<ScheduleRoundedIcon />} label={timeLabel} />
              <InfoPill icon={<NotificationsActiveRoundedIcon />} label={booking.customer} />
              <InfoPill icon={<PaymentsRoundedIcon />} label={finalPriceLabel} />
            </Stack>

            {(booking.originalPrice || booking.finalPrice) ? (
              <Box
                sx={{
                  p: 1,
                  borderRadius: "18px",
                  backgroundColor: alpha("#f6c85f", 0.1),
                  border: `1px solid ${alpha("#f6c85f", 0.16)}`,
                }}
              >
                <Stack direction="row" justifyContent="space-between" spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Xizmat narxi
                  </Typography>
                  <Typography variant="subtitle2">{originalPriceLabel}</Typography>
                </Stack>

                {booking.appliedDiscountPercent ? (
                  <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mt: 0.5 }}>
                    <Typography variant="body2" sx={{ color: "#86efac", fontWeight: 700 }}>
                      Skidka
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: "#86efac" }}>
                      -{booking.appliedDiscountPercent}%
                    </Typography>
                  </Stack>
                ) : null}

                <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mt: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    To'lanadigan narx
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    {finalPriceLabel}
                  </Typography>
                </Stack>
              </Box>
            ) : null}

            <Box
              sx={{
                p: 1,
                borderRadius: "18px",
                backgroundColor: alpha(view.shadowColor, 0.07),
                border: `1px solid ${alpha(view.shadowColor, 0.09)}`,
              }}
            >
              <Stack direction="row" spacing={0.8} alignItems="center">
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: "12px",
                    display: "grid",
                    placeItems: "center",
                    backgroundColor: alpha("#ffffff", 0.08),
                    color: view.badgeColor,
                    flexShrink: 0,
                  }}
                >
                  <AccessTimeRoundedIcon sx={{ fontSize: "1rem" }} />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {view.notice}
                </Typography>
              </Stack>
            </Box>

            {booking.status === "Rad etildi" && booking.rejectionReason ? (
              <Box
                sx={{
                  p: 1,
                  borderRadius: "18px",
                  backgroundColor: alpha("#d96868", 0.08),
                  border: `1px solid ${alpha("#d96868", 0.14)}`,
                }}
              >
                <Typography variant="subtitle2" sx={{ color: "#a23c3c", mb: 0.3 }}>
                  Sabab
                </Typography>
                <Typography variant="body2" sx={{ color: "#6e3737", lineHeight: 1.6 }}>
                  {booking.rejectionReason}
                </Typography>
              </Box>
            ) : null}
          </Stack>
        </Box>

        <Box
          sx={{
            p: 1.2,
            borderRadius: "24px",
            backgroundColor: alpha("#ffffff", 0.05),
            border: `1px solid ${alpha("#c4b5fd", 0.12)}`,
            backdropFilter: "blur(18px)",
          }}
        >
          <Typography variant="subtitle2" sx={{ color: "#8d95a8", mb: 1 }}>
            Holat
          </Typography>

          <Stack spacing={0.8}>
            {timeline.map((item) => (
              <Stack
                key={item.title}
                direction="row"
                spacing={0.75}
                alignItems="flex-start"
                sx={{
                  p: 0.85,
                  borderRadius: "16px",
                  backgroundColor: item.active ? alpha(item.color, 0.12) : alpha("#ffffff", 0.04),
                }}
              >
                <RadioButtonCheckedRoundedIcon
                  sx={{
                    fontSize: "0.95rem",
                    mt: 0.15,
                    color: item.active ? item.color : "#c6ccda",
                  }}
                />

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: item.active ? "#f8fafc" : "#8890a4" }}
                  >
                    {item.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#8d95a8" }}>
                    {item.note}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>

      {booking.status === "Tugallandi" && onReset ? (
        <Button
          fullWidth
          variant="contained"
          onClick={onReset}
          sx={{ minHeight: 54, borderRadius: "18px", fontSize: "1rem" }}
        >
          Yangi navbat olish
        </Button>
      ) : booking.status === "Rad etildi" && onReset ? (
        <Button
          fullWidth
          variant="contained"
          onClick={onReset}
          sx={{ minHeight: 54, borderRadius: "18px", fontSize: "1rem" }}
        >
          Boshqa vaqt tanlash
        </Button>
      ) : (
        <Button
          fullWidth
          variant="contained"
          disabled
          sx={{
            minHeight: 54,
            borderRadius: "18px",
            fontSize: "1rem",
            color: "#fff",
            opacity: 1,
            backgroundColor: "#0f0f0f",
            "&.Mui-disabled": {
              color: "#fff",
              backgroundColor: "#0f0f0f",
              opacity: 0.92,
            },
          }}
        >
          Javob kutilmoqda
        </Button>
      )}
    </Stack>
  );
}

function formatMoney(value: number) {
  return `${value.toLocaleString("uz-UZ")} so'm`;
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
      spacing={0.7}
      alignItems="center"
      sx={{
        px: 1,
        py: 0.9,
        borderRadius: "16px",
        backgroundColor: alpha("#ffffff", 0.06),
        border: `1px solid ${alpha("#c4b5fd", 0.12)}`,
      }}
    >
      <Box sx={{ color: "#8d96ad", display: "grid", placeItems: "center" }}>{icon}</Box>
      <Typography variant="body2" sx={{ fontSize: "0.94rem", color: "#f8fafc" }}>
        {label}
      </Typography>
    </Stack>
  );
}

function getNotificationView(status: BookingStatus) {
  if (status === "Rad etildi") {
    return {
      title: "Rad etildi",
      description: "Bu vaqt tasdiqlanmadi.",
      shortStatus: "Rad etildi",
      badgeBg: alpha("#d96868", 0.16),
      badgeColor: "#a23c3c",
      shadowColor: "#d96868",
      notice: "Boshqa vaqt tanlab yana yuborishingiz mumkin.",
      heroIcon: <ReportProblemRoundedIcon sx={{ fontSize: "3rem" }} />,
    };
  }

  if (status === "Tasdiqlandi") {
    return {
      title: "Qabul qilindi",
      description: "Bron barber tomonidan tasdiqlandi.",
      shortStatus: "Qabul qilindi",
      badgeBg: alpha("#3aa66f", 0.16),
      badgeColor: "#1f7d4c",
      shadowColor: "#3aa66f",
      notice: "Belgilangan vaqtda kelishingiz mumkin.",
      heroIcon: <CheckCircleRoundedIcon sx={{ fontSize: "3rem" }} />,
    };
  }

  if (status === "Jarayonda") {
    return {
      title: "Jarayonda",
      description: "Xizmat boshlangan.",
      shortStatus: "Jarayonda",
      badgeBg: alpha("#5a7bd8", 0.16),
      badgeColor: "#3354b8",
      shadowColor: "#5a7bd8",
      notice: "Barber hozir siz bilan ishlayapti.",
      heroIcon: <ContentCutRoundedIcon sx={{ fontSize: "2.8rem" }} />,
    };
  }

  if (status === "Tugallandi") {
    return {
      title: "Yakunlandi",
      description: "Xizmat tugadi.",
      shortStatus: "Tugatildi",
      badgeBg: alpha("#d5a546", 0.18),
      badgeColor: "#946f16",
      shadowColor: "#d5a546",
      notice: "Xohlasangiz yangi navbat olishingiz mumkin.",
      heroIcon: <CheckCircleRoundedIcon sx={{ fontSize: "3rem" }} />,
    };
  }

  return {
    title: "Javob kutilmoqda",
    description: "Barber ko'rib chiqmoqda.",
    shortStatus: "Kutilmoqda",
    badgeBg: alpha("#d5a546", 0.16),
    badgeColor: "#946f16",
    shadowColor: "#d5a546",
    notice: "Holat realtime yangilanadi.",
    heroIcon: <AccessTimeRoundedIcon sx={{ fontSize: "3rem" }} />,
  };
}

function getTimeline(status: BookingStatus) {
  if (status === "Rad etildi") {
    return [
      {
        title: "Yuborildi",
        note: "So'rov ketdi",
        active: true,
        color: "#d5a546",
      },
      {
        title: "Rad etildi",
        note: "Tasdiqlanmadi",
        active: true,
        color: "#d96868",
      },
      {
        title: "Qayta tanlash",
        note: "Yangi vaqt olish mumkin",
        active: false,
        color: "#c6ccda",
      },
    ];
  }

  const activeMap = {
    sent: true,
    accepted: status === "Tasdiqlandi" || status === "Jarayonda" || status === "Tugallandi",
    started: status === "Jarayonda" || status === "Tugallandi",
    finished: status === "Tugallandi",
  };

  return [
    {
      title: "Yuborildi",
      note: "So'rov ketdi",
      active: activeMap.sent,
      color: "#d5a546",
    },
    {
      title: "Qabul qilindi",
      note: "Tasdiqlandi",
      active: activeMap.accepted,
      color: "#3aa66f",
    },
    {
      title: "Jarayonda",
      note: "Xizmat boshlandi",
      active: activeMap.started,
      color: "#5a7bd8",
    },
    {
      title: "Yakunlandi",
      note: "Tugadi",
      active: activeMap.finished,
      color: "#22d3ee",
    },
  ];
}
