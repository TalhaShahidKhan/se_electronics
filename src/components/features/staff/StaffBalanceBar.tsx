"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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
      <div className="bg-white rounded-full h-9 shadow-md border border-brand/10 overflow-hidden relative min-w-[170px] sm:min-w-[170px]">
        <div className="flex items-start h-full w-full relative">
          {/* Tap for Balance Button */}
          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              className="absolute inset-0 flex items-center gap-3  z-20 bg-white transition-opacity duration-300 hover:bg-gray-50 active:scale-95"
            >
              <div className="size-8 rounded-full  flex items-center justify-center shrink-0 bg-brand">
                <div className="w-3 h-3  text-white text-sm font-extrabold -mt-2">
                  ৳
                </div>
              </div>
              <span className="text-sm sm:text-sm font-black text-brand whitespace-nowrap">
                Tap For Balance
              </span>
            </button>
          ) : (
            /* Revealed Balance Content */
            <div className="flex items-center justify-between w-full h-full   animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="size-8 rounded-full  flex items-center justify-center shrink-0 bg-brand">
                <div className="w-3 h-3  text-white text-sm font-extrabold -mt-2">
                  ৳
                </div>
              </div>

              <div className="flex-1 flex items-center justify-between gap-2 animate-in fade-in slide-in-from-right-4 duration-500">
                <span className="text-sm sm:text-base font-black text-brand ml-2">
                  {amountText}
                </span>
                <Link
                  href="/staff/payment"
                  className="h-7 px-3 rounded-full bg-brand text-white flex items-center gap-1 text-[10px] sm:text-sm font-black hover:bg-brand-800 transition-all active:scale-95 shadow-sm"
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
