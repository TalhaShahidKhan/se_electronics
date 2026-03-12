"use client";

import { useSideNavContext } from "@/hooks";
import { Plus } from "lucide-react";
import Link from "next/link";
import NotificationBell from "./NotificationBell";


export default function DashboardHeader() {
  const { openSideNav } = useSideNavContext();

  return (
    <header className="flex items-center justify-between mb-4 sm:mb-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          title="Show Sidebar"
          onClick={openSideNav}
          className="xl:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 text-gray-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-brand tracking-tight">
          Admin Overview
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <NotificationBell />
        <Link
          href="/services/add"
          className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-brand text-white rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm hover:bg-brand-800 active:scale-95 transition-all shadow-md shadow-brand-100"
        >
          <Plus size={18} className="sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Add New Service</span>
          <span className="sm:hidden">Add</span>
        </Link>
      </div>
    </header>
  );
}

