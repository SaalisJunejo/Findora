"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon for bundled/SSR environments
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationMapProps {
  position: [number, number] | null;
  onPositionChange: (pos: [number, number]) => void;
}

/** Captures map click events and reports the lat/lng to the parent. */
function MapClickHandler({
  onPositionChange,
}: {
  onPositionChange: (pos: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      onPositionChange([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function LocationMap({
  position,
  onPositionChange,
}: LocationMapProps) {
  const defaultCenter: [number, number] = [40.7128, -74.006]; // NYC

  return (
    <MapContainer
      center={position || defaultCenter}
      zoom={13}
      className="h-80 w-full rounded-lg"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onPositionChange={onPositionChange} />
      {position && <Marker position={position} icon={defaultIcon} />}
    </MapContainer>
  );
}
