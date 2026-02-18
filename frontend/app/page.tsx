"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, MapPin, Navigation, Layers, TriangleAlert, RotateCcw, Route, ChevronRight, Zap, ShieldCheck, ShieldAlert, Clock, CheckCircle2, XCircle, AlertTriangle, Info, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Map = dynamic(() => import("@/components/map"), { ssr: false });
const ClockPicker = dynamic(() => import("@/components/ui/ClockPicker"), { ssr: false });

const DEFAULT_CENTER: [number, number] = [22.7196, 75.8577];

const SAFETY_TIPS: Record<string, string[]> = {
  night: [
    "Avoid dimly lit streets and isolated areas",
    "Share your live location with a trusted contact",
    "Keep emergency numbers on speed dial",
    "Stay on well-populated main roads",
  ],
  evening: [
    "Be aware of your surroundings as visibility decreases",
    "Prefer routes with active shops and street lights",
    "Inform someone about your travel plans",
  ],
  day: [
    "Stay hydrated and aware in crowded areas",
    "Use busy intersections for crossing",
    "Keep valuables out of sight",
  ],
};

function getSafetyTipsForHour(hour: number) {
  if (hour >= 20 || hour <= 4) return { label: "Night Safety Tips", tips: SAFETY_TIPS.night, icon: "🌙" };
  if (hour >= 17 && hour <= 19) return { label: "Evening Safety Tips", tips: SAFETY_TIPS.evening, icon: "🌆" };
  return { label: "Daytime Tips", tips: SAFETY_TIPS.day, icon: "☀️" };
}

