import { create } from 'zustand'

export interface RouteAnalysisData {
  recommended: any;
  alternatives: any[];
  total_routes_found: number;
  hour_analyzed: number;
}

export interface SafetyData {
  safety_score: number;
  category: string;
  zone_color: string;
  advice: string;
}

export interface CrimeHotspot {
  lat: number;
  lng: number;
  relevance: number;
  hour: number;
}

export interface SafePlace {
  lat: number;
  lng: number;
  name: string;
  type: string;
  icon: string;
}

interface AppState {
  // UI State
  mode: "explore" | "route";
  setMode: (mode: "explore" | "route") => void;
  hour: number;
  setHour: (hour: number) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  mapTheme: "dark" | "light";
  setMapTheme: (theme: "dark" | "light") => void;
  
  // Location & Map State
  selectedLocation: { lat: number; lng: number } | null;
  setSelectedLocation: (loc: { lat: number; lng: number } | null) => void;
  routeStart: { lat: number; lng: number } | null;
  setRouteStart: (loc: { lat: number; lng: number } | null) => void;
  routeEnd: { lat: number; lng: number } | null;
  setRouteEnd: (loc: { lat: number; lng: number } | null) => void;
  
  // API Data State
  safetyData: SafetyData | null;
  setSafetyData: (data: SafetyData | null) => void;
  routeData: RouteAnalysisData | null;
  setRouteData: (data: RouteAnalysisData | null) => void;
  selectedRouteIdx: number;
  setSelectedRouteIdx: (idx: number) => void;
  crimeHotspots: CrimeHotspot[];
  setCrimeHotspots: (spots: CrimeHotspot[]) => void;
  safePlaces: SafePlace[];
  setSafePlaces: (places: SafePlace[]) => void;
  
  // Navigation State
  isNavigating: boolean;
  setIsNavigating: (navigating: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  mode: "explore",
  setMode: (mode) => set({ mode }),
  hour: new Date().getHours(),
  setHour: (hour) => set({ hour }),
  showGrid: false,
  setShowGrid: (showGrid) => set({ showGrid }),
  mapTheme: "dark",
  setMapTheme: (mapTheme) => set({ mapTheme }),
  
  selectedLocation: null,
  setSelectedLocation: (selectedLocation) => set({ selectedLocation }),
  routeStart: null,
  setRouteStart: (routeStart) => set({ routeStart }),
  routeEnd: null,
  setRouteEnd: (routeEnd) => set({ routeEnd }),
  
  safetyData: null,
  setSafetyData: (safetyData) => set({ safetyData }),
  routeData: null,
  setRouteData: (routeData) => set({ routeData }),
  selectedRouteIdx: 0,
  setSelectedRouteIdx: (selectedRouteIdx) => set({ selectedRouteIdx }),
  crimeHotspots: [],
  setCrimeHotspots: (crimeHotspots) => set({ crimeHotspots }),
  safePlaces: [],
  setSafePlaces: (safePlaces) => set({ safePlaces }),
  
  isNavigating: false,
  setIsNavigating: (isNavigating) => set({ isNavigating }),
}))
