import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
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

interface LogoutConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  subtitle?: string;
  message?: string;
  confirmLabel?: string;
}

export function LogoutConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Tizimdan chiqish",
  subtitle = "Sessiya yakunlanadi",
  message = "Haqiqatan ham chiqmoqchimisiz? Tasdiqlasangiz, akkauntingizdan chiqasiz.",
  confirmLabel = "Ha, chiqaman",
}: LogoutConfirmDialogProps) {
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
                  backgroundColor: alpha("#f6c85f", 0.14),
                  color: "#fde68a",
                  border: `1px solid ${alpha("#f6c85f", 0.18)}`,
                }}
              >
                <WarningAmberRoundedIcon />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ mb: 0.4 }}>
                  {title}
                </Typography>
                <Typography variant="body2" color="text.primary" sx={{ opacity: 0.9 }}>
                  {subtitle}
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

          <Box
            sx={{
              p: 2,
              borderRadius: "20px",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.04) 100%)",
              border: `1px solid ${alpha("#c4b5fd", 0.14)}`,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <Typography variant="body1" color="text.primary" sx={{ color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.92)' : undefined }}>
              {message}
            </Typography>
          </Box>

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
              startIcon={<LogoutRoundedIcon />}
              sx={{
                minHeight: 50,
                borderRadius: "18px",
                textTransform: "none",
                fontWeight: 700,
                boxShadow: "none",
              }}
            >
              {confirmLabel}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
