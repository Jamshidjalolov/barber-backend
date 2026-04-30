import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import TelegramIcon from "@mui/icons-material/Telegram";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import { alpha, Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { QRCodeSVG } from "qrcode.react";

interface TelegramQRCodeProps {
  botUsername?: string;
  size?: number;
  role?: "customer" | "barber" | "admin";
  subjectId?: string;
  linked?: boolean;
  chatId?: string;
  title?: string;
  description?: string;
  compact?: boolean;
}

function getDefaultTitle(role?: "customer" | "barber" | "admin") {
  if (role === "customer") {
    return "Shaxsiy Telegram ulash";
  }

  if (role === "barber") {
    return "Barber Telegram ulash";
  }

  if (role === "admin") {
    return "Admin Telegram ulash";
  }

  return "Telegram botga ulanish";
}

function getDefaultDescription(role?: "customer" | "barber" | "admin") {
  if (role === "customer") {
    return "QR ni ochib Start bosing. Faqat sizning bronlaringiz va eslatmalaringiz shu botga keladi.";
  }

  if (role === "barber") {
    return "QR ni ochib Start bosing. Faqat shu barberga tegishli navbatlar, bo'sh vaqtlar va so'rovlar ko'rinadi.";
  }

  if (role === "admin") {
    return "QR ni ochib Start bosing. Faqat admin xabarlari shu botga ulanadi.";
  }

  return "QR ni skaner qiling yoki tugma orqali botni ochib Start bosing.";
}

function buildTelegramLink(
  botUsername: string,
  role?: "customer" | "barber" | "admin",
  subjectId?: string,
) {
  const cleanUsername = botUsername.replace("@", "");
  if (!role || !subjectId) {
    return `https://t.me/${cleanUsername}`;
  }
  return `https://t.me/${cleanUsername}?start=link_${role}_${subjectId}`;
}

export function TelegramQRCode({
  botUsername = "Barber_shop_001_bot",
  size = 200,
  role,
  subjectId,
  linked = false,
  chatId,
  title,
  description,
  compact = false,
}: TelegramQRCodeProps) {
  const telegramLink = buildTelegramLink(botUsername, role, subjectId);
  const buttonLabel = linked ? "Bot ulangan" : "Botni ulash";
  const resolvedTitle = title ?? getDefaultTitle(role);
  const resolvedDescription = description ?? getDefaultDescription(role);
  const qrSize = compact ? Math.min(size, 112) : size;

  return (
    <Paper
      elevation={0}
      sx={{
        p: compact ? 1.35 : 2,
        textAlign: compact ? "left" : "center",
        bgcolor: "#f8fbff",
        borderRadius: compact ? "20px" : "24px",
        border: `1px solid ${alpha("#111111", 0.06)}`,
        boxShadow: "0 16px 36px rgba(17,17,17,0.05)",
      }}
    >
      <Stack spacing={compact ? 1 : 1.25} alignItems={compact ? "stretch" : "center"}>
        <Chip
          icon={<TelegramIcon sx={{ fontSize: "1rem !important" }} />}
          label={linked ? "Telegram ulangan" : "Telegram bot"}
          sx={{
            alignSelf: compact ? "flex-start" : "center",
            borderRadius: "999px",
            backgroundColor: alpha(linked ? "#3aa66f" : "#229ed9", 0.12),
            color: linked ? "#1b7d4a" : "#1674a3",
            "& .MuiChip-label": { fontWeight: 700 },
          }}
        />

        <Stack
          direction={{ xs: "column", sm: compact ? "row" : "column" }}
          spacing={compact ? 1.1 : 1.25}
          alignItems={compact ? "center" : "center"}
        >
          <Box
            sx={{
              display: "inline-block",
              p: compact ? 0.85 : 1.4,
              bgcolor: "#ffffff",
              borderRadius: compact ? "16px" : "20px",
              border: `1px solid ${alpha("#111111", 0.06)}`,
              flexShrink: 0,
            }}
          >
            <QRCodeSVG
              value={telegramLink}
              size={qrSize}
              level="M"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#111111"
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant={compact ? "subtitle1" : "h6"}
              fontWeight={700}
              gutterBottom={!compact}
            >
              {resolvedTitle}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ maxWidth: compact ? "none" : 220 }}
            >
              {resolvedDescription}
            </Typography>
          </Box>
        </Stack>

        {linked ? (
          <Stack
            direction="row"
            spacing={0.7}
            alignItems="center"
            sx={{
              alignSelf: compact ? "stretch" : "center",
              px: 1.1,
              py: 0.8,
              borderRadius: "14px",
              backgroundColor: alpha("#3aa66f", 0.08),
              color: "#1b7d4a",
            }}
          >
            <VerifiedRoundedIcon sx={{ fontSize: "1rem" }} />
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {chatId ? `Chat ID: ${chatId}` : "Bot muvaffaqiyatli ulangan"}
            </Typography>
          </Stack>
        ) : (
          <Stack
            direction="row"
            spacing={0.7}
            alignItems="center"
            sx={{
              alignSelf: compact ? "stretch" : "center",
              px: 1.1,
              py: 0.8,
              borderRadius: "14px",
              backgroundColor: alpha("#111111", 0.04),
              color: "#576074",
            }}
          >
            <QrCode2RoundedIcon sx={{ fontSize: "1rem" }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Start bossangiz bron va eslatmalar shu yerga tushadi
            </Typography>
          </Stack>
        )}

        <Button
          component="a"
          href={telegramLink}
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          endIcon={<OpenInNewRoundedIcon />}
          sx={{
            alignSelf: compact ? "stretch" : "center",
            borderRadius: "14px",
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          {buttonLabel}
        </Button>
      </Stack>
    </Paper>
  );
}
