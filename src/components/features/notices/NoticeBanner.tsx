"use client";

import { NoticeRecipientType } from "@/types";
import { useState, useEffect } from "react";
import { AlertTriangle, Zap, X, ChevronRight } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export default function NoticeBanner({
  notifications,
}: {
  notifications: NoticeRecipientType[];
}) {
  const [currentNotice, setCurrentNotice] =
    useState<NoticeRecipientType | null>(null);

  useEffect(() => {
    // Find the most recent unread urgent/high priority notice
    const importantUnread = notifications
      .filter(
        (n) =>
          !n.isRead &&
          (n.notice?.priority === "urgent" || n.notice?.priority === "high"),
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0];

    setCurrentNotice(importantUnread || null);
  }, [notifications]);

  if (!currentNotice) return null;

  return (
    <div
      className={clsx(
        "w-full px-6 py-4 flex items-center justify-between gap-4 animate-in slide-in-from-top duration-500",
        currentNotice.notice?.priority === "urgent"
          ? "bg-rose-600 text-white"
          : "bg-orange-500 text-white",
      )}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          {currentNotice.notice?.priority === "urgent" ? (
            <Zap size={20} />
          ) : (
            <AlertTriangle size={20} />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-70 mb-0.5">
            {currentNotice.notice?.priority} Announcement
          </p>
          <h4 className="text-sm font-bold truncate">
            {currentNotice.notice?.title}
          </h4>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/staff/notifications"
          className="px-4 py-2 bg-white text-gray-900 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center gap-2"
        >
          View Notice
          <ChevronRight size={14} />
        </Link>
        <button
          onClick={() => setCurrentNotice(null)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
