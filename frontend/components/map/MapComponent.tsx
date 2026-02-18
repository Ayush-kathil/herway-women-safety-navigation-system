"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Circle, Polyline, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
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

const MapComponent = ({ center, zoom, onLocationSelect, markers = [], gridData = [], routeSegments = [], crimeHotspots = [], allRoutes = [], selectedRouteIdx = 0 }: MapProps) => {
  
  const hasMultipleRoutes = allRoutes.length > 1;
  const hasAnyRoute = allRoutes.length > 0 || routeSegments.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="w-full h-full rounded-2xl overflow-hidden glass shadow-2xl relative z-0"
    >
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ChangeView center={center} zoom={zoom} />
        <MapEvents onLocationSelect={onLocationSelect} />

        {/* Safety Grid Heatmap */}
        {gridData.map((cell, idx) => (
          <Circle 
            key={`grid-${idx}`}
            center={[cell.lat, cell.lng]}
            pathOptions={{ 
              fillColor: cell.color, 
              color: 'transparent', 
              fillOpacity: 0.4 
            }}
            radius={400} 
          />
        ))}

        {/* --- MULTI-ROUTE DISPLAY --- */}
        {/* Render NON-SELECTED (risky/alternative) routes FIRST (behind) in light red */}
        {hasMultipleRoutes && allRoutes.map((route, rIdx) => {
          if (rIdx === selectedRouteIdx) return null;
          return route.risk_segments?.map((segment, sIdx) => (
            <Polyline
              key={`alt-route-${rIdx}-seg-${sIdx}`}
              positions={segment.path.map(p => [p[0], p[1]] as [number, number])}
              pathOptions={{
                color: '#fca5a5',
                weight: 5,
                opacity: 0.55,
                lineCap: "round",
                lineJoin: "round",
                dashArray: "8 6",
              }}
            />
          ));
        })}

        {/* Render the SELECTED (safest/recommended) route ON TOP with full safety colors */}
        {hasMultipleRoutes && allRoutes[selectedRouteIdx]?.risk_segments?.map((segment, idx) => (
          <Polyline 
            key={`safe-route-seg-${idx}`}
            positions={segment.path.map(p => [p[0], p[1]] as [number, number])}
            pathOptions={{ 
              color: segment.color, 
              weight: 7, 
              opacity: 0.9,
              lineCap: "round",
              lineJoin: "round"
            }} 
          />
        ))}

        {/* Fallback: single route with old routeSegments prop */}
        {!hasMultipleRoutes && routeSegments.map((segment, idx) => (
          <Polyline 
            key={`route-seg-${idx}`}
            positions={segment.path.map(p => [p[0], p[1]] as [number, number])}
            pathOptions={{ 
              color: segment.color, 
              weight: 7, 
              opacity: 0.85,
              lineCap: "round",
              lineJoin: "round"
            }} 
          />
        ))}

        {/* Crime Hotspots */}
        {crimeHotspots.map((spot, idx) => (
          <CircleMarker
            key={`crime-${idx}`}
            center={[spot.lat, spot.lng]}
            radius={8}
            pathOptions={{
              color: '#dc2626',
              fillColor: '#ef4444',
              fillOpacity: 0.7 * spot.relevance,
              weight: 2,
            }}
          >
            <Popup>
              <div style={{ fontFamily: 'sans-serif', fontSize: '12px' }}>
                <strong style={{ color: '#dc2626' }}>⚠️ Crime Reported</strong><br/>
                Time: {spot.hour}:00<br/>
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
      
      {/* Floating Map Legend */}
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
                <div className="w-6 h-[3px] bg-red-300 rounded-full" style={{ borderBottom: '2px dashed #fca5a5' }} />
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Alt. Route (Riskier)</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full border border-red-700" />
              <span className="text-[11px] text-zinc-600 dark:text-zinc-400">Crime Incident</span>
            </div>
          </div>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-white/20 dark:to-black/20 z-[400]" />
    </motion.div>
  );
};

export default MapComponent;
