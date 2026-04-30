import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { LatLngTuple, LeafletEvent, Marker as LeafletMarker } from "leaflet";
import * as React from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { GeoCoordinates } from "../../types";
import { createMapMarkerIcon, DEFAULT_MAP_CENTER } from "../../lib/leaflet";

interface BarberLocationPickerMapProps {
  value: GeoCoordinates | null;
  address?: string;
  onChange: (coords: GeoCoordinates) => void;
}

function MapViewportController({ position }: { position: LatLngTuple }) {
  const map = useMap();

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
      map.setView(position, 13, { animate: false });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [map, position]);

  return null;
}

function MapPicker({ onChange }: { onChange: (coords: GeoCoordinates) => void }) {
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

const markerIcon = createMapMarkerIcon({
  background: "#111111",
  border: "#f3d28b",
  label: "B",
});

export function BarberLocationPickerMap({
  value,
  address,
  onChange,
}: BarberLocationPickerMapProps) {
  const position: LatLngTuple = value
    ? [value.latitude, value.longitude]
    : DEFAULT_MAP_CENTER;

  return (
    <Stack spacing={0.8}>
      <Box
        sx={{
          height: { xs: 240, md: 280 },
          borderRadius: "20px",
          overflow: "hidden",
          border: `1px solid ${alpha("#111111", 0.08)}`,
          backgroundColor: "#f5f6fa",
        }}
      >
        <MapContainer
          center={position}
          zoom={value ? 13 : 11}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapViewportController position={position} />
          <MapPicker onChange={onChange} />
          {value ? (
            <Marker
              position={position}
              icon={markerIcon}
              draggable
              eventHandlers={{
                dragend(event: LeafletEvent) {
                  const marker = event.target as LeafletMarker;
                  const point = marker.getLatLng();
                  onChange({
                    latitude: Number(point.lat.toFixed(6)),
                    longitude: Number(point.lng.toFixed(6)),
                  });
                },
              }}
            />
          ) : null}
        </MapContainer>
      </Box>

      <Typography variant="caption" sx={{ color: "#7b8398", px: 0.3 }}>
        Xaritadan bosing yoki markerni suring. {address ? `Manzil: ${address}` : "Barbershop joyini aniq belgilang."}
      </Typography>
    </Stack>
  );
}
