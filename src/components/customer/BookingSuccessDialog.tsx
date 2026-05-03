import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import {
  alpha,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { BarberProfile, CustomerProfile } from "../../types";

interface BookingSuccessDialogProps {
  open: boolean;
  barber: BarberProfile | null;
  customer: CustomerProfile | null;
  time: string | null;
  onClose: () => void;
}

export function BookingSuccessDialog({
  open,
  barber,
  customer,
  time,
  onClose,
}: BookingSuccessDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
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
      <DialogTitle sx={{ pb: 0.5 }}>Navbat qabul qilindi</DialogTitle>
      <DialogContent sx={{ pb: 2.4 }}>
        <Stack spacing={1.4}>
          <Box
            sx={{
              width: 58,
              height: 58,
              borderRadius: "20px",
              display: "grid",
              placeItems: "center",
              backgroundColor: alpha("#34d399", 0.12),
              color: "#86efac",
              border: `1px solid ${alpha("#34d399", 0.16)}`,
            }}
          >
            <CheckCircleRoundedIcon sx={{ fontSize: "1.8rem" }} />
          </Box>

          <Typography variant="body1" color="text.primary">
            Tanlangan barber va vaqt saqlandi. Bu hozircha frontend demo, lekin
            slot darrov band holatiga o&apos;tadi.
          </Typography>

          <Box
            sx={{
              p: 1.3,
              borderRadius: "18px",
              backgroundColor: alpha("#ffffff", 0.06),
              border: `1px solid ${alpha("#c4b5fd", 0.12)}`,
            }}
          >
            <Stack spacing={0.45}>
              <Typography variant="subtitle2">Mijoz: {customer?.name ?? "-"}</Typography>
              <Typography variant="body2" color="text.primary">
                Telefon: {customer?.phone ?? "-"}
              </Typography>
              <Typography variant="body2" color="text.primary">
                Barber: {barber?.name ?? "-"}
              </Typography>
              <Typography variant="body2" color="text.primary">
                Vaqt: {time ?? "-"}
              </Typography>
            </Stack>
          </Box>

          <Button onClick={onClose} variant="contained" sx={{ minHeight: 46 }}>
            Yopish
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
