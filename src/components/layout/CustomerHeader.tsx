"use client";

import { usePathname } from "next/navigation";
import CustomerNotificationBell from "../features/customers/CustomerNotificationBell";

export function CustomerHeader() {
  const pathname = usePathname();
  const isDashboard = pathname === "/customer/profile";

  if (isDashboard) {
    return (
      <header className="bg-[#0A1A3A] text-white shadow-2xl rounded-b-[2rem] border-b-4 border-white/5 animate-in slide-in-from-top duration-500">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-center">
          <h1 className="text-[15px] font-black tracking-[0.2em] uppercase text-center drop-shadow-md">
            Welcome to SE Electronics
          </h1>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-brand text-white shadow-lg">
      <div className="max-w-4xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* <LanguageToggle /> */}
          <CustomerNotificationBell variant="header" />
        </div>
      </div>
    </header>
  );
}
