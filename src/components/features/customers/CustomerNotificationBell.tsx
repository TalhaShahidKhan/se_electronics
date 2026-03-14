"use client";

import { useEffect, useState } from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import { getCustomerNotifications, markCustomerNotificationAsRead } from "@/actions/customerActions";
import { formatDate } from "@/utils";
import clsx from "clsx";

export default function CustomerNotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    const res = await getCustomerNotifications();
    if (res.success && res.data) {
      setUnreadCount(res.data.filter((n: any) => !n.isRead).length);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      href="/customer/notifications"
      className="relative size-12 rounded-2xl flex items-center justify-center transition-all duration-300 bg-white/10 text-white hover:bg-white/20 border border-white/20 shadow-sm"
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
