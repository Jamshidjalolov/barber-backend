import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import NearMeRoundedIcon from "@mui/icons-material/NearMeRounded";
import RadioButtonCheckedRoundedIcon from "@mui/icons-material/RadioButtonCheckedRounded";
import { alpha, Avatar, Box, Button, Chip, IconButton, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
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
      component={motion.div}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        p: { xs: 1.25, sm: 1.55, md: 1.8 },
        borderRadius: "28px",
        background:
          "linear-gradient(135deg, rgba(22,22,39,0.9) 0%, rgba(10,11,22,0.82) 54%, rgba(7,19,31,0.82) 100%)",
        border: `1px solid ${alpha("#c4b5fd", 0.15)}`,
        boxShadow: "0 24px 70px rgba(0,0,0,0.36), inset 0 1px 0 rgba(255,255,255,0.06)",
        backdropFilter: "blur(22px)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          right: -58,
          top: -52,
          width: 180,
          height: 180,
          borderRadius: "42px",
          transform: "rotate(18deg)",
          background:
            "linear-gradient(135deg, rgba(139,92,246,0.26) 0%, rgba(34,211,238,0.12) 100%)",
          border: `1px solid ${alpha("#ffffff", 0.08)}`,
        },
        "& > *": {
          position: "relative",
          zIndex: 1,
        },
      }}
    >
      <Stack spacing={1.45}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box
            sx={{
              px: 0.75,
              py: 0.55,
              borderRadius: "16px",
              backgroundColor: alpha("#ffffff", 0.07),
              border: `1px solid ${alpha("#ffffff", 0.12)}`,
              backdropFilter: "blur(12px)",
            }}
          >
            <BrandLogo badgeSize={40} tone="light" />
          </Box>

          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap justifyContent="flex-end">
            <Chip
              icon={<RadioButtonCheckedRoundedIcon sx={{ fontSize: "0.8rem !important" }} />}
              label="Realtime"
              size="small"
              sx={{
                height: 30,
                borderRadius: "999px",
                color: "#86efac",
                backgroundColor: alpha("#34d399", 0.12),
                border: `1px solid ${alpha("#34d399", 0.18)}`,
                "& .MuiChip-icon": { color: "#34d399" },
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
                  backgroundColor: alpha("#ffffff", 0.08),
                  border: `1px solid ${alpha("#ffffff", 0.12)}`,
                }}
              >
                <Avatar
                  sx={{
                    width: 30,
                    height: 30,
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    bgcolor: "#8b5cf6",
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
                  color: "#f8fafc",
                  backgroundColor: alpha("#ffffff", 0.08),
                  border: `1px solid ${alpha("#ffffff", 0.12)}`,
                  "&:hover": {
                    backgroundColor: alpha("#ffffff", 0.14),
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
                letterSpacing: 0,
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
                backgroundColor: alpha("#ffffff", 0.08),
                border: `1px solid ${alpha("#ffffff", 0.12)}`,
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
