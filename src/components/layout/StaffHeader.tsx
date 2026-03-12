"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { StaffBalanceBar } from "../features/staff/StaffBalanceBar";
import StaffNotificationBell from "../features/staff/StaffNotificationBell";

interface StaffHeaderProps {
  balance: number;
}

export function StaffHeader({ balance }: StaffHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-brand text-white shadow-lg">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/staff/profile" className="flex items-center gap-2 hover:bg-white/10 p-1.5 rounded-xl transition-colors">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/20 rounded-lg flex items-center justify-center border border-white/20 overflow-hidden">
               <span className="text-sm font-bold">SE</span>
            </div>
            <div className="hidden xs:block">
              <p className="text-[10px] text-blue-200 font-bold uppercase tracking-wider leading-none mb-1">Staff Portal</p>
              <p className="text-xs sm:text-sm font-bold leading-none">Dashboard</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <StaffBalanceBar amount={balance} />
          <div className="h-6 w-px bg-white/20 hidden sm:block"></div>
          <StaffNotificationBell />
        </div>
      </div>
    </header>
  );
}
