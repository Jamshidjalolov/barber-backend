import AlternateEmailRoundedIcon from "@mui/icons-material/AlternateEmailRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CircleRoundedIcon from "@mui/icons-material/CircleRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import VpnKeyRoundedIcon from "@mui/icons-material/VpnKeyRounded";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { ReactNode } from "react";
import { BarberProfile } from "../../types";
import { TelegramQRCode } from "../common/TelegramQRCode";
import { SectionCard } from "../common/SectionCard";

interface BarbersGridProps {
  items: BarberProfile[];
  telegramBotUsername?: string;
  expandedId: string | null;
  onEdit: (barber: BarberProfile) => void;
  onDelete: (barber: BarberProfile) => void;
  onToggleExpand: (barberId: string) => void;
}

interface MetaPillProps {
  icon: ReactNode;
  label: string;
}

function MetaPill({ icon, label }: MetaPillProps) {
  return (
    <Stack
      direction="row"
      spacing={0.7}
      alignItems="center"
      sx={{
        px: 0.88,
        py: 0.52,
        borderRadius: "999px",
        backgroundColor: alpha("#111111", 0.045),
        border: `1px solid ${alpha("#121212", 0.06)}`,
        color: "text.secondary",
      }}
    >
      <Box
        sx={{
          display: "grid",
          placeItems: "center",
          color: "#a37a22",
        }}
      >
        {icon}
      </Box>
      <Typography variant="body2" sx={{ lineHeight: 1.1, fontSize: "0.84rem" }}>
        {label}
      </Typography>
    </Stack>
  );
}

function ActionButton({
  active = false,
  children,
  onClick,
  tone = "neutral",
}: {
  active?: boolean;
  children: ReactNode;
  onClick: () => void;
  tone?: "neutral" | "danger";
}) {
  const isDanger = tone === "danger";

  return (
    <IconButton
      onClick={onClick}
      sx={{
        width: { xs: 38, sm: 40 },
        height: { xs: 38, sm: 40 },
        borderRadius: "13px",
        border: active
          ? `1px solid ${alpha("#111111", 0.22)}`
          : `1px solid ${alpha("#121212", 0.1)}`,
        background: active
          ? "linear-gradient(180deg, rgba(17,17,17,1) 0%, rgba(31,31,31,1) 100%)"
          : "linear-gradient(180deg, rgba(255,252,247,0.98) 0%, rgba(246,238,225,0.95) 100%)",
        color: active
          ? "#fff"
          : isDanger
            ? "#b65b5b"
            : "#6d7486",
        boxShadow: active ? "0 10px 22px rgba(17, 17, 17, 0.14)" : "none",
        "&:hover": {
          backgroundColor: active ? "#111111" : alpha("#121212", 0.04),
        },
      }}
    >
      {children}
    </IconButton>
  );
}

