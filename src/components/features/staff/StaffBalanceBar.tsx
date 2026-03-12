"use client";

import Link from "next/link";
import { Wallet } from "lucide-react";
import { useState } from "react";

export function StaffBalanceBar({ amount }: { amount: number }) {
  const [revealed, setRevealed] = useState(false);

  const displayAmount = Math.floor(amount || 0);
  const amountText =
    displayAmount < 0
      ? `-${Math.abs(displayAmount).toLocaleString()}৳`
      : `${displayAmount.toLocaleString()}৳`;

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={() => setRevealed((v) => !v)}
        className="relative h-9 sm:h-10 w-[210px] sm:w-[260px] rounded-full bg-brand/90 border border-brand-700/30 shadow-sm overflow-hidden flex items-center justify-between px-2.5 sm:px-3.5 transition-transform active:scale-[0.98]"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-7 sm:size-8 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="text-[11px] sm:text-xs font-semibold text-white/90 truncate">
            {revealed ? amountText : "Tap for Balance"}
          </span>
        </div>

        <Link
          href="/staff/payment"
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 ml-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-[11px] sm:text-xs font-semibold text-white hover:bg-white/20 transition-colors"
        >
          Details
        </Link>

        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
            revealed ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent motion-safe:animate-pulse" />
        </div>
      </button>
    </div>
  );
}

