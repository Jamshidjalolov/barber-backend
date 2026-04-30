import ContentCutRoundedIcon from "@mui/icons-material/ContentCutRounded";
import { alpha, Box, Stack, Typography } from "@mui/material";

interface BrandLogoProps {
  badgeSize?: number;
  showWordmark?: boolean;
  stacked?: boolean;
  tone?: "dark" | "light";
}

export function BrandLogo({
  badgeSize = 52,
  showWordmark = true,
  stacked = false,
  tone = "dark",
}: BrandLogoProps) {
  const ringInset = Math.max(4, Math.round(badgeSize * 0.09));
  const innerInset = Math.max(9, Math.round(badgeSize * 0.18));
  const wordmarkSize = badgeSize < 50 ? "0.88rem" : "0.98rem";
  const primaryTextColor = tone === "light" ? "#f4ead5" : "#171717";
  const secondaryTextColor = tone === "light" ? "#d8aa52" : "#a37a22";

  return (
    <Stack
      direction={stacked ? "column" : "row"}
      spacing={stacked ? 0.9 : 1.1}
      alignItems={stacked ? "center" : "center"}
    >
      <Box
        sx={{
          position: "relative",
          width: badgeSize,
          height: badgeSize,
          flexShrink: 0,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 30% 28%, #2e2e2e 0%, #151515 48%, #090909 100%)",
          border: "2px solid #d8aa52",
          boxShadow:
            "0 10px 26px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: ringInset,
            borderRadius: "50%",
            border: `1px solid ${alpha("#f2d38a", 0.75)}`,
            opacity: 0.7,
          },
          "&::after": {
            content: '""',
            position: "absolute",
            left: innerInset,
            right: innerInset,
            bottom: Math.max(8, Math.round(badgeSize * 0.15)),
            height: 2,
            borderRadius: 99,
            background:
              "linear-gradient(90deg, rgba(216,170,82,0) 0%, rgba(216,170,82,0.9) 22%, rgba(242,211,138,1) 50%, rgba(216,170,82,0.9) 78%, rgba(216,170,82,0) 100%)",
          },
        }}
      >
        <Typography
          sx={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            fontFamily: '"Georgia", "Times New Roman", serif',
            fontWeight: 800,
            fontSize: `${badgeSize * 0.52}px`,
            lineHeight: 1,
            letterSpacing: "-0.05em",
            color: "#1b1b1b",
            textShadow:
              "0 1px 0 rgba(255,255,255,0.2), 0 8px 22px rgba(0,0,0,0.4)",
            background: "linear-gradient(180deg, #f8e3a1 0%, #d7a94d 52%, #9b6d21 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            transform: "translateY(-2px)",
          }}
        >
          B
        </Typography>

        <ContentCutRoundedIcon
          sx={{
            position: "absolute",
            left: "50%",
            bottom: Math.max(4, Math.round(badgeSize * 0.07)),
            transform: "translateX(-50%)",
            fontSize: Math.max(13, Math.round(badgeSize * 0.22)),
            color: "#d8aa52",
            filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.35))",
          }}
        />
      </Box>

      {showWordmark ? (
        <Stack spacing={0.15} alignItems={stacked ? "center" : "flex-start"}>
          <Typography
            sx={{
              fontFamily: '"Georgia", "Times New Roman", serif',
              fontWeight: 700,
              fontSize: wordmarkSize,
              lineHeight: 1.1,
              letterSpacing: "0.08em",
              color: primaryTextColor,
              textTransform: "uppercase",
              textShadow: tone === "light" ? "0 2px 12px rgba(0,0,0,0.35)" : "none",
            }}
          >
            Barbershop
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: secondaryTextColor,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 700,
              fontSize: "0.66rem",
            }}
          >
            Cut & Shave
          </Typography>
        </Stack>
      ) : null}
    </Stack>
  );
}
