"use client";

import { useEffect, useState } from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import {
  getAdminNotifications,
  markNotificationAsRead,
} from "@/actions/adminActions";
import { formatDate } from "@/utils";
import clsx from "clsx";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    const res = await getAdminNotifications();
    if (res.success && res.data) {
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n: any) => !n.isRead).length);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Polling every 1 minute
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    const res = await markNotificationAsRead(id);
    if (res.success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-brand transition-all shadow-sm"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 size-5 bg-rose-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-md shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 bg-brand text-white flex justify-between items-center">
              <h3 className="font-bold tracking-tight">System Notifications</h3>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium uppercase tracking-widest">
                Latest Updates
              </span>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center gap-3">
                  <div className="p-3 bg-gray-50 rounded-full">
                    <Bell className="text-gray-300" size={32} />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">
                    No notifications yet
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={clsx(
                      "p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-0 relative",
                      !n.isRead && "bg-brand/5",
                    )}
                  >
                    {!n.isRead && (
                      <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand rounded-full"></div>
                    )}
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-tighter mb-1">
                          {n.type} • {formatDate(n.createdAt)}
                        </p>
                        <p className="text-sm text-gray-800 leading-snug font-medium mb-2">
                          {n.message}
                        </p>
                        <div className="flex gap-2">
                          {n.link && (
                            <Link
                              href={n.link}
                              onClick={() => setIsOpen(false)}
                              className="text-[11px] font-bold text-brand hover:underline flex items-center gap-1"
                            >
                              <ExternalLink size={12} />
                              View Details
                            </Link>
                          )}
                          {!n.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(n.id)}
                              className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                            >
                              <Check size={12} />
                              Mark as Read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link
              href="/complaints"
              onClick={() => setIsOpen(false)}
              className="block p-3 text-center text-sm font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors border-t border-gray-100"
            >
              View All Complaints
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