export default function Dashboard() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [mode, setMode] = useState<"explore" | "route">("explore");
  const [hour, setHour] = useState(new Date().getHours());
  
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [safetyData, setSafetyData] = useState<any>(null);
  
  const [routeStart, setRouteStart] = useState<{ lat: number; lng: number } | null>(null);
  const [routeEnd, setRouteEnd] = useState<{ lat: number; lng: number } | null>(null);
  const [routeData, setRouteData] = useState<any>(null);
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);
  const [crimeHotspots, setCrimeHotspots] = useState<any[]>([]);
  
  const [gridData, setGridData] = useState<any[]>([]);
  const [showGrid, setShowGrid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<"checking" | "connected" | "error">("checking");
  const [errorMsg, setErrorMsg] = useState("");

  // Check backend health on mount
  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async () => {
    setBackendStatus("checking");
    try {
      const res = await fetch("http://localhost:8000/health", { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      if (data.status === "ok" && data.model_loaded) {
        setBackendStatus("connected");
      } else {
        setBackendStatus("error");
        setErrorMsg(data.model_loaded ? "Backend running but model not loaded" : "Model not loaded — run train_model.py");
      }
    } catch {
      setBackendStatus("error");
      setErrorMsg("Cannot connect to backend. Make sure the server is running on port 8000.");
    }
  };

  useEffect(() => {
    if (showGrid) fetchGrid();
    else setGridData([]);
  }, [showGrid, hour]);

  useEffect(() => {
    if (routeStart && routeEnd && routeData) {
      analyzeRoute(routeStart, routeEnd);
    }
  }, [hour]);

  useEffect(() => {
    if (selectedLocation && mode === "explore") {
      fetchSafety(selectedLocation.lat, selectedLocation.lng);
    }
  }, [hour]);

  const fetchGrid = async () => {
    try {
      const res = await fetch(`http://localhost:8000/get_safety_grid?lat_min=22.6&lat_max=22.85&long_min=75.7&long_max=76.0&hour=${hour}`);
      const data = await res.json();
      setGridData(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSafety = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/predict_safety?lat=${lat}&long=${lng}&hour=${hour}`);
      const data = await res.json();
      setSafetyData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCrimeHotspots = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`http://localhost:8000/get_crime_hotspots?lat=${lat}&lng=${lng}&radius=3000&hour=${hour}`);
      const data = await res.json();
      setCrimeHotspots(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLocationSelect = async (lat: number, lng: number) => {
    if (mode === "explore") {
      setSelectedLocation({ lat, lng });
      setSidebarOpen(true);
      fetchSafety(lat, lng);
      fetchCrimeHotspots(lat, lng);
    } else if (mode === "route") {
      if (!routeStart) {
        setRouteStart({ lat, lng });
      } else if (!routeEnd) {
        setRouteEnd({ lat, lng });
        analyzeRoute({ lat: routeStart.lat, lng: routeStart.lng }, { lat, lng });
      } else {
        setRouteStart({ lat, lng });
        setRouteEnd(null);
        setRouteData(null);
        setCrimeHotspots([]);
        setSelectedRouteIdx(0);
      }
    }
  };

  const analyzeRoute = async (start: {lat: number, lng: number}, end: {lat: number, lng: number}) => {
    setLoading(true);
    setSidebarOpen(true);
    try {
        const res = await fetch("http://localhost:8000/analyze_route", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ waypoints: [[start.lat, start.lng], [end.lat, end.lng]], hour })
        });
        const data = await res.json();
        if (data.error) {
          console.error("Route error:", data.error);
          setErrorMsg(data.error);
        } else {
          setRouteData(data);
          setSelectedRouteIdx(0);
          setErrorMsg("");
          const midLat = (start.lat + end.lat) / 2;
          const midLng = (start.lng + end.lng) / 2;
          fetchCrimeHotspots(midLat, midLng);
        }
    } catch (e) {
        console.error(e);
        setErrorMsg("Failed to analyze route. Check your internet connection.");
    } finally {
        setLoading(false);
    }
  };

  const resetRoute = () => {
    setRouteStart(null);
    setRouteEnd(null);
    setRouteData(null);
    setCrimeHotspots([]);
    setSelectedRouteIdx(0);
    setErrorMsg("");
  };

  const getCurrentRouteSegments = () => {
    if (!routeData) return [];
    if (selectedRouteIdx === 0) return routeData.recommended?.risk_segments ?? [];
    const alt = routeData.alternatives?.[selectedRouteIdx - 1];
    return alt?.risk_segments ?? [];
  };

  const getCurrentRouteStats = () => {
    if (!routeData) return null;
    if (selectedRouteIdx === 0) return routeData.recommended;
    return routeData.alternatives?.[selectedRouteIdx - 1] ?? null;
  };

  const allRoutes = routeData ? [routeData.recommended, ...(routeData.alternatives || [])] : [];
  const currentStats = getCurrentRouteStats();
  const tipsData = getSafetyTipsForHour(hour);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50 font-sans selection:bg-rose-500/30">
      
      <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      <header className="absolute top-4 left-4 right-4 h-16 glass rounded-2xl z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500 rounded-xl shadow-lg shadow-rose-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
            HerWay
          </h1>
        </div>
        <div className="flex items-center gap-2">
           {/* Backend status indicator */}
           <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider",
             backendStatus === "connected" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" :
             backendStatus === "error" ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" :
             "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 animate-pulse"
           )}>
             <div className={cn("w-1.5 h-1.5 rounded-full",
               backendStatus === "connected" ? "bg-emerald-500" :
               backendStatus === "error" ? "bg-red-500" : "bg-zinc-400"
             )} />
             {backendStatus === "connected" ? "AI Connected" : backendStatus === "error" ? "Offline" : "Checking..."}
           </div>
           <button 
             onClick={() => setShowGrid(!showGrid)}
             className={cn("p-2 rounded-xl transition-all", showGrid ? "bg-rose-100 text-rose-600 dark:bg-rose-900/30" : "hover:bg-zinc-100 dark:hover:bg-zinc-800")}
             title="Toggle Safety Grid"
           >
             <Layers className="w-5 h-5" />
           </button>
        </div>
      </header>

      <main className="relative z-10 w-full h-full pt-24 pb-4 px-4 flex gap-4">
        
        <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            className="w-full md:w-[420px] h-full glass rounded-3xl p-5 flex flex-col gap-4 shadow-2xl relative overflow-y-auto"
          >
             {/* Backend Error Banner */}
             {backendStatus === "error" && (
               <motion.div
                 initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="p-3 rounded-xl bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/30"
               >
                 <div className="flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400 mb-1">
                   <XCircle className="w-4 h-4" /> Backend Unavailable
                 </div>
                 <p className="text-xs text-red-500/80 dark:text-red-400/60">{errorMsg}</p>
                 <button onClick={checkBackend} className="mt-2 text-xs font-medium text-red-600 dark:text-red-400 hover:underline flex items-center gap-1">
                   <RotateCcw className="w-3 h-3" /> Retry Connection
                 </button>
               </motion.div>
             )}

             {/* Mode Toggle */}
             <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                 <button 
                   onClick={() => { setMode("explore"); resetRoute(); }}
                   className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition-all", mode === "explore" ? "bg-white dark:bg-zinc-700 shadow-sm text-rose-500" : "text-zinc-500 hover:text-zinc-700")}
                 >
                   🔍 Explore
                 </button>
                 <button 
                   onClick={() => { setMode("route"); setSelectedLocation(null); setSafetyData(null); setCrimeHotspots([]); }}
                   className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition-all", mode === "route" ? "bg-white dark:bg-zinc-700 shadow-sm text-rose-500" : "text-zinc-500 hover:text-zinc-700")}
                 >
                   🧭 Navigate
                 </button>
             </div>

             {/* Premium Clock Picker */}
             <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
               <ClockPicker hour={hour} onChange={setHour} />
             </div>

             {/* EXPLORE MODE */}
             {mode === "explore" && (
                <>
                  {!selectedLocation ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                      <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center animate-pulse">
                        <MapPin className="w-7 h-7 text-zinc-400" />
                      </div>
                      <p className="text-sm text-zinc-500">Tap anywhere on the map to analyze safety.</p>
                    </div>
                  ) : safetyData ? (
                     <div className="space-y-3">
                       <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-center">
                          <div className={cn("text-5xl font-black mb-1", 
                            safetyData.safety_score > 75 ? "text-red-500" : 
                            safetyData.safety_score > 40 ? "text-yellow-500" : "text-emerald-500"
                          )}>
                            {safetyData.safety_score}
                          </div>
                          <div className="text-xs uppercase tracking-widest text-zinc-400 mb-2">Risk Score</div>
                          <div className={cn("inline-block px-3 py-1 rounded-full text-xs font-bold",
                            safetyData.zone_color === "red" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                            safetyData.zone_color === "yellow" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                            "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          )}>
                            {safetyData.category}
                          </div>
                       </div>
                       
                       {/* Dynamic Advice */}
                       <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 text-sm text-zinc-600 dark:text-zinc-400">
                         💡 {safetyData.advice}
                       </div>

                       {/* Data source indicator */}
                       {safetyData.crime_count !== undefined && (
                         <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/30 text-[10px] text-zinc-400 uppercase tracking-wider">
                           <span>📊 ML Model: {safetyData.model_raw_score}</span>
                           <span>🔴 Crimes nearby: {safetyData.crime_count}</span>
                         </div>
                       )}

                       {crimeHotspots.length > 0 && (
                         <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
                            <div className="flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400">
                              <TriangleAlert className="w-4 h-4" /> {crimeHotspots.length} Crime Incidents Nearby
                            </div>
                         </div>
                       )}
                     </div>
                  ) : loading ? (
                    <div className="space-y-3">
                      <div className="h-24 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
                      <div className="h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
                    </div>
                  ) : null}
                </>
             )}

             {/* ROUTE MODE */}
             {mode === "route" && (
                <div className="space-y-3">
                    {/* Start / End point indicators */}
                    <div className="flex flex-col gap-2">
                        <div className={cn("p-3 rounded-xl border flex items-center gap-3 transition-all", routeStart ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10" : "border-dashed border-zinc-300 dark:border-zinc-700")}>
                            <div className={cn("w-3 h-3 rounded-full", routeStart ? "bg-emerald-500" : "bg-zinc-300")} />
                            <span className="text-sm">{routeStart ? `${routeStart.lat.toFixed(4)}, ${routeStart.lng.toFixed(4)}` : "Click map for START"}</span>
                        </div>
                        <div className={cn("p-3 rounded-xl border flex items-center gap-3 transition-all", routeEnd ? "border-rose-500 bg-rose-50/50 dark:bg-rose-900/10" : "border-dashed border-zinc-300 dark:border-zinc-700")}>
                            <div className={cn("w-3 h-3 rounded-full", routeEnd ? "bg-rose-500" : "bg-zinc-300")} />
                            <span className="text-sm">{routeEnd ? `${routeEnd.lat.toFixed(4)}, ${routeEnd.lng.toFixed(4)}` : "Click map for END"}</span>
                        </div>
                    </div>

                    {routeStart && (
                      <button onClick={resetRoute} className="flex items-center gap-2 text-xs text-zinc-500 hover:text-rose-500 transition-colors">
                        <RotateCcw className="w-3.5 h-3.5" /> Reset Route
                      </button>
                    )}

                    {loading && (
                      <div className="space-y-2">
                        <div className="text-center py-2 text-sm text-zinc-400 animate-pulse">
                          🔄 Analyzing routes with AI model...
                        </div>
                        <div className="h-16 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
                        <div className="h-16 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
                      </div>
                    )}

                    {/* Route error */}
                    {errorMsg && !loading && (
                      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                          <AlertTriangle className="w-4 h-4" /> {errorMsg}
                        </div>
                      </div>
                    )}

                    {/* Comparison Banner */}
                    {routeData?.comparison && allRoutes.length > 1 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/15 dark:to-teal-900/15 border border-emerald-200 dark:border-emerald-800/30"
                      >
                        <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                          <ShieldCheck className="w-4 h-4" />
                          Recommended route is {routeData.comparison.percent_safer}% safer
                        </div>
                        {routeData.comparison.crimes_avoided > 0 && (
                          <div className="text-xs text-emerald-600/70 dark:text-emerald-400/60 mt-0.5 flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" />
                            Avoids {routeData.comparison.crimes_avoided} crime hotspot{routeData.comparison.crimes_avoided > 1 ? 's' : ''}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Route Cards */}
                    {allRoutes.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Route className="w-3.5 h-3.5" />
                          {allRoutes.length} Route{allRoutes.length > 1 ? 's' : ''} Found
                        </div>
                        {allRoutes.map((route: any, idx: number) => (
                          <motion.button 
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => setSelectedRouteIdx(idx)}
                            className={cn(
                              "w-full p-3 rounded-xl border text-left transition-all",
                              selectedRouteIdx === idx
                                ? idx === 0
                                  ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10 shadow-md shadow-emerald-500/10"
                                  : "border-red-300 bg-red-50/50 dark:bg-red-900/10 shadow-md shadow-red-500/10"
                                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {idx === 0 ? (
                                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded flex items-center gap-0.5">
                                    <ShieldCheck className="w-2.5 h-2.5" /> Safest
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded flex items-center gap-0.5">
                                    <ShieldAlert className="w-2.5 h-2.5" /> Riskier
                                  </span>
                                )}
                                <span className="text-xs text-zinc-500">
                                  {route.distance_km} km · {route.duration_min} min
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={cn("text-lg font-black",
                                  route.average_safety_score > 65 ? "text-red-500" :
                                  route.average_safety_score > 35 ? "text-yellow-500" : "text-emerald-500"
                                )}>
                                  {route.average_safety_score}
                                </span>
                                <ChevronRight className={cn("w-4 h-4 transition-transform", selectedRouteIdx === idx ? "text-indigo-500 rotate-90" : "text-zinc-400")} />
                              </div>
                            </div>
                            
                            {/* Mini color bar */}
                            <div className="flex mt-2 h-1.5 rounded-full overflow-hidden gap-px">
                              {route.risk_segments?.slice(0, 20).map((seg: any, sIdx: number) => (
                                <div key={sIdx} className="flex-1 rounded-full" style={{ backgroundColor: seg.color }} />
                              ))}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {/* Current Route Details */}
                    {currentStats && (
                        <motion.div 
                          key={selectedRouteIdx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20"
                        >
                            <div className="grid grid-cols-3 gap-3 mb-3">
                                <div className="text-center">
                                    <div className={cn("text-2xl font-black", 
                                      currentStats.average_safety_score > 65 ? "text-red-500" : 
                                      currentStats.average_safety_score > 35 ? "text-yellow-500" : "text-emerald-500"
                                    )}>
                                      {currentStats.average_safety_score}
                                    </div>
                                    <div className="text-[9px] uppercase text-zinc-500 tracking-wider">Avg Risk</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-black text-rose-500">{currentStats.max_risk_score}</div>
                                    <div className="text-[9px] uppercase text-zinc-500 tracking-wider">Peak</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-black text-indigo-500">{currentStats.duration_min}<span className="text-sm">m</span></div>
                                    <div className="text-[9px] uppercase text-zinc-500 tracking-wider">ETA</div>
                                </div>
                            </div>
                            <div className={cn("text-sm font-medium p-2 rounded-lg text-center",
                              currentStats.is_safe ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                            )}>
                                {currentStats.is_safe ? "✅ Safe Route — Recommended" : "⚠️ Contains High Risk Segments"}
                            </div>
                            
                            {/* Crimes along route */}
                            {currentStats.total_crimes_along_route !== undefined && (
                              <div className="mt-2 text-xs text-zinc-500 text-center">
                                🔴 {currentStats.total_crimes_along_route} crime incident{currentStats.total_crimes_along_route !== 1 ? 's' : ''} along route
                              </div>
                            )}

                            <div className="mt-2 flex gap-3 text-[10px] text-zinc-500 justify-center">
                              <span className="flex items-center gap-1"><span className="w-3 h-1 bg-emerald-500 rounded"></span> Safe</span>
                              <span className="flex items-center gap-1"><span className="w-3 h-1 bg-yellow-500 rounded"></span> Moderate</span>
                              <span className="flex items-center gap-1"><span className="w-3 h-1 bg-red-500 rounded"></span> High Risk</span>
                              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full"></span> Crime</span>
                            </div>
                        </motion.div>
                    )}

                    {/* Why This Route - Recommendation Reasons */}
                    {routeData?.recommendation_reasons?.length > 0 && selectedRouteIdx === 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/30"
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-2">
                          <Info className="w-3.5 h-3.5" /> Why This Route?
                        </div>
                        <ul className="space-y-1">
                          {routeData.recommendation_reasons.map((reason: string, i: number) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-indigo-600/80 dark:text-indigo-400/70">
                              <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}

                    {crimeHotspots.length > 0 && routeData && (
                      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
                         <div className="flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400">
                           <TriangleAlert className="w-4 h-4" /> {crimeHotspots.length} Crime Hotspots Nearby
                         </div>
                      </div>
                    )}
                </div>
             )}

             {/* Safety Tips - shown in both modes */}
             <div className="mt-auto p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800">
               <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-2">
                 {tipsData.icon} {tipsData.label}
               </div>
               <ul className="space-y-1">
                 {tipsData.tips.map((tip, i) => (
                   <li key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-500">
                     <span className="text-zinc-400 mt-px">•</span>
                     {tip}
                   </li>
                 ))}
               </ul>
             </div>

          </motion.aside>
        )}
        </AnimatePresence>

        {/* Map */}
        <div className="flex-1 h-full relative rounded-3xl overflow-hidden shadow-2xl border border-white/20">
           <Map 
             center={DEFAULT_CENTER} 
             zoom={13} 
             onLocationSelect={handleLocationSelect}
             markers={[
                 ...(selectedLocation ? [{ lat: selectedLocation.lat, lng: selectedLocation.lng, info: `Safety: ${safetyData?.safety_score ?? '...'}` }] : []),
                 ...(routeStart ? [{ lat: routeStart.lat, lng: routeStart.lng, info: "🟢 Start" }] : []),
                 ...(routeEnd ? [{ lat: routeEnd.lat, lng: routeEnd.lng, info: "🔴 Destination" }] : [])
             ]}
             gridData={gridData}
             routeSegments={getCurrentRouteSegments()}
             crimeHotspots={crimeHotspots}
             allRoutes={allRoutes}
             selectedRouteIdx={selectedRouteIdx}
           />
        </div>
      </main>
    </div>
  );
}
