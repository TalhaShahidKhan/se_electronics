"use client";

import { useSideNavContext } from "@/hooks";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function DashboardHeader() {
  const { openSideNav } = useSideNavContext();

  return (
    <header className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-4">
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
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Admin Overview
        </h1>
      </div>

      <Link
        href="/services/add"
        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-2xl font-bold font-plus-jakarta hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200"
      >
        <Plus size={20} />
        <span>Add New Service</span>
      </Link>
    </header>
  );
}
