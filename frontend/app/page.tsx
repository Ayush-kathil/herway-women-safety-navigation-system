"use client";

import { useState, useEffect, useRef } from "react";
import IncidentReportModal from "@/components/map/IncidentReportModal";
import { Navigation, AlertTriangle } from "lucide-react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import VoiceEngine from "@/lib/VoiceEngine";
import useGeoLocation from "@/hooks/useGeoLocation";
import type { MapTheme } from "@/components/map/MapComponent";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { SafetyData, RouteAnalysisData, CrimeHotspot, SafePlace } from "@/lib/types";
import SOSButton from "@/components/emergency/SOSButton";
import SafePlacesManager from "@/components/map/SafePlacesManager";
import TrustedContacts from "@/components/emergency/TrustedContacts";
import ClassicalIntro from "@/components/ui/ClassicalIntro";
import LocationPermissionDialog from "@/components/ui/LocationPermissionDialog";
import LoginModal from "@/components/auth/LoginModal";

// Dynamic imports
const Map = dynamic(() => import("@/components/map/MapComponent"), { ssr: false });
const NavigationPanel = dynamic(() => import("@/components/navigation/NavigationPanel"), { ssr: false });
const DangerAlert = dynamic(() => import("@/components/navigation/DangerAlert"), { ssr: false });
const LiveSafetyBar = dynamic(() => import("@/components/navigation/LiveSafetyBar"), { ssr: false });
const GPSPermissionPrompt = dynamic(() => import("@/components/navigation/GPSPermissionPrompt"), { ssr: false });

