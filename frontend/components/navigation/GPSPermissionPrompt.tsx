"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation2, X } from "lucide-react";

interface GPSPermissionPromptProps {
  visible: boolean;
  onAllow: () => void;
  onDismiss: () => void;
  error?: string | null;
}

export default function GPSPermissionPrompt({ visible, onAllow, onDismiss, error }: GPSPermissionPromptProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="w-[90%] max-w-[380px] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Animated header */}
            <div className="relative h-40 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 left-4 w-20 h-20 bg-white/20 rounded-full blur-xl" />
                <div className="absolute bottom-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              </div>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              >
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                  <Navigation2 className="w-10 h-10 text-white" />
                </div>
              </motion.div>
              <button
                onClick={onDismiss}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              <h2 className="text-xl font-black text-zinc-900 dark:text-white mb-2">
                Enable Location
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
                HerWay needs your location to provide <strong className="text-zinc-700 dark:text-zinc-300">real-time safety alerts</strong>, 
                voice-guided navigation, and danger zone warnings as you travel.
              </p>

              {/* Features list */}
              <div className="text-left space-y-2 mb-5">
                {[
                  { icon: "🛡️", text: "Live danger zone alerts" },
                  { icon: "🗺️", text: "Turn-by-turn voice navigation" },
                  { icon: "📍", text: "Real-time safety score for your area" },
                  { icon: "🔊", text: "Voice warnings in risky zones" },
                ].map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-400"
                  >
                    <span className="text-base">{f.icon}</span> {f.text}
                  </motion.div>
                ))}
              </div>

              {/* Error message */}
              {error && (
                <div className="p-2 mb-3 rounded-lg bg-red-50 dark:bg-red-900/15 text-xs text-red-600 dark:text-red-400">
                  ⚠️ {error}. Please enable location in your browser settings.
                </div>
              )}

              {/* Buttons */}
              <button
                onClick={onAllow}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4" /> Allow Location Access
              </button>
              <button
                onClick={onDismiss}
                className="w-full mt-2 py-2.5 text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              >
                Not now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
