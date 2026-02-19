"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MapPin,
    RotateCcw,
    XCircle,
    TriangleAlert,
    LocateFixed,
    X,
    AlertTriangle,
    ShieldCheck,
    TrendingDown,
    Route,
    ShieldAlert,
    Users,
    Clock,
    ChevronRight,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import ClockPicker from "@/components/ui/ClockPicker";
import LocationSearch from "@/components/ui/LocationSearch";
import type { RouteAnalysisData, SafetyData, CrimeHotspot, GeoState } from "@/lib/types";

interface SidebarProps {
    isOpen: boolean;
    isNavigating: boolean;
    backendStatus: "checking" | "connected" | "error";
    errorMsg: string;
    retryBackend: () => void;
    mode: "explore" | "route";
    setMode: (mode: "explore" | "route") => void;
    resetRoute: () => void;
    resetExplore: () => void;
    hour: number;
    setHour: (h: number) => void;
    geo: GeoState;
    selectedLocation: { lat: number; lng: number } | null;
    safetyData: SafetyData | null;
    crimeHotspots: CrimeHotspot[];
    loading: boolean;
    // Route props
    routeStart: { lat: number; lng: number } | null;
    routeEnd: { lat: number; lng: number } | null;
    startName: string;
    endName: string;
    routeData: RouteAnalysisData | null;
    selectedRouteIdx: number;
    setSelectedRouteIdx: (idx: number) => void;
    setRouteStart: (loc: { lat: number; lng: number } | null) => void;
    setRouteEnd: (loc: { lat: number; lng: number } | null) => void;
    setStartName: (name: string) => void;
    setEndName: (name: string) => void;
    analyzeRoute: (s: { lat: number; lng: number }, e: { lat: number; lng: number }) => void;
    onOpenContacts: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Sidebar({
    isOpen,
    isNavigating,
    backendStatus,
    errorMsg,
    retryBackend,
    mode,
    setMode,
    resetRoute,
    resetExplore,
    hour,
    setHour,
    geo,
    selectedLocation,
    safetyData,
    crimeHotspots,
    loading,
    routeStart,
    routeEnd,
    startName,
    endName,
    routeData,
    selectedRouteIdx,
    setSelectedRouteIdx,
    setRouteStart,
    setRouteEnd,
    setStartName,
    setEndName,
    analyzeRoute,
    onOpenContacts,
}: SidebarProps) {
    const [isManualSearch, setIsManualSearch] = useState(false);
    const allRoutes = routeData
        ? [routeData.recommended, ...(routeData.alternatives || [])]
        : [];

    return (
        <AnimatePresence mode="wait">
            {isOpen && !isNavigating && (
                <motion.aside
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "circOut" }}
                    className="w-full md:w-[420px] h-full glass rounded-2xl p-6 flex flex-col gap-6 shadow-2xl relative overflow-y-auto border border-black/10 dark:border-white/10 hide-scrollbar"
                >
                    {/* Backend Error */}
                    {backendStatus === "error" && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-none border border-red-500 bg-red-50 dark:bg-red-900/10"
                        >
                            <div className="flex items-center gap-2 text-sm font-serif font-bold text-red-600 dark:text-red-400 mb-1">
                                <XCircle className="w-4 h-4" /> System Offline
                            </div>
                            <p className="text-xs text-red-500/80 dark:text-red-400/60 font-medium">
                                {errorMsg}
                            </p>
                            <button
                                onClick={retryBackend}
                                className="mt-3 text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                            >
                                <RotateCcw className="w-3 h-3" /> Retry Connection
                            </button>
                        </motion.div>
                    )}

                    {/* Mode Toggle - Tab Style */}
                    <div className="flex border-b border-zinc-200 dark:border-zinc-800">
                        <button
                            onClick={() => {
                                setMode("explore");
                                resetRoute();
                            }}
                            className={cn(
                                "flex-1 pb-3 text-xs font-serif font-bold uppercase tracking-widest transition-all relative",
                                mode === "explore"
                                    ? "text-black dark:text-white"
                                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                            )}
                        >
                            Explore
                            {mode === "explore" && (
                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white" />
                            )}
                        </button>
                        <button
                            onClick={() => {
                                setMode("route");
                                resetExplore();
                            }}
                            className={cn(
                                "flex-1 pb-3 text-xs font-serif font-bold uppercase tracking-widest transition-all relative",
                                mode === "route"
                                    ? "text-black dark:text-white"
                                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                            )}
                        >
                            Navigate
                            {mode === "route" && (
                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black dark:bg-white" />
                            )}
                        </button>
                    </div>

                    {/* Trusted Contacts Button */}
                    <button
                        onClick={onOpenContacts}
                        className="w-full py-3 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-colors text-zinc-600 dark:text-zinc-300 text-xs font-serif font-bold uppercase tracking-widest flex items-center justify-center gap-2 group"
                    >
                         <Users className="w-4 h-4 group-hover:scale-110 transition-transform" /> Trusted Contacts
                    </button>

                    {/* Clock Picker */}
                    <div className="py-2 border-y border-zinc-100 dark:border-zinc-800/50">
                        <div className="flex items-center justify-center mb-4">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Time of Travel</h3>
                        </div>
                        <ClockPicker hour={hour} onChange={setHour} />
                    </div>

                    {/* GPS Status */}
                    {geo.watching && geo.lat && (
                        <div className="flex items-center gap-3 px-4 py-3 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30">
                            <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-pulse" />
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Live GPS</span>
                                <span className="text-xs font-serif font-medium text-black dark:text-white">
                                    {geo.lat.toFixed(4)}, {geo.lng!.toFixed(4)}
                                </span>
                            </div>
                            {geo.speed !== null && geo.speed > 0 && (
                                <span className="text-[10px] font-bold text-zinc-500 ml-auto border border-zinc-200 px-2 py-1">
                                    {(geo.speed * 3.6).toFixed(0)} km/h
                                </span>
                            )}
                        </div>
                    )}

                    {/* EXPLORE MODE */}
                    {mode === "explore" && (
                        <div className="mt-2">
                            {!selectedLocation ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 opacity-60">
                                    <MapPin className="w-8 h-8 text-black dark:text-white stroke-[1.5]" />
                                    <p className="text-sm font-serif italic text-zinc-500">
                                        Select a location on the map to analyze safety.
                                    </p>
                                </div>
                            ) : safetyData ? (
                                <div className="space-y-6 animate-fade-in-scale">
                                    {/* Score Card */}
                                    <div className="p-6 border border-black dark:border-white text-center relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-black dark:bg-white" />
                                        <div className="text-6xl font-serif font-black mb-2 text-black dark:text-white">
                                            {safetyData.safety_score}
                                        </div>
                                        <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-4 font-bold">
                                            Safety Score
                                        </div>
                                        <div
                                            className={cn(
                                                "inline-block px-4 py-1.5 text-xs font-bold uppercase tracking-widest border",
                                                safetyData.zone_color === "red"
                                                    ? "border-black text-black dark:border-white dark:text-white bg-zinc-100 dark:bg-zinc-800"
                                                    : "border-zinc-300 text-zinc-600 dark:border-zinc-600 dark:text-zinc-300"
                                            )}
                                        >
                                            {safetyData.category}
                                        </div>
                                    </div>

                                    {/* Analysis Details */}
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Analysis</h4>
                                        <p className="text-sm font-serif leading-relaxed text-zinc-800 dark:text-zinc-200 border-l-2 border-black dark:border-white pl-4 italic">
                                            "{safetyData.advice}"
                                        </p>
                                    </div>

                                    {/* Stats */}
                                    {safetyData.crime_count !== undefined && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 border border-zinc-200 dark:border-zinc-800">
                                                <div className="text-xl font-serif font-bold text-black dark:text-white">
                                                    {safetyData.model_raw_score}
                                                </div>
                                                <div className="text-[9px] uppercase tracking-wider text-zinc-400">ML Confidence</div>
                                            </div>
                                            <div className="p-3 border border-zinc-200 dark:border-zinc-800">
                                                <div className="text-xl font-serif font-bold text-black dark:text-white">
                                                    {safetyData.crime_count}
                                                </div>
                                                <div className="text-[9px] uppercase tracking-wider text-zinc-400">Nearby Crimes</div>
                                            </div>
                                        </div>
                                    )}

                                    {crimeHotspots.length > 0 && (
                                        <div className="p-4 border border-zinc-900 dark:border-white bg-black dark:bg-white text-white dark:text-black">
                                            <div className="flex items-start gap-3">
                                                <TriangleAlert className="w-5 h-5 shrink-0 mt-0.5" />
                                                <div>
                                                    <div className="text-sm font-bold uppercase tracking-wider mb-1">Caution Required</div>
                                                    <div className="text-xs opacity-80 font-serif">
                                                        {crimeHotspots.length} significantly dangerous zones detected in immediate vicinity.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : loading ? (
                                <div className="space-y-4 opacity-50">
                                    <div className="h-32 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 animate-pulse" />
                                    <div className="h-16 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 animate-pulse" />
                                </div>
                            ) : null}
                        </div>
                    )}

                    {/* ROUTE MODE */}
                    {mode === "route" && (
                        <div className="space-y-6 mt-2">
                            {/* GPS Auto-Detect Status */}
                            {!routeStart && !geo.lat && (
                                <div className="p-3 border border-dashed border-zinc-300 dark:border-zinc-700 text-center">
                                    <span className="text-xs font-serif italic text-zinc-500 animate-pulse">
                                        Acquiring GPS signal...
                                    </span>
                                </div>
                            )}

                            {/* Start Location */}
                            <div className="group space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">
                                    Start Point
                                </label>
                                
                                {routeStart && startName ? (
                                    <div className="flex items-center gap-3 px-4 py-3 border border-black dark:border-white bg-zinc-50 dark:bg-zinc-900">
                                        <div className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full shrink-0" />
                                        <span className="text-sm font-serif font-medium text-black dark:text-white flex-1 truncate">
                                            {startName}
                                        </span>
                                        <button
                                            onClick={() => {
                                                setRouteStart(null);
                                                setStartName("");
                                            }}
                                            className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Choice 1: Live Location */}
                                        <button
                                            onClick={() => {
                                                if (geo.lat && geo.lng) {
                                                    setRouteStart({ lat: geo.lat, lng: geo.lng });
                                                    setStartName("Current Location");
                                                } else {
                                                    alert("Waiting for GPS...");
                                                }
                                            }}
                                            className="flex flex-col items-center justify-center gap-2 p-5 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all group/btn h-24 bg-zinc-50 dark:bg-zinc-900/20"
                                        >
                                            <LocateFixed className="w-5 h-5 text-zinc-400 group-hover/btn:text-black dark:group-hover/btn:text-white transition-colors" />
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 group-hover/btn:text-black dark:group-hover/btn:text-white text-center leading-tight">
                                                Use My Location
                                            </span>
                                        </button>

                                        {/* Choice 2: Manual Input */}
                                        {!isManualSearch ? (
                                            <button
                                                onClick={() => setIsManualSearch(true)}
                                                className="flex flex-col items-center justify-center gap-2 p-5 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all group/btn h-24 bg-zinc-50 dark:bg-zinc-900/20"
                                            >
                                                <Search className="w-5 h-5 text-zinc-400 group-hover/btn:text-black dark:group-hover/btn:text-white transition-colors" />
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 group-hover/btn:text-black dark:group-hover/btn:text-white text-center leading-tight">
                                                    Manual Search
                                                </span>
                                            </button>
                                        ) : (
                                            <div className="col-span-2">
                                                <LocationSearch
                                                    placeholder="Enter start location..."
                                                    accent="black"
                                                    onSelect={(lat, lng, name) => {
                                                        setRouteStart({ lat, lng });
                                                        setStartName(name);
                                                        setIsManualSearch(false);
                                                    }}
                                                    onClear={() => {
                                                        setRouteStart(null);
                                                        setStartName("");
                                                    }}
                                                />
                                                <button 
                                                    onClick={() => setIsManualSearch(false)}
                                                    className="w-full text-[9px] text-zinc-400 hover:text-black dark:hover:text-white text-center mt-2 uppercase tracking-wider"
                                                >
                                                    Cancel Manual Search
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Destination */}
                            <div className="group space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">
                                    Destination
                                </label>
                                {routeEnd && endName ? (
                                    <div className="flex items-center gap-3 px-4 py-3 border border-black dark:border-white bg-zinc-50 dark:bg-zinc-900">
                                        <MapPin className="w-4 h-4 text-black dark:text-white shrink-0" />
                                        <span className="text-sm font-serif font-medium text-black dark:text-white flex-1 truncate">
                                            {endName}
                                        </span>
                                        <button
                                            onClick={() => {
                                                setRouteEnd(null);
                                                setEndName("");
                                            }}
                                            className="text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <LocationSearch
                                        placeholder="Where to?"
                                        accent="black"
                                        onSelect={(lat, lng, name) => {
                                            setRouteEnd({ lat, lng });
                                            setEndName(name);
                                        }}
                                        onClear={() => {
                                            setRouteEnd(null);
                                            setEndName("");
                                        }}
                                    />
                                )}
                            </div>

                            {routeStart && (
                                <button
                                    onClick={resetRoute}
                                    className="flex items-center justify-center w-full gap-2 text-[10px] uppercase tracking-widest font-bold text-zinc-400 hover:text-black dark:hover:text-white transition-colors border-t border-zinc-100 dark:border-zinc-800 pt-3"
                                >
                                    <RotateCcw className="w-3 h-3" /> Reset
                                </button>
                            )}

                            {loading && (
                                <div className="space-y-3 py-4">
                                    <div className="text-center text-xs font-serif text-zinc-400 animate-pulse">
                                        Calculating safety scores for multiple routes...
                                    </div>
                                    <div className="h-20 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 animate-pulse" />
                                    <div className="h-20 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 animate-pulse" />
                                </div>
                            )}

                            {errorMsg && !loading && (
                                <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-900/10">
                                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-bold">
                                        <AlertTriangle className="w-4 h-4" /> {errorMsg}
                                    </div>
                                </div>
                            )}

                            {/* Comparison Banner */}
                            {routeData?.comparison && allRoutes.length > 1 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-4 bg-black dark:bg-white text-white dark:text-black mb-4 relative overflow-hidden"
                                >
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 text-sm font-serif font-bold uppercase tracking-wider mb-1">
                                            <ShieldCheck className="w-4 h-4" />
                                            Recommended Route
                                        </div>
                                        <div className="text-xs opacity-90 font-sans">
                                            {routeData.comparison.percent_safer}% safer than alternatives.
                                            {routeData.comparison.crimes_avoided > 0 && 
                                                ` Avoids ${routeData.comparison.crimes_avoided} major risk zones.`
                                            }
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <ShieldCheck className="w-20 h-20" />
                                    </div>
                                </motion.div>
                            )}

                            {/* Route Cards */}
                            {allRoutes.length > 0 && (
                                <motion.div 
                                  variants={containerVariants}
                                  initial="hidden"
                                  animate="show"
                                  className="space-y-4"
                                >
                                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-3">
                                        <Route className="w-3.5 h-3.5" />
                                        Available Routes
                                    </div>
                                    {allRoutes.map((route: any, idx: number) => {
                                        // Comparison Logic
                                        const recommended = allRoutes[0];
                                        const safetyDiff = route.average_safety_score - recommended.average_safety_score;
                                        const timeDiff = recommended.duration_min - route.duration_min;
                                        
                                        return (
                                        <motion.button
                                            key={idx}
                                            variants={itemVariants}
                                            onClick={() => setSelectedRouteIdx(idx)}
                                            className={cn(
                                                "w-full text-left transition-all group relative overflow-hidden rounded-xl",
                                                selectedRouteIdx === idx
                                                    ? "border-2 border-black dark:border-white p-4 bg-white dark:bg-black scale-[1.02] shadow-xl z-10"
                                                    : "border border-zinc-200 dark:border-zinc-800 p-4 hover:border-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 grayscale-[0.5] hover:grayscale-0"
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {idx === 0 ? (
                                                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black rounded-full">
                                                            Safest
                                                        </span>
                                                    ) : (
                                                        <>
                                                            {safetyDiff > 5 && (
                                                                <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full flex items-center gap-1">
                                                                    <ShieldCheck className="w-3 h-3" /> Safer (+{Math.round(safetyDiff)})
                                                                </span>
                                                            )}
                                                            {timeDiff > 2 && (
                                                                <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full flex items-center gap-1">
                                                                    <TrendingDown className="w-3 h-3" /> Faster (-{Math.round(timeDiff)}m)
                                                                </span>
                                                            )}
                                                            {!safetyDiff && !timeDiff && (
                                                                <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border border-zinc-300 text-zinc-500 rounded-full">
                                                                    Alternative
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                    <span className="text-[10px] font-serif text-zinc-500">
                                                        {route.distance_km} km
                                                    </span>
                                                </div>
                                                <div className="text-xs font-bold font-serif text-zinc-900 dark:text-white">
                                                    {route.duration_min} min
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-end justify-between">
                                                 <div className="flex flex-col">
                                                     <span className="text-[9px] uppercase tracking-widest text-zinc-400 mb-0.5">Safety Score</span>
                                                     <div className="flex items-baseline gap-1">
                                                         <span className={cn(
                                                             "text-3xl font-serif font-black leading-none",
                                                             selectedRouteIdx === idx ? "text-black dark:text-white" : "text-zinc-600 dark:text-zinc-400",
                                                             route.average_safety_score > 80 ? "text-emerald-600 dark:text-emerald-400" : 
                                                             route.average_safety_score > 60 ? "text-amber-600 dark:text-amber-400" : 
                                                             "text-red-600 dark:text-red-400"
                                                         )}>
                                                             {Math.round(route.average_safety_score)}
                                                         </span>
                                                         <span className="text-[10px] font-bold text-zinc-400">/ 100</span>
                                                     </div>
                                                 </div>
                                                 {selectedRouteIdx === idx && (
                                                     <ChevronRight className="w-5 h-5 text-black dark:text-white animate-pulse" />
                                                 )}
                                            </div>
                                        </motion.button>
                                    );})}
                                </motion.div>
                            )}
                        </div>
                    )}
                </motion.aside>
            )}
        </AnimatePresence>
    );
}
