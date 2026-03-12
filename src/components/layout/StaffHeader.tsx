"use client";

import { Bell, Search } from "lucide-react";
import Link from "next/link";
import { StaffBalanceBar } from "../features/staff/StaffBalanceBar";

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
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Search size={20} />
          </button>

          <Link
            href="/staff/notifications"
            className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 size-2 bg-rose-500 rounded-full border border-brand" />
          </Link>
        </div>
      </div>
    </header>
  );
}
