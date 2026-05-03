import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
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

interface BookingDetailsDialogProps {
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
    return "Narx yo'q";
  }
  return `${value.toLocaleString("uz-UZ")} so'm`;
}

function getStatusTone(status: BookingItem["status"]) {
  if (status === "Tugallandi") {
    return { bg: alpha("#34d399", 0.12), color: "#86efac" };
  }
  if (status === "Rad etildi") {
    return { bg: alpha("#fb7185", 0.12), color: "#fecdd3" };
  }
  if (status === "Jarayonda") {
    return { bg: alpha("#22d3ee", 0.12), color: "#67e8f9" };
  }
  if (status === "Tasdiqlandi") {
    return { bg: alpha("#34d399", 0.12), color: "#86efac" };
  }
  return { bg: alpha("#f6c85f", 0.12), color: "#fde68a" };
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
        p: 1.05,
        borderRadius: "16px",
        backgroundColor: alpha("#ffffff", 0.06),
        border: `1px solid ${alpha("#c4b5fd", 0.12)}`,
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "12px",
          display: "grid",
          placeItems: "center",
          color: "#67e8f9",
          backgroundColor: alpha("#22d3ee", 0.12),
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: (theme) => theme.palette.text.secondary }}>
          {label}
        </Typography>
        <Typography variant="subtitle2" sx={{ color: (theme) => theme.palette.text.primary }}>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

export function BookingDetailsDialog({
  open,
  booking,
  onClose,
}: BookingDetailsDialogProps) {
  if (!booking) {
    return null;
  }

  const tone = getStatusTone(booking.status);

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
          background:
            "linear-gradient(180deg, rgba(18,18,31,0.96) 0%, rgba(9,10,20,0.94) 100%)",
          border: `1px solid ${alpha("#c4b5fd", 0.16)}`,
        },
      }}
    >
      <DialogTitle sx={{ px: 2.4, py: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.2}>
          <Box>
            <Typography variant="h5">Bron tafsiloti</Typography>
            <Typography variant="body2" color="text.primary">
              Kim band qilgani va to'liq ma'lumot shu yerda.
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 2.4, py: 0.4 }}>
        <Stack spacing={1.35}>
          <Box
            sx={{
              p: 1.35,
              borderRadius: "22px",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.04) 100%)",
              border: `1px solid ${alpha("#c4b5fd", 0.14)}`,
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
            >
              <Box>
                <Typography variant="h6">{booking.customer}</Typography>
                <Typography variant="body2" color="text.primary">
                  #{booking.id}
                </Typography>
              </Box>
              <Chip
                label={booking.status}
                sx={{
                  backgroundColor: tone.bg,
                  color: tone.color,
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
              icon={<AccessTimeRoundedIcon sx={{ fontSize: "1rem" }} />}
              label="Vaqt"
              value={`${booking.date} | ${formatTimeLabel(booking.time)}`}
            />
            <InfoRow
              icon={<CallRoundedIcon sx={{ fontSize: "1rem" }} />}
              label="Telefon"
              value={booking.phone}
            />
            <InfoRow
              icon={<ContentCutRoundedIcon sx={{ fontSize: "1rem" }} />}
              label="Xizmat"
              value={booking.service}
            />
            <InfoRow
              icon={<PaymentsRoundedIcon sx={{ fontSize: "1rem" }} />}
              label="Yakuniy narx"
              value={formatMoney(booking.finalPrice ?? booking.originalPrice)}
            />
            <InfoRow
              icon={<PersonRoundedIcon sx={{ fontSize: "1rem" }} />}
              label="Mijoz"
              value={booking.customer}
            />
            <InfoRow
              icon={<StickyNote2RoundedIcon sx={{ fontSize: "1rem" }} />}
              label="Izoh"
              value={booking.note?.trim() || "Izoh qoldirilmagan"}
            />
          </Box>

          {typeof booking.appliedDiscountPercent === "number" ? (
            <Box
              sx={{
                px: 1.2,
                py: 0.95,
                borderRadius: "16px",
                backgroundColor: alpha("#34d399", 0.1),
                border: `1px solid ${alpha("#34d399", 0.16)}`,
              }}
            >
              <Typography variant="body2" sx={{ color: "#86efac", fontWeight: 700 }}>
                Ushbu bron uchun {booking.appliedDiscountPercent}% skidka qo'llangan.
              </Typography>
            </Box>
          ) : null}

          {booking.status === "Rad etildi" && booking.rejectionReason ? (
            <Box
              sx={{
                px: 1.2,
                py: 0.95,
                borderRadius: "16px",
                backgroundColor: alpha("#fb7185", 0.1),
                border: `1px solid ${alpha("#fb7185", 0.16)}`,
              }}
            >
              <Typography variant="caption" sx={{ color: "#fecdd3", fontWeight: 700 }}>
                Rad etish sababi
              </Typography>
              <Typography variant="body2" sx={{ color: "#ffe4e6", mt: 0.35 }}>
                {booking.rejectionReason}
              </Typography>
            </Box>
          ) : null}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
