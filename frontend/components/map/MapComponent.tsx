"use client";

import { useEffect, useRef, useState, useMemo } from "react";
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

import { SafePlace } from "@/lib/types";

interface MapProps {
  center: [number, number];
  zoom: number;
  onLocationSelect?: (lat: number, lng: number) => void;
  markers?: Array<{ lat: number; lng: number; color?: string; info?: string }>;
  gridData?: Array<{ lat: number; lng: number; score: number; color: string }>;
  routeSegments?: RouteSegment[];
  crimeHotspots?: CrimeHotspot[];
  safePlaces?: SafePlace[]; // NEW
  allRoutes?: RouteData[];
  selectedRouteIdx?: number;
  userPosition?: { lat: number; lng: number; heading: number | null } | null;
  isNavigating?: boolean;
  mapTheme?: MapTheme;
  showTraffic?: boolean;
  startPoint?: { lat: number; lng: number };
  endPoint?: { lat: number; lng: number };
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

function FollowUser({ lat, lng, isNavigating, is3D }: { lat: number; lng: number; isNavigating: boolean; is3D: boolean }) {
  const map = useMap();
  const prevPos = useRef<[number, number] | null>(null);
  const prevIs3D = useRef<boolean>(is3D);

  useEffect(() => {
    if (!isNavigating) return;
    const newPos: [number, number] = [lat, lng];
    const modeChanged = prevIs3D.current !== is3D;
    
    // Premium 3D Navigation Behavior (Google Maps Style)
    if (is3D) {
       // Aggressively fly to the point with high zoom (19) and tilt
       map.flyTo(newPos, 19, { animate: true, duration: 2.0, easeLinearity: 0.1 });
    } else {
       // Standard 2D Behavior
       if (modeChanged || !prevPos.current) {
         // Zoom out if we just switched to 2D
         map.flyTo(newPos, 16, { duration: 1.5 });
       } else {
         // Smooth panning for normal 2D movement
         map.panTo(newPos, { animate: true, duration: 0.8 });
       }
    }
    prevPos.current = newPos;
    prevIs3D.current = is3D;
  }, [lat, lng, isNavigating, is3D, map]);

  return null;
}

// Constant user dot icon to stop React-Leaflet from thrashing the DOM on re-render
const userDotIcon = L.divIcon({
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
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
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

const TOMTOM_KEY = process.env.NEXT_PUBLIC_TOMTOM_KEY || "";
const TRAFFIC_LAYER = {
  url: `https://{s}.api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${TOMTOM_KEY}&tileSize=256`,
  subdomains: ["a", "b", "c", "d"],
  attribution: '&copy; <a href="https://developer.tomtom.com/">TomTom</a> Traffic',
};

// Custom Icons
const startIcon = L.divIcon({
  className: "custom-map-icon",
  html: `<div class="w-4 h-4 bg-black dark:bg-white rounded-full border-2 border-white dark:border-black shadow-lg relative"><div class="absolute -inset-2 bg-black/20 dark:bg-white/20 rounded-full animate-ping"></div></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const endIcon = L.divIcon({
  className: "custom-map-icon",
  html: `<div class="w-8 h-8 flex items-center justify-center"><div class="text-2xl">🏁</div></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const policeIcon = L.divIcon({
  className: "custom-map-icon",
  html: `<div class="w-8 h-8 bg-blue-600 rounded-full border-2 border-white text-white flex items-center justify-center shadow-md"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const hospitalIcon = L.divIcon({
  className: "custom-map-icon",
  html: `<div class="w-8 h-8 bg-red-600 rounded-full border-2 border-white text-white flex items-center justify-center shadow-md"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v8"/><path d="M8 12h8"/></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const defaultSafeIcon = L.divIcon({
  className: "custom-map-icon",
  html: `<div class="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-md"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const MapComponent = ({
  center,
  zoom,
  onLocationSelect,
  markers = [],
  gridData = [],
  routeSegments = [],
  crimeHotspots = [],
  safePlaces = [],
  allRoutes = [],
  selectedRouteIdx = 0,
  userPosition = null,
  isNavigating = false,
  mapTheme = "dark",
  showTraffic = false,
  startPoint,
  endPoint,
}: MapProps) => {

  const hasMultipleRoutes = allRoutes.length > 1;
  const hasAnyRoute = allRoutes.length > 0 || routeSegments.length > 0;
  const tile = TILE_LAYERS[mapTheme];
  const [is3D, setIs3D] = useState(false);

  const [prevIsNavigating, setPrevIsNavigating] = useState(isNavigating);
  if (isNavigating !== prevIsNavigating) {
    setPrevIsNavigating(isNavigating);
    if (isNavigating) {
      setIs3D(true);
    }
  }

  const headingIcon = useMemo(() => {
    if (!userPosition || userPosition.heading === null || userPosition.heading === undefined) return null;
    return createHeadingIcon(userPosition.heading);
  }, [userPosition]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        // improved 3D transform for "Google Maps" feel with fixed edge clipping
        transform: is3D 
          ? "perspective(1000px) rotateX(55deg) scale(1.8) translateY(25%)" 
          : "perspective(1000px) rotateX(0deg) scale(1) translateY(0)"
      }}
      transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }} 
      className="w-full h-full rounded-2xl overflow-hidden glass shadow-2xl relative z-0 origin-bottom"
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

        {/* Start/End Markers */}
        {startPoint && (
          <Marker position={[startPoint.lat, startPoint.lng]} icon={startIcon} />
        )}
        {endPoint && (
          <Marker position={[endPoint.lat, endPoint.lng]} icon={endIcon} />
        )}

        {/* Follow user during navigation */}
        {userPosition && isNavigating && (
          <FollowUser lat={userPosition.lat} lng={userPosition.lng} isNavigating={isNavigating} is3D={is3D} />
        )}

        {/* User Position - Pulsing Blue Dot */}
        {userPosition && (
          <>
            {/* Accuracy circle */}
            <Circle
              center={[userPosition.lat, userPosition.lng]}
              radius={30}
              pathOptions={{
                color: "rgba(0,0,0,0.3)",
                fillColor: "rgba(0,0,0,0.1)",
                fillOpacity: 0.1,
                weight: 1,
              }}
            />
            {/* Blue dot marker */}
            <Marker
              position={[userPosition.lat, userPosition.lng]}
              icon={userDotIcon}
            >
              <Popup>
                <div style={{ fontFamily: "serif", fontSize: "12px" }}>
                  <strong style={{ color: "#000000", textTransform: "uppercase", letterSpacing: "1px" }}>Your Location</strong>
                </div>
              </Popup>
            </Marker>
            {/* Heading arrow */}
            {headingIcon && userPosition && (
              <Marker
                position={[userPosition.lat, userPosition.lng]}
                icon={headingIcon}
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
                color: "#71717a", // Zinc-500
                weight: 4,
                opacity: 0.4,
                lineCap: "round",
                lineJoin: "round",
                dashArray: "1, 6",
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

        {/* Safe Places Markers */}
        {safePlaces.map((place, idx) => {
          let icon = defaultSafeIcon;
          if (place.type === "police_station") icon = policeIcon;
          else if (place.type === "hospital") icon = hospitalIcon;
          
          return (
            <Marker
              key={`safe-${idx}`}
              position={[place.lat, place.lng]}
              icon={icon}
            >
              <Popup>
                <div style={{ fontFamily: "serif", minWidth: "150px" }}>
                  <strong style={{ fontSize: "14px", color: "#000" }}>{place.name}</strong><br />
                  <span style={{ textTransform: "uppercase", fontSize: "10px", color: "#666", letterSpacing: "1px" }}>{place.type.replace("_", " ")}</span>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* User Markers */}
        {markers.map((marker, idx) => (
          <Marker key={`marker-${idx}`} position={[marker.lat, marker.lng]}>
            {marker.info && <Popup>{marker.info}</Popup>}
          </Marker>
        ))}
      </MapContainer>
      
      {/* 3D Toggle Button */}
      <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-2">
         <button
            onClick={() => setIs3D(!is3D)}
            className="p-3 bg-white dark:bg-black text-zinc-800 dark:text-zinc-200 rounded-full shadow-2xl border-2 border-zinc-200 dark:border-zinc-800 hover:scale-110 active:scale-95 transition-all font-black text-xs uppercase tracking-widest"
            title="Toggle 3D View"
         >
            {is3D ? "2D" : "3D"}
         </button>
      </div>

      {/* Route Legend */}
      {hasAnyRoute && (
        <div className="absolute bottom-6 right-6 z-[500] bg-white dark:bg-black rounded-lg p-4 shadow-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="text-[10px] font-serif font-bold uppercase tracking-widest text-zinc-500 mb-3 border-b border-zinc-100 dark:border-zinc-900 pb-2">
            Route Legend
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-[2px] bg-emerald-600 dark:bg-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Safe</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-[2px] bg-yellow-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Moderate</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-[2px] bg-red-600 dark:bg-red-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">High Risk</span>
            </div>
            {hasMultipleRoutes && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-[2px] bg-zinc-400" style={{ borderBottom: "2px dotted #a1a1aa" }} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Alt. Route</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-red-600 rounded-full border border-black dark:border-white" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Incident</span>
            </div>
          </div>
        </div>
      )}

      {/* User position indicator (floating label) */}
      {userPosition && (
        <div className="absolute top-6 left-6 z-[500] bg-white dark:bg-black border border-black dark:border-white px-4 py-2 shadow-xl flex items-center gap-3">
          <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-pulse" />
          <span className="text-[10px] font-serif font-bold uppercase tracking-widest text-black dark:text-white">Live GPS Active</span>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-white/10 dark:to-black/20 z-[400]" />
    </motion.div>
  );
};

export default MapComponent;
