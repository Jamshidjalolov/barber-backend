import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import RadioButtonCheckedRoundedIcon from "@mui/icons-material/RadioButtonCheckedRounded";
import { alpha, Box, Chip, Stack, Typography } from "@mui/material";
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
      sx={{
        p: { xs: 1.3, md: 1.6 },
        borderRadius: "26px",
        background:
          "linear-gradient(135deg, rgba(255,250,244,0.98) 0%, rgba(248,242,232,0.92) 100%)",
        border: `1px solid ${alpha("#111111", 0.06)}`,
        boxShadow: "0 24px 60px rgba(17,17,17,0.06)",
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
                  bgcolor: "#111111",
                  color: "#fff",
                  boxShadow: "0 14px 26px rgba(17,17,17,0.12)",
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
                  color: "#1f7d4c",
                  backgroundColor: alpha("#3aa66f", 0.12),
                  "& .MuiChip-icon": { color: "#2f9d62" },
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
                    backgroundColor: alpha("#d5a546", 0.14),
                    color: "#8f6a0c",
                    border: `1px solid ${alpha("#d5a546", 0.18)}`,
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
