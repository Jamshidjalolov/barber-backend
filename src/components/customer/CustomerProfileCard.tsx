import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import {
  alpha,
  Avatar,
  Box,
  Button,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { BarberProfile, CustomerProfile } from "../../types";

interface CustomerProfileCardProps {
  barber: BarberProfile;
  dateLabel: string;
  timeLabel: string;
  workHoursLabel: string;
  originalPriceLabel: string;
  finalPriceLabel: string;
  discountPercent?: number;
  serviceOptions: string[];
  value: CustomerProfile;
  onBack: () => void;
  onChange: (field: keyof CustomerProfile, nextValue: string) => void;
  onSubmit: () => void;
}

export function CustomerProfileCard({
  barber,
  dateLabel,
  timeLabel,
  workHoursLabel,
  originalPriceLabel,
  finalPriceLabel,
  discountPercent,
  serviceOptions,
  value,
  onBack,
  onChange,
  onSubmit,
}: CustomerProfileCardProps) {
  return (
    <Stack
      component={motion.div}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      spacing={{ xs: 2.2, md: 2.5 }}
    >
      <Stack direction="row" spacing={0.7} alignItems="flex-start">
        <IconButtonEdge onClick={onBack} />
        <Box>
          <Typography variant="h5" sx={{ fontSize: { xs: "1.25rem", sm: "1.4rem" } }}>
            Ma&apos;lumotlaringiz
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Deyarli tayyor
          </Typography>
        </Box>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "320px minmax(0, 1fr)" },
          gap: { xs: 1.35, md: 1.8 },
          alignItems: "start",
        }}
      >
        <Box
          sx={{
            p: 1.35,
            borderRadius: "22px",
            background:
              "linear-gradient(180deg, rgba(19,20,34,0.86) 0%, rgba(10,11,22,0.72) 100%)",
            border: `1px solid ${alpha("#c4b5fd", 0.14)}`,
            boxShadow: "0 18px 42px rgba(0,0,0,0.22)",
            backdropFilter: "blur(18px)",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "#8d96ad",
              textTransform: "uppercase",
              letterSpacing: 0,
              fontWeight: 700,
            }}
          >
            Booking summary
          </Typography>

          <Stack direction="row" spacing={0.9} alignItems="center" sx={{ mt: 1, mb: 1.1 }}>
            <Avatar
              variant="rounded"
              src={barber.photoUrl}
              sx={{
                width: 42,
                height: 42,
                borderRadius: "14px",
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

          <Box sx={{ height: 1, bgcolor: alpha("#c4b5fd", 0.12), mb: 1.05 }} />

          <Stack spacing={0.9}>
            <SummaryRow icon={<CalendarTodayRoundedIcon />} label={dateLabel} />
            <SummaryRow icon={<ScheduleRoundedIcon />} label={timeLabel} />
            <SummaryRow icon={<ScheduleRoundedIcon />} label={`Ish vaqti: ${workHoursLabel}`} />
          </Stack>

          <Box
            sx={{
              mt: 1.1,
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

            {discountPercent ? (
              <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mt: 0.55 }}>
                  <Typography variant="body2" sx={{ color: "#86efac", fontWeight: 700 }}>
                  Skidka
                </Typography>
                <Typography variant="subtitle2" sx={{ color: "#86efac" }}>
                  -{discountPercent}%
                </Typography>
              </Stack>
            ) : null}

            <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mt: 0.55 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Yakuniy narx
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                {finalPriceLabel}
              </Typography>
            </Stack>
          </Box>
        </Box>

        <Box
          sx={{
            p: { xs: 0, md: 1.35 },
            borderRadius: { xs: 0, md: "22px" },
            backgroundColor: { xs: "transparent", md: alpha("#ffffff", 0.05) },
            border: { xs: "none", md: `1px solid ${alpha("#c4b5fd", 0.12)}` },
          }}
        >
          <Stack spacing={1.2}>
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 0.55 }}>
                To&apos;liq ism
              </Typography>
              <TextField
                fullWidth
                placeholder="Masalan, Jamshid Sobirov"
                value={value.name}
                onChange={(event) => onChange("name", event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineRoundedIcon sx={{ color: "#8d96ad" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ mb: 0.55 }}>
                Xizmat turi
              </Typography>
              <TextField
                fullWidth
                select
                value={value.service}
                onChange={(event) => onChange("service", event.target.value)}
              >
                {serviceOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ mb: 0.55 }}>
                Telefon raqami
              </Typography>
              <TextField
                fullWidth
                placeholder="+998 90 123 45 67"
                value={value.phone}
                onChange={(event) => onChange("phone", event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIphoneRoundedIcon sx={{ color: "#8d96ad" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ mb: 0.55 }}>
                Izoh
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={3}
                placeholder="Kerak bo'lsa qisqa izoh yozing"
                value={value.note}
                onChange={(event) => onChange("note", event.target.value)}
              />
            </Box>
          </Stack>
        </Box>
      </Box>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ textAlign: "center", pt: 0.2 }}
      >
        Navbatdan oldin sizga eslatma yuboramiz
      </Typography>

      <Box sx={{ pt: { xs: 2.5, sm: 3 }, display: "flex", justifyContent: { md: "flex-end" } }}>
        <Button
          fullWidth
          variant="contained"
          onClick={onSubmit}
          disabled={!value.name.trim() || !value.phone.trim()}
          sx={{
            minHeight: 56,
            maxWidth: { md: 340 },
            borderRadius: "18px",
            fontSize: "1rem",
            boxShadow: "0 14px 26px rgba(17,17,17,0.14)",
          }}
        >
          So'rovni yuborish
        </Button>
      </Box>
    </Stack>
  );
}

function IconButtonEdge({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      sx={{
        minWidth: 0,
        width: 34,
        height: 34,
        borderRadius: "50%",
        p: 0,
        color: "#f8fafc",
        backgroundColor: alpha("#ffffff", 0.06),
        border: `1px solid ${alpha("#c4b5fd", 0.12)}`,
        mt: -0.15,
      }}
    >
      <ArrowBackRoundedIcon />
    </Button>
  );
}

function SummaryRow({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <Stack direction="row" spacing={0.8} alignItems="center">
      <Box sx={{ color: "#8d96ad", display: "grid", placeItems: "center" }}>{icon}</Box>
      <Typography variant="body2" sx={{ fontSize: "1rem", color: "#f8fafc" }}>
        {label}
      </Typography>
    </Stack>
  );
}
