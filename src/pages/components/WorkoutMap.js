/* src/pages/components/WorkoutMap.jsx */

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(
  () =>
    import("react-leaflet").then(
      (mod) => mod.MapContainer
    ),
  { ssr: false }
);

const TileLayer = dynamic(
  () =>
    import("react-leaflet").then(
      (mod) => mod.TileLayer
    ),
  { ssr: false }
);

const Polyline = dynamic(
  () =>
    import("react-leaflet").then(
      (mod) => mod.Polyline
    ),
  { ssr: false }
);

export default function WorkoutMap({
  points = [],
}) {
  if (!points.length) return null;

  return (
    <div
      style={{
        height: "260px",
        width: "100%",
      }}
    >
      <MapContainer
        center={points[0]}
        zoom={13}
        scrollWheelZoom={false}
        style={{
          height: "100%",
          width: "100%",
          borderRadius: "16px",
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Polyline
          positions={points}
        />
      </MapContainer>
    </div>
  );
}