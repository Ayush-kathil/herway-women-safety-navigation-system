"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, MapPin, Activity, Lightbulb, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import SafetyGauge from "@/components/ui/SafetyGauge";

interface SafetyCheckResult {
  safety_score?: number;
  advice?: string;
  [key: string]: unknown;
}

interface LiveSafetyBarProps {
  riskScore: number | null;
  isNavigating: boolean;
  userLat: number | null;
  userLng: number | null;
  onCheckSafety?: (lat: number, lng: number) => Promise<SafetyCheckResult>;
}

function getRiskTier(score: number) {
  if (score < 20) return { label: "DANGEROUS", color: "bg-red-600", text: "text-red-100", glow: "shadow-red-500/50", icon: "🔴", barColor: "#ef4444" };
  if (score < 40) return { label: "RISKY", color: "bg-orange-500", text: "text-orange-100", glow: "shadow-orange-500/40", icon: "🟠", barColor: "#f97316" };
  if (score < 60) return { label: "MODERATE", color: "bg-yellow-500", text: "text-yellow-100", glow: "shadow-yellow-500/30", icon: "🟡", barColor: "#eab308" };
  if (score < 80) return { label: "SAFE", color: "bg-teal-500", text: "text-teal-100", glow: "shadow-teal-500/30", icon: "🟢", barColor: "#14b8a6" };
  return { label: "VERY SAFE", color: "bg-emerald-500", text: "text-emerald-100", glow: "shadow-emerald-500/30", icon: "✅", barColor: "#10b981" };
}

export default function LiveSafetyBar({ riskScore, userLat, userLng, onCheckSafety }: LiveSafetyBarProps) {
  const [expanded, setExpanded] = useState(false);
  const [liveScore, setLiveScore] = useState<number | null>(riskScore);
  const [liveData, setLiveData] = useState<SafetyCheckResult | null>(null);
  const [checking, setChecking] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Continuous safety checks every 10 seconds when GPS is active
  useEffect(() => {
    if (!userLat || !userLng || !onCheckSafety) return;

    const check = async () => {
      setChecking(true);
      try {
        const data = await onCheckSafety(userLat, userLng);
        if (data?.safety_score !== undefined) {
          setLiveScore(data.safety_score);
          setLiveData(data);
        }
      } catch {}
      setChecking(false);
    };

    check();
    intervalRef.current = setInterval(check, 10000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [userLat, userLng, onCheckSafety]);

  // Derive the display score from riskScore prop or live data
  const derivedScore = liveScore ?? riskScore;
  if (derivedScore === null && !userLat) return null;

  const score = derivedScore ?? 0;
  const tier = getRiskTier(score);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={cn(
          "fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-[380px] z-[800]",
          "bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-2xl",
          "border border-zinc-200/50 dark:border-zinc-700/50",
          "shadow-2xl", tier.glow
        )}
      >
        {/* Header bar */}
        <div className="w-full flex items-center justify-between px-4 py-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center gap-4">
             {/* Safety Gauge replaces icon */}
             <div className="relative w-16 h-16 flex-shrink-0">
               <SafetyGauge score={score} size={64} strokeWidth={6} />
               <motion.div 
                 className={cn("absolute inset-0 rounded-full blur-xl opacity-20", tier.color)}
                 animate={{ opacity: [0.1, 0.3, 0.1] }}
                 transition={{ repeat: Infinity, duration: 2 }}
               />
             </div>

            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black font-serif text-zinc-800 dark:text-zinc-200 tracking-tight">
                  {tier.label}
                </span>
                {checking && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                )}
              </div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
                Live Zone Analysis
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {expanded ? <ChevronDown className="w-5 h-5 text-zinc-400" /> : <ChevronUp className="w-5 h-5 text-zinc-400" />}
          </div>
        </div>

        {/* Expanded details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-6 space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                
                {/* Breakdown Metrics */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 flex flex-col items-center gap-1">
                        <Lightbulb className="w-5 h-5 text-yellow-500 mb-1" />
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Good</span>
                        <span className="text-[8px] uppercase text-zinc-400 tracking-wider">Lighting</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 flex flex-col items-center gap-1">
                        <Activity className="w-5 h-5 text-red-500 mb-1" />
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Low</span>
                        <span className="text-[8px] uppercase text-zinc-400 tracking-wider">Crime</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 flex flex-col items-center gap-1">
                        <Users className="w-5 h-5 text-blue-500 mb-1" />
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Moderate</span>
                        <span className="text-[8px] uppercase text-zinc-400 tracking-wider">Crowd</span>
                    </div>
                </div>

                {liveData?.advice && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 text-xs font-medium text-amber-800 dark:text-amber-400 flex gap-2">
                    <span>💡</span>
                    {liveData.advice}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {userLat?.toFixed(4)}, {userLng?.toFixed(4)}
                  </div>
                  <span>Updated just now</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
