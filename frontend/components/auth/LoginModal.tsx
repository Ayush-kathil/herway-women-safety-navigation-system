"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock login delay
    setTimeout(() => {
      setLoading(false);
      onLogin(); // Call parent handler
      onClose(); // Close modal
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-lg bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col"
          >
             {/* Classical Header */}
             <div className="p-8 pb-0 text-center relative">
               <button 
                 onClick={onClose}
                 className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
               >
                 <X className="w-5 h-5 text-zinc-500" />
               </button>

               <div className="w-12 h-12 mx-auto bg-black dark:bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
                 <ShieldCheck className="w-6 h-6 text-white dark:text-black" />
               </div>
               
               <h2 className="text-3xl font-serif font-black tracking-tight text-black dark:text-white mb-2">
                 HerWay
               </h2>
               <p className="text-zinc-500 dark:text-zinc-400 font-serif text-sm">
                 Premium Safety & Navigation
               </p>
             </div>

             {/* Tabs */}
             <div className="flex p-2 mx-8 mt-6 bg-zinc-100 dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800">
               <button
                 onClick={() => setMode("login")}
                 className={cn(
                   "flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-full transition-all",
                   mode === "login" 
                     ? "bg-white dark:bg-black text-black dark:text-white shadow-md border border-zinc-200 dark:border-zinc-800" 
                     : "text-zinc-500 hover:text-black dark:hover:text-white"
                 )}
               >
                 Log In
               </button>
               <button
                 onClick={() => setMode("signup")}
                 className={cn(
                   "flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-full transition-all",
                   mode === "signup" 
                     ? "bg-white dark:bg-black text-black dark:text-white shadow-md border border-zinc-200 dark:border-zinc-800" 
                     : "text-zinc-500 hover:text-black dark:hover:text-white"
                 )}
               >
                 Sign Up
               </button>
             </div>

             {/* Form */}
             <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <div className="space-y-4">
                  {mode === "signup" && (
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider ml-1">Full Name</label>
                      <input 
                        required
                        type="text"
                        className="w-full px-5 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                        placeholder="Jane Doe"
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider ml-1">Email Address</label>
                    <input 
                      required
                      type="email"
                      className="w-full px-5 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider ml-1">Password</label>
                    <input 
                      required
                      type="password"
                      className="w-full px-5 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    disabled={loading}
                    className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group shadow-xl"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {mode === "login" ? "Enter HerWay" : "Join Premium"} 
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
                
                <p className="text-center text-xs text-zinc-400">
                  {mode === "login" ? "Forgot your password?" : "By joining, you agree to our Terms."}
                </p>
             </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
