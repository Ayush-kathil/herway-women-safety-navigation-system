"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, AlertTriangle, MapPin, Shield } from "lucide-react";
import { useEffect, useState, useRef } from "react";

interface DangerAlertProps {
  visible: boolean;
  riskScore: number;
  advice: string;
  crimeCount: number;
  areaName?: string;
  onDismiss: () => void;
}

function getRiskLabel(score: number) {
  if (score > 80) return { label: "CRITICAL DANGER", sub: "Leave this area immediately", urgency: "critical" };
  if (score > 60) return { label: "HIGH RISK ZONE", sub: "Stay alert and move cautiously", urgency: "high" };
  return { label: "CAUTION ZONE", sub: "Be aware of your surroundings", urgency: "moderate" };
}

const DangerAlert = ({ visible, riskScore, advice, crimeCount, areaName, onDismiss }: DangerAlertProps) => {
  const [countdown, setCountdown] = useState(15);
  const risk = getRiskLabel(riskScore);

  useEffect(() => {
    if (visible && typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 300, 100, 400]);
    }
  }, [visible]);

  // Auto-dismiss countdown — resets when component becomes visible
  const countdownRef = useRef(15);
  useEffect(() => {
    if (!visible) return;
    // Reset via ref (avoids synchronous setState)
    countdownRef.current = 15;
    const timer = setInterval(() => {
      countdownRef.current -= 1;
      if (countdownRef.current <= 0) {
        countdownRef.current = 15;
        onDismiss();
      }
      setCountdown(countdownRef.current);
    }, 1000);
    return () => clearInterval(timer);
  }, [visible, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
        >
          {/* Animated gradient background */}
          <motion.div
            animate={{ opacity: [0.6, 0.8, 0.6] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-gradient-to-b from-red-900/80 via-red-950/90 to-black/95 backdrop-blur-xl"
          />

          {/* Pulsing rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                initial={{ scale: 0.5, opacity: 0.5 }}
                animate={{ scale: [0.5, 2.5], opacity: [0.3, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.5, ease: "easeOut" }}
                className="absolute w-32 h-32 rounded-full border border-red-500/30"
              />
            ))}
          </div>

          {/* Content Card */}
          <motion.div
            initial={{ scale: 0.7, y: 40, rotateX: 15 }}
            animate={{ scale: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.7, y: 40 }}
            transition={{ type: "spring", damping: 20, stiffness: 250 }}
            className="relative z-10 w-[92%] max-w-[400px]"
          >
            {/* Glowing icon */}
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-24 h-24 mx-auto -mb-12 z-20 relative rounded-full bg-gradient-to-br from-red-500 via-rose-500 to-red-700 flex items-center justify-center ring-4 ring-white/20 shadow-2xl shadow-red-500/60"
            >
              <ShieldAlert className="w-12 h-12 text-white" />
              <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="absolute inset-0 rounded-full bg-red-400/30"
              />
            </motion.div>

            <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-red-500/20 overflow-hidden pt-16 pb-5 px-5">
              {/* Timer bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-200 dark:bg-zinc-800">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 15, ease: "linear" }}
                  className="h-full bg-gradient-to-r from-red-500 to-rose-500"
                />
              </div>

              {/* Title */}
              <motion.h2
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-xl font-black text-red-600 dark:text-red-400 text-center mb-1"
              >
                ⚠️ {risk.label}
              </motion.h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mb-4">{risk.sub}</p>

              {/* Risk Score with ring */}
              <div className="flex justify-center mb-4">
                <div className="relative w-28 h-28">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-zinc-100 dark:text-zinc-800" />
                    <motion.circle
                      cx="50" cy="50" r="42" fill="none" strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={`${(riskScore / 100) * 264} 264`}
                      initial={{ strokeDashoffset: 264 }}
                      animate={{ strokeDashoffset: 0 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className={riskScore > 80 ? "text-red-500" : riskScore > 60 ? "text-orange-500" : "text-yellow-500"}
                      stroke="currentColor"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-red-600 dark:text-red-400">{Math.round(riskScore)}</span>
                    <span className="text-[8px] uppercase tracking-widest text-zinc-400 font-bold">Risk</span>
                  </div>
                </div>
              </div>

              {/* Area & Stats */}
              {(areaName || crimeCount > 0) && (
                <div className="flex items-center justify-center gap-3 mb-3 text-xs text-zinc-500">
                  {areaName && (
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{areaName}</span>
                  )}
                  {crimeCount > 0 && (
                    <span className="flex items-center gap-1 text-red-500">
                      <AlertTriangle className="w-3 h-3" />{crimeCount} incident{crimeCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              )}

              {/* Advice */}
              <div className="p-3 rounded-2xl bg-red-50/80 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/20 mb-3">
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{advice}</p>
              </div>

              {/* Quick action tips */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { icon: "🛡️", text: "Stay on main roads" },
                  { icon: "📱", text: "Share live location" },
                  { icon: "👀", text: "Stay alert & aware" },
                  { icon: "📞", text: "Emergency: 112" },
                ].map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-1.5 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 text-xs text-zinc-600 dark:text-zinc-400"
                  >
                    <span>{tip.icon}</span>
                    <span className="truncate">{tip.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Dismiss */}
              <button
                onClick={onDismiss}
                className="w-full py-3 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" /> I Understand ({countdown}s)
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DangerAlert;
