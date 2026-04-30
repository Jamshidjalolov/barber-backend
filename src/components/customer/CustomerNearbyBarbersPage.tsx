import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import FmdGoodRoundedIcon from "@mui/icons-material/FmdGoodRounded";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import NearMeRoundedIcon from "@mui/icons-material/NearMeRounded";
import { alpha, Box, Button, Chip, Stack, Typography } from "@mui/material";
import { NearbyBarbersMap } from "../maps/NearbyBarbersMap";
import { BarberProfile, GeoCoordinates } from "../../types";

interface CustomerNearbyBarbersPageProps {
  customerCoords: GeoCoordinates | null;
  nearestBarber: BarberProfile | null;
  selectedBarber: BarberProfile | null;
  barbers: BarberProfile[];
  onBack: () => void;
  onUseCurrentLocation: () => void;
  onPreviewBarber: (barber: BarberProfile) => void;
  onChooseBarber: (barber: BarberProfile) => void;
  onChangeCustomerCoords: (coords: GeoCoordinates) => void;
}

export function CustomerNearbyBarbersPage({
  customerCoords,
  nearestBarber,
  selectedBarber,
  barbers,
  onBack,
  onUseCurrentLocation,
  onPreviewBarber,
  onChooseBarber,
  onChangeCustomerCoords,
}: CustomerNearbyBarbersPageProps) {
  return (
    <Stack spacing={{ xs: 2.1, md: 2.35 }}>
      <Stack direction="row" spacing={0.7} alignItems="flex-start">
        <Button
          onClick={onBack}
          startIcon={<ArrowBackRoundedIcon />}
          variant="text"
          sx={{
            mt: -0.25,
            ml: -0.6,
            minWidth: "auto",
            px: 0.8,
            borderRadius: "14px",
            textTransform: "none",
            color: "#111111",
          }}
        >
          Orqaga
        </Button>

        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" sx={{ fontSize: { xs: "1.3rem", sm: "1.45rem" } }}>
            Yaqin barberlar xaritada
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Joylashuvingiz va yaqin barberlar shu yerda ko‘rinadi.
          </Typography>
        </Box>
      </Stack>

      <Box
        sx={{
          p: { xs: 1.35, md: 1.6 },
          borderRadius: "26px",
          border: `1px solid ${alpha("#111111", 0.06)}`,
          background:
            "linear-gradient(180deg, rgba(248,249,253,0.96) 0%, rgba(255,255,255,1) 100%)",
          boxShadow: "0 16px 36px rgba(17,17,17,0.05)",
        }}
      >
        <Stack spacing={1.2}>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", lg: "center" }}
          >
            <Box>
              <Typography variant="h6">Menga yaqin barberni topish</Typography>
              <Typography variant="body2" color="text.secondary">
                Avval joyingizni belgilang, keyin xaritada barber tanlang.
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={0.85}
              sx={{ width: { xs: "100%", lg: "auto" } }}
            >
              <Button
                variant="outlined"
                onClick={onUseCurrentLocation}
                startIcon={<MyLocationRoundedIcon />}
                sx={{ minHeight: 42, borderRadius: "14px", textTransform: "none" }}
              >
                Mening joyim
              </Button>
              <Button
                variant="contained"
                onClick={() => nearestBarber && onPreviewBarber(nearestBarber)}
                disabled={!nearestBarber}
                startIcon={<NearMeRoundedIcon />}
                sx={{ minHeight: 42, borderRadius: "14px", textTransform: "none" }}
              >
                Eng yaqin barberni ko‘rsat
              </Button>
            </Stack>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={1} flexWrap="wrap" useFlexGap>
            {customerCoords ? (
              <Chip
                icon={<FmdGoodRoundedIcon sx={{ fontSize: "1rem !important" }} />}
                label={`Mening joyim: ${customerCoords.latitude.toFixed(4)}, ${customerCoords.longitude.toFixed(4)}`}
                sx={{
                  alignSelf: "flex-start",
                  backgroundColor: alpha("#d5a546", 0.12),
                  color: "#8f6617",
                  "& .MuiChip-label": { fontWeight: 700 },
                }}
              />
            ) : null}

            {nearestBarber && typeof nearestBarber.distanceKm === "number" ? (
              <Chip
                icon={<NearMeRoundedIcon sx={{ fontSize: "1rem !important" }} />}
                label={`Eng yaqin barber: ${nearestBarber.name} | ${nearestBarber.distanceKm.toFixed(1)} km`}
                onClick={() => onPreviewBarber(nearestBarber)}
                sx={{
                  alignSelf: "flex-start",
                  cursor: "pointer",
                  backgroundColor: alpha("#3aa66f", 0.12),
                  color: "#24764b",
                  "& .MuiChip-label": { fontWeight: 700 },
                  "& .MuiChip-icon": { color: "#24764b" },
                }}
              />
            ) : null}
          </Stack>

          {barbers.length ? (
            <NearbyBarbersMap
              customerCoords={customerCoords}
              barbers={barbers}
              selectedBarberId={selectedBarber?.id ?? null}
              onPreviewBarber={onPreviewBarber}
              onChooseBarber={onChooseBarber}
              onChangeCustomerCoords={onChangeCustomerCoords}
            />
          ) : (
            <Box
              sx={{
                p: 1.6,
                borderRadius: "18px",
                border: `1px dashed ${alpha("#111111", 0.12)}`,
                textAlign: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Hozircha barberlar lokatsiyasi kiritilmagan.
              </Typography>
            </Box>
          )}

          {selectedBarber ? (
            <Box
              sx={{
                p: 1.15,
                borderRadius: "20px",
                backgroundColor: "#fff",
                border: `1px solid ${alpha("#111111", 0.06)}`,
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
              >
                <Box>
                  <Typography variant="subtitle1">{selectedBarber.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedBarber.specialty}
                    {selectedBarber.address ? ` | ${selectedBarber.address}` : ""}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  onClick={() => onChooseBarber(selectedBarber)}
                  sx={{ minHeight: 42, borderRadius: "14px", textTransform: "none" }}
                >
                  Shu barberga bron qilish
                </Button>
              </Stack>
            </Box>
          ) : null}
        </Stack>
      </Box>
    </Stack>
  );
}
