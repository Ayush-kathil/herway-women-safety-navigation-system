"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, MapPin, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

interface LocationSearchProps {
  placeholder?: string;
  value?: string;
  onSelect: (lat: number, lng: number, name: string) => void;
  onClear?: () => void;
  className?: string;
  accent?: "emerald" | "rose" | "black";
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export default function LocationSearch({
  placeholder = "Search a place...",
  value = "",
  onSelect,
  onClear,
  className,
  accent = "black", // Default to black for Classical Theme
}: LocationSearchProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<{ name: string; lat: number; lng: number }[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("herway_recent_searches");
      if (saved) setRecentSearches(JSON.parse(saved).slice(0, 5));
    } catch {}
  }, []);

  const saveRecent = (name: string, lat: number, lng: number) => {
    const updated = [{ name, lat, lng }, ...recentSearches.filter(r => r.name !== name)].slice(0, 5);
    setRecentSearches(updated);
    try { localStorage.setItem("herway_recent_searches", JSON.stringify(updated)); } catch {}
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const searchPlaces = useCallback(async (q: string) => {
    if (q.length < 3) { setResults([]); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q,
        format: "json",
        limit: "6",
        addressdetails: "1",
        countrycodes: "in",
      });
      const res = await fetch(`${NOMINATIM_URL}?${params}`, {
        headers: { "Accept-Language": "en" },
      });
      const data: SearchResult[] = await res.json();
      setResults(data);
    } catch (e) {
      console.error("Geocoding error:", e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (val: string) => {
    setQuery(val);
    setIsOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchPlaces(val), 400);
  };

  const handleSelect = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const name = formatName(result.display_name);
    setQuery(name);
    setIsOpen(false);
    setResults([]);
    saveRecent(name, lat, lng);
    onSelect(lat, lng, name);
  };

  const handleRecentSelect = (r: { name: string; lat: number; lng: number }) => {
    setQuery(r.name);
    setIsOpen(false);
    onSelect(r.lat, r.lng, r.name);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    onClear?.();
  };

  const formatName = (name: string) => {
    const parts = name.split(",").map(p => p.trim());
    if (parts.length <= 2) return name;
    return `${parts[0]}, ${parts[1]}, ${parts[2]}`;
  };

  const accentColors = {
    emerald: { ring: "focus-within:ring-emerald-500/30 focus-within:border-emerald-500", dot: "bg-emerald-500", icon: "text-emerald-500" },
    rose: { ring: "focus-within:ring-rose-500/30 focus-within:border-rose-500", dot: "bg-rose-500", icon: "text-rose-500" },
    black: { 
      ring: "focus-within:ring-black/10 dark:focus-within:ring-white/20 focus-within:border-black dark:focus-within:border-white", 
      dot: "bg-black dark:bg-white", 
      icon: "text-black dark:text-white" 
    }
  }[accent] || { ring: "focus-within:ring-zinc-500/30 focus-within:border-zinc-500", dot: "bg-zinc-500", icon: "text-zinc-500" };

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className={cn(
        "flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all",
        "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800",
        "focus-within:ring-0", accentColors.ring
      )}>
        <div className={cn("w-2 h-2 rounded-full shrink-0", accentColors.dot)} />
        <Search className={cn("w-4 h-4 shrink-0", accentColors.icon)} />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-zinc-400 text-zinc-900 dark:text-white font-serif"
        />
        {loading && <Loader2 className="w-4 h-4 text-zinc-400 animate-spin shrink-0" />}
        {query && !loading && (
          <button onClick={handleClear} className="p-0.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (results.length > 0 || (query.length < 3 && recentSearches.length > 0)) && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl overflow-hidden max-h-[280px] overflow-y-auto"
          >
            {/* Search results */}
            {results.length > 0 && results.map((result, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(result)}
                className="w-full flex items-start gap-2.5 px-3 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border-b border-zinc-100 dark:border-zinc-800 last:border-0"
              >
                <MapPin className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-serif font-bold text-zinc-900 dark:text-white truncate">
                    {formatName(result.display_name)}
                  </div>
                  <div className="text-[10px] text-zinc-400 capitalize">{result.type.replace(/_/g, " ")}</div>
                </div>
              </button>
            ))}

            {/* Recent searches */}
            {results.length === 0 && query.length < 3 && recentSearches.length > 0 && (
              <>
                <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-50 dark:bg-zinc-800/30">
                  Recent
                </div>
                {recentSearches.map((r, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRecentSelect(r)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                  >
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-sm font-medium font-serif text-zinc-600 dark:text-zinc-300 truncate">{r.name}</span>
                  </button>
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
