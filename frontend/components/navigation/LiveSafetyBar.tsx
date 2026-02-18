"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ShieldAlert, ShieldCheck, Volume2, ChevronUp, ChevronDown, MapPin, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveSafetyBarProps {
  riskScore: number | null;
  isNavigating: boolean;
  userLat: number | null;
  userLng: number | null;
  onCheckSafety?: (lat: number, lng: number) => Promise<any>;
}

function getRiskTier(score: number) {
  if (score > 80) return { label: "DANGEROUS", color: "bg-red-600", text: "text-red-100", glow: "shadow-red-500/50", icon: "🔴", barColor: "#ef4444" };
  if (score > 60) return { label: "RISKY", color: "bg-orange-500", text: "text-orange-100", glow: "shadow-orange-500/40", icon: "🟠", barColor: "#f97316" };
  if (score > 40) return { label: "MODERATE", color: "bg-yellow-500", text: "text-yellow-100", glow: "shadow-yellow-500/30", icon: "🟡", barColor: "#eab308" };
  if (score > 20) return { label: "SAFE", color: "bg-teal-500", text: "text-teal-100", glow: "shadow-teal-500/30", icon: "🟢", barColor: "#14b8a6" };
  return { label: "VERY SAFE", color: "bg-emerald-500", text: "text-emerald-100", glow: "shadow-emerald-500/30", icon: "✅", barColor: "#10b981" };
}

export default function LiveSafetyBar({ riskScore, isNavigating, userLat, userLng, onCheckSafety }: LiveSafetyBarProps) {
  const [expanded, setExpanded] = useState(false);
  const [liveScore, setLiveScore] = useState<number | null>(riskScore);
  const [liveData, setLiveData] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (riskScore !== null) setLiveScore(riskScore);
  }, [riskScore]);

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

  if (liveScore === null && !userLat) return null;

  const score = liveScore ?? 0;
  const tier = getRiskTier(score);
  const percentage = Math.min(100, Math.max(0, score));

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
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={score > 60 ? { scale: [1, 1.15, 1] } : {}}
              transition={score > 60 ? { repeat: Infinity, duration: 1.5 } : {}}
              className={cn("w-10 h-10 rounded-xl flex items-center justify-center", tier.color, "shadow-lg", tier.glow)}
            >
              {score > 60 ? <ShieldAlert className="w-5 h-5 text-white" /> : <ShieldCheck className="w-5 h-5 text-white" />}
            </motion.div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  {tier.icon} {tier.label}
                </span>
                {checking && (
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                )}
              </div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                Live Safety · Score {Math.round(score)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("text-2xl font-black", score > 60 ? "text-red-500" : score > 40 ? "text-yellow-500" : "text-emerald-500")}>
              {Math.round(score)}
            </span>
            {expanded ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronUp className="w-4 h-4 text-zinc-400" />}
          </div>
        </button>

        {/* Risk bar */}
        <div className="px-4 pb-2">
          <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: tier.barColor }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[8px] uppercase tracking-widest text-zinc-400">
            <span>Safe</span>
            <span>Moderate</span>
            <span>Dangerous</span>
          </div>
        </div>

        {/* Expanded details */}
        <AnimatePresence>
          {expanded && liveData && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <div className="text-lg font-black text-zinc-800 dark:text-zinc-200">{liveData.model_raw_score}</div>
                    <div className="text-[8px] uppercase text-zinc-400 tracking-wider">ML Score</div>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <div className="text-lg font-black text-zinc-800 dark:text-zinc-200">{liveData.crime_count}</div>
                    <div className="text-[8px] uppercase text-zinc-400 tracking-wider">Crimes</div>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <div className="text-lg font-black text-zinc-800 dark:text-zinc-200">{liveData.hour}:00</div>
                    <div className="text-[8px] uppercase text-zinc-400 tracking-wider">Time</div>
                  </div>
                </div>
                {liveData.advice && (
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/10 text-xs text-amber-700 dark:text-amber-400">
                    💡 {liveData.advice}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                  <MapPin className="w-3 h-3" />
                  {userLat?.toFixed(4)}, {userLng?.toFixed(4)}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
