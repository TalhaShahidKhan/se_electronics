"use client";

import { useSideNavContext } from "@/hooks";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useDebouncedCallback } from "use-debounce";

export default function Toolbar({
  title,
  actions,
  filters,
  pagination,
}: {
  title: string;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  pagination: {
    currentPage: number;
    totalRecords: number;
    totalPages: number;
    currentLimit: number;
  };
}) {
  const [isPending, startTransition] = useTransition();
  const [isPaginationPending, startPaginationTransition] = useTransition();
  const [pendingDirection, setPendingDirection] = useState<
    "left" | "right" | null
  >(null);
  const searchParams = useSearchParams();
  const { openSideNav } = useSideNavContext();
  const { refresh, push } = useRouter();
  const DEFAULT_PAGE = 1;
  const DEFAULT_LIMIT = 20;
  const currentPage = searchParams.get("page") || DEFAULT_PAGE.toString();
  const currentLimit = searchParams.get("limit") || DEFAULT_LIMIT.toString();

  const handlePaginationControls = ({
    page,
    limit,
  }: {
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams(searchParams);
    const currentPageInt = parseInt(currentPage);
    const currentLimitInt = parseInt(currentLimit);

    if (limit) {
      if (limit === DEFAULT_LIMIT && currentPageInt === DEFAULT_PAGE) {
        params.delete("limit");
        params.delete("page");
      } else {
        if (!params.has("page")) {
          params.set("page", DEFAULT_PAGE.toString());
        }
        params.set("limit", limit.toString());
      }
    }
    if (page) {
      const newPage = parseInt(currentPage.toString()) + page;
      if (newPage > pagination.totalPages || newPage < DEFAULT_PAGE) return;
      if (newPage === DEFAULT_PAGE && currentLimitInt === DEFAULT_LIMIT) {
        params.delete("page");
        params.delete("limit");
      } else {
        params.set("page", newPage.toString());
        if (!params.has("limit")) {
          params.set("limit", DEFAULT_LIMIT.toString());
        }
      }
    }
    startPaginationTransition(() => {
      push(`?${params.toString()}`);
      setPendingDirection(null);
    });
  };

  const handleRefresh = () => {
    startTransition(() => {
      refresh();
    });
  };

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete("page");
    params.delete("limit");
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    push(`?${params.toString()}`);
  }, 500);

  return (
    <header className="flex flex-col gap-4 mb-4">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        {/* Title and hamburger */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            title="Show Sidebar"
            onClick={openSideNav}
            className="xl:hidden p-2 hover:bg-gray-100 rounded-md transition-colors"
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
          <div className="font-extrabold text-2xl sm:text-3xl text-brand tracking-tight">
            <span>{title}</span>
          </div>
        </div>
        {/* Custom Actions */}
        <div className="flex items-center gap-2">{actions}</div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between bg-white p-3 sm:p-4 rounded-md border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center flex-1">
          {/* Search bar */}
          <div className="relative w-full lg:max-w-xs">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="#696969"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </div>
            <input
              defaultValue={searchParams.get("query")?.toString()}
              onChange={(e) => handleSearch(e.target.value)}
              type="text"
              placeholder="Search records..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-md text-base focus:ring-2 focus:ring-brand/20 transition-all outline-none"
            />
          </div>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            className="flex items-center justify-center gap-2 hover:bg-gray-50 text-gray-600 rounded-md px-4 py-2.5 text-base font-medium transition-colors border border-gray-100 sm:border-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`size-5 ${isPending ? "animate-spin" : ""}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            <span>Refresh</span>
          </button>
        </div>

        {/* Pagination controls */}
        <div className="flex flex-wrap items-center gap-4 lg:gap-6 pt-3 lg:pt-0 border-t lg:border-none border-gray-50">
          {filters && <div className="flex items-center gap-2">{filters}</div>}

          <div className="flex items-center gap-4 ml-auto sm:ml-0">
            <div className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-500">
              <span className="hidden sm:inline">Total:</span>
              <span className="text-gray-900 bg-gray-100 px-2 py-1 rounded-md font-bold">
                {pagination.totalRecords}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-500">
              <span className="hidden sm:inline">Show:</span>
              <select
                defaultValue={currentLimit}
                onChange={(e) =>
                  handlePaginationControls({ limit: parseInt(e.target.value) })
                }
                className="bg-gray-100 border-none rounded-md text-sm font-bold h-9 px-2 outline-none focus:ring-2 focus:ring-brand/20"
              >
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="40">40</option>
                <option value="50">50</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm sm:text-base font-bold text-gray-700 whitespace-nowrap">
                {currentPage} / {pagination.totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === "1" || isPaginationPending}
                  onClick={() => {
                    setPendingDirection("left");
                    handlePaginationControls({ page: -1 });
                  }}
                  className="p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-gray-100 rounded-md transition-all"
                >
                  {pendingDirection === "left" ? (
                    <Loader2 className="text-brand animate-spin size-5" />
                  ) : (
                    <ChevronLeft className="text-gray-700 size-5" />
                  )}
                </button>
                <button
                  disabled={
                    currentPage === pagination.totalPages.toString() ||
                    isPaginationPending
                  }
                  onClick={() => {
                    setPendingDirection("right");
                    handlePaginationControls({ page: 1 });
                  }}
                  className="p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-gray-100 rounded-md transition-all"
                >
                  {pendingDirection === "right" ? (
                    <Loader2 className="text-brand animate-spin size-5" />
                  ) : (
                    <ChevronRight className="text-gray-700 size-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
