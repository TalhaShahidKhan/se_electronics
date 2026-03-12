"use client";

import { logout } from "@/actions";
import { ProgressBar } from "@/components";
import { appVersion } from "@/constants";
import clsx from "clsx";
import {
  HomeIcon,
  Users,
  FileText,
  Wrench,
  Zap,
  Star,
  ClipboardList,
  UserCog,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  LogOut,
  X,
  Crown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useState } from "react";

const links = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Service List", href: "/services/repairs", icon: Wrench },
  { name: "Install List", href: "/services/installations", icon: Zap },
  { name: "Feedbacks", href: "/feedbacks", icon: Star },
  { name: "Applications", href: "/applications", icon: ClipboardList },
  { name: "Technicians", href: "/staffs/technicians", icon: UserCog },
  { name: "Electricians", href: "/staffs/electricians", icon: UserCog },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Staff Reports", href: "/complaints", icon: AlertTriangle },
  { name: "Subscribers", href: "/subscribers", icon: Crown },
];

type Pagination = {
  currentPage: number;
  totalRecords: number;
  totalPages: number;
  currentLimit: number;
};

export const SideNavContext = createContext<{ openSideNav: () => void } | null>(
  null,
);

export default function DashboardLayout({
  children,
  username,
  smsBalance,
}: {
  children: React.ReactNode;
  username: string;
  smsBalance: number | null;
}) {
  const pathname = usePathname();
  const [isLogginOut, setIsLogginOut] = useState(false);
  const [showSideNav, setShowSideNav] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalRecords: 0,
    totalPages: 0,
    currentLimit: 20,
  });

  return (
    <>
      <ProgressBar />
      <div className="flex h-screen bg-gray-50">
        {/* Overlay for mobile */}
        {showSideNav && (
          <div
            className="fixed inset-0 bg-black/30 z-40 xl:hidden"
            onClick={() => setShowSideNav(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={clsx(
            "fixed xl:static z-50 flex flex-col h-screen w-[280px] sm:w-[260px] bg-brand text-white transition-transform duration-300 ease-in-out shadow-2xl xl:shadow-none",
            showSideNav ? "translate-x-0" : "-translate-x-full xl:translate-x-0",
          )}
        >
          {/* Sidebar Header */}
          <div className="flex items-center gap-3 px-4 sm:px-5 py-4 sm:py-5 border-b border-white/10">
            <Image
              src="/logo.jpg"
              alt="SE Electronics"
              width={32}
              height={32}
              className="rounded-lg border border-white/20 sm:w-9 sm:h-9"
            />
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-sm sm:text-base truncate">{username}</h1>
              <p className="text-[10px] sm:text-[11px] text-blue-200 font-medium tracking-wider uppercase">Admin Panel</p>
            </div>
            {showSideNav && (
              <button
                title="Close Sidebar"
                onClick={() => setShowSideNav(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors xl:hidden"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* SMS Balance */}
          <div className="mx-3 sm:mx-4 mt-4 mb-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 border border-white/10">
              {smsBalance ? (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs text-blue-200 font-medium">SMS Balance</span>
                  <span className="text-sm sm:text-base text-emerald-400 font-bold">
                    ৳{smsBalance.toLocaleString()}
                  </span>
                </div>
              ) : (
                <span className="text-[10px] sm:text-[11px] text-red-300 leading-tight block">
                  Could not fetch balance. Refresh to try again.
                </span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-2 sm:px-3 py-2 space-y-0.5 custom-scrollbar">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href + link.name}
                  onClick={() => setShowSideNav(false)}
                  href={link.href}
                  className={clsx(
                    "flex items-center gap-3 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl text-[13px] sm:text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-white text-brand shadow-sm"
                      : "text-blue-100 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <Icon size={18} className={clsx(isActive ? "text-brand" : "")} />
                  <span className="truncate">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 sm:p-4 border-t border-white/10">
            <button
              onClick={() => {
                setIsLogginOut(true);
                logout();
              }}
              disabled={isLogginOut}
              className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-red-500/80 text-white font-semibold text-sm sm:text-base py-2 sm:py-2.5 rounded-xl transition-all disabled:opacity-50 border border-white/10"
            >
              {!isLogginOut && <LogOut size={16} />}
              <span>{isLogginOut ? "Logging out..." : "Logout"}</span>
            </button>
            <span className="text-[10px] sm:text-[11px] text-blue-300 mt-2 sm:mt-3 block text-center font-medium tracking-wider">
              v{appVersion}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <section
          className={clsx(
            "flex-1 h-screen overflow-hidden flex flex-col relative",
          )}
        >
          <SideNavContext value={{ openSideNav: () => setShowSideNav(true) }}>
            <div className="flex-1 p-3 sm:p-5 pb-0 overflow-y-auto">
              {children}
            </div>
          </SideNavContext>
        </section>
      </div>
    </>
  );
}
