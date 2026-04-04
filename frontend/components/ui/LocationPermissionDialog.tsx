"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MapPin } from "lucide-react";
import { useState } from "react";

interface LocationPermissionDialogProps {
  onAllow: () => void;
  onDeny: () => void;
}

export default function LocationPermissionDialog({ onAllow, onDeny }: LocationPermissionDialogProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleAllow = () => {
    setIsVisible(false);
    setTimeout(onAllow, 300); // Wait for exit animation
  };

  const handleDeny = () => {
    setIsVisible(false);
    setTimeout(onDeny, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden"
          >
            {/* Background Texture/Gradient for Classical Feel */}
            <div className="absolute top-0 left-0 w-full h-1 bg-black dark:bg-white" />
            
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-2">
                <MapPin className="w-8 h-8 text-black dark:text-white" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-serif font-bold text-black dark:text-white">
                  Enable Location Services
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 font-serif leading-relaxed">
                  To provide accurate safety scores and real-time navigation, HerWay requires access to your current location.
                </p>
              </div>

              <div className="flex flex-col w-full gap-3 pt-2">
                <button
                  onClick={handleAllow}
                  className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg"
                >
                  Allow Access
                </button>
                <button
                  onClick={handleDeny}
                  className="w-full py-4 bg-transparent border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white rounded-full font-bold uppercase tracking-widest text-xs hover:border-black dark:hover:border-white transition-all"
                >
                  Enter Manually
                </button>
              </div>

              <p className="text-[10px] text-zinc-400 uppercase tracking-widest pt-4">
                Your location data is processed locally and securely.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
