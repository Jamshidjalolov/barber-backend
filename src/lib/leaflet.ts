import { divIcon, type DivIcon, type LatLngTuple } from "leaflet";

export const DEFAULT_MAP_CENTER: LatLngTuple = [41.311081, 69.240562];

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function hasCoordinates(
  latitude?: number | null,
  longitude?: number | null,
): boolean {
  return typeof latitude === "number" && Number.isFinite(latitude) &&
    typeof longitude === "number" && Number.isFinite(longitude);
}

export function createMapMarkerIcon({
  background,
  border = "#ffffff",
  color = "#ffffff",
  label,
  size = 22,
}: {
  background: string;
  border?: string;
  color?: string;
  label: string;
  size?: number;
}): DivIcon {
  const circleSize = size * 2;
  const labelText = escapeHtml(label.slice(0, 3).toUpperCase());

  return divIcon({
    className: "custom-map-marker",
    html: `
      <div style="
        width:${circleSize}px;
        height:${circleSize}px;
        border-radius:999px;
        display:flex;
        align-items:center;
        justify-content:center;
        background:${background};
        border:3px solid ${border};
        box-shadow:0 10px 22px rgba(17,17,17,.18);
        color:${color};
        font-weight:800;
        font-size:${Math.max(10, size - 8)}px;
        letter-spacing:.02em;
      ">${labelText}</div>
    `,
    iconSize: [circleSize, circleSize],
    iconAnchor: [circleSize / 2, circleSize / 2],
    popupAnchor: [0, -circleSize / 2],
  });
}
