import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import FmdGoodRoundedIcon from "@mui/icons-material/FmdGoodRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { alpha, Avatar, Box, Card, CardActionArea, Chip, Stack, Typography } from "@mui/material";
import { BarberProfile, DiscountItem } from "../../types";

interface CustomerBarberListProps {
  items: BarberProfile[];
  discounts: DiscountItem[];
  onSelect: (barber: BarberProfile) => void;
}

export function CustomerBarberList({ items, discounts, onSelect }: CustomerBarberListProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 1.35,
      }}
    >
      {items.map((barber) => {
        const nearestDiscount = discounts
          .filter((item) => item.barberId === barber.id || item.barberUserId === barber.userId)
          .sort((left, right) =>
            `${left.date}${left.startTime}`.localeCompare(`${right.date}${right.startTime}`),
          )[0];

        return (
          <Card
            key={barber.id}
            elevation={0}
            sx={{
              borderRadius: "22px",
              border: `1px solid ${alpha("#111111", 0.06)}`,
              boxShadow: "0 8px 20px rgba(17,17,17,0.04)",
              backgroundColor: "#fff",
              transition: "transform 160ms ease, box-shadow 160ms ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 18px 34px rgba(17,17,17,0.08)",
              },
            }}
          >
            <CardActionArea
              onClick={() => onSelect(barber)}
              sx={{
                p: { xs: 1.45, md: 1.6, lg: 1.75 },
                borderRadius: "22px",
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "84px minmax(0, 1fr) 42px",
                    md: "90px minmax(0, 1fr) 48px",
                  },
                  gap: { xs: 1.2, md: 1.45 },
                  alignItems: "center",
                }}
              >
                <Avatar
                  variant="rounded"
                  src={barber.photoUrl}
                  sx={{
                    width: { xs: 78, md: 84 },
                    height: { xs: 78, md: 84 },
                    borderRadius: { xs: "22px", md: "24px" },
                    bgcolor: barber.avatarColor,
                    fontWeight: 800,
                    fontSize: "1rem",
                    boxShadow: `0 12px 22px ${alpha(barber.avatarColor, 0.18)}`,
                  }}
                >
                  {barber.initials}
                </Avatar>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Stack
                    direction="row"
                    spacing={0.8}
                    justifyContent="space-between"
                    alignItems="flex-start"
                    sx={{ mb: 0.35 }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: { xs: "1.08rem", md: "1.16rem" },
                          lineHeight: 1.1,
                        }}
                      >
                        {barber.name}
                      </Typography>
                    </Box>

                    <Chip
                      size="small"
                      label={`${barber.todayBookings} ta bugun`}
                      sx={{
                        height: 26,
                        borderRadius: "999px",
                        backgroundColor: alpha("#111111", 0.05),
                        "& .MuiChip-label": {
                          px: 1,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                        },
                      }}
                    />
                  </Stack>

                  {barber.address ? (
                    <Stack direction="row" spacing={0.45} alignItems="center" sx={{ mt: 0.55 }}>
                      <FmdGoodRoundedIcon sx={{ fontSize: "0.92rem", color: "#9ca3b5" }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.82rem" }}>
                        {barber.address}
                        {typeof barber.distanceKm === "number" ? ` | ${barber.distanceKm.toFixed(1)} km` : ""}
                      </Typography>
                    </Stack>
                  ) : typeof barber.distanceKm === "number" ? (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.82rem", mt: 0.55 }}>
                      Sizdan {barber.distanceKm.toFixed(1)} km uzoqda
                    </Typography>
                  ) : null}

                  {nearestDiscount ? (
                    <Stack direction="row" spacing={0.55} alignItems="center" sx={{ mt: 0.65 }}>
                      <LocalOfferRoundedIcon sx={{ fontSize: "0.95rem", color: "#2d8b58" }} />
                      <Typography variant="body2" sx={{ color: "#2d8b58", fontWeight: 700 }}>
                        {nearestDiscount.percent}% skidka
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#8a91a3", fontSize: "0.82rem" }}>
                        {nearestDiscount.startTime} - {nearestDiscount.endTime}
                      </Typography>
                    </Stack>
                  ) : null}

                  <Stack direction="row" spacing={1.4} alignItems="center" sx={{ mt: 0.9 }} flexWrap="wrap" useFlexGap>
                    <Stack direction="row" spacing={0.45} alignItems="center">
                      <StarRoundedIcon sx={{ fontSize: "1rem", color: "#f2b400" }} />
                      <Typography variant="subtitle2" sx={{ fontSize: "0.9rem" }}>
                        {barber.rating}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={0.45} alignItems="center">
                      <PersonOutlineRoundedIcon sx={{ fontSize: "0.95rem", color: "#a3a9bb" }} />
                      <Typography variant="subtitle2" sx={{ fontSize: "0.9rem", color: "#788199" }}>
                        {barber.experience.replace("tajriba", "").trim()}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={0.45} alignItems="center">
                      <AccessTimeRoundedIcon sx={{ fontSize: "0.95rem", color: "#a3a9bb" }} />
                      <Typography variant="subtitle2" sx={{ fontSize: "0.86rem", color: "#788199" }}>
                        {barber.workStartTime} - {barber.workEndTime}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>

                <Box
                  sx={{
                    width: { xs: 40, md: 46 },
                    height: { xs: 40, md: 46 },
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "#0f0f0f",
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  <ChevronRightRoundedIcon />
                </Box>
              </Box>
            </CardActionArea>
          </Card>
        );
      })}
    </Box>
  );
}
