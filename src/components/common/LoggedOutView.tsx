import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import { alpha, Box, Button, Stack, Typography } from "@mui/material";
import { AdminUser } from "../../types";
import { BrandLogo } from "./BrandLogo";

interface LoggedOutViewProps {
  lastUser: AdminUser;
  onLoginAgain: () => void;
  onBackToCustomer?: () => void;
}

export function LoggedOutView({
  lastUser,
  onLoginAgain,
  onBackToCustomer,
}: LoggedOutViewProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
      }}
    >
      <Box
        sx={{
          width: "min(560px, 100%)",
          p: { xs: 3, md: 4 },
          borderRadius: "28px",
          background:
            "linear-gradient(180deg, rgba(255,253,249,1) 0%, rgba(247,242,233,1) 100%)",
          border: `1px solid ${alpha("#121212", 0.08)}`,
          boxShadow: "0 24px 70px rgba(17, 17, 17, 0.08)",
        }}
      >
        <Stack spacing={2.25} alignItems="flex-start">
          <BrandLogo badgeSize={68} />

          <Box>
            <Typography variant="h4" sx={{ mb: 1 }}>
              Tizimdan chiqdingiz
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Oxirgi foydalanuvchi: @{lastUser.username}. Qayta kirish tugmasi
              demo holatda panelni yana ochadi.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button
              onClick={onLoginAgain}
              variant="contained"
              startIcon={<LoginRoundedIcon />}
              sx={{
                minHeight: 50,
                px: 2.5,
                borderRadius: "18px",
                textTransform: "none",
                fontWeight: 700,
                boxShadow: "none",
              }}
            >
              Qayta kirish
            </Button>

            {onBackToCustomer ? (
              <Button
                onClick={onBackToCustomer}
                variant="outlined"
                startIcon={<StorefrontRoundedIcon />}
                sx={{
                  minHeight: 50,
                  px: 2.1,
                  borderRadius: "18px",
                }}
              >
                Mijoz sahifasi
              </Button>
            ) : null}
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
