import { alpha, Box, Button, Chip, Stack, Typography } from "@mui/material";
import {
  latLngBounds,
  type LatLngTuple,
  type LeafletEvent,
  type Marker as LeafletMarker,
} from "leaflet";
import * as React from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { createMapMarkerIcon, DEFAULT_MAP_CENTER, hasCoordinates } from "../../lib/leaflet";
import { BarberProfile, GeoCoordinates } from "../../types";

interface NearbyBarbersMapProps {
  customerCoords: GeoCoordinates | null;
  barbers: BarberProfile[];
  selectedBarberId: string | null;
  onPreviewBarber: (barber: BarberProfile) => void;
  onChooseBarber: (barber: BarberProfile) => void;
  onChangeCustomerCoords: (coords: GeoCoordinates) => void;
}

function MapViewportController({
  customerCoords,
  barbers,
}: {
  customerCoords: GeoCoordinates | null;
  barbers: BarberProfile[];
}) {
  const map = useMap();

  React.useEffect(() => {
    const points: LatLngTuple[] = [];

    if (customerCoords) {
      points.push([customerCoords.latitude, customerCoords.longitude]);
    }

    barbers.forEach((item) => {
      if (hasCoordinates(item.latitude, item.longitude)) {
        points.push([item.latitude!, item.longitude!]);
      }
    });

    const timer = window.setTimeout(() => {
      map.invalidateSize();

      if (points.length > 1) {
        map.fitBounds(latLngBounds(points), { padding: [48, 48] });
      } else if (points.length === 1) {
        map.setView(points[0], 13, { animate: false });
      } else {
        map.setView(DEFAULT_MAP_CENTER, 11, { animate: false });
      }
    }, 120);

    return () => window.clearTimeout(timer);
  }, [barbers, customerCoords, map]);

  return null;
}

function CustomerLocationPicker({
  onChange,
}: {
  onChange: (coords: GeoCoordinates) => void;
}) {
  useMapEvents({
    click(event) {
      onChange({
        latitude: Number(event.latlng.lat.toFixed(6)),
        longitude: Number(event.latlng.lng.toFixed(6)),
      });
    },
  });

  return null;
}

const customerMarkerIcon = createMapMarkerIcon({
  background: "#111111",
  border: "#f1cf7f",
  label: "SIZ",
  size: 24,
});

const defaultBarberIcon = createMapMarkerIcon({
  background: "#d5a546",
  border: "#ffffff",
  label: "B",
  color: "#111111",
});

const selectedBarberIcon = createMapMarkerIcon({
  background: "#1f7d4c",
  border: "#ffffff",
  label: "VIP",
});

export function NearbyBarbersMap({
  customerCoords,
  barbers,
  selectedBarberId,
  onPreviewBarber,
  onChooseBarber,
  onChangeCustomerCoords,
}: NearbyBarbersMapProps) {
  const visibleBarbers = React.useMemo(
    () => barbers.filter((item) => hasCoordinates(item.latitude, item.longitude)),
    [barbers],
  );
  const firstBarberWithCoords = visibleBarbers[0];

  const initialCenter: LatLngTuple = customerCoords
    ? [customerCoords.latitude, customerCoords.longitude]
    : firstBarberWithCoords && hasCoordinates(firstBarberWithCoords.latitude, firstBarberWithCoords.longitude)
      ? [firstBarberWithCoords.latitude!, firstBarberWithCoords.longitude!]
      : DEFAULT_MAP_CENTER;

  return (
    <Stack spacing={0.9}>
      <Box
        sx={{
          height: { xs: 300, lg: 360 },
          borderRadius: "24px",
          overflow: "hidden",
          border: `1px solid ${alpha("#111111", 0.08)}`,
          backgroundColor: "#f5f6fa",
        }}
      >
        <MapContainer
          center={initialCenter}
          zoom={12}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapViewportController customerCoords={customerCoords} barbers={visibleBarbers} />
          <CustomerLocationPicker onChange={onChangeCustomerCoords} />

          {customerCoords ? (
            <Marker
              position={[customerCoords.latitude, customerCoords.longitude]}
              icon={customerMarkerIcon}
              draggable
              eventHandlers={{
                dragend(event: LeafletEvent) {
                  const marker = event.target as LeafletMarker;
                  const point = marker.getLatLng();
                  onChangeCustomerCoords({
                    latitude: Number(point.lat.toFixed(6)),
                    longitude: Number(point.lng.toFixed(6)),
                  });
                },
              }}
            >
              <Popup>
                <strong>Sizning joylashuvingiz</strong>
                <br />
                Shu nuqtaga yaqin barberlar hisoblanadi.
              </Popup>
            </Marker>
          ) : null}

          {visibleBarbers.map((barber) => {
            if (!hasCoordinates(barber.latitude, barber.longitude)) {
              return null;
            }

            return (
              <Marker
                key={barber.id}
                position={[barber.latitude!, barber.longitude!]}
                icon={selectedBarberId === barber.id ? selectedBarberIcon : defaultBarberIcon}
                eventHandlers={{
                  click() {
                    onPreviewBarber(barber);
                  },
                }}
              >
                <Popup>
                  <div style={{ minWidth: 220 }}>
                    <strong>{barber.name}</strong>
                    <br />
                    <span>{barber.specialty}</span>
                    <br />
                    <span>Ish vaqti: {barber.workStartTime} - {barber.workEndTime}</span>
                    <br />
                    <span>Manzil: {barber.address ?? "Kiritilmagan"}</span>
                    <br />
                    <span>Narx: {barber.priceHaircut.toLocaleString("uz-UZ")} so'mdan</span>
                    {typeof barber.distanceKm === "number" ? (
                      <>
                        <br />
                        <span>Sizdan: {barber.distanceKm.toFixed(1)} km</span>
                      </>
                    ) : null}
                    <div style={{ marginTop: 10 }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => onChooseBarber(barber)}
                        sx={{ borderRadius: "12px", textTransform: "none" }}
                      >
                        Shu barberni tanlash
                      </Button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </Box>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={0.9} justifyContent="space-between">
        <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
          <Chip
            label="Qora marker - siz"
            sx={{
              backgroundColor: alpha("#111111", 0.06),
              color: "#30343d",
            }}
          />
          <Chip
            label="Yashil marker - tanlangan barber"
            sx={{
              backgroundColor: alpha("#1f7d4c", 0.1),
              color: "#1f7d4c",
            }}
          />
        </Stack>

        <Typography variant="caption" sx={{ color: "#7d8599", alignSelf: "center" }}>
          Xaritadan bosing yoki markerni suring. Barber markerini bossangiz shu barber tanlanadi.
        </Typography>
      </Stack>
    </Stack>
  );
}
