"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Navigation,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  CornerUpLeft,
  CornerUpRight,
  MapPin,
  Clock,
  Shield,
  X,
  Volume2,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

export interface TurnStep {
  instruction: string;
  distance_m: number;
  maneuver: string;
  location: [number, number];
}

interface NavigationPanelProps {
  steps: TurnStep[];
  currentStepIdx: number;
  distanceToNext: number;
  totalDistanceKm: number;
  totalDurationMin: number;
  etaMin: number;
  safetyScore: number;
  isNavigating: boolean;
  onStartNav: () => void;
  onStopNav: () => void;
  onAnnounceTime: () => void;
}

function getManeuverIcon(maneuver: string) {
  if (maneuver.includes("left"))
    return <CornerUpLeft className="w-8 h-8" />;
  if (maneuver.includes("right"))
    return <CornerUpRight className="w-8 h-8" />;
  if (maneuver.includes("arrive") || maneuver.includes("destination"))
    return <MapPin className="w-8 h-8" />;
  if (maneuver.includes("depart"))
    return <Navigation className="w-8 h-8" />;
  return <ArrowUp className="w-8 h-8" />;
}

function formatDist(m: number) {
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${Math.round(m)} m`;
}

const NavigationPanel = ({
  steps,
  currentStepIdx,
  distanceToNext,
  totalDistanceKm,
  totalDurationMin,
  etaMin,
  safetyScore,
  isNavigating,
  onStartNav,
  onStopNav,
  onAnnounceTime,
}: NavigationPanelProps) => {
  const [expanded, setExpanded] = useState(false);
  const currentStep = steps[currentStepIdx] ?? null;
  const nextStep = steps[currentStepIdx + 1] ?? null;

  const safetyColor =
    safetyScore > 65
      ? "text-red-500"
      : safetyScore > 35
        ? "text-yellow-500"
        : "text-emerald-500";

  const safetyBg =
    safetyScore > 65
      ? "from-red-500/20 to-red-600/5"
      : safetyScore > 35
        ? "from-yellow-500/20 to-yellow-600/5"
        : "from-emerald-500/20 to-emerald-600/5";

  // Pre-navigation: show Start button
  if (!isNavigating) {
    return (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[600] w-[92%] max-w-[440px]"
      >
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 dark:border-zinc-700/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Navigation className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Route Ready</div>
                <div className="text-xs text-zinc-500">{totalDistanceKm} km · {totalDurationMin} min</div>
              </div>
            </div>
            <div className={cn("text-2xl font-black", safetyColor)}>{safetyScore}</div>
          </div>
          <button
            onClick={onStartNav}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-base shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Navigation className="w-5 h-5" />
            Start Navigation
          </button>
        </div>
      </motion.div>
    );
  }

  // Active navigation
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="absolute bottom-0 left-0 right-0 z-[600]"
    >
      <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] border-t border-white/30 dark:border-zinc-700/50">
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-10 h-1.5 bg-zinc-300 dark:bg-zinc-600 rounded-full hover:bg-zinc-400 transition-colors"
          />
        </div>

        {/* Current instruction */}
        <div className="px-5 pb-4">
          {currentStep && (
            <div className="flex items-center gap-4 mb-3">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0",
                "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
              )}>
                {getManeuverIcon(currentStep.maneuver)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-0.5">
                  {formatDist(distanceToNext)}
                </div>
                <div className="text-base font-bold text-zinc-900 dark:text-zinc-50 leading-tight truncate">
                  {currentStep.instruction}
                </div>
                {nextStep && (
                  <div className="text-xs text-zinc-400 mt-1 truncate">
                    Then: {nextStep.instruction}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stats bar */}
          <div className={cn("flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r", safetyBg)}>
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-zinc-500" />
              <span className={cn("text-sm font-black", safetyColor)}>{safetyScore}</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">{etaMin} min left</span>
            </div>
            <div className="text-xs text-zinc-500 font-semibold">
              {totalDistanceKm} km
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={onAnnounceTime}
              className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <Volume2 className="w-3.5 h-3.5" /> Time
            </button>
            <button
              onClick={onStopNav}
              className="flex-1 py-2.5 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-200 dark:hover:bg-red-800/30 transition-colors flex items-center justify-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" /> End
            </button>
          </div>
        </div>

        {/* Expanded step list */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-zinc-200 dark:border-zinc-800"
            >
              <div className="px-5 py-3 max-h-[35vh] overflow-y-auto space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                  All Steps
                </div>
                {steps.map((step, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center gap-3 p-2.5 rounded-xl transition-all text-sm",
                      i === currentStepIdx
                        ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-semibold"
                        : i < currentStepIdx
                          ? "text-zinc-400 line-through"
                          : "text-zinc-600 dark:text-zinc-400"
                    )}
                  >
                    <div className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                      {getManeuverIcon(step.maneuver)}
                    </div>
                    <div className="flex-1 min-w-0 truncate">{step.instruction}</div>
                    <span className="text-xs text-zinc-400 shrink-0">
                      {formatDist(step.distance_m)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default NavigationPanel;
