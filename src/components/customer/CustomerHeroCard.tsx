import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import NearMeRoundedIcon from "@mui/icons-material/NearMeRounded";
import RadioButtonCheckedRoundedIcon from "@mui/icons-material/RadioButtonCheckedRounded";
import { alpha, Avatar, Box, Button, Chip, IconButton, Stack, Typography } from "@mui/material";
import { BrandLogo } from "../common/BrandLogo";

interface CustomerHeroCardProps {
  customerName?: string;
  onOpenMap?: () => void;
  onLogout?: () => void;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return "MJ";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function CustomerHeroCard({
  customerName,
  onOpenMap,
  onLogout,
}: CustomerHeroCardProps) {
  return (
    <Box
      sx={{
        p: { xs: 1.2, sm: 1.45, md: 1.65 },
        borderRadius: "26px",
        background:
          "linear-gradient(180deg, rgba(255,252,247,0.98) 0%, rgba(248,244,237,0.9) 100%)",
        border: `1px solid ${alpha("#111111", 0.05)}`,
        boxShadow: "0 16px 34px rgba(17,17,17,0.05)",
      }}
    >
      <Stack spacing={1.45}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box
            sx={{
              px: 0.75,
              py: 0.55,
              borderRadius: "16px",
              backgroundColor: "#fff",
              border: `1px solid ${alpha("#111111", 0.05)}`,
            }}
          >
            <BrandLogo badgeSize={40} />
          </Box>

          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap justifyContent="flex-end">
            <Chip
              icon={<RadioButtonCheckedRoundedIcon sx={{ fontSize: "0.8rem !important" }} />}
              label="Realtime"
              size="small"
              sx={{
                height: 30,
                borderRadius: "999px",
                color: "#1f7d4c",
                backgroundColor: alpha("#3aa66f", 0.12),
                "& .MuiChip-icon": { color: "#2f9d62" },
                "& .MuiChip-label": { px: 0.95, fontWeight: 700 },
              }}
            />

            {customerName ? (
              <Stack
                direction="row"
                spacing={0.75}
                alignItems="center"
                sx={{
                  px: 0.7,
                  py: 0.4,
                  borderRadius: "999px",
                  backgroundColor: "#fff",
                  border: `1px solid ${alpha("#111111", 0.05)}`,
                }}
              >
                <Avatar
                  sx={{
                    width: 30,
                    height: 30,
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    bgcolor: "#111111",
                  }}
                >
                  {getInitials(customerName)}
                </Avatar>
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 700 }}>
                  {customerName}
                </Typography>
              </Stack>
            ) : null}

            {onLogout ? (
              <IconButton
                onClick={onLogout}
                sx={{
                  width: 34,
                  height: 34,
                  color: alpha("#111111", 0.7),
                  backgroundColor: "#fff",
                  border: `1px solid ${alpha("#111111", 0.06)}`,
                  "&:hover": {
                    backgroundColor: alpha("#111111", 0.04),
                  },
                }}
              >
                <LogoutRoundedIcon sx={{ fontSize: "1.05rem" }} />
              </IconButton>
            ) : null}
          </Stack>
        </Stack>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "flex-end" }}
        >
          <Stack spacing={0.55}>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: "1.9rem", sm: "2.2rem" },
                fontWeight: 800,
                lineHeight: 0.98,
                letterSpacing: "-0.05em",
              }}
            >
              Barber tanlang
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.92rem" }}
            >
              Keyin vaqtni tanlaysiz
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            <Chip
              icon={<AccessTimeRoundedIcon sx={{ fontSize: "0.95rem !important" }} />}
              label="09:00 - 18:30"
              sx={{
                height: 34,
                borderRadius: "999px",
                backgroundColor: "#fff",
                border: `1px solid ${alpha("#111111", 0.06)}`,
                "& .MuiChip-label": { px: 1.1, fontWeight: 700 },
              }}
            />
            {onOpenMap ? (
              <Button
                variant="contained"
                startIcon={<NearMeRoundedIcon />}
                onClick={onOpenMap}
                sx={{
                  minHeight: 34,
                  px: 1.4,
                  borderRadius: "999px",
                  textTransform: "none",
                  whiteSpace: "nowrap",
                  boxShadow: "0 10px 18px rgba(17,17,17,0.12)",
                }}
              >
                Eng yaqin barberni ko&apos;rsat
              </Button>
            ) : null}
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}
