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
import type { RouteStep } from "@/lib/types";

interface NavigationPanelProps {
  steps: RouteStep[];
  currentStepIdx: number;
  distanceToNext: number;
  totalDistance: number;
  totalDuration: number;
  onStop: () => void;
  isRerouting: boolean;
}

export default function NavigationPanel({
  steps,
  currentStepIdx,
  distanceToNext,
  totalDistance,
  totalDuration,
  onStop,
  isRerouting,
}: NavigationPanelProps) {
  const currentStep = steps[currentStepIdx];
  const nextStep = steps[currentStepIdx + 1];
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper to get icon for maneuver
  const getIcon = (maneuver: string) => {
    const m = maneuver?.toLowerCase() || "";
    if (m.includes("left")) return <ArrowLeft className="w-8 h-8" />;
    if (m.includes("right")) return <ArrowRight className="w-8 h-8" />;
    if (m.includes("uturn")) return <RotateCcw className="w-8 h-8" />;
    if (m.includes("sharp left")) return <CornerUpLeft className="w-8 h-8" />;
    if (m.includes("sharp right")) return <CornerUpRight className="w-8 h-8" />;
    if (m.includes("arrive")) return <MapPin className="w-8 h-8" />;
    return <ArrowUp className="w-8 h-8" />;
  };

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="w-full glass rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-white/10"
    >
      {/* Top Bar: Current Instruction */}
      <div className="bg-black dark:bg-zinc-900 p-4 text-white flex items-center gap-4">
        <div className="p-3 bg-white/20 rounded-none backdrop-blur-md border border-white/10">
          {getIcon(currentStep?.maneuver)}
        </div>
        <div className="flex-1">
          <div className="text-3xl font-serif font-bold tracking-tight">
            {distanceToNext < 1000
              ? `${Math.round(distanceToNext)}m`
              : `${(distanceToNext / 1000).toFixed(1)}km`}
          </div>
          <div className="text-lg font-medium opacity-90 leading-tight font-serif">
            {currentStep?.instruction || "Proceed to route"}
          </div>
        </div>
        <button
          onClick={onStop}
          className="p-2 hover:bg-white/20 rounded-none transition-colors border border-transparent hover:border-white/30"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Next Step Preview */}
      {nextStep && (
        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 flex items-center gap-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="text-zinc-500">
            {getIcon(nextStep.maneuver)}
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400 font-serif font-medium truncate">
            Then: {nextStep.instruction}
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div 
        className="p-5 flex items-center justify-between bg-white dark:bg-black cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Arrival</span>
            <span className="text-xl font-serif font-bold text-black dark:text-white">
              {new Date(Date.now() + totalDuration * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex flex-col">
             <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Time</span>
             <span className="text-xl font-serif font-bold text-black dark:text-white">
               {Math.floor(totalDuration)} <span className="text-sm font-sans font-medium text-zinc-500">min</span>
             </span>
          </div>
          <div className="flex flex-col">
             <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Dist</span>
             <span className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
               {totalDistance.toFixed(1)} <span className="text-sm font-medium text-zinc-500">km</span>
             </span>
          </div>
        </div>
        
        <ChevronUp className={cn("w-5 h-5 text-zinc-400 transition-transform", isExpanded && "rotate-180")} />
      </div>

      {/* Expanded Route List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="bg-zinc-50 dark:bg-zinc-950 overflow-hidden"
          >
             <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
               {steps.slice(currentStepIdx + 1).map((step, idx) => (
                 <div key={idx} className="flex items-start gap-3 p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                   <div className="mt-1 text-zinc-400 scale-75 origin-top-left">
                     {getIcon(step.maneuver)}
                   </div>
                   <div className="flex-1">
                     <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                       {step.instruction}
                     </div>
                     <div className="text-xs text-zinc-400 mt-0.5">
                       {step.distance_m > 1000 ? `${(step.distance_m/1000).toFixed(1)} km` : `${Math.round(step.distance_m)} m`}
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Missing imports fix
import { RotateCcw } from "lucide-react";
