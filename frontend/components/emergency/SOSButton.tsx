"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert, Siren } from "lucide-react";

interface SOSButtonProps {
  location?: { lat: number; lng: number } | null;
}

export default function SOSButton({ location }: SOSButtonProps) {
  const [active, setActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [triggering, setTriggering] = useState(false);

  const triggerSOS = useCallback(async () => {
    setTriggering(true);
    // Haptic feedback
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([500, 200, 500]);
    }
    
    try {
      // Attempt to notify backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/trigger_sos`, {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: location?.lat ?? null,
          lng: location?.lng ?? null,
          timestamp: Date.now()
        })
      });
      console.log("SOS Triggered", await res.json());
    } catch (e) {
      console.error("Failed to trigger SOS backend", e);
    } finally {
      // Connect explicitly to the National Helpline (112 or local equivalent)
      if (typeof window !== "undefined") {
        window.location.href = "tel:112";
      }
    }
  }, [location]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (active && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    } else if (active && countdown === 0) {
      triggerSOS();
    }
    return () => clearInterval(interval);
  }, [active, countdown, triggerSOS]);

  const startSOS = () => {
    setActive(true);
    setCountdown(5);
    // Haptic feedback if available
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(200);
    }
  };

  const cancelSOS = () => {
    setActive(false);
    setCountdown(5);
    setTriggering(false);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={startSOS}
        className="fixed bottom-8 right-8 z-[1000] w-16 h-16 rounded-full bg-red-600 shadow-lg shadow-red-600/40 flex items-center justify-center text-white cursor-pointer group"
      >
         <div className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-20" />
         <div className="absolute inset-0 rounded-full border-2 border-white/20" />
         <span className="font-black text-xs absolute -bottom-6 text-red-600 bg-white/90 px-2 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">SOS</span>
         <ShieldAlert className="w-8 h-8 fill-current" />
      </motion.button>

      {/* Full Screen Countdown/Alert Overlay */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-red-600/95 backdrop-blur-xl flex flex-col items-center justify-center text-white"
          >
            {!triggering ? (
              <>
                 <motion.div 
                   animate={{ scale: [1, 1.2, 1] }} 
                   transition={{ repeat: Infinity, duration: 1 }}
                   className="w-40 h-40 rounded-full bg-white/20 flex items-center justify-center mb-8 border-4 border-white"
                 >
                    <span className="text-8xl font-black tabular-nums">{countdown}</span>
                 </motion.div>
                 
                 <h2 className="text-3xl font-bold mb-2">Sending Emergency Alert</h2>
                 <p className="text-red-100 mb-12 text-center max-w-xs">
                   Alerting trusted contacts and emergency services with your location.
                 </p>

                 <button
                   onClick={cancelSOS}
                   className="px-10 py-4 bg-white text-red-600 rounded-full font-bold text-lg shadow-xl active:scale-95 transition-transform flex items-center gap-2"
                 >
                   <X className="w-6 h-6" /> CANCEL SOS
                 </button>
              </>
            ) : (
               <div className="text-center">
                 <motion.div
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-6"
                 >
                   <Siren className="w-16 h-16 text-red-600 animate-pulse" />
                 </motion.div>
                 <h2 className="text-4xl font-black mb-4">ALERT SENT!</h2>
                 <p className="text-xl opacity-90 mb-8">Help is on the way.</p>
                 <button 
                   onClick={cancelSOS}
                   className="text-white/80 hover:text-white underline"
                 >
                   Dismiss
                 </button>
               </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
