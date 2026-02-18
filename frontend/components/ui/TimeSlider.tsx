"use client";

import { motion } from "framer-motion";
import { Clock, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeSliderProps {
  hour: number;
  setHour: (h: number) => void;
}

export default function TimeSlider({ hour, setHour }: TimeSliderProps) {
  return (
    <div className="w-full glass-card p-4 rounded-2xl flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Clock className="w-4 h-4 text-rose-500" />
          <span>Time Travel</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-mono">
            {hour >= 6 && hour < 18 ? <Sun className="w-3 h-3 text-amber-500" /> : <Moon className="w-3 h-3 text-indigo-400" />}
            {hour.toString().padStart(2, '0')}:00
        </div>
      </div>
      
      <div className="relative h-6 flex items-center">
        <input
          type="range"
          min="0"
          max="23"
          value={hour}
          onChange={(e) => setHour(parseInt(e.target.value))}
          className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
        />
      </div>
      
      <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
        <span>00:00</span>
        <span>12:00</span>
        <span>23:00</span>
      </div>
    </div>
  );
}
