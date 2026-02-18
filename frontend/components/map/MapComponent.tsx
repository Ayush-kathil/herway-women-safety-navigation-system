"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Circle, Polyline, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import L from "leaflet";
import { motion } from "framer-motion";

interface RouteSegment {
  path: number[][];
  score: number;
  color: string;
}

interface RouteData {
  route_index: number;
  risk_segments: RouteSegment[];
  average_safety_score: number;
  max_risk_score: number;
  is_safe: boolean;
  duration_min: number;
  distance_km: number;
}

interface CrimeHotspot {
  lat: number;
  lng: number;
  hour: number;
  relevance: number;
}

export type MapTheme = "dark" | "light" | "satellite";

interface MapProps {
  center: [number, number];
  zoom: number;
  onLocationSelect?: (lat: number, lng: number) => void;
  markers?: Array<{ lat: number; lng: number; color?: string; info?: string }>;
  gridData?: Array<{ lat: number; lng: number; score: number; color: string }>;
  routeSegments?: RouteSegment[];
  crimeHotspots?: CrimeHotspot[];
  allRoutes?: RouteData[];
  selectedRouteIdx?: number;
  userPosition?: { lat: number; lng: number; heading: number | null } | null;
  isNavigating?: boolean;
  mapTheme?: MapTheme;
  showTraffic?: boolean;
}

