"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function ClassicalIntro({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Sequence timing
    const timers = [
      setTimeout(() => setStage(1), 800),  // "Safety"
      setTimeout(() => setStage(2), 1600), // "Elegance"
      setTimeout(() => setStage(3), 2400), // "HerWay"
      setTimeout(() => setStage(4), 3500), // Exit
      setTimeout(onComplete, 4000),      // Unmount
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeInOut" as any } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.5 } }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-white dark:bg-black flex flex-col items-center justify-center pointer-events-none"
      initial={{ opacity: 1 }}
      animate={stage === 4 ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="relative">
        <AnimatePresence mode="wait">
          {stage === 1 && (
            <motion.h1
              key="safety"
              variants={textVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-4xl md:text-6xl font-serif font-light text-black dark:text-white tracking-widest uppercase absolute left-1/2 -translate-x-1/2"
            >
              Safety
            </motion.h1>
          )}
          {stage === 2 && (
            <motion.h1
              key="elegance"
              variants={textVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-4xl md:text-6xl font-serif font-light text-black dark:text-white tracking-widest uppercase absolute left-1/2 -translate-x-1/2"
            >
              Elegance
            </motion.h1>
          )}
          {stage === 3 && (
            <motion.div
              key="herway"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 1 }}
              className="flex flex-col items-center"
            >
              <h1 className="text-6xl md:text-8xl font-serif font-black text-black dark:text-white tracking-tighter mb-4">
                HerWay
              </h1>
              <div className="w-12 h-1 bg-black dark:bg-white rounded-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative Border */}
      <motion.div 
        className="absolute inset-8 border border-black dark:border-white opacity-20"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.2 }}
        transition={{ duration: 2 }}
      />
    </motion.div>
  );
}
