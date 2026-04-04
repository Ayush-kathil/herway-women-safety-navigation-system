"use client";

import { Shield, Volume2, VolumeX, LocateFixed, Car, Moon, Sun, Globe, User, Layers } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import type { MapTheme } from "@/components/map/MapComponent";

interface HeaderProps {
    voiceEnabled: boolean;
    setVoiceEnabled: (enabled: boolean) => void;
    useMyLocation: () => void;
    isWatching: boolean;
    mapTheme: MapTheme;
    setMapTheme: (theme: MapTheme) => void;
    showTraffic: boolean;
    setShowTraffic: (show: boolean) => void;
    backendStatus: "checking" | "connected" | "error";
    showGrid: boolean;
    setShowGrid: (show: boolean) => void;
    onLogin: () => void;
}

export default function Header({
    voiceEnabled,
    setVoiceEnabled,
    useMyLocation,
    isWatching,
    mapTheme,
    setMapTheme,
    showTraffic,
    setShowTraffic,
    backendStatus,
    showGrid,
    setShowGrid,
    onLogin,
}: HeaderProps) {
    useTheme();

    return (
        <header className="absolute top-6 left-6 right-6 h-16 glass z-50 flex items-center justify-between px-6 border border-white/20 dark:border-white/10 rounded-full shadow-lg backdrop-blur-xl">
            <div className="flex items-center gap-4">
                <div className="p-2 border border-black dark:border-white rounded-full bg-white/10">
                    <Shield className="w-5 h-5 text-black dark:text-white" />
                </div>
                <h1 className="text-2xl font-serif font-bold tracking-tight text-black dark:text-white hidden md:block">
                    HerWay
                </h1>
            </div>
            <div className="flex items-center gap-2">
                {/* Voice Toggle */}
                <button
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={cn(
                        "p-2.5 rounded-full border transition-all",
                        voiceEnabled
                            ? "bg-black text-white dark:bg-white dark:text-black border-transparent"
                            : "bg-transparent text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white"
                    )}
                    title={voiceEnabled ? "Voice On" : "Voice Off"}
                >
                    {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* GPS */}
                <button
                    onClick={useMyLocation}
                    className={cn(
                        "p-2.5 rounded-full border transition-all",
                        isWatching
                            ? "bg-black text-white dark:bg-white dark:text-black border-transparent"
                            : "bg-transparent text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white"
                    )}
                    title="Use My Location"
                >
                    <LocateFixed className={cn("w-4 h-4", isWatching && "animate-pulse")} />
                </button>

                {/* Map Theme Cycle */}
                <button
                    onClick={() => {
                        const newInit = mapTheme === "dark" ? "light" : mapTheme === "light" ? "satellite" : "dark";
                        setMapTheme(newInit);
                    }}
                    className="p-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-all text-zinc-600 dark:text-zinc-300"
                    title={`Map: ${mapTheme}`}
                >
                    {mapTheme === "dark" ? (
                        <Moon className="w-4 h-4" />
                    ) : mapTheme === "light" ? (
                        <Sun className="w-4 h-4" />
                    ) : (
                        <Globe className="w-4 h-4" />
                    )}
                </button>

                {/* Traffic Toggle */}
                <button
                    onClick={() => setShowTraffic(!showTraffic)}
                    className={cn(
                        "p-2.5 rounded-full border transition-all hidden sm:block",
                        showTraffic
                           ? "bg-black text-white dark:bg-white dark:text-black border-transparent"
                           : "bg-transparent text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white"
                    )}
                    title={showTraffic ? "Traffic On" : "Traffic Off"}
                >
                    <Car className="w-4 h-4" />
                </button>
                
                {/* Grid toggle */}
                <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={cn(
                        "p-2.5 rounded-full border transition-all hidden sm:block",
                        showGrid
                           ? "bg-black text-white dark:bg-white dark:text-black border-transparent"
                           : "bg-transparent text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white"
                    )}
                    title="Toggle Safety Grid"
                >
                    <Layers className="w-4 h-4" />
                </button>

                {/* Separator */}
                <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1" />

                {/* Login Button */}
                <button
                    onClick={onLogin}
                    className="px-5 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider hover:scale-105 transition-transform shadow-lg flex items-center gap-2"
                >
                    <User className="w-3 h-3" />
                    <span className="hidden sm:inline">Login</span>
                </button>

                <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-800 mx-2" />

                {/* Backend status */}
                <div
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                        backendStatus === "connected"
                            ? "border-black dark:border-white text-black dark:text-white"
                            : "border-red-500 text-red-500"
                    )}
                >
                    <div
                        className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            backendStatus === "connected"
                                ? "bg-black dark:bg-white"
                                : "bg-red-500"
                        )}
                    />
                    {backendStatus === "connected" ? "Online" : "Offline"}
                </div>
            </div>
        </header>
    );
}