const DEFAULT_CENTER: [number, number] = [
  parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LAT || "22.7196"),
  parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LNG || "75.8577"),
];
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Dashboard() {
  const [showSplash, setShowSplash] = useState(true);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showIncidentReport, setShowIncidentReport] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [mode, setMode] = useState<"explore" | "route">("explore");
  const [hour, setHour] = useState(new Date().getHours());

  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [safetyData, setSafetyData] = useState<SafetyData | null>(null);

  const [routeStart, setRouteStart] = useState<{ lat: number; lng: number } | null>(null);
  const [routeEnd, setRouteEnd] = useState<{ lat: number; lng: number } | null>(null);
  const [startName, setStartName] = useState("");
  const [endName, setEndName] = useState("");
  const [routeData, setRouteData] = useState<RouteAnalysisData | null>(null);
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);
  const [crimeHotspots, setCrimeHotspots] = useState<CrimeHotspot[]>([]);
  const [safePlaces, setSafePlaces] = useState<SafePlace[]>([]);

  const [gridData, setGridData] = useState<any[]>([]); // Keep any for grid for now or add type
  const [showGrid, setShowGrid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<"checking" | "connected" | "error">("checking");
  const [errorMsg, setErrorMsg] = useState("");

  // Map themes & traffic
  const [mapTheme, setMapTheme] = useState<MapTheme>("dark");
  const [showTraffic, setShowTraffic] = useState(false);
  const [showContacts, setShowContacts] = useState(false);

  // Voice & Navigation
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [distanceToNext, setDistanceToNext] = useState(0);
  const [showDangerAlert, setShowDangerAlert] = useState(false);
  const [dangerInfo, setDangerInfo] = useState({ riskScore: 0, advice: "", crimeCount: 0 });
  const lastDangerAlertRef = useRef(0);
  const lastStepAnnounced = useRef(-1);

  // GPS permission prompt
  const [showGPSPrompt, setShowGPSPrompt] = useState(false);
  const [liveSafetyScore, setLiveSafetyScore] = useState<number | null>(null);

  // GPS
  const geo = useGeoLocation();
  const voiceRef = useRef<VoiceEngine | null>(null);

  // Initialize voice engine
  useEffect(() => {
    voiceRef.current = VoiceEngine.getInstance();
    voiceRef.current.init();
  }, []);

  useEffect(() => {
    voiceRef.current?.setEnabled(voiceEnabled);
  }, [voiceEnabled]);

  // Backend health check
  useEffect(() => { checkBackend(); }, []);

  // GPS - Only start watching if permission granted via dialog (or if already granted previously - logic handled by dialog)
  // We remove the auto-start effect.
  // useEffect(() => {
  //   geo.startWatching();
  // }, []);

  useEffect(() => {
    if (geo.error) setShowGPSPrompt(true);
  }, [geo.error]);

  // Voice alert when entering danger zones during live monitoring
  useEffect(() => {
    if (liveSafetyScore !== null && liveSafetyScore > 65 && geo.lat && geo.lng) {
      const now = Date.now();
      if (now - lastDangerAlertRef.current > 30000) {
        lastDangerAlertRef.current = now;
        voiceRef.current?.speakDangerAlert(
          liveSafetyScore,
          "You are in a high-risk area. Stay on main roads and keep your phone accessible."
        );
        if (!isNavigating) {
          setDangerInfo({
            riskScore: liveSafetyScore,
            advice: `This area has a risk score of ${Math.round(liveSafetyScore)}. Stay alert and consider moving to a safer location.`,
            crimeCount: 0,
          });
          setShowDangerAlert(true);
        }
      }
    }
  }, [liveSafetyScore]);

  const checkBackend = async () => {
    setBackendStatus("checking");
    try {
      const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(5000) });
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

  // Auto-start GPS when entering route mode
  useEffect(() => {
    if (mode === "route" && !geo.watching) {
      geo.startWatching();
    }
  }, [mode]);

  // Auto-set start to GPS location when GPS becomes available in route mode
  useEffect(() => {
    if (mode === "route" && geo.lat && geo.lng && !routeStart) {
      setRouteStart({ lat: geo.lat, lng: geo.lng });
      reverseGeocode(geo.lat, geo.lng).then(name => setStartName(name || "Your Location"));
    }
  }, [geo.lat, geo.lng, mode, routeStart]);

  // Auto-analyze route when both start and end are set
  useEffect(() => {
    if (routeStart && routeEnd && !routeData && !loading) {
      analyzeRoute(routeStart, routeEnd);
    }
  }, [routeStart, routeEnd]);

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

  // === LIVE NAVIGATION LOOP ===
  useEffect(() => {
    if (!isNavigating || !geo.lat || !geo.lng || !routeData) return;

    const route = selectedRouteIdx === 0 ? routeData.recommended : routeData.alternatives?.[selectedRouteIdx - 1];
    if (!route) return;

    const steps = route.steps || [];
    if (steps.length === 0) return;

    // Find closest step
    let minDist = Infinity;
    let closestIdx = currentStepIdx;
    for (let i = currentStepIdx; i < steps.length; i++) {
      const step = steps[i];
      const d = haversineDistance(geo.lat, geo.lng, step.location[0], step.location[1]);
      if (d < minDist) {
        minDist = d;
        closestIdx = i;
      }
    }

    // Advance step if close enough
    if (closestIdx > currentStepIdx && minDist < 50) {
      setCurrentStepIdx(closestIdx);
    }

    // Update distance to next step
    if (closestIdx < steps.length) {
      const nextStep = steps[closestIdx];
      const d = haversineDistance(geo.lat, geo.lng, nextStep.location[0], nextStep.location[1]);
      setDistanceToNext(Math.round(d));
    }

    // Voice: announce new step
    if (closestIdx !== lastStepAnnounced.current && closestIdx < steps.length) {
      const step = steps[closestIdx];
      voiceRef.current?.speakDirection(step.instruction, step.distance_m);
      lastStepAnnounced.current = closestIdx;
    }

    // Arrival detection
    if (closestIdx === steps.length - 1 && minDist < 30) {
      voiceRef.current?.announceArrival();
      setIsNavigating(false);
    }

    // === DANGER ZONE DETECTION ===
    const segments = route.risk_segments || [];
    for (const seg of segments) {
      if (seg.score > 65) {
        const midPt = seg.path[Math.floor(seg.path.length / 2)];
        const distToSeg = haversineDistance(geo.lat, geo.lng, midPt[0], midPt[1]);
        if (distToSeg < 200) {
          const now = Date.now();
          if (now - lastDangerAlertRef.current > 60000) {
            lastDangerAlertRef.current = now;
            setDangerInfo({
              riskScore: seg.score,
              advice: `This area has a risk score of ${Math.round(seg.score)}. Stay on main roads, avoid isolated paths, and keep your phone accessible.`,
              crimeCount: route.total_crimes_along_route || 0,
            });
            setShowDangerAlert(true);
            voiceRef.current?.speakDangerAlert(
              seg.score,
              "Stay on well-lit main roads and share your live location with a trusted contact."
            );
          }
          break;
        }
      }
    }
  }, [geo.lat, geo.lng, isNavigating, routeData, currentStepIdx, selectedRouteIdx]);

  const fetchGrid = async () => {
    const [cLat, cLng] = DEFAULT_CENTER;
    const latSpan = 0.125;
    const lngSpan = 0.15;
    try {
      const res = await fetch(`${API_URL}/get_safety_grid?lat_min=${cLat - latSpan}&lat_max=${cLat + latSpan}&long_min=${cLng - lngSpan}&long_max=${cLng + lngSpan}&hour=${hour}`);
      const data = await res.json();
      setGridData(data);
    } catch (e) { console.error(e); }
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (data.display_name) {
        const parts = data.display_name.split(",").map((p: string) => p.trim());
        return parts.length > 2 ? `${parts[0]}, ${parts[1]}, ${parts[2]}` : data.display_name;
      }
    } catch {}
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  const fetchSafety = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/predict_safety?lat=${lat}&long=${lng}&hour=${hour}`);
      const data = await res.json();
      setSafetyData(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchCrimeHotspots = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`${API_URL}/get_crime_hotspots?lat=${lat}&lng=${lng}&radius=3000&hour=${hour}`);
      const data = await res.json();
      setCrimeHotspots(data);
    } catch (e) { console.error(e); }
  };

  const handleLocationSelect = async (lat: number, lng: number) => {
    if (mode === "explore") {
      setSelectedLocation({ lat, lng });
      setSidebarOpen(true);
      fetchSafety(lat, lng);
      fetchCrimeHotspots(lat, lng);
    } else if (mode === "route") {
      // In route mode, clicking sets destination (start is auto-GPS)
      if (routeStart && !routeEnd) {
        setRouteEnd({ lat, lng });
        reverseGeocode(lat, lng).then(name => setEndName(name));
      } else if (!routeStart) {
        setRouteStart({ lat, lng });
        reverseGeocode(lat, lng).then(name => setStartName(name));
      } else {
        // Both exist — reset and set as new destination
        setRouteEnd({ lat, lng });
        setRouteData(null);
        setCrimeHotspots([]);
        setSelectedRouteIdx(0);
        reverseGeocode(lat, lng).then(name => setEndName(name));
      }
    }
  };

  const analyzeRoute = async (start: { lat: number; lng: number }, end: { lat: number; lng: number }) => {
    setLoading(true);
    setSidebarOpen(true);
    try {
      const res = await fetch(`${API_URL}/analyze_route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waypoints: [[start.lat, start.lng], [end.lat, end.lng]], hour }),
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
    } finally { setLoading(false); }
  };

  const resetRoute = () => {
    setRouteStart(null);
    setRouteEnd(null);
    setStartName("");
    setEndName("");
    setRouteData(null);
    setCrimeHotspots([]);
    setSelectedRouteIdx(0);
    setErrorMsg("");
    setIsNavigating(false);
    setCurrentStepIdx(0);
    geo.stopWatching();
  };

  const startNavigation = () => {
    setIsNavigating(true);
    setCurrentStepIdx(0);
    lastStepAnnounced.current = -1;
    lastDangerAlertRef.current = 0;
    geo.startWatching();
    voiceRef.current?.announceNavStart();
    setSidebarOpen(false);
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setCurrentStepIdx(0);
    geo.stopWatching();
    setSidebarOpen(true);
    voiceRef.current?.speak("Navigation ended.", true);
  };

  const useMyLocation = () => {
    geo.startWatching();
    if (geo.lat && geo.lng && mode === "route" && !routeStart) {
      setRouteStart({ lat: geo.lat, lng: geo.lng });
      reverseGeocode(geo.lat, geo.lng).then(name => setStartName(name || "Your Location"));
    }
  };

  const getCurrentRouteStats = () => {
    if (!routeData) return null;
    if (selectedRouteIdx === 0) return routeData.recommended;
    return routeData.alternatives?.[selectedRouteIdx - 1] ?? null;
  };

  const stats = getCurrentRouteStats();
  const allRoutes = routeData ? [routeData.recommended, ...(routeData.alternatives || [])] : [];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50 font-sans selection:bg-rose-500/30">

      {/* Splash Screen */}


      {/* Classical Background - Solid with subtle texture if desired, now just clean */}
      <div className="absolute inset-0 z-0 bg-white dark:bg-black" />

      <Header
        voiceEnabled={voiceEnabled}
        setVoiceEnabled={setVoiceEnabled}
        useMyLocation={useMyLocation}
        isWatching={geo.watching}
        mapTheme={mapTheme}
        setMapTheme={setMapTheme}
        showTraffic={showTraffic}
        setShowTraffic={setShowTraffic}
        backendStatus={backendStatus}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        onLogin={() => setShowLogin(true)}
      />

      <main className="relative z-10 w-full h-full pt-28 md:pt-28 pb-4 px-4 flex gap-4">
        
        <Sidebar
            isOpen={isSidebarOpen}
            isNavigating={isNavigating}
            backendStatus={backendStatus}
            errorMsg={errorMsg}
            retryBackend={checkBackend}
            mode={mode}
            setMode={setMode}
            resetRoute={resetRoute}
            resetExplore={() => {
                setSelectedLocation(null);
                setSafetyData(null);
                setCrimeHotspots([]);
            }}
            hour={hour}
            setHour={setHour}
            geo={geo}
            selectedLocation={selectedLocation}
            safetyData={safetyData}
            crimeHotspots={crimeHotspots}
            loading={loading}
            routeStart={routeStart}
            routeEnd={routeEnd}
            startName={startName}
            endName={endName}
            routeData={routeData}
            selectedRouteIdx={selectedRouteIdx}
            setSelectedRouteIdx={setSelectedRouteIdx}
            setRouteStart={setRouteStart}
            setRouteEnd={setRouteEnd}
            setStartName={setStartName}
            setEndName={setEndName}
            analyzeRoute={analyzeRoute}
            onOpenContacts={() => setShowContacts(true)}
        />

        {/* Navigation Overlays */}
        {isNavigating && stats && (
          <div className="absolute top-24 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            <div className="pointer-events-auto">
              <NavigationPanel
                steps={stats.steps}
                currentStepIdx={currentStepIdx}
                distanceToNext={distanceToNext}
                totalDistance={stats.distance_km}
                totalDuration={stats.duration_min}
                onStop={stopNavigation}
                isRerouting={false}
              />
            </div>
            <div className="pointer-events-auto">
               <LiveSafetyBar
                riskScore={liveSafetyScore}
                isNavigating={isNavigating}
                userLat={geo.lat}
                userLng={geo.lng}
                onCheckSafety={async (lat, lng) => {
                  try {
                    const res = await fetch(`${API_URL}/predict_safety?lat=${lat}&long=${lng}&hour=${hour}`);
                    const d = await res.json();
                    setLiveSafetyScore(d.safety_score);
                    return d;
                  } catch { return null; }
                }}
              />
            </div>
          </div>
        )}

        {/* Start Nav Button (Floating) */}
        {!isNavigating && routeData && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
            <button
              onClick={startNavigation}
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold shadow-lg shadow-emerald-500/40 transition-all active:scale-95 flex items-center gap-2"
            >
              <Navigation className="w-5 h-5 fill-current" />
              Start Navigation
            </button>
          </div>
        )}
        
        {/* Alerts */}
        <div className="absolute top-24 right-4 z-[60] w-full max-w-sm pointer-events-none flex flex-col gap-2">
            <div className="pointer-events-auto">
                <DangerAlert
                    visible={showDangerAlert}
                    riskScore={dangerInfo.riskScore}
                    advice={dangerInfo.advice}
                    crimeCount={dangerInfo.crimeCount}
                    onDismiss={() => setShowDangerAlert(false)}
                />
            </div>
            <div className="pointer-events-auto">
                <GPSPermissionPrompt
                    visible={showGPSPrompt}
                    onAllow={() => geo.startWatching()}
                    onDismiss={() => setShowGPSPrompt(false)}
                    error={geo.error}
                />
            </div>
        </div>

        <div className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none z-[60]">
             <div className="pointer-events-auto">
               <SOSButton />
             </div>
        </div>

        <TrustedContacts 
            isOpen={showContacts} 
            onClose={() => setShowContacts(false)} 
        />

        <LoginModal 
            isOpen={showLogin} 
            onClose={() => setShowLogin(false)} 
            onLogin={() => setShowLogin(false)} 
        />

        <SafePlacesManager 
           lat={geo.lat || DEFAULT_CENTER[0]}
           lng={geo.lng || DEFAULT_CENTER[1]}
           show={true}
           onLoad={setSafePlaces}
        />

        {/* Map Container */}
        <div className="flex-1 h-full rounded-2xl overflow-hidden glass shadow-2xl relative border border-black/10 dark:border-white/10">
          <Map
            center={DEFAULT_CENTER}
            zoom={13}
            onLocationSelect={handleLocationSelect}
            markers={
              selectedLocation
                ? [{ lat: selectedLocation.lat, lng: selectedLocation.lng, color: "red", info: "Selected Location" }]
                : []
            }
            gridData={gridData}
            routeSegments={
              mode === "route" && routeData
                ? (selectedRouteIdx === 0 ? routeData.recommended.risk_segments : routeData.alternatives?.[selectedRouteIdx - 1]?.risk_segments)
                : []
            }
            crimeHotspots={crimeHotspots}
            safePlaces={safePlaces}
            allRoutes={allRoutes}
            selectedRouteIdx={selectedRouteIdx}
            userPosition={geo.lat && geo.lng ? { lat: geo.lat, lng: geo.lng, heading: geo.heading } : null}
            isNavigating={isNavigating}
            mapTheme={mapTheme}
            showTraffic={showTraffic}
            startPoint={routeStart || undefined}
            endPoint={routeEnd || undefined}
          />
        </div>

        {/* Report Incident FAB */}
        <button
            onClick={() => setShowIncidentReport(true)}
            className="absolute bottom-24 right-6 z-[60] p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group"
            title="Report Incident"
        >
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500 group-hover:animate-pulse" />
            <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-black/80 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Report Incident
            </span>
        </button>

        <IncidentReportModal
            isOpen={showIncidentReport}
            onClose={() => setShowIncidentReport(false)}
            onSubmit={(type, desc) => {
                console.log("Incident Reported:", type, desc);
                // Here we would send to backend
                // Show a simple simulated alert for MVP
                alert(`Thank you. Your report for "${type}" has been submitted anonymously.`);
            }}
        />

      </main>
    </div>
  );
}
