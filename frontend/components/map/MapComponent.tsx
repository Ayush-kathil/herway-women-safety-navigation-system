"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Map, { Source, Layer, Marker, MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { motion, AnimatePresence } from "framer-motion";
import { SafePlace, RouteStats } from "@/lib/types";

interface RouteSegment {
  path: number[][]; // [lat, lng] array
  score: number;
  color: string;
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
  safePlaces?: SafePlace[];
  allRoutes?: RouteStats[];
  selectedRouteIdx?: number;
  userPosition?: { lat: number; lng: number; heading: number | null } | null;
  isNavigating?: boolean;
  mapTheme?: MapTheme;
  showTraffic?: boolean;
  startPoint?: { lat: number; lng: number };
  endPoint?: { lat: number; lng: number };
}

// Convert [lat, lng] to [lng, lat] for MapLibre GeoJSON
function toGeoJSONLine(path: number[][]) {
  return {
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "LineString" as const,
      coordinates: path.map(p => [p[1], p[0]])
    }
  };
}

export default function MapComponent(props: MapProps) {
  const mapRef = useRef<MapRef>(null);
  const is3D = Boolean(props.isNavigating);
  const [selectedPopup, setSelectedPopup] = useState<{type: 'safe', data: SafePlace} | {type: 'crime', data: CrimeHotspot} | null>(null);

  // Handle 3D transitions natively through WebGL Pitch/Bearing! 
  // This solves the CSS clipping perfectly.
  useEffect(() => {
    if (!mapRef.current) return;
    if (is3D) {
      mapRef.current.flyTo({ 
        pitch: 65, 
        bearing: props.userPosition?.heading || 0,
        zoom: 18,
        duration: 1500 
      });
    } else {
      mapRef.current.flyTo({ 
        pitch: 0, 
        bearing: 0,
        duration: 1000 
      });
    }
  }, [is3D, props.userPosition?.heading]);

  // Follow User smoothly
  useEffect(() => {
    if (props.isNavigating && props.userPosition && mapRef.current) {
       mapRef.current.flyTo({
          center: [props.userPosition.lng, props.userPosition.lat],
          zoom: is3D ? 19 : 16,
          bearing: is3D ? (props.userPosition.heading || 0) : 0,
          duration: 1000,
          essential: true
       });
    }
  }, [props.userPosition, props.isNavigating, is3D]);

  // Handle initial bounds or start point
  useEffect(() => {
     if (!props.isNavigating && props.startPoint && mapRef.current) {
        mapRef.current.flyTo({ center: [props.startPoint.lng, props.startPoint.lat], zoom: 15 });
     }
  }, [props.startPoint, props.isNavigating]);

  const mapStyle = useMemo(() => {
    const tileUrl = props.mapTheme === 'dark' 
      ? "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png"
      : "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png";

    return {
      version: 8 as const,
      sources: {
        'raster-tiles': {
          type: 'raster' as const,
          tiles: [tileUrl],
          tileSize: 256
        }
      },
      layers: [{
        id: 'simple-tiles',
        type: 'raster' as const,
        source: 'raster-tiles',
        minzoom: 0,
        maxzoom: 22
      }]
    };
  }, [props.mapTheme]);

  const gridGeoJson = useMemo(() => ({
    type: "FeatureCollection" as const,
    features: (props.gridData || []).map((cell, index) => ({
      type: "Feature" as const,
      properties: {
        id: index,
        score: cell.score,
        color: cell.color,
      },
      geometry: {
        type: "Point" as const,
        coordinates: [cell.lng, cell.lat],
      },
    })),
  }), [props.gridData]);

  const hasMultipleRoutes = (props.allRoutes?.length || 0) > 1;
  const hasAnyRoute = (props.allRoutes?.length || 0) > 0 || (props.routeSegments?.length || 0) > 0;

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden glass shadow-2xl relative z-0">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: props.center[1],
          latitude: props.center[0],
          zoom: props.zoom,
          pitch: 0,
          bearing: 0
        }}
        mapStyle={mapStyle}
        style={{ width: "100%", height: "100%" }}
        onClick={(e) => {
           if (props.onLocationSelect) props.onLocationSelect(e.lngLat.lat, e.lngLat.lng);
           setSelectedPopup(null);
        }}
        maxPitch={85}
        interactiveLayerIds={['crime-hotspots']}
      >
        {(props.gridData || []).length > 0 && (
          <Source id="safety-grid" type="geojson" data={gridGeoJson}>
            <Layer
              id="safety-grid-cells"
              type="circle"
              paint={{
                "circle-radius": ["interpolate", ["linear"], ["get", "score"], 0, 12, 100, 22],
                "circle-color": [
                  "case",
                  ["==", ["get", "color"], "red"], "#ef4444",
                  ["==", ["get", "color"], "yellow"], "#eab308",
                  "#10b981",
                ],
                "circle-opacity": 0.18,
                "circle-stroke-color": "#ffffff",
                "circle-stroke-width": 0.4,
              }}
            />
          </Source>
        )}

        {/* Crime Hotspots Heatmap Circles */}
        {(props.crimeHotspots || []).map((spot, idx) => (
           <Marker key={`crime-${idx}`} longitude={spot.lng} latitude={spot.lat} anchor="center">
             <div 
               className="rounded-full bg-red-600/50 border border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.7)] animate-pulse cursor-pointer"
               style={{ width: 40 * spot.relevance, height: 40 * spot.relevance }}
               onClick={(e) => {
                 e.stopPropagation();
                 setSelectedPopup({ type: 'crime', data: spot });
               }}
             />
           </Marker>
        ))}

        {/* Selected Route / Green Line */}
        {(props.allRoutes || []).map((route, rIdx) => {
           const isSelected = props.selectedRouteIdx === rIdx;
           if (!isSelected) {
               // Render unselected variants below
               return route.risk_segments?.map((seg, sIdx) => (
                 <Source key={`alt-${rIdx}-${sIdx}`} type="geojson" data={toGeoJSONLine(seg.path)}>
                   <Layer 
                     id={`layer-alt-${rIdx}-${sIdx}`}
                     type="line"
                     paint={{ "line-color": "#ef4444", "line-width": 4, "line-opacity": 0.5, "line-dasharray": [2, 2] }}
                   />
                 </Source>
               ));
           } else {
               // Safest recommended route explicit green
               return route.risk_segments?.map((seg, sIdx) => (
                 <Source key={`main-${rIdx}-${sIdx}`} type="geojson" data={toGeoJSONLine(seg.path)}>
                   <Layer 
                     id={`layer-main-${rIdx}-${sIdx}`}
                     type="line"
                     layout={{ "line-join": "round", "line-cap": "round" }}
                     paint={{ "line-color": "#10b981", "line-width": 8, "line-opacity": 0.9 }}
                   />
                 </Source>
               ));
           }
        })}

        {/* Fallback Single Segments */}
        {!hasMultipleRoutes && (props.routeSegments || []).map((seg, sIdx) => (
           <Source key={`single-${sIdx}`} type="geojson" data={toGeoJSONLine(seg.path)}>
             <Layer 
               id={`layer-single-${sIdx}`}
               type="line"
               layout={{ "line-join": "round", "line-cap": "round" }}
               paint={{ "line-color": "#10b981", "line-width": 8, "line-opacity": 0.9 }}
             />
           </Source>
        ))}

        {/* Start / End Markers */}
        {props.startPoint && (
          <Marker longitude={props.startPoint.lng} latitude={props.startPoint.lat} anchor="center">
            <div className="w-5 h-5 bg-black dark:bg-white rounded-full border-2 border-white dark:border-black shadow-lg relative">
              <div className="absolute -inset-2 bg-black/30 dark:bg-white/30 rounded-full animate-ping"></div>
            </div>
          </Marker>
        )}
        {props.endPoint && (
          <Marker longitude={props.endPoint.lng} latitude={props.endPoint.lat} anchor="bottom">
             <div className="text-4xl drop-shadow-xl">🏁</div>
          </Marker>
        )}

        {/* Safe Places */}
        {(props.safePlaces || []).map((place, idx) => {
           const isPolice = place.type === "police_station";
           const isHosp = place.type === "hospital";
           return (
             <Marker key={`safe-${idx}`} longitude={place.lng} latitude={place.lat} anchor="center">
               <div 
                 onClick={(e) => { e.stopPropagation(); setSelectedPopup({ type: 'safe', data: place }); }}
                 className={`w-10 h-10 rounded-full border-2 border-white text-white flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition-transform ${isPolice ? 'bg-blue-600' : isHosp ? 'bg-red-600' : 'bg-green-500'}`}
               >
                 {isPolice ? "🚓" : isHosp ? "🏥" : "🛡️"}
               </div>
             </Marker>
           )
        })}

        {/* User Navigation Marker */}
        {props.userPosition && (
          <Marker longitude={props.userPosition.lng} latitude={props.userPosition.lat} anchor="center">
            {props.isNavigating ? (
               <div 
                 className="relative flex items-center justify-center w-12 h-12 transition-all duration-300"
                 style={{ 
                   transform: `rotate(${props.userPosition.heading || 0}deg)`,
                   // We add a drop shadow to simulate 3D altitude hovering slightly
                   filter: 'drop-shadow(0px 10px 8px rgba(0,0,0,0.4))'
                 }}
               >
                 <span className="text-3xl filter saturate-150">🚗</span>
               </div>
            ) : (
              <div className="relative flex items-center justify-center w-12 h-12">
                 {/* Accuracy Pulse */}
                 <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
                 {/* Core */}
                 <div className="w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-xl z-10 transition-transform"></div>
              </div>
            )}
          </Marker>
        )}
      </Map>

      {/* Popups rendered via HTML overlay instead of WebGL for better styling */}
      <AnimatePresence>
        {selectedPopup && selectedPopup.type === 'safe' && (
           <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[80px] z-50 bg-white dark:bg-black p-3 rounded-lg shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center">
              <strong className="text-black dark:text-white font-serif">{selectedPopup.data.name}</strong>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{selectedPopup.data.type?.replace("_", " ")}</span>
           </motion.div>
        )}
        {selectedPopup && selectedPopup.type === 'crime' && (
           <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-red-600 text-white p-3 rounded-lg shadow-[0_0_30px_rgba(220,38,38,0.5)] border border-red-400 flex flex-col items-center">
              <strong className="font-bold uppercase flex items-center gap-2">⚠️ Crime Cluster Alert</strong>
              <span className="text-xs opacity-90 mt-1">Historically dangerous hour: {selectedPopup.data.hour}:00</span>
           </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Toggle Button */}
      <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-2">
         <button
            onClick={() => setIs3D(!is3D)}
            className="p-3 bg-white dark:bg-black text-zinc-800 dark:text-zinc-200 rounded-full shadow-2xl border-2 border-zinc-200 dark:border-zinc-800 hover:scale-110 active:scale-95 transition-all font-black text-xs uppercase tracking-widest"
         >
            {is3D ? "2D" : "3D"}
         </button>
      </div>

      {/* Route Legend overlay */}
      {hasAnyRoute && (
        <div className="absolute bottom-6 right-6 z-[500] bg-white dark:bg-black rounded-lg p-4 shadow-2xl border border-zinc-200 dark:border-zinc-800">
           <div className="text-[10px] font-serif font-bold uppercase tracking-widest text-zinc-500 mb-3 border-b border-zinc-100 dark:border-zinc-900 pb-2">
             Route Legend
           </div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-[3px] bg-emerald-500 rounded" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Safest / Recommended Line</span>
           </div>
           {hasMultipleRoutes && (
             <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-[3px] bg-zinc-400 rounded border-b-[2px] border-dotted border-zinc-300" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Alternative Options</span>
             </div>
           )}
           <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-red-600 rounded-full border border-black dark:border-white animate-pulse shadow-[0_0_5px_rgba(220,38,38,1)]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Crime Hotspot Area</span>
           </div>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/30 dark:to-white/5 z-40" />
    </div>
  );
}
