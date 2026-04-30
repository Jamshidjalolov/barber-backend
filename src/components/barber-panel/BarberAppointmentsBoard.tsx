import CallRoundedIcon from "@mui/icons-material/CallRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import { alpha, Box, Button, Chip, IconButton, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";
import { BookingItem, BookingStatus } from "../../types";

export type BarberScheduleFilter = "all" | "pending" | "completed" | "rejected";

interface BarberAppointmentsBoardProps {
  items: BookingItem[];
  selectedDateLabel: string;
  total: number;
  pending: number;
  completed: number;
  rejected: number;
  filter: BarberScheduleFilter;
  highlightedBookingId: string | null;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrevDate: () => void;
  onNextDate: () => void;
  onFilterChange: (filter: BarberScheduleFilter) => void;
  onOpenDetails: (booking: BookingItem) => void;
  onCopyPhone: (booking: BookingItem) => void;
  onAdvanceStatus: (booking: BookingItem) => void;
  onRejectBooking: (booking: BookingItem) => void;
}

export function BarberAppointmentsBoard({
  items,
  selectedDateLabel,
  total,
  pending,
  completed,
  rejected,
  filter,
  highlightedBookingId,
  canGoPrev,
  canGoNext,
  onPrevDate,
  onNextDate,
  onFilterChange,
  onOpenDetails,
  onCopyPhone,
  onAdvanceStatus,
  onRejectBooking,
}: BarberAppointmentsBoardProps) {
  return (
    <Box
      sx={{
        p: { xs: 1.5, md: 1.8 },
        borderRadius: "28px",
        backgroundColor: "#fff",
        border: `1px solid ${alpha("#111111", 0.06)}`,
        boxShadow: "0 24px 56px rgba(17,17,17,0.05)",
      }}
    >
      <Stack spacing={1.6}>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={1.4}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", lg: "center" }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontSize: { xs: "1.55rem", md: "1.8rem" } }}>
              Kunlik jadval
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
              Bugungi navbatlar, statuslar va mijozlar bilan ishlash shu yerda.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              onClick={onPrevDate}
              disabled={!canGoPrev}
              sx={{
                width: 44,
                height: 44,
                border: `1px solid ${alpha("#111111", 0.08)}`,
              }}
            >
              <ChevronLeftRoundedIcon />
            </IconButton>

            <Box sx={{ textAlign: "center", minWidth: { sm: 220 } }}>
              <Typography variant="h6">Tanlangan kun</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedDateLabel}
              </Typography>
            </Box>

            <IconButton
              onClick={onNextDate}
              disabled={!canGoNext}
              sx={{
                width: 44,
                height: 44,
                border: `1px solid ${alpha("#111111", 0.08)}`,
              }}
            >
              <ChevronRightRoundedIcon />
            </IconButton>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <LegendChip tone="pending" label={`${pending} ta kutilmoqda`} />
          <LegendChip tone="done" label={`${completed} ta tugallangan`} />
          <LegendChip tone="rejected" label={`${rejected} ta rad etilgan`} />
          <LegendChip tone="neutral" label={`${total} ta jami`} />
        </Stack>

        <Box
          sx={{
            p: 0.55,
            borderRadius: "20px",
            backgroundColor: alpha("#111111", 0.04),
            display: "inline-grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 0.6,
            width: { xs: "100%", md: "fit-content" },
          }}
        >
          {[
            { key: "all", label: "Hammasi" },
            { key: "pending", label: "Kutilmoqda" },
            { key: "completed", label: "Tugallangan" },
            { key: "rejected", label: "Rad etilgan" },
          ].map((item) => {
            const active = filter === item.key;

            return (
              <Button
                key={item.key}
                onClick={() => onFilterChange(item.key as BarberScheduleFilter)}
                variant={active ? "contained" : "text"}
                sx={{
                  minHeight: 44,
                  px: 2,
                  borderRadius: "16px",
                  boxShadow: active ? "0 10px 20px rgba(17,17,17,0.08)" : "none",
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>

        <Stack spacing={1.05}>
          {items.length === 0 ? (
            <Box
              sx={{
                p: 2.2,
                borderRadius: "22px",
                border: `1px dashed ${alpha("#111111", 0.12)}`,
                textAlign: "center",
              }}
            >
              <Typography variant="body1">
                {total > 0
                  ? "Bu kunda navbat bor, lekin hozirgi filter bo'yicha ko'rinmayapti."
                  : "Bu kunga navbat topilmadi."}
              </Typography>
            </Box>
          ) : (
            items.map((booking) => {
              const isNew = highlightedBookingId === booking.id;
              const statusView = getStatusView(booking.status);

              return (
                <Box
                  key={booking.id}
                  onClick={() => onOpenDetails(booking)}
                  sx={{
                    p: { xs: 1.35, md: 1.5 },
                    borderRadius: "24px",
                    border: `1px solid ${alpha("#111111", isNew ? 0.12 : 0.06)}`,
                    background: isNew
                      ? "linear-gradient(180deg, rgba(255,251,241,1) 0%, rgba(255,255,255,1) 100%)"
                      : "#fff",
                    boxShadow: isNew
                      ? "0 18px 40px rgba(213,165,70,0.12)"
                      : "0 10px 24px rgba(17,17,17,0.03)",
                    cursor: "pointer",
                    transition: "transform 160ms ease, box-shadow 160ms ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: isNew
                        ? "0 22px 42px rgba(213,165,70,0.14)"
                        : "0 16px 28px rgba(17,17,17,0.06)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) auto" },
                      gap: 1.2,
                      alignItems: "start",
                    }}
                  >
                    <Stack spacing={1}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={0.8}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="h6">{booking.customer}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            #{booking.id}
                          </Typography>
                        </Box>

                        {isNew ? (
                          <Chip
                            size="small"
                            label="Yangi bron"
                            sx={{
                              backgroundColor: alpha("#d5a546", 0.16),
                              color: "#946f16",
                            }}
                          />
                        ) : null}
                      </Stack>

                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1.4}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        <InfoLine icon={<ScheduleRoundedIcon sx={{ fontSize: "1rem" }} />} label={formatTimeLabel(booking.time)} />
                        <InfoLine icon={<CallRoundedIcon sx={{ fontSize: "1rem" }} />} label={booking.phone} />
                      </Stack>

                      <Typography variant="body2" color="text.secondary">
                        {booking.service}
                      </Typography>

                      {booking.status === "Rad etildi" && booking.rejectionReason ? (
                        <Box
                          sx={{
                            px: 1,
                            py: 0.85,
                            borderRadius: "14px",
                            backgroundColor: alpha("#d96868", 0.08),
                          }}
                        >
                          <Typography variant="caption" sx={{ color: "#a23c3c", fontWeight: 700 }}>
                            Rad etish sababi
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#6d3f3f", mt: 0.2 }}>
                            {booking.rejectionReason}
                          </Typography>
                        </Box>
                      ) : null}
                    </Stack>

                    <Stack direction={{ xs: "row", md: "column" }} spacing={0.9} alignItems={{ md: "flex-end" }}>
                      <Chip
                        label={statusView.label}
                        sx={{
                          backgroundColor: statusView.bg,
                          color: statusView.color,
                        }}
                      />

                      {booking.status === "Tugallandi" ? (
                        <Chip
                          icon={<CheckCircleRoundedIcon />}
                          label="Yakunlangan"
                          sx={{
                            backgroundColor: alpha("#39a96b", 0.12),
                            color: "#1f7d4c",
                            "& .MuiChip-icon": { color: "#1f7d4c" },
                          }}
                        />
                      ) : booking.status === "Rad etildi" ? (
                        <Chip
                          icon={<ReportProblemRoundedIcon />}
                          label="Rad etilgan"
                          sx={{
                            backgroundColor: alpha("#d96868", 0.12),
                            color: "#a23c3c",
                            "& .MuiChip-icon": { color: "#a23c3c" },
                          }}
                        />
                      ) : (
                        <Stack direction="row" spacing={0.8}>
                          <Button
                            variant="outlined"
                            onClick={(event) => {
                              event.stopPropagation();
                              onCopyPhone(booking);
                            }}
                            sx={{ minHeight: 40, borderRadius: "14px" }}
                          >
                            Qo&apos;ng&apos;iroq
                          </Button>
                          {booking.status === "Kutilmoqda" ? (
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={(event) => {
                                event.stopPropagation();
                                onRejectBooking(booking);
                              }}
                              sx={{ minHeight: 40, borderRadius: "14px" }}
                            >
                              Rad etish
                            </Button>
                          ) : null}
                          <Button
                            variant="contained"
                            onClick={(event) => {
                              event.stopPropagation();
                              onAdvanceStatus(booking);
                            }}
                            sx={{ minHeight: 40, borderRadius: "14px" }}
                          >
                            {getActionLabel(booking.status)}
                          </Button>
                        </Stack>
                      )}
                    </Stack>
                  </Box>
                </Box>
              );
            })
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

function LegendChip({
  label,
  tone,
}: {
  label: string;
  tone: "pending" | "done" | "neutral" | "rejected";
}) {
  const styles =
    tone === "done"
      ? { bg: alpha("#39a96b", 0.12), color: "#1f7d4c", icon: "#2daa62" }
      : tone === "rejected"
        ? { bg: alpha("#d96868", 0.12), color: "#a23c3c", icon: "#d96868" }
      : tone === "pending"
        ? { bg: alpha("#d5a546", 0.12), color: "#986c00", icon: "#d6a622" }
        : { bg: alpha("#111111", 0.05), color: "#6b7488", icon: "#c0c5d1" };

  return (
    <Stack
      direction="row"
      spacing={0.65}
      alignItems="center"
      sx={{
        px: 1.05,
        py: 0.7,
        borderRadius: "999px",
        backgroundColor: styles.bg,
      }}
    >
      <RadioButtonUncheckedRoundedIcon sx={{ fontSize: "0.8rem", color: styles.icon }} />
      <Typography variant="body2" sx={{ color: styles.color }}>
        {label}
      </Typography>
    </Stack>
  );
}

function InfoLine({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <Stack direction="row" spacing={0.65} alignItems="center">
      <Box sx={{ color: "#8d95a8", display: "grid", placeItems: "center" }}>{icon}</Box>
      <Typography variant="body1">{label}</Typography>
    </Stack>
  );
}

function formatTimeLabel(time: string) {
  const [rawHour, rawMinute] = time.split(":").map(Number);
  const suffix = rawHour >= 12 ? "PM" : "AM";
  const hour = rawHour % 12 || 12;
  return `${hour}:${String(rawMinute).padStart(2, "0")} ${suffix}`;
}

function getStatusView(status: BookingStatus) {
  if (status === "Rad etildi") {
    return {
      label: "Rad etildi",
      bg: alpha("#d96868", 0.14),
      color: "#a23c3c",
    };
  }

  if (status === "Tugallandi") {
    return {
      label: "Tayyor",
      bg: alpha("#39a96b", 0.14),
      color: "#1f7d4c",
    };
  }

  if (status === "Jarayonda") {
    return {
      label: "Jarayonda",
      bg: alpha("#5a7bd8", 0.12),
      color: "#3354b8",
    };
  }

  if (status === "Tasdiqlandi") {
    return {
      label: "Qabul qilindi",
      bg: alpha("#3aa66f", 0.14),
      color: "#1f7d4c",
    };
  }

  return {
    label: "Kutilmoqda",
    bg: alpha("#d5a546", 0.14),
    color: "#946f16",
  };
}

function getActionLabel(status: BookingStatus) {
  if (status === "Kutilmoqda") {
    return "Qabul qilish";
  }

  if (status === "Tasdiqlandi") {
    return "Boshlash";
  }

  return "Tugatish";
}
