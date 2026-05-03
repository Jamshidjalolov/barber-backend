import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import FmdGoodRoundedIcon from "@mui/icons-material/FmdGoodRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { alpha, Avatar, Box, Card, CardActionArea, Chip, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { isVideoUrl } from "../../lib/media";
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
            component={motion.div}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, scale: 1.006 }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            key={barber.id}
            elevation={0}
            sx={{
              borderRadius: "24px",
              border: `1px solid ${alpha("#c4b5fd", 0.14)}`,
              boxShadow: "0 18px 42px rgba(0,0,0,0.24)",
              background:
                "linear-gradient(180deg, rgba(19,20,34,0.86) 0%, rgba(10,11,22,0.72) 100%)",
              backdropFilter: "blur(18px)",
              transition: "box-shadow 160ms ease",
              "&:hover": {
                boxShadow: `0 26px 54px ${alpha("#8b5cf6", 0.18)}`,
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
                        backgroundColor: alpha("#ffffff", 0.07),
                        color: "#dbeafe",
                        border: `1px solid ${alpha("#c4b5fd", 0.12)}`,
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
                      <FmdGoodRoundedIcon sx={{ fontSize: "0.92rem", color: "#8d96ad" }} />
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
                      <Typography variant="body2" sx={{ color: "#86efac", fontWeight: 700 }}>
                        {nearestDiscount.percent}% skidka
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#8d96ad", fontSize: "0.82rem" }}>
                        {nearestDiscount.startTime} - {nearestDiscount.endTime}
                      </Typography>
                    </Stack>
                  ) : null}

                  <Stack direction="row" spacing={1.4} alignItems="center" sx={{ mt: 0.9 }} flexWrap="wrap" useFlexGap>
                    <Stack direction="row" spacing={0.45} alignItems="center">
                      <StarRoundedIcon sx={{ fontSize: "1rem", color: "#f6c85f" }} />
                      <Typography variant="subtitle2" sx={{ fontSize: "0.9rem" }}>
                        {barber.rating}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={0.45} alignItems="center">
                      <PersonOutlineRoundedIcon sx={{ fontSize: "0.95rem", color: "#8d96ad" }} />
                      <Typography variant="subtitle2" sx={{ fontSize: "0.9rem", color: "#aab2c8" }}>
                        {barber.experience.replace("tajriba", "").trim()}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={0.45} alignItems="center">
                      <AccessTimeRoundedIcon sx={{ fontSize: "0.95rem", color: "#8d96ad" }} />
                      <Typography variant="subtitle2" sx={{ fontSize: "0.86rem", color: "#aab2c8" }}>
                        {barber.workStartTime} - {barber.workEndTime}
                      </Typography>
                    </Stack>
                  </Stack>

                  {barber.mediaUrl ? (
                    <Box
                      sx={{
                        mt: 1.15,
                        borderRadius: "16px",
                        overflow: "hidden",
                        border: `1px solid ${alpha("#c4b5fd", 0.12)}`,
                        backgroundColor: alpha("#ffffff", 0.05),
                      }}
                    >
                      {isVideoUrl(barber.mediaUrl) ? (
                        <Box
                          component="video"
                          src={barber.mediaUrl}
                          muted
                          playsInline
                          controls
                          sx={{
                            display: "block",
                            width: "100%",
                            maxHeight: 170,
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <Box
                          component="img"
                          src={barber.mediaUrl}
                          alt={`${barber.name} ish namunasi`}
                          sx={{
                            display: "block",
                            width: "100%",
                            maxHeight: 170,
                            objectFit: "cover",
                          }}
                        />
                      )}
                    </Box>
                  ) : null}
                </Box>

                <Box
                  sx={{
                    width: { xs: 40, md: 46 },
                    height: { xs: 40, md: 46 },
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    background:
                      "linear-gradient(135deg, rgba(139,92,246,1) 0%, rgba(34,211,238,0.88) 100%)",
                    color: "#fff",
                    flexShrink: 0,
                    boxShadow: `0 14px 24px ${alpha("#8b5cf6", 0.24)}`,
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
