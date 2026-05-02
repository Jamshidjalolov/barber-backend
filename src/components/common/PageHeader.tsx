import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import RadioButtonCheckedRoundedIcon from "@mui/icons-material/RadioButtonCheckedRounded";
import { alpha, Box, Chip, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  action?: ReactNode;
  meta?: string;
  icon?: ReactNode;
  eyebrow?: string;
}

export function PageHeader({
  title,
  subtitle,
  action,
  meta,
  icon,
  eyebrow = "Admin paneli",
}: PageHeaderProps) {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        p: { xs: 1.3, md: 1.6 },
        borderRadius: "26px",
        background:
          "linear-gradient(135deg, rgba(22,22,39,0.88) 0%, rgba(10,11,22,0.72) 58%, rgba(7,19,31,0.78) 100%)",
        border: `1px solid ${alpha("#c4b5fd", 0.14)}`,
        boxShadow: "0 24px 70px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.06)",
        backdropFilter: "blur(22px)",
        position: "relative",
        overflow: "hidden",
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(120deg, rgba(139,92,246,0.14), transparent 34%, rgba(34,211,238,0.1))",
          pointerEvents: "none",
        },
        "& > *": {
          position: "relative",
          zIndex: 1,
        },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) auto" },
          gap: { xs: 1.3, lg: 2.2 },
          alignItems: "center",
        }}
      >
        <Stack spacing={1.1}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              justifyContent: "space-between",
              flexWrap: "wrap",
              rowGap: 0.8,
            }}
          >
            <Stack direction="row" spacing={1.1} alignItems="center">
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: "16px",
                  display: "grid",
                  placeItems: "center",
                  background:
                    "linear-gradient(135deg, rgba(139,92,246,1) 0%, rgba(34,211,238,0.88) 100%)",
                  color: "#fff",
                  boxShadow: `0 16px 30px ${alpha("#8b5cf6", 0.28)}`,
                  flexShrink: 0,
                }}
              >
                {icon}
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.84rem" }}>
                  {eyebrow}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ mt: 0.12, lineHeight: 1.02, fontSize: { xs: "1.5rem", md: "1.75rem" } }}
                >
                  {title}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              <Chip
                icon={<RadioButtonCheckedRoundedIcon sx={{ fontSize: "0.8rem !important" }} />}
                label="Realtime"
                size="small"
                sx={{
                  height: 31,
                  borderRadius: "999px",
                  color: "#86efac",
                  backgroundColor: alpha("#34d399", 0.12),
                  border: `1px solid ${alpha("#34d399", 0.18)}`,
                  "& .MuiChip-icon": { color: "#34d399" },
                  "& .MuiChip-label": { px: 1, fontWeight: 700 },
                }}
              />

              {meta ? (
                <Chip
                  icon={<CalendarMonthRoundedIcon sx={{ fontSize: "0.85rem !important" }} />}
                  label={meta}
                  size="small"
                  sx={{
                    height: 31,
                    borderRadius: "999px",
                    backgroundColor: alpha("#f6c85f", 0.14),
                    color: "#fde68a",
                    border: `1px solid ${alpha("#f6c85f", 0.18)}`,
                    "& .MuiChip-label": { px: 1.05, fontWeight: 700 },
                  }}
                />
              ) : null}
            </Stack>
          </Stack>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 620, fontSize: { xs: "0.92rem", md: "0.98rem" } }}
          >
            {subtitle}
          </Typography>
        </Stack>

        {action ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: { xs: "stretch", lg: "flex-end" },
            }}
          >
            {action}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
