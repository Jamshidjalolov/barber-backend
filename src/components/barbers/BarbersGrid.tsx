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
import { SectionCard } from "../common/SectionCard";

interface BarbersGridProps {
  items: BarberProfile[];
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
        backgroundColor: alpha("#ffffff", 0.06),
        border: `1px solid ${alpha("#c4b5fd", 0.12)}`,
        color: "text.secondary",
      }}
    >
      <Box
        sx={{
          display: "grid",
          placeItems: "center",
          color: "#67e8f9",
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
          ? `1px solid ${alpha("#67e8f9", 0.36)}`
          : `1px solid ${alpha("#c4b5fd", 0.14)}`,
        background: active
          ? "linear-gradient(135deg, rgba(139,92,246,1) 0%, rgba(34,211,238,0.86) 100%)"
          : "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)",
        color: active
          ? "#fff"
          : isDanger
            ? "#fecdd3"
            : "#cbd5e1",
        boxShadow: active ? `0 14px 26px ${alpha("#8b5cf6", 0.26)}` : "none",
        "&:hover": {
          backgroundColor: active ? undefined : alpha("#ffffff", 0.1),
        },
      }}
    >
      {children}
    </IconButton>
  );
}

export function BarbersGrid({
  items,
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
              border: `1px solid ${alpha("#c4b5fd", 0.14)}`,
              background:
                "linear-gradient(180deg, rgba(20,20,34,0.86) 0%, rgba(11,12,24,0.72) 100%)",
              overflow: "hidden",
              position: "relative",
              boxShadow: "0 20px 48px rgba(0,0,0,0.24)",
              "&::before": {
                content: '""',
                position: "absolute",
                top: -34,
                right: -28,
                width: 124,
                height: 112,
                borderRadius: "30px",
                transform: "rotate(18deg)",
                background:
                  "linear-gradient(135deg, rgba(139,92,246,0.16), rgba(34,211,238,0.08))",
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
                )} 0%, ${alpha("#22d3ee", 0.8)} 100%)`,
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
                        "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                      border: `1px solid ${alpha("#c4b5fd", 0.12)}`,
                      boxShadow: "0 10px 22px rgba(0,0,0,0.18)",
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
                          backgroundColor: alpha("#f6c85f", 0.14),
                          color: "#fde68a",
                          border: `1px solid ${alpha("#f6c85f", 0.18)}`,
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
                        color: "#aab2c8",
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
                      border: `1px solid ${alpha("#c4b5fd", 0.12)}`,
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.04) 100%)",
                      boxShadow: "0 12px 24px rgba(0,0,0,0.16)",
                    }}
                  >
                    <CardContent sx={{ p: 0.95, "&:last-child": { pb: 0.95 } }}>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          mb: 0.22,
                          letterSpacing: 0,
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
                          <CircleRoundedIcon sx={{ fontSize: "0.6rem", color: "#34d399" }} />
                          <Typography
                            variant="body2"
                            sx={{ color: "#86efac", fontWeight: 600, fontSize: "0.74rem" }}
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
                    borderTop: `1px solid ${alpha("#c4b5fd", 0.12)}`,
                    position: "relative",
                    zIndex: 1,
                    display: "grid",
                    width: { xs: "100%", md: "fit-content" },
                    maxWidth: "100%",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "minmax(260px, 310px) 272px",
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
                        "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.04) 100%)",
                      color: "#f8fafc",
                      position: "relative",
                      overflow: "hidden",
                      border: `1px solid ${alpha("#c4b5fd", 0.12)}`,
                      boxShadow: "0 10px 22px rgba(0,0,0,0.16)",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: -26,
                        right: -8,
                        width: 84,
                        height: 84,
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, rgba(139,92,246,0.14), rgba(34,211,238,0.08))",
                        transform: "rotate(18deg)",
                      },
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: "#8d96ad",
                        mb: 0.28,
                        letterSpacing: 0,
                        textTransform: "uppercase",
                        fontSize: "0.62rem",
                      }}
                    >
                      Bio
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "#cbd5e1", fontSize: "0.72rem", lineHeight: 1.36 }}
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
                        "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.04) 100%)",
                      border: `1px solid ${alpha("#c4b5fd", 0.12)}`,
                      boxShadow: "0 10px 22px rgba(0,0,0,0.16)",
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
                          backgroundColor: alpha("#22d3ee", 0.12),
                          color: "#67e8f9",
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
                          border: `1px solid ${alpha("#c4b5fd", 0.12)}`,
                          background:
                            "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.035) 100%)",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            mb: 0.16,
                            color: "#8d96ad",
                            letterSpacing: 0,
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
                            color: "#f8fafc",
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
                            "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.035) 100%)",
                          border: `1px solid ${alpha("#c4b5fd", 0.12)}`,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            mb: 0.16,
                            color: "#8d96ad",
                            letterSpacing: 0,
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
                            color: barber.password ? "#f8fafc" : "#fde68a",
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
                              backgroundColor: alpha("#f6c85f", 0.12),
                              color: "#fde68a",
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              "&:hover": {
                                backgroundColor: alpha("#f6c85f", 0.18),
                              },
                            }}
                          >
                            Parol qo'yish
                          </Button>
                        ) : null}
                      </Box>
                    </Box>
                  </Box>

                </Box>
              </Collapse>
            </Stack>
          </SectionCard>
        );
      })}
    </Stack>
  );
}
