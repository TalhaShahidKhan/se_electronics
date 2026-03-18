"use client";

import Link from "next/link";
import CustomerNotificationBell from "../features/customers/CustomerNotificationBell";
import LanguageToggle from "../ui/LanguageToggle";

export function CustomerHeader() {
  return (
    <header className="hidden md:block sticky top-0 z-50 bg-brand text-white shadow-lg">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
            {/* <LanguageToggle /> */}
            <CustomerNotificationBell />
        </div>
        
        <div className="flex items-center justify-center">
          <Link
            href="/customer/profile"
            className="flex items-center gap-2 hover:bg-white/40 p-1.5 rounded-xl transition-colors"
          >
            <div className="hidden xs:block text-right">
              <p className="text-[11px] text-blue-100 font-bold uppercase tracking-wider leading-none mb-1">
                Customer Portal
              </p>
              <p className="text-sm sm:text-base font-bold leading-none text-white">
                Dashboard
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center border border-white/20 overflow-hidden">
              <span className="text-base font-bold text-white">SE</span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
