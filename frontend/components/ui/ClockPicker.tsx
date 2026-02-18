"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sun, Moon, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface ClockPickerProps {
  hour: number;
  onChange: (hour: number) => void;
}

const ClockPicker = ({ hour, onChange }: ClockPickerProps) => {
  const [period, setPeriod] = useState<"AM" | "PM">(hour >= 12 ? "PM" : "AM");
  
  const displayHours = period === "AM" 
    ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    : [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  
  const get24Hour = (displayHr: number, p: "AM" | "PM") => {
    if (p === "AM") return displayHr === 12 ? 0 : displayHr;
    return displayHr === 12 ? 12 : displayHr + 12;
  };

  const getDisplayHour = () => {
    if (hour === 0) return 12;
    if (hour > 12) return hour - 12;
    return hour;
  };

  const handleHourClick = (displayHr: number) => {
    const h24 = get24Hour(displayHr, period);
    onChange(h24);
  };

  const handlePeriodToggle = (p: "AM" | "PM") => {
    setPeriod(p);
    const currentDisplay = getDisplayHour();
    const h24 = get24Hour(currentDisplay, p);
    onChange(h24);
  };

  const isNight = hour >= 19 || hour <= 5;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Period Toggle */}
      <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
        <button
          onClick={() => handlePeriodToggle("AM")}
          className={cn(
            "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
            period === "AM"
              ? "bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md shadow-amber-500/25"
              : "text-zinc-500 hover:text-zinc-700"
          )}
        >
          <Sun className="w-3 h-3 inline mr-1" /> AM
        </button>
        <button
          onClick={() => handlePeriodToggle("PM")}
          className={cn(
            "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
            period === "PM"
              ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/25"
              : "text-zinc-500 hover:text-zinc-700"
          )}
        >
          <Moon className="w-3 h-3 inline mr-1" /> PM
        </button>
      </div>

      {/* Clock Face */}
      <div className="relative w-[200px] h-[200px]">
        {/* Outer Ring */}
        <div className={cn(
          "absolute inset-0 rounded-full border-2 transition-colors duration-500",
          isNight 
            ? "border-indigo-500/30 bg-gradient-to-br from-indigo-950/50 to-purple-950/50" 
            : "border-amber-400/30 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10"
        )} />
        
        {/* Inner Glow */}
        <div className={cn(
          "absolute inset-4 rounded-full transition-colors duration-500",
          isNight
            ? "bg-gradient-to-br from-indigo-900/20 to-transparent"
            : "bg-gradient-to-br from-amber-100/30 to-transparent dark:from-amber-900/10"
        )} />

        {/* Center Display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            key={hour}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <span className={cn(
              "text-4xl font-black tabular-nums tracking-tight",
              isNight ? "text-indigo-300" : "text-amber-600 dark:text-amber-400"
            )}>
              {getDisplayHour().toString().padStart(2, '0')}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              {period} · {isNight ? "Night" : hour < 12 ? "Morning" : "Day"}
            </span>
          </motion.div>
        </div>

        {/* Hour Marks */}
        {displayHours.map((displayHr, idx) => {
          const angle = (idx * 30 - 90) * (Math.PI / 180);
          const radius = 82;
          const x = 100 + radius * Math.cos(angle);
          const y = 100 + radius * Math.sin(angle);
          
          const h24 = get24Hour(displayHr, period);
          const isSelected = h24 === hour;
          
          return (
            <button
              key={displayHr}
              onClick={() => handleHourClick(displayHr)}
              className="absolute z-10"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <motion.div
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                  isSelected
                    ? isNight
                      ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/40 scale-110"
                      : "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/40 scale-110"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
              >
                {displayHr}
              </motion.div>
            </button>
          );
        })}

        {/* Clock Hand */}
        {(() => {
          const displayHr = getDisplayHour();
          const idx = displayHours.indexOf(displayHr);
          const angle = idx * 30 - 90;
          return (
            <div
              className="absolute top-1/2 left-1/2 origin-left z-0"
              style={{
                width: '60px',
                height: '2px',
                transform: `rotate(${angle}deg)`,
                background: isNight
                  ? 'linear-gradient(to right, rgba(129,140,248,0.6), rgba(129,140,248,0))'
                  : 'linear-gradient(to right, rgba(245,158,11,0.6), rgba(245,158,11,0))',
                transition: 'transform 0.3s ease-out',
              }}
            />
          );
        })()}

        {/* Center Dot */}
        <div className={cn(
          "absolute top-1/2 left-1/2 w-2.5 h-2.5 rounded-full -translate-x-1/2 -translate-y-1/2 z-10",
          isNight ? "bg-indigo-400" : "bg-amber-500"
        )} />
      </div>
    </div>
  );
};

export default ClockPicker;
