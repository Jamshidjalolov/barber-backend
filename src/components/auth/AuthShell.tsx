import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { alpha, Box, Chip, IconButton, Stack, Typography } from "@mui/material";
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
        px: { xs: 1.2, sm: 1.8 },
        py: { xs: 1.2, sm: 1.8 },
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(circle at top, rgba(227,191,106,0.2), transparent 26%), linear-gradient(180deg, #f7f1e8 0%, #f2ece2 100%)",
      }}
    >
      <Box
        sx={{
          width: "min(680px, 100%)",
          p: { xs: 0.85, sm: 1 },
          borderRadius: { xs: "28px", sm: "34px" },
          background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, #fffaf2 100%)",
          border: `1px solid ${alpha("#111111", 0.06)}`,
          boxShadow: "0 28px 60px rgba(17,17,17,0.09)",
        }}
      >
        <Box
          sx={{
            p: { xs: 1.05, sm: 1.2 },
            borderRadius: { xs: "24px", sm: "28px" },
            color: "#fff",
            background:
              "radial-gradient(circle at 18% 16%, rgba(216,170,82,0.22), transparent 22%), linear-gradient(145deg, #17120d 0%, #100d0a 58%, #0b0a08 100%)",
            boxShadow: "0 18px 44px rgba(17,17,17,0.16)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Box
              sx={{
                px: 0.8,
                py: 0.6,
                borderRadius: "16px",
                backgroundColor: alpha("#ffffff", 0.05),
                border: `1px solid ${alpha("#f1d38f", 0.12)}`,
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
                  color: "#f6e6bb",
                  backgroundColor: alpha("#ffffff", 0.06),
                  border: `1px solid ${alpha("#f1d38f", 0.1)}`,
                  "&:hover": {
                    backgroundColor: alpha("#ffffff", 0.12),
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
                color: "#f6e6bb",
                backgroundColor: alpha("#d8aa52", 0.14),
                border: `1px solid ${alpha("#f1d38f", 0.18)}`,
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
                  letterSpacing: "-0.05em",
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
                      color: "#f7ecd3",
                      backgroundColor: alpha("#ffffff", 0.06),
                      border: `1px solid ${alpha("#f1d38f", 0.08)}`,
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
