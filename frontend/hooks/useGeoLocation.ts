"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface GeoState {
  lat: number | null;
  lng: number | null;
  heading: number | null;
  speed: number | null;
  accuracy: number | null;
  error: string | null;
  watching: boolean;
}

const defaultState: GeoState = {
  lat: null,
  lng: null,
  heading: null,
  speed: null,
  accuracy: null,
  error: null,
  watching: false,
};

export default function useGeoLocation() {
  const [state, setState] = useState<GeoState>(defaultState);
  const watchRef = useRef<number | null>(null);

  const startWatching = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState((s) => ({ ...s, error: "Geolocation not supported" }));
      return;
    }

    setState((s) => ({ ...s, watching: true, error: null }));

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setState({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
          accuracy: pos.coords.accuracy,
          error: null,
          watching: true,
        });
      },
      (err) => {
        setState((s) => ({
          ...s,
          error:
            err.code === 1
              ? "Location permission denied"
              : err.code === 2
                ? "Position unavailable"
                : "Location timeout",
          watching: false,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 2000,
      }
    );
  }, []);

  const stopWatching = useCallback(() => {
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    setState((s) => ({ ...s, watching: false }));
  }, []);

  useEffect(() => {
    return () => {
      if (watchRef.current !== null) {
        navigator.geolocation.clearWatch(watchRef.current);
      }
    };
  }, []);

  return { ...state, startWatching, stopWatching };
}
