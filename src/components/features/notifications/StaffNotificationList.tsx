"use client";

import {
  getStaffNotifications,
  markStaffNotificationAsRead,
} from "@/actions/staffActions";
import { getStaffNotices, markNoticeAsRead } from "@/actions/noticeActions";
import { Spinner } from "@/components/ui";
import { formatDate } from "@/utils";
import {
  CombinedNotificationType,
  StaffNotificationType,
  NoticeRecipientType,
} from "@/types";
import { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Info,
  AlertTriangle,
  Zap,
  Inbox,
  Wallet,
  Wrench,
} from "lucide-react";
import clsx from "clsx";
import Link from "next/link";

export default function StaffNotificationList() {
  const [notifications, setNotifications] = useState<
    CombinedNotificationType[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    const [actionNotifRes, noticeNotifRes] = await Promise.all([
      getStaffNotifications(),
      getStaffNotices(),
    ]);

    let combined: CombinedNotificationType[] = [];

    if (actionNotifRes.success && actionNotifRes.data) {
      combined = [
        ...combined,
        ...(actionNotifRes.data as StaffNotificationType[]).map((n) => ({
          ...n,
          itemType: "action" as const,
        })),
      ];
    }

    if (noticeNotifRes.success && noticeNotifRes.data) {
      combined = [
        ...combined,
        ...(noticeNotifRes.data as NoticeRecipientType[]).map((n) => ({
          ...n,
          itemType: "notice" as const,
        })),
      ];
    }

    // Sort by createdAt desc
    combined.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    setNotifications(combined);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkAsRead = async (id: string, type: "action" | "notice") => {
    if (type === "action") {
      await markStaffNotificationAsRead(id);
    } else {
      await markNoticeAsRead(id);
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  if (isLoading)
    return (
      <div className="h-64 __center">
        <Spinner />
      </div>
    );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-brand/5 flex items-center justify-center">
            <Bell size={24} className="text-brand" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-0.5">
              {unreadCount} Unread Alerts
            </p>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="grid grid-cols-1 gap-3">
        {notifications.map((item) => {
          const isAction = item.itemType === "action";

          // Separate properties safely based on itemType
          let title = "";
          let message = "";
          let link = "#";

          if (item.itemType === "action") {
            title =
              item.type === "balance_added" ? "Balance Added" : "Notification";
            message = item.message;
            link = item.link || "/staff/notifications";
          } else {
            title = item.notice?.title || "Notice";
            message = item.notice?.content || "";
            link = "/staff/notifications";
          }

          return (
            <Link
              key={item.id}
              href={link || "#"}
              onClick={() => handleMarkAsRead(item.id, item.itemType)}
              className={clsx(
                "group relative flex items-center gap-4 p-4 lg:p-6 bg-white rounded-2xl lg:rounded-[2.5rem] border transition-all text-left",
                item.isRead
                  ? "border-gray-50 opacity-80"
                  : "border-brand/20 shadow-md ring-2 ring-brand/5",
              )}
            >
              <div
                className={clsx(
                  "shrink-0 size-12 lg:size-14 rounded-xl lg:rounded-2xl flex items-center justify-center text-white shadow-lg",
                  item.itemType === "action"
                    ? item.type === "balance_added"
                      ? "bg-emerald-500"
                      : "bg-brand"
                    : item.notice?.priority === "urgent"
                      ? "bg-rose-500"
                      : item.notice?.priority === "high"
                        ? "bg-orange-500"
                        : "bg-blue-500",
                )}
              >
                {item.itemType === "action" ? (
                  item.type === "balance_added" ? (
                    <Wallet size={20} />
                  ) : (
                    <Info size={20} />
                  )
                ) : item.notice?.priority === "urgent" ? (
                  <Zap size={20} />
                ) : (
                  <Info size={20} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3
                    className={clsx(
                      "text-sm lg:text-base font-bold truncate",
                      item.isRead ? "text-gray-600" : "text-gray-900",
                    )}
                  >
                    {title}
                  </h3>
                  {!item.isRead && (
                    <span className="size-2 rounded-full bg-brand animate-pulse" />
                  )}
                </div>
                <p className="text-sm lg:text-sm text-gray-500 line-clamp-1 font-medium leading-relaxed">
                  {message}
                </p>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5 block">
                  {formatDate(item.createdAt, true)}
                </span>
              </div>

              <div className="shrink-0 size-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all">
                <ChevronRight size={16} />
              </div>
            </Link>
          );
        })}
      </div>

      {notifications.length === 0 && (
        <div className="h-96 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-gray-100 p-12 text-center">
          <div className="size-20 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 text-gray-200">
            <Inbox size={40} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            All Caught Up!
          </h3>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">
            No notifications at the moment
          </p>
        </div>
      )}
    </div>
  );
}
