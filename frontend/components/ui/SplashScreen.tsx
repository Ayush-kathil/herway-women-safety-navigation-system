"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Shield, MapPin, Navigation } from "lucide-react";
import { useEffect, useState } from "react";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for exit animation
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-950 text-white overflow-hidden"
        >
          {/* Background Gradients */}
          <div className="absolute inset-0 z-0">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-rose-600/20 rounded-full blur-[100px]"
            />
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              className="absolute bottom-[-20%] right-[-20%] w-[80vw] h-[80vw] bg-indigo-600/20 rounded-full blur-[100px]"
            />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="relative">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  duration: 1.5,
                }}
                className="w-24 h-24 bg-gradient-to-br from-rose-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-rose-500/30 mb-8"
              >
                <Shield className="w-12 h-12 text-white" strokeWidth={2.5} />
              </motion.div>
              
              {/* Floating Orbiting Icons */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-40px]"
              >
               <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                 <MapPin className="w-6 h-6 text-rose-400" />
               </div>
               <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                 <Navigation className="w-6 h-6 text-indigo-400" />
               </div>
              </motion.div>
            </div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-zinc-400"
            >
              HerWay
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mt-4 text-zinc-400 text-sm tracking-widest uppercase font-medium"
            >
              AI-Powered Safety Navigation
            </motion.p>
          </div>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 200 }}
            transition={{ delay: 1, duration: 1.5, ease: "easeInOut" }}
            className="absolute bottom-20 h-1 bg-gradient-to-r from-rose-500 to-indigo-600 rounded-full"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
