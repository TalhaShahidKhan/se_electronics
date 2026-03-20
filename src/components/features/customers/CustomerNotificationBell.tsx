"use client";

import { useEffect, useState } from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import { getCustomerNotifications, markCustomerNotificationAsRead } from "@/actions/customerActions";
import { formatDate } from "@/utils";
import clsx from "clsx";

export default function CustomerNotificationBell({ variant = "header" }: { variant?: "header" | "card" }) {
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
      className={clsx(
        "relative flex items-center justify-center transition-all duration-300 shadow-sm border",
        variant === "header" 
          ? "size-10 rounded-md bg-white/10 text-white hover:bg-white/20 border-white/20" 
          : "size-12 rounded-md bg-white text-[#0A1A3A] hover:bg-gray-100 border-gray-200"
      )}
    >
      <Bell size={variant === "header" ? 20 : 24} /> 
      {unreadCount > 0 && (
        <span className={clsx(
          "absolute -top-1 -right-1 bg-[#FF3B30] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 shadow-sm",
          variant === "header" ? "size-4 border-[#0A1A3A]" : "size-6 border-white"
        )}>
          {unreadCount}
        </span>
      )}
    </Link>
  );
}
