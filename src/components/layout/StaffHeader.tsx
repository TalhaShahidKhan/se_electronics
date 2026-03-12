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
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <StaffBalanceBar amount={balance} />
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <StaffNotificationBell />
        </div>
      </div>
    </header>
  );
}