function MapEvents({ onLocationSelect }: { onLocationSelect?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function FollowUser({ lat, lng, isNavigating }: { lat: number; lng: number; isNavigating: boolean }) {
  const map = useMap();
  const prevPos = useRef<[number, number] | null>(null);

  useEffect(() => {
    if (!isNavigating) return;
    const newPos: [number, number] = [lat, lng];
    if (!prevPos.current) {
      map.flyTo(newPos, 17, { duration: 1.2 });
    } else {
      map.panTo(newPos, { animate: true, duration: 0.5 });
    }
    prevPos.current = newPos;
  }, [lat, lng, isNavigating, map]);

  return null;
}

// Create pulsing blue dot icon for user position
function createUserIcon() {
  return L.divIcon({
    className: "user-position-marker",
    html: `
      <div class="user-dot-container">
        <div class="user-dot-pulse"></div>
        <div class="user-dot-core"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

// Create heading arrow icon
function createHeadingIcon(heading: number) {
  return L.divIcon({
    className: "user-heading-marker",
    html: `
      <div class="user-heading-arrow" style="transform: rotate(${heading}deg)">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M20 6 L28 26 L20 22 L12 26 Z" fill="rgba(59,130,246,0.7)" stroke="rgba(59,130,246,0.9)" stroke-width="1"/>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

const TILE_LAYERS: Record<MapTheme, { url: string; attribution: string }> = {
  light: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, Maxar, Earthstar',
  },
};

const TRAFFIC_LAYER = {
  url: "https://{s}.api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=ek3vPOqbSH8sVEaYblCrAjGr03XIDLSP&tileSize=256",
  subdomains: ["a", "b", "c", "d"],
  attribution: '&copy; <a href="https://developer.tomtom.com/">TomTom</a> Traffic',
};

const MapComponent = ({
  center,
  zoom,
  onLocationSelect,
  markers = [],
  gridData = [],
  routeSegments = [],
  crimeHotspots = [],
  allRoutes = [],
  selectedRouteIdx = 0,
  userPosition = null,
  isNavigating = false,
  mapTheme = "dark",
  showTraffic = false,
}: MapProps) => {

  const hasMultipleRoutes = allRoutes.length > 1;
  const hasAnyRoute = allRoutes.length > 0 || routeSegments.length > 0;
  const tile = TILE_LAYERS[mapTheme];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="w-full h-full rounded-2xl overflow-hidden glass shadow-2xl relative z-0"
    >
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} zoomControl={false} className="w-full h-full">
        <TileLayer
          key={mapTheme}
          attribution={tile.attribution}
          url={tile.url}
        />

        {/* Traffic overlay */}
        {showTraffic && (
          <TileLayer
            url={TRAFFIC_LAYER.url}
            subdomains={TRAFFIC_LAYER.subdomains}
            attribution={TRAFFIC_LAYER.attribution}
            opacity={0.6}
          />
        )}

        <ChangeView center={center} zoom={zoom} />
        <MapEvents onLocationSelect={onLocationSelect} />

        {/* Follow user during navigation */}
        {userPosition && isNavigating && (
          <FollowUser lat={userPosition.lat} lng={userPosition.lng} isNavigating={isNavigating} />
        )}

        {/* User Position - Pulsing Blue Dot */}
        {userPosition && (
          <>
            {/* Accuracy circle */}
            <Circle
              center={[userPosition.lat, userPosition.lng]}
              radius={30}
              pathOptions={{
                color: "rgba(59,130,246,0.3)",
                fillColor: "rgba(59,130,246,0.1)",
                fillOpacity: 0.3,
                weight: 1,
              }}
            />
            {/* Blue dot marker */}
            <Marker
              position={[userPosition.lat, userPosition.lng]}
              icon={createUserIcon()}
            >
              <Popup>
                <div style={{ fontFamily: "sans-serif", fontSize: "12px" }}>
                  <strong style={{ color: "#3b82f6" }}>📍 Your Location</strong>
                </div>
              </Popup>
            </Marker>
            {/* Heading arrow */}
            {userPosition.heading !== null && (
              <Marker
                position={[userPosition.lat, userPosition.lng]}
                icon={createHeadingIcon(userPosition.heading)}
                interactive={false}
              />
            )}
          </>
        )}

        {/* Safety Grid Heatmap */}
        {gridData.map((cell, idx) => (
          <Circle
            key={`grid-${idx}`}
            center={[cell.lat, cell.lng]}
            pathOptions={{
              fillColor: cell.color,
              color: "transparent",
              fillOpacity: 0.4,
            }}
            radius={400}
          />
        ))}

        {/* NON-SELECTED routes (behind) */}
        {hasMultipleRoutes && allRoutes.map((route, rIdx) => {
          if (rIdx === selectedRouteIdx) return null;
          return route.risk_segments?.map((segment, sIdx) => (
            <Polyline
              key={`alt-route-${rIdx}-seg-${sIdx}`}
              positions={segment.path.map(p => [p[0], p[1]] as [number, number])}
              pathOptions={{
                color: "#fca5a5",
                weight: 5,
                opacity: 0.55,
                lineCap: "round",
                lineJoin: "round",
                dashArray: "8 6",
              }}
            />
          ));
        })}

        {/* SELECTED route ON TOP */}
        {hasMultipleRoutes && allRoutes[selectedRouteIdx]?.risk_segments?.map((segment, idx) => (
          <Polyline
            key={`safe-route-seg-${idx}`}
            positions={segment.path.map(p => [p[0], p[1]] as [number, number])}
            pathOptions={{
              color: segment.color,
              weight: 7,
              opacity: 0.9,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        ))}

        {/* Single route fallback */}
        {!hasMultipleRoutes && routeSegments.map((segment, idx) => (
          <Polyline
            key={`route-seg-${idx}`}
            positions={segment.path.map(p => [p[0], p[1]] as [number, number])}
            pathOptions={{
              color: segment.color,
              weight: 7,
              opacity: 0.85,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        ))}

        {/* Crime Hotspots — pulsing red circles */}
        {crimeHotspots.map((spot, idx) => (
          <CircleMarker
            key={`crime-${idx}`}
            center={[spot.lat, spot.lng]}
            radius={10}
            pathOptions={{
              color: "#dc2626",
              fillColor: "#ef4444",
              fillOpacity: 0.6 * spot.relevance,
              weight: 2,
              className: "crime-hotspot-pulse",
            }}
          >
            <Popup>
              <div style={{ fontFamily: "sans-serif", fontSize: "12px" }}>
                <strong style={{ color: "#dc2626" }}>⚠️ Crime Reported</strong><br />
                Time: {spot.hour}:00<br />
                📍 {spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* User Markers */}
        {markers.map((marker, idx) => (
          <Marker key={`marker-${idx}`} position={[marker.lat, marker.lng]}>
            {marker.info && <Popup>{marker.info}</Popup>}
          </Marker>
        ))}
      </MapContainer>

      {/* Route Legend */}
      {hasAnyRoute && (
        <div className="absolute bottom-4 right-4 z-[500] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-xl p-3 shadow-lg border border-zinc-200 dark:border-zinc-700">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Route Legend</div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-[3px] bg-emerald-500 rounded-full" />
              <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Safe Zone</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-[3px] bg-yellow-500 rounded-full" />
              <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Moderate Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-[3px] bg-red-500 rounded-full" />
              <span className="text-[11px] text-zinc-600 dark:text-zinc-400">High Risk</span>
            </div>
            {hasMultipleRoutes && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-[3px] bg-red-300 rounded-full" style={{ borderBottom: "2px dashed #fca5a5" }} />
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Alt. Route</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full border border-red-700" />
              <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Crime Incident</span>
            </div>
          </div>
        </div>
      )}

      {/* User position indicator (floating label) */}
      {userPosition && (
        <div className="absolute top-4 left-4 z-[500] bg-blue-500/90 backdrop-blur-md rounded-xl px-3 py-1.5 shadow-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-[11px] text-white font-semibold">Live GPS Active</span>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-white/10 dark:to-black/20 z-[400]" />
    </motion.div>
  );
};

export default MapComponent;
