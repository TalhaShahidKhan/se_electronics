"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings, Crown, User, Monitor } from "lucide-react";
import clsx from "clsx";

export function CustomerBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Home",
      icon: Home,
      href: "/customer/profile",
    },
    {
      label: "Services",
      icon: Monitor,
      href: "/customer/services",
    },
    {
      label: "VIP Card",
      icon: Crown,
      href: "/customer/vip-card",
    },
    {
      label: "Profile",
      icon: User,
      href: "/customer/profile", // Or a dedicated personal details page if exists
    },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 px-2 py-2 flex items-center justify-around z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={clsx(
              "flex flex-col items-center gap-1 p-2 min-w-16 transition-all duration-300 rounded-2xl",
              isActive ? "text-brand bg-brand/5" : "text-gray-400 hover:text-brand hover:bg-brand/5"
            )}
          >
            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
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
