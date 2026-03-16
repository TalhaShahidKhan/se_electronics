"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wrench, Wallet, User } from "lucide-react";
import clsx from "clsx";

export function StaffBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Home",
      icon: Home,
      href: "/staff/profile",
    },
    {
      label: "Services",
      icon: Wrench,
      href: "/staff/services",
    },
    {
      label: "Payment",
      icon: Wallet,
      href: "/staff/payment",
    },
    {
      label: "Profile",
      icon: User,
      href: "/staff/details",
    },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 w-full bg-white px-4 py-2 flex items-center justify-around z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] rounded-tl-3xl rounded-tr-3xl">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={clsx(
              "flex flex-col items-center gap-1 p-2 min-w-16 transition-all duration-300 relative",
              isActive ? "text-brand" : "text-gray-400 hover:text-brand"
            )}
          >
            {isActive && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-brand rounded-full" />
            )}
            <div className={clsx(
              "p-1.5 rounded-xl transition-all duration-300",
              isActive ? "bg-brand/10" : ""
            )}>
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={clsx(
              "text-[10px] uppercase tracking-widest font-black",
              isActive ? "opacity-100" : "opacity-60"
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
