"use client";

import { getStaffNotices } from "@/actions";
import { getStaffNotifications } from "@/actions/staffActions";
import {
  NoticeRecipientType,
  StaffNotificationType,
  CombinedNotificationType,
} from "@/types";
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";

export default function StaffNotificationBell() {
  const [notifications, setNotifications] = useState<
    CombinedNotificationType[]
  >([]);
  const fetchData = async () => {
    const [noticesRes, actionsRes] = await Promise.all([
      getStaffNotices(),
      getStaffNotifications(),
    ]);

    let combined: CombinedNotificationType[] = [];
    if (noticesRes.success && noticesRes.data) {
      combined = [
        ...combined,
        ...(noticesRes.data as NoticeRecipientType[]).map((n) => ({
          ...n,
          itemType: "notice" as const,
        })),
      ];
    }
    if (actionsRes.success && actionsRes.data) {
      combined = [
        ...combined,
        ...(actionsRes.data as StaffNotificationType[]).map((n) => ({
          ...n,
          itemType: "action" as const,
        })),
      ];
    }

    combined.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    setNotifications(combined);
  };

  useEffect(() => {
    fetchData();
    // Poll every 1 minute for "real-time"
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Link
      href="/staff/notifications"
      className="relative size-12 rounded-md flex items-center justify-center transition-all duration-300 bg-white/10 text-white hover:bg-white/20 border border-white/20 shadow-sm"
    >
      <Bell size={24} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 size-6 bg-[#FF5252] text-white text-[10px] font-black rounded-full flex items-center justify-center border-4 border-brand shadow-lg">
          {unreadCount}
        </span>
      )}
    </Link>
  );
}
