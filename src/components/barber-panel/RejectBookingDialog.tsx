import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import {
  alpha,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { BookingItem } from "../../types";

interface RejectBookingDialogProps {
  booking: BookingItem | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const reasonPresets = [
  "Bu vaqt allaqachon band bo'lib qoldi",
  "Barber shu paytda tanaffusda bo'ladi",
  "Mijoz boshqa vaqt tanlashi kerak",
];

export function RejectBookingDialog({
  booking,
  open,
  onClose,
  onConfirm,
}: RejectBookingDialogProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      setReason("");
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: "28px",
          p: 0.3,
          background:
            "linear-gradient(180deg, rgba(255,252,247,0.98) 0%, rgba(255,255,255,1) 100%)",
        },
      }}
    >
      <DialogTitle sx={{ pb: 0.7 }}>
        <Stack direction="row" spacing={1.1} alignItems="center">
          <Stack
            sx={{
              width: 42,
              height: 42,
              borderRadius: "14px",
              display: "grid",
              placeItems: "center",
              color: "#a23c3c",
              bgcolor: alpha("#d96868", 0.12),
            }}
          >
            <ReportProblemRoundedIcon />
          </Stack>
          <div>
            <Typography variant="h6">Bronni rad etish</Typography>
            <Typography variant="body2" color="text.secondary">
              {booking ? `${booking.customer} uchun sabab yozing.` : "Sebab ko'rsating."}
            </Typography>
          </div>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: "8px !important" }}>
        <Stack spacing={1.1}>
          <Stack direction="row" flexWrap="wrap" gap={0.75}>
            {reasonPresets.map((item) => (
              <Button
                key={item}
                variant="outlined"
                color="inherit"
                onClick={() => setReason(item)}
                sx={{
                  minHeight: 36,
                  px: 1.25,
                  borderRadius: "999px",
                  borderColor: alpha("#111111", 0.08),
                }}
              >
                {item}
              </Button>
            ))}
          </Stack>

          <TextField
            fullWidth
            multiline
            minRows={4}
            placeholder="Masalan, shu vaqtda boshqa mijoz bilan bandman. Iltimos, boshqa slot tanlang."
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 2.3, pb: 2, pt: 0.8 }}>
        <Button onClick={onClose} variant="outlined" sx={{ minHeight: 44, borderRadius: "14px" }}>
          Bekor qilish
        </Button>
        <Button
          onClick={() => onConfirm(reason)}
          variant="contained"
          color="error"
          disabled={!reason.trim()}
          sx={{ minHeight: 44, borderRadius: "14px" }}
        >
          Rad etishni tasdiqlash
        </Button>
      </DialogActions>
    </Dialog>
  );
}
