import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";

// Fix default marker icon issue in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface LeafletMapProps {
  center?: [number, number];
  zoom?: number;
  markerPosition?: [number, number];
  markerColor?: "low" | "medium" | "high";
  className?: string;
  locationName?: string;
}

const riskColors = {
  low: "#10b981",
  medium: "#f59e0b", 
  high: "#ef4444",
};

export function LeafletMap({
  center = [16.5062, 80.6480], // Default: Vijayawada, India
  zoom = 13,
  markerPosition,
  markerColor = "medium",
  className,
  locationName,
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map with disabled scroll zoom and single-touch drag
    mapInstanceRef.current = L.map(mapRef.current, {
      scrollWheelZoom: false,
      dragging: false,
      touchZoom: true,
      doubleClickZoom: true,
    }).setView(center, zoom);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapInstanceRef.current);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map view when center changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // Update marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    if (markerPosition) {
      // Create custom icon with risk color
      const customIcon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            width: 30px;
            height: 30px;
            background-color: ${riskColors[markerColor]};
            border: 3px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          "></div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });

      markerRef.current = L.marker(markerPosition, { icon: customIcon })
        .addTo(mapInstanceRef.current);

      if (locationName) {
        markerRef.current.bindPopup(`<strong>${locationName}</strong>`, {
          closeOnClick: false,
          autoClose: false,
        }).openPopup();
      }

      // Pan to marker
      mapInstanceRef.current.setView(markerPosition, zoom);

      // Keep popup open after zoom events
      mapInstanceRef.current.on('zoomend', () => {
        if (markerRef.current && locationName) {
          markerRef.current.openPopup();
        }
      });
    }
  }, [markerPosition, markerColor, locationName, zoom]);

  return (
    <div 
      ref={mapRef} 
      className={cn("w-full h-full rounded-lg", className)}
      style={{ minHeight: "200px", zIndex: 0 }}
    />
  );
}
