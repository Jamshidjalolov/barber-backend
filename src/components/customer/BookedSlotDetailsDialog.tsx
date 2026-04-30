import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import StickyNote2RoundedIcon from "@mui/icons-material/StickyNote2Rounded";
import {
  alpha,
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { ReactNode } from "react";
import { BookingItem } from "../../types";

interface BookedSlotDetailsDialogProps {
  open: boolean;
  booking: BookingItem | null;
  onClose: () => void;
}

function formatTimeLabel(time: string) {
  const [rawHour, rawMinute] = time.split(":").map(Number);
  const suffix = rawHour >= 12 ? "PM" : "AM";
  const hour = rawHour % 12 || 12;
  return `${hour}:${String(rawMinute).padStart(2, "0")} ${suffix}`;
}

function formatMoney(value?: number) {
  if (typeof value !== "number") {
    return "Kiritilmagan";
  }

  return `${value.toLocaleString("uz-UZ")} so'm`;
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        p: 1,
        borderRadius: "16px",
        backgroundColor: "#fff",
        border: `1px solid ${alpha("#111111", 0.05)}`,
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "12px",
          display: "grid",
          placeItems: "center",
          backgroundColor: alpha("#d5a546", 0.12),
          color: "#a37a22",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: "#8a91a3" }}>
          {label}
        </Typography>
        <Typography variant="subtitle2">{value}</Typography>
      </Box>
    </Stack>
  );
}

export function BookedSlotDetailsDialog({
  open,
  booking,
  onClose,
}: BookedSlotDetailsDialogProps) {
  if (!booking) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: "28px",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle sx={{ px: 2.4, py: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Box>
            <Typography variant="h5">Bu vaqt band</Typography>
            <Typography variant="body2" color="text.secondary">
              Kim bron qilgani va qaysi xizmatga yozilgani shu yerda ko'rinadi.
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 2.4, py: 0.5 }}>
        <Stack spacing={1.2}>
          <Box
            sx={{
              p: 1.25,
              borderRadius: "20px",
              background:
                "linear-gradient(180deg, rgba(255,252,247,0.98) 0%, rgba(247,239,226,0.94) 100%)",
              border: `1px solid ${alpha("#111111", 0.05)}`,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
              <Box>
                <Typography variant="h6">{booking.customer || "Ma'lumot topilmadi"}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {booking.date} | {formatTimeLabel(booking.time)}
                </Typography>
              </Box>
              <Chip
                label={booking.status}
                sx={{
                  backgroundColor: alpha("#d5a546", 0.14),
                  color: "#946f16",
                  fontWeight: 700,
                }}
              />
            </Stack>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
              gap: 1,
            }}
          >
            <InfoRow
              icon={<PersonRoundedIcon sx={{ fontSize: "1rem" }} />}
              label="Kim bron qilgan"
              value={booking.customer || "Ma'lumot topilmadi"}
            />
            <InfoRow
              icon={<CallRoundedIcon sx={{ fontSize: "1rem" }} />}
              label="Telefon"
              value={booking.phone || "Ma'lumot topilmadi"}
            />
            <InfoRow
              icon={<ContentCutRoundedIcon sx={{ fontSize: "1rem" }} />}
              label="Qaysi xizmat"
              value={booking.service || "Xizmat ko'rsatilmagan"}
            />
            <InfoRow
              icon={<AccessTimeRoundedIcon sx={{ fontSize: "1rem" }} />}
              label="Sana va vaqt"
              value={`${booking.date} | ${formatTimeLabel(booking.time)}`}
            />
            <InfoRow
              icon={<ConfirmationNumberRoundedIcon sx={{ fontSize: "1rem" }} />}
              label="Bron ID"
              value={`#${booking.id}`}
            />
            <InfoRow
              icon={<PaymentsRoundedIcon sx={{ fontSize: "1rem" }} />}
              label="Narx"
              value={formatMoney(booking.finalPrice ?? booking.originalPrice)}
            />
          </Box>

          <Box
            sx={{
              px: 1.2,
              py: 0.95,
              borderRadius: "16px",
              backgroundColor: alpha("#111111", 0.03),
              border: `1px solid ${alpha("#111111", 0.05)}`,
            }}
          >
            <Stack direction="row" spacing={0.8} alignItems="center">
              <StickyNote2RoundedIcon sx={{ fontSize: "1rem", color: "#8a91a3" }} />
              <Typography variant="body2" sx={{ color: "#5f6473" }}>
                {booking.note?.trim() || "Qo'shimcha izoh qoldirilmagan"}
              </Typography>
            </Stack>
          </Box>

          {typeof booking.appliedDiscountPercent === "number" ? (
            <Box
              sx={{
                px: 1.2,
                py: 0.95,
                borderRadius: "16px",
                backgroundColor: alpha("#3aa66f", 0.08),
                border: `1px solid ${alpha("#3aa66f", 0.12)}`,
              }}
            >
              <Typography variant="body2" sx={{ color: "#1f7d4c", fontWeight: 700 }}>
                Ushbu bron uchun {booking.appliedDiscountPercent}% skidka qo'llangan.
              </Typography>
            </Box>
          ) : null}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
