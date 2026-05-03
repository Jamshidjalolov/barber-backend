import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import {
  alpha,
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { BookingItem } from "../../types";

interface DeleteBookingDialogProps {
  open: boolean;
  booking: BookingItem | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteBookingDialog({
  open,
  booking,
  onClose,
  onConfirm,
}: DeleteBookingDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: "28px",
          width: "min(520px, calc(100% - 24px))",
          background:
            "linear-gradient(180deg, rgba(18,18,31,0.96) 0%, rgba(9,10,20,0.94) 100%)",
          border: `1px solid ${alpha("#c4b5fd", 0.16)}`,
          boxShadow: "0 34px 100px rgba(0,0,0,0.58)",
        },
      }}
    >
      <DialogContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack spacing={2.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "18px",
                  backgroundColor: alpha("#fb7185", 0.13),
                  color: "#fecdd3",
                  border: `1px solid ${alpha("#fb7185", 0.18)}`,
                }}
              >
                <WarningAmberRoundedIcon />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ mb: 0.4 }}>
                  Bookingni o'chirish
                </Typography>
                <Typography variant="body2" color="text.primary">
                  Bu booking ro'yxatdan olib tashlanadi
                </Typography>
              </Box>
            </Stack>

            <IconButton
              onClick={onClose}
              sx={{
                width: 42,
                height: 42,
                borderRadius: "14px",
                border: `1px solid ${alpha("#c4b5fd", 0.14)}`,
                backgroundColor: alpha("#ffffff", 0.06),
              }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>

          {booking ? (
            <Box
              sx={{
                p: 2,
                borderRadius: "20px",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.04) 100%)",
                border: `1px solid ${alpha("#c4b5fd", 0.14)}`,
              }}
            >
              <Typography variant="subtitle1">{booking.customer}</Typography>
              <Typography variant="body2" color="text.primary">
                {booking.barber} / {booking.time} / {booking.id}
              </Typography>
            </Box>
          ) : null}

          <Typography variant="body1" color="text.primary">
            Haqiqatan ham bu bookingni o'chirmoqchimisiz? Tasdiqlasangiz, u
            jadvaldan olib tashlanadi.
          </Typography>

          <Stack direction={{ xs: "column-reverse", sm: "row" }} spacing={1.5}>
            <Button
              onClick={onClose}
              fullWidth
              variant="outlined"
              sx={{
                minHeight: 50,
                borderRadius: "18px",
                textTransform: "none",
                borderColor: alpha("#c4b5fd", 0.18),
                color: "text.secondary",
              }}
            >
              Bekor qilish
            </Button>
            <Button
              onClick={onConfirm}
              fullWidth
              variant="contained"
              sx={{
                minHeight: 50,
                borderRadius: "18px",
                textTransform: "none",
                fontWeight: 700,
                background: "linear-gradient(135deg, #fb7185 0%, #be123c 100%)",
                boxShadow: "none",
                "&:hover": {
                  background: "linear-gradient(135deg, #fb7185 0%, #9f1239 100%)",
                },
              }}
            >
              Ha, o'chirilsin
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
