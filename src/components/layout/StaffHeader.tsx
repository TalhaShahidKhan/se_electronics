"use client";

import Link from "next/link";
import { StaffBalanceBar } from "../features/staff/StaffBalanceBar";
import { StaffNotificationBell } from "../features/notices";

interface StaffHeaderProps {
  balance: number;
}

export function StaffHeader({ balance }: StaffHeaderProps) {
  return (
    <header className="hidden md:block sticky top-0 z-50 bg-brand text-white shadow-lg">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <StaffBalanceBar amount={balance} />
        <div className="flex items-center justify-center">
          <Link
            href="/staff/profile"
            className="flex items-center gap-2 hover:bg-white/40 p-1.5 rounded-xl transition-colors"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center border border-white/20 overflow-hidden">
              <span className="text-base font-bold">SE</span>
            </div>
            <div className="hidden xs:block">
              <p className="text-[11px] text-blue-200 font-bold uppercase tracking-wider leading-none mb-1">
                Staff Portal
              </p>
              <p className="text-sm sm:text-base font-bold leading-none">
                Dashboard
              </p>
            </div>
          </Link>
          <StaffNotificationBell />
        </div>
      </div>
    </header>
  );
}
