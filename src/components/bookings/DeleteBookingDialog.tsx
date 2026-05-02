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
                  backgroundColor: alpha("#d94f4f", 0.12),
                  color: "#c53d3d",
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
                border: `1px solid ${alpha("#121212", 0.08)}`,
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
                backgroundColor: (theme) => theme.palette.background.paper,
                border: `1px solid ${alpha("7a5d31", 0.08)}`,
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
                borderColor: alpha("#121212", 0.12),
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
                backgroundColor: "#d94f4f",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#c53d3d",
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
