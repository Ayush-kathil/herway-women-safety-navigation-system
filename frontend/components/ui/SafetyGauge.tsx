"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SafetyGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export default function SafetyGauge({ score, size = 120, strokeWidth = 10, className }: SafetyGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, score));
  const offset = circumference - (progress / 100) * circumference;
  
  // Color logic
  let color = "text-emerald-500";
  if (score > 40) color = "text-yellow-500";
  if (score > 60) color = "text-orange-500";
  if (score > 80) color = "text-red-600";
  
  // Track color (background ring)
  const trackColor = "text-zinc-100 dark:text-zinc-800";

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className={trackColor}
        />
        {/* Progress */}
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
          className={color}
        />
      </svg>
      
      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
         <motion.span 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className={cn("text-3xl font-black tabular-nums", color)}
         >
            {Math.round(score)}
         </motion.span>
         <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Score
         </span>
      </div>
    </div>
  );
}
