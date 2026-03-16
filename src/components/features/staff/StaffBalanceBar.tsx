"use client";

import { Wallet, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export function StaffBalanceBar({ amount }: { amount: number }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!revealed) return;

    const timeoutId = setTimeout(() => {
      setRevealed(false);
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [revealed]);

  const displayAmount = Math.floor(amount || 0);
  const amountText =
    displayAmount < 0
      ? `-${Math.abs(displayAmount).toLocaleString()}৳`
      : `${displayAmount.toLocaleString()}৳`;

  return (
    <div className="flex items-center">
      <div className="bg-white rounded-full h-9 shadow-md border border-brand/10 overflow-hidden relative min-w-[150px] sm:min-w-[170px]">
        <div className="flex items-center h-full w-full relative">
          {/* Tap for Balance Button */}
          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              className="absolute inset-0 flex items-center gap-3 px-4 z-20 bg-white transition-opacity duration-300 hover:bg-gray-50 active:scale-95"
            >
              <div className="size-6 rounded-full bg-brand/5 flex items-center justify-center shrink-0">
                <div className="w-3 h-3 text-brand text-sm font-extrabold -mt-2">৳</div>
              </div>
              <span className="text-xs sm:text-sm font-black text-brand whitespace-nowrap">
                Tap For Balance
              </span>
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-brand/10 to-transparent skew-x-12 animate-[shimmer_2s_infinite]"
              />
            </button>
          ) : (
            /* Revealed Balance Content */
            <div className="flex items-center justify-between w-full h-full px-1 pl-4 animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="size-6 rounded-full bg-brand/5 flex items-center justify-center shrink-0 animate-in slide-in-from-left-4 duration-300">
                <Wallet className="w-3.5 h-3.5 text-brand" />
              </div>

              <div className="flex-1 flex items-center justify-between gap-2 animate-in fade-in slide-in-from-right-4 duration-500">
                <span className="text-sm sm:text-base font-black text-brand ml-2">
                  {amountText}
                </span>
                <Link
                  href="/staff/payment"
                  className="h-7 px-3 rounded-full bg-brand text-white flex items-center gap-1 text-[10px] sm:text-xs font-black hover:bg-brand-800 transition-all active:scale-95 shadow-sm"
                >
                  Details
                  <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
