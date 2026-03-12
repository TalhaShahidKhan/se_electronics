"use client";

import { Wallet } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function StaffBalanceBar({ amount }: { amount: number }) {
  const [revealed, setRevealed] = useState(false);

  const displayAmount = Math.floor(amount || 0);
  const amountText =
    displayAmount < 0
      ? `-${Math.abs(displayAmount).toLocaleString()}৳`
      : `${displayAmount.toLocaleString()}৳`;

  return (
    <div className="flex items-center">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setRevealed((v) => !v)}
        className="h-8 sm:h-9 px-3 rounded-full bg-white flex items-center gap-2 shadow-sm border border-white/20 select-none overflow-hidden min-w-[140px] sm:min-w-[160px]"
      >
        <div className="size-5 sm:size-6 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
          <img src="/bkash_logo_small.png" alt="৳" className="w-3 h-3 object-contain" onError={(e) => {
            (e.target as any).src = ""; // Fallback to icon if logo not found
            (e.target as any).style.display = 'none';
          }} />
          <span className="text-brand font-bold text-[10px] sm:text-xs">৳</span>
        </div>
        
        <div className="relative h-full flex-1 flex items-center overflow-hidden">
          <AnimatePresence mode="wait">
            {!revealed ? (
              <motion.span
                key="tap"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="text-[11px] sm:text-xs font-bold text-brand whitespace-nowrap"
              >
                Tap for Balance
              </motion.span>
            ) : (
              <motion.span
                key="amount"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="text-[11px] sm:text-xs font-bold text-brand whitespace-nowrap"
              >
                {amountText}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        
        {/* Shine animation when not revealed */}
        {!revealed && (
          <motion.div
            animate={{
              x: ["-100%", "200%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-brand/5 to-transparent skew-x-12"
          />
        )}
      </motion.button>
    </div>
  );
}

