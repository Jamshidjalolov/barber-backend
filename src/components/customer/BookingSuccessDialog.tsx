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
              backgroundColor: alpha("#3aa66f", 0.12),
              color: "#1f7d4c",
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
              backgroundColor: (theme) => theme.palette.background.paper,
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
