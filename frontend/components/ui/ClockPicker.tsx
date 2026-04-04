"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

interface ClockPickerProps {
  hour: number;
  onChange: (hour: number) => void;
}

export default function ClockPicker({ hour, onChange }: ClockPickerProps) {
  // Determine initial period based on hour prop
  // Note: hour prop is 0-23
  const [period, setPeriod] = useState<"AM" | "PM">(hour >= 12 ? "PM" : "AM");
  const clockRef = useRef<HTMLDivElement>(null);

  // Convert 0-23 hour to 1-12 for display
  const displayHour = hour % 12 || 12;

  const handleTimeChange = (newHour12: number) => {
    let finalHour = newHour12;
    // Adjust based on CURRENT period state
    if (period === "AM" && finalHour === 12) finalHour = 0;
    if (period === "PM" && finalHour !== 12) finalHour += 12;
    // Edge case: if user clicks 12 and it's PM, it should be 12 (noon).
    // If user clicks 12 and it's AM, it should be 0 (midnight).
    onChange(finalHour);
  };

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if (!clockRef.current) return;
    const rect = clockRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;

    // Calculate angle in degrees (0 at top/12 o'clock)
    // atan2(y, x) gives angle from X axis. We want angle from -Y axis (top).
    // dx, -dy transforms coords so Y is up.
    // Actually, let's keep it simple:
    // angle = atan2(dy, dx) is from 3 o'clock clockwise if y is down.
    // Let's use standard:
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90; // +90 to make 12 o'clock 0 degrees
    if (angle < 0) angle += 360;

    // Snap to nearest hour (30 degrees per hour)
    const snappedAngle = Math.round(angle / 30) * 30;
    let newHour = Math.round(snappedAngle / 30);
    if (newHour === 0) newHour = 12;

    handleTimeChange(newHour);
  };

  const togglePeriod = () => {
    const newPeriod = period === "AM" ? "PM" : "AM";
    setPeriod(newPeriod);
    let h = hour;
    // Convert current 24h time to new period
    if (newPeriod === "PM" && h < 12) h += 12;
    if (newPeriod === "AM" && h >= 12) h -= 12;
    onChange(h);
  };

  return (
    <div className="flex flex-col items-center select-none w-full">
       {/* Period Switch - Pill Shape */}
       <div className="relative flex bg-zinc-100 dark:bg-zinc-900 rounded-full p-1 mb-8 shadow-inner border border-zinc-200 dark:border-zinc-800 w-full max-w-[200px]">
          <motion.div 
            className="absolute top-1 bottom-1 w-[50%] bg-white dark:bg-zinc-800 rounded-full shadow-sm z-0"
            animate={{ left: period === "AM" ? "4px" : "calc(50% - 4px)" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          <button 
            onClick={() => { if(period !== "AM") togglePeriod() }}
            className={cn("relative z-10 w-1/2 py-2 rounded-full text-xs font-serif font-bold tracking-widest transition-colors flex items-center justify-center gap-2", period === "AM" ? "text-black dark:text-white" : "text-zinc-400")}
          >
            <Sun className="w-3 h-3" /> AM
          </button>
          <button 
            onClick={() => { if(period !== "PM") togglePeriod() }}
            className={cn("relative z-10 w-1/2 py-2 rounded-full text-xs font-serif font-bold tracking-widest transition-colors flex items-center justify-center gap-2", period === "PM" ? "text-black dark:text-white" : "text-zinc-400")}
          >
            <Moon className="w-3 h-3" /> PM
          </button>
       </div>

       {/* Clock Face */}
       <div 
         ref={clockRef}
         className="relative w-64 h-64 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-2xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform touch-none"
         onClick={handleInteraction}
         onTouchMove={handleInteraction} // Simple drag support
       >
          {/* Hour Markers */}
          {[...Array(12)].map((_, i) => {
            const h = i === 0 ? 12 : i;
            const angle = i * 30;
            const isSelected = h === displayHour;
            return (
              <div 
                key={i}
                className="absolute w-full h-full top-0 left-0 pointer-events-none"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <div className={cn(
                  "absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 transition-all",
                   isSelected ? "scale-110" : "opacity-40"
                )}>
                  <span className={cn(
                    "text-xl font-serif font-bold rotate-[calc(-1*var(--rot))]", 
                    isSelected ? "text-black dark:text-white" : "text-zinc-400"
                  )} style={{ "--rot": `${angle}deg` } as React.CSSProperties}>
                    {h}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Clock Hand */}
          <motion.div 
            className="absolute top-0 left-1/2 w-[2px] h-[50%] bg-black dark:bg-white origin-bottom z-20 pointer-events-none"
            animate={{ rotate: displayHour * 30 }}
            transition={{ type: "spring", stiffness: 150, damping: 15 }}
            style={{ x: "-50%", y: "0%" }}
          >
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-4 h-4 bg-black dark:bg-white rounded-full border-2 border-white dark:border-black shadow-lg" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-8 bg-black dark:bg-white rounded-full" />
          </motion.div>

          {/* Center Hub */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-black dark:bg-white rounded-full z-30 ring-4 ring-white dark:ring-black" />
       </div>

       <div className="mt-8 text-center space-y-2">
         <div className="text-5xl font-serif font-black text-black dark:text-white tracking-tighter flex items-center justify-center gap-1">
           {displayHour}<span className="animate-pulse">:</span>00
           <span className="text-lg text-zinc-400 self-start mt-2 font-sans font-medium">{period}</span>
         </div>
         <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-medium">Predictive Safety Analysis</p>
       </div>
    </div>
  );
}
