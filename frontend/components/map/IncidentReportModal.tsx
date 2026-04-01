"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, EyeOff, ShieldAlert, Car, Siren, LightbulbOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface IncidentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: string, description: string) => void;
}

const INCIDENT_TYPES = [
  { id: "harassment", label: "Harassment", icon: ShieldAlert, color: "text-red-600" },
  { id: "lighting", label: "Poor Lighting", icon: LightbulbOff, color: "text-yellow-500" },
  { id: "accident", label: "Accident", icon: Car, color: "text-orange-500" },
  { id: "suspicious", label: "Suspicious Activity", icon: AlertTriangle, color: "text-zinc-500" },
];

export default function IncidentReportModal({ isOpen, onClose, onSubmit }: IncidentReportModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedType) return;
    setIsSubmitting(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onSubmit(selectedType, description);
    
    // Reset
    setIsSubmitting(false);
    setSelectedType(null);
    setDescription("");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] shadow-2xl overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-serif font-bold text-zinc-900 dark:text-white">Report Incident</h2>
                    <p className="text-xs text-zinc-500 mt-1">Help keep the community safe.</p>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {INCIDENT_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedType === type.id;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all duration-200",
                          isSelected
                            ? "border-black dark:border-white bg-zinc-50 dark:bg-zinc-900 shadow-md ring-1 ring-black dark:ring-white"
                            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                        )}
                      >
                        <Icon className={cn("w-8 h-8", type.color)} />
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">{type.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2 mb-6">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Details (Optional)</label>
                    <textarea
                    placeholder="Describe specific location or details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white h-24 resize-none text-sm"
                    />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!selectedType || isSubmitting}
                  className={cn(
                      "w-full py-4 rounded-full font-bold uppercase tracking-widest text-sm transition-all shadow-lg",
                      !selectedType || isSubmitting
                        ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                        : "bg-black dark:bg-white text-white dark:text-black hover:scale-[1.02] active:scale-[0.98]"
                  )}
                >
                  {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Submitting...
                      </span>
                  ) : "Submit Report"}
                </button>
              </div>
            </motion.div>
          </div>
        </>
    </AnimatePresence>
  );
}
