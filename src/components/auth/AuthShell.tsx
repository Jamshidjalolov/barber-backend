import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import { alpha, Box, Chip, IconButton, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { BrandLogo } from "../common/BrandLogo";

interface AuthShellHighlight {
  title: string;
  description: string;
}

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  contentTitle: string;
  contentDescription: string;
  highlights: AuthShellHighlight[];
  children: ReactNode;
  onBack?: () => void;
}

export function AuthShell({
  eyebrow,
  title,
  description,
  contentTitle,
  contentDescription,
  highlights,
  children,
  onBack,
}: AuthShellProps) {
  const hasHighlights = highlights.length > 0;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 1.15, sm: 1.8 },
        py: { xs: 1.15, sm: 1.8 },
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(circle at 14% 8%, rgba(139,92,246,0.32), transparent 28%), radial-gradient(circle at 94% 6%, rgba(34,211,238,0.18), transparent 26%), linear-gradient(135deg, #05050a 0%, #10071d 50%, #06111e 100%)",
      }}
    >
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 22, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.54, ease: [0.22, 1, 0.36, 1] }}
        sx={{
          width: "min(720px, 100%)",
          p: { xs: 0.85, sm: 1 },
          borderRadius: { xs: "28px", sm: "34px" },
          background:
            "linear-gradient(180deg, rgba(17,17,30,0.76) 0%, rgba(9,10,20,0.7) 100%)",
          border: `1px solid ${alpha("#c4b5fd", 0.14)}`,
          boxShadow: "0 34px 90px rgba(0,0,0,0.44), inset 0 1px 0 rgba(255,255,255,0.06)",
          backdropFilter: "blur(24px)",
        }}
      >
        <Box
          component={motion.div}
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          sx={{
            p: { xs: 1.15, sm: 1.35 },
            borderRadius: { xs: "24px", sm: "28px" },
            color: "#fff",
            background:
              "linear-gradient(135deg, rgba(139,92,246,0.42) 0%, rgba(11,12,24,0.92) 36%, rgba(6,17,30,0.95) 70%, rgba(34,211,238,0.22) 100%)",
            backgroundSize: "180% 180%",
            boxShadow: "0 22px 54px rgba(0,0,0,0.36)",
            position: "relative",
            overflow: "hidden",
            border: `1px solid ${alpha("#ffffff", 0.1)}`,
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
              transform: "translateX(-72%) rotate(8deg)",
              animation: "authShine 5.5s ease-in-out infinite",
            },
            "@keyframes authShine": {
              "0%, 42%": { transform: "translateX(-72%) rotate(8deg)" },
              "70%, 100%": { transform: "translateX(78%) rotate(8deg)" },
            },
          }}
        >
          <Box
            component={motion.div}
            animate={{ y: [0, -8, 0], rotate: [0, -3, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            sx={{
              position: "absolute",
              right: { xs: -14, sm: 22 },
              top: { xs: 78, sm: 82 },
              width: 86,
              height: 86,
              borderRadius: "28px",
              display: { xs: "none", sm: "grid" },
              placeItems: "center",
              color: "#101827",
              background:
                "linear-gradient(135deg, rgba(246,200,95,0.94) 0%, rgba(34,211,238,0.86) 100%)",
              boxShadow: "0 22px 44px rgba(0,0,0,0.34)",
              opacity: 0.88,
            }}
          >
            <ContentCutRoundedIcon sx={{ fontSize: "2.2rem" }} />
          </Box>

          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Box
              sx={{
                px: 0.8,
                py: 0.6,
                borderRadius: "16px",
                backgroundColor: alpha("#ffffff", 0.07),
                border: `1px solid ${alpha("#ffffff", 0.12)}`,
                backdropFilter: "blur(10px)",
              }}
            >
              <BrandLogo badgeSize={42} tone="light" />
            </Box>

            {onBack ? (
              <IconButton
                onClick={onBack}
                sx={{
                  width: 42,
                  height: 42,
                  color: "#ecfeff",
                  backgroundColor: alpha("#ffffff", 0.08),
                  border: `1px solid ${alpha("#ffffff", 0.12)}`,
                  "&:hover": {
                    backgroundColor: alpha("#ffffff", 0.14),
                  },
                }}
              >
                <ArrowBackRoundedIcon />
              </IconButton>
            ) : null}
          </Stack>

          <Stack spacing={0.75} sx={{ mt: 1.1 }}>
            <Chip
              label={eyebrow}
              sx={{
                alignSelf: "flex-start",
                height: 29,
                borderRadius: "999px",
                color: "#ecfeff",
                backgroundColor: alpha("#22d3ee", 0.14),
                border: `1px solid ${alpha("#67e8f9", 0.22)}`,
                "& .MuiChip-label": {
                  px: 1.2,
                  fontWeight: 700,
                },
              }}
            />

            {title ? (
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: "1.85rem", sm: "2.2rem" },
                  lineHeight: 0.98,
                  letterSpacing: 0,
                  maxWidth: 420,
                }}
              >
                {title}
              </Typography>
            ) : null}

            {description ? (
              <Typography
                variant="body1"
                sx={{
                  color: alpha("#ffffff", 0.72),
                  fontSize: { xs: "0.88rem", sm: "0.94rem" },
                  lineHeight: 1.55,
                  maxWidth: 420,
                }}
              >
                {description}
              </Typography>
            ) : null}

            {hasHighlights ? (
              <Stack direction="row" flexWrap="wrap" gap={0.7} sx={{ pt: 0.25 }}>
                {highlights.map((item) => (
                  <Chip
                    key={item.title}
                    label={item.title}
                    size="small"
                    sx={{
                      borderRadius: "999px",
                      color: "#f8fafc",
                      backgroundColor: alpha("#ffffff", 0.08),
                      border: `1px solid ${alpha("#ffffff", 0.1)}`,
                      "& .MuiChip-label": {
                        px: 1.05,
                        fontWeight: 600,
                      },
                    }}
                  />
                ))}
              </Stack>
            ) : null}
          </Stack>
        </Box>

        <Box sx={{ px: { xs: 0.2, sm: 0.35 }, pt: 1.4, pb: 0.2 }}>
          {contentTitle || contentDescription ? (
            <Stack spacing={0.45} sx={{ mb: 1.25 }}>
              {contentTitle ? (
                <Typography variant="h4" sx={{ fontSize: { xs: "1.45rem", sm: "1.7rem" } }}>
                  {contentTitle}
                </Typography>
              ) : null}
              {contentDescription ? (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ lineHeight: 1.55, fontSize: "0.94rem" }}
                >
                  {contentDescription}
                </Typography>
              ) : null}
            </Stack>
          ) : null}

          {children}
        </Box>
      </Box>
    </Box>
  );
}