export function BarbersGrid({
  items,
  telegramBotUsername,
  expandedId,
  onEdit,
  onDelete,
  onToggleExpand,
}: BarbersGridProps) {
  return (
    <Stack spacing={1.75}>
      {items.map((barber) => {
        const expanded = expandedId === barber.id;

        return (
          <SectionCard
            key={barber.id}
            sx={{
              px: { xs: 1.05, sm: 1.3, md: 1.55 },
              py: { xs: 1.1, md: 1.35 },
              borderRadius: "20px",
              border: `1px solid ${alpha("#121212", 0.07)}`,
              background:
                "linear-gradient(180deg, rgba(255,254,251,1) 0%, rgba(255,249,242,1) 100%)",
              overflow: "hidden",
              position: "relative",
              boxShadow: "0 12px 28px rgba(17, 17, 17, 0.045)",
              "&::before": {
                content: '""',
                position: "absolute",
                top: -52,
                right: -34,
                width: 132,
                height: 132,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(213,165,70,0.18) 0%, rgba(213,165,70,0) 72%)",
                pointerEvents: "none",
              },
              "&::after": {
                content: '""',
                position: "absolute",
                left: 14,
                top: 20,
                height: 76,
                width: 3,
                borderRadius: 99,
                display: { xs: "none", sm: "block" },
                background: `linear-gradient(180deg, ${alpha(
                  barber.avatarColor,
                  0.9,
                )} 0%, ${alpha("#d5a546", 0.8)} 100%)`,
              },
            }}
          >
            <Stack spacing={expanded ? 1.25 : 0}>
              <Stack
                direction={{ xs: "column", lg: "row" }}
                spacing={{ xs: 1.05, lg: 1.35 }}
                alignItems={{ xs: "stretch", lg: "center" }}
                justifyContent="space-between"
                sx={{ position: "relative", zIndex: 1 }}
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={1.2}
                  alignItems={{ xs: "flex-start", md: "center" }}
                  sx={{ minWidth: 0, flex: 1, pl: { xs: 0, sm: 0.8, md: 1.1 } }}
                >
                  <Box
                    sx={{
                      p: 0.3,
                      borderRadius: "16px",
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(248,241,228,0.95) 100%)",
                      border: `1px solid ${alpha("#121212", 0.08)}`,
                      boxShadow: "0 8px 18px rgba(17, 17, 17, 0.05)",
                    }}
                  >
                    <Avatar
                      variant="rounded"
                      src={barber.photoUrl}
                      sx={{
                        width: { xs: 52, sm: 56 },
                        height: { xs: 52, sm: 56 },
                        bgcolor: barber.avatarColor,
                        fontWeight: 800,
                        fontSize: { xs: "0.82rem", sm: "0.9rem" },
                        borderRadius: "13px",
                      }}
                    >
                      {barber.initials}
                    </Avatar>
                  </Box>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      flexWrap="wrap"
                      useFlexGap
                      sx={{ mb: 0.45 }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          fontSize: { xs: "1rem", md: "1.18rem" },
                          lineHeight: 1.05,
                        }}
                      >
                        {barber.name}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={0.45}
                        alignItems="center"
                        sx={{
                          px: 0.72,
                          py: 0.3,
                          borderRadius: "999px",
                          backgroundColor: alpha("#f6b800", 0.14),
                          color: "#9a7410",
                        }}
                      >
                        <StarRoundedIcon sx={{ fontSize: "0.95rem" }} />
                        <Typography variant="subtitle2">{barber.rating}</Typography>
                      </Stack>
                    </Stack>

                    <Typography
                      variant="body1"
                      sx={{
                        mb: 0.65,
                        color: "#544d40",
                        fontSize: { xs: "0.84rem", md: "0.9rem" },
                      }}
                    >
                      {barber.specialty}
                    </Typography>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <MetaPill
                        icon={<ScheduleRoundedIcon sx={{ fontSize: "0.92rem" }} />}
                        label={barber.experience}
                      />
                      <MetaPill
                        icon={<AlternateEmailRoundedIcon sx={{ fontSize: "0.92rem" }} />}
                        label={barber.handle}
                      />
                      <MetaPill
                        icon={<CalendarMonthRoundedIcon sx={{ fontSize: "0.92rem" }} />}
                        label={`${barber.totalBookings} ta jami navbat`}
                      />
                    </Stack>
                  </Box>
                </Stack>

                <Stack
                  direction={{ xs: "column", sm: "row", lg: "column" }}
                  spacing={0.64}
                  sx={{ width: { xs: "100%", lg: 154 }, flexShrink: 0 }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: "15px",
                      border: `1px solid ${alpha("#7a5d31", 0.1)}`,
                      background:
                        "linear-gradient(180deg, rgba(255,252,247,0.98) 0%, rgba(247,240,229,0.95) 100%)",
                      boxShadow: "0 8px 18px rgba(58, 44, 23, 0.04)",
                    }}
                  >
                    <CardContent sx={{ p: 0.95, "&:last-child": { pb: 0.95 } }}>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          mb: 0.22,
                          letterSpacing: "0.04em",
                          color: "text.secondary",
                          fontSize: "0.68rem",
                        }}
                      >
                        Bugungi navbatlar
                      </Typography>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" sx={{ lineHeight: 1, fontSize: "1.4rem" }}>
                          {barber.todayBookings}
                        </Typography>
                        <Stack direction="row" spacing={0.45} alignItems="center">
                          <CircleRoundedIcon sx={{ fontSize: "0.6rem", color: "#3da56e" }} />
                          <Typography
                            variant="body2"
                            sx={{ color: "#6f685a", fontWeight: 600, fontSize: "0.74rem" }}
                          >
                            faol
                          </Typography>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>

                  <Stack
                    direction="row"
                    spacing={0.72}
                    justifyContent={{ xs: "space-between", sm: "flex-end" }}
                  >
                    <ActionButton onClick={() => onEdit(barber)}>
                      <EditOutlinedIcon fontSize="small" />
                    </ActionButton>
                    <ActionButton tone="danger" onClick={() => onDelete(barber)}>
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </ActionButton>
                    <ActionButton active={expanded} onClick={() => onToggleExpand(barber.id)}>
                      <KeyboardArrowDownRoundedIcon
                        fontSize="small"
                        sx={{
                          transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 180ms ease",
                        }}
                      />
                    </ActionButton>
                  </Stack>
                </Stack>
              </Stack>

              <Collapse in={expanded} timeout={280} unmountOnExit>
                <Box
                  sx={{
                    pt: 1.05,
                    mt: 0.2,
                    borderTop: `1px solid ${alpha("#121212", 0.08)}`,
                    position: "relative",
                    zIndex: 1,
                    display: "grid",
                    width: { xs: "100%", md: "fit-content" },
                    maxWidth: "100%",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: telegramBotUsername
                        ? "minmax(240px, 290px) 252px minmax(220px, 260px)"
                        : "minmax(260px, 310px) 272px",
                    },
                    gap: 0.9,
                    alignItems: "stretch",
                    overflow: "hidden",
                    opacity: expanded ? 1 : 0,
                    transform: expanded ? "translateY(0)" : "translateY(-6px)",
                    transition: "opacity 220ms ease, transform 220ms ease",
                  }}
                >
                  <Box
                    sx={{
                      minWidth: 0,
                      width: "100%",
                      p: 0.82,
                      borderRadius: "14px",
                      background:
                        "linear-gradient(180deg, rgba(255,252,247,0.98) 0%, rgba(247,240,229,0.95) 100%)",
                      color: "#2d2923",
                      position: "relative",
                      overflow: "hidden",
                      border: `1px solid ${alpha("#7a5d31", 0.08)}`,
                      boxShadow: "0 8px 18px rgba(58, 44, 23, 0.035)",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: -26,
                        right: -8,
                        width: 84,
                        height: 84,
                        borderRadius: "50%",
                        background:
                          "radial-gradient(circle, rgba(213,165,70,0.18) 0%, rgba(213,165,70,0) 72%)",
                      },
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: "#9a8f7a",
                        mb: 0.28,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        fontSize: "0.62rem",
                      }}
                    >
                      Bio
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "#4f4639", fontSize: "0.72rem", lineHeight: 1.36 }}
                    >
                      {barber.bio ?? "Bio hozircha kiritilmagan."}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      width: "100%",
                      p: 0.88,
                      borderRadius: "14px",
                      background:
                        "linear-gradient(180deg, rgba(255,252,247,0.98) 0%, rgba(247,240,229,0.95) 100%)",
                      border: `1px solid ${alpha("#7a5d31", 0.08)}`,
                      boxShadow: "0 8px 18px rgba(58, 44, 23, 0.035)",
                    }}
                  >
                    <Stack direction="row" spacing={0.7} alignItems="center" sx={{ mb: 0.55 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          display: "grid",
                          placeItems: "center",
                          borderRadius: "8px",
                          backgroundColor: alpha("#111111", 0.05),
                          color: "#a37a22",
                        }}
                      >
                        <VpnKeyRoundedIcon sx={{ fontSize: "1rem" }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontSize: "0.84rem", lineHeight: 1.15 }}>
                          Login ma'lumotlari
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: "0.72rem" }}
                        >
                          Panelga kirish uchun kerak bo'ladi
                        </Typography>
                      </Box>
                    </Stack>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                        gap: 0.6,
                      }}
                    >
                      <Box
                        sx={{
                          p: 0.7,
                          borderRadius: "11px",
                          background:
                            "linear-gradient(180deg, rgba(255,251,244,0.96) 0%, rgba(247,239,226,0.92) 100%)",
                          border: `1px solid ${alpha("#7a5d31", 0.08)}`,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            mb: 0.16,
                            color: "#9a8f7a",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            fontSize: "0.58rem",
                          }}
                        >
                          Username
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: '"Consolas", "Courier New", monospace',
                            color: "#323232",
                            fontSize: "0.76rem",
                          }}
                        >
                          {barber.username}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          p: 0.7,
                          borderRadius: "11px",
                          background:
                            "linear-gradient(180deg, rgba(255,251,244,0.96) 0%, rgba(247,239,226,0.92) 100%)",
                          border: `1px solid ${alpha("#7a5d31", 0.08)}`,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            mb: 0.16,
                            color: "#9a8f7a",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            fontSize: "0.58rem",
                          }}
                        >
                          Parol
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: '"Consolas", "Courier New", monospace',
                            color: barber.password ? "#323232" : "#8d6e2a",
                            fontSize: "0.76rem",
                          }}
                        >
                          {barber.password || "Parol saqlanmagan"}
                        </Typography>
                        {!barber.password ? (
                          <Button
                            size="small"
                            onClick={() => onEdit(barber)}
                            sx={{
                              mt: 0.45,
                              minHeight: 28,
                              px: 0.95,
                              borderRadius: "999px",
                              textTransform: "none",
                              alignSelf: "flex-start",
                              backgroundColor: alpha("#d5a546", 0.12),
                              color: "#8d6e2a",
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              "&:hover": {
                                backgroundColor: alpha("#d5a546", 0.18),
                              },
                            }}
                          >
                            Parol qo'yish
                          </Button>
                        ) : null}
                      </Box>
                    </Box>
                  </Box>

                  {telegramBotUsername && barber.userId ? (
                    <Box sx={{ width: "100%" }}>
                      <TelegramQRCode
                        botUsername={telegramBotUsername}
                        role="barber"
                        subjectId={barber.userId}
                        linked={Boolean(barber.telegramConnected)}
                        chatId={barber.telegramChatId}
                        size={108}
                        title={
                          barber.telegramConnected
                            ? "Telegram ulangan"
                            : "Shu barberni ulang"
                        }
                        description={
                          barber.telegramConnected
                            ? "Faqat shu barberga tegishli bron va eslatmalar shu botga boradi."
                            : "Start bosilgach faqat shu barberning navbatlari, bo'sh-band vaqtlari va eslatmalari ko'rinadi."
                        }
                      />
                    </Box>
                  ) : null}
                </Box>
              </Collapse>
            </Stack>
          </SectionCard>
        );
      })}
    </Stack>
  );
}
