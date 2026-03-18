"use client";

import {
  getStaffNotices,
  markNoticeAsRead,
  acknowledgeNotice,
} from "@/actions";
import { Spinner, Modal } from "@/components/ui";
import { NoticeRecipientType } from "@/types";
import { formatDate } from "@/utils";
import { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Info,
  AlertTriangle,
  Zap,
  Eye,
  Calendar,
  Clock,
  Inbox,
  UserCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import clsx from "clsx";

export default function StaffNoticeList() {
  const [notifications, setNotifications] = useState<NoticeRecipientType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] =
    useState<NoticeRecipientType | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    const res = await getStaffNotices();
    if (res.success) setNotifications(res.data as any);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRead = async (notification: NoticeRecipientType) => {
    setSelectedNotification(notification);
    if (!notification.isRead) {
      const res = await markNoticeAsRead(notification.id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id
              ? { ...n, isRead: true, readAt: new Date() }
              : n,
          ),
        );
      }
    }
  };

  const handleAcknowledge = async (id: string) => {
    const res = await acknowledgeNotice(id);
    if (res.success) {
      toast.success(res.message);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
                ...n,
                isAcknowledged: true,
                acknowledgedAt: new Date(),
                isRead: true,
              }
            : n,
        ),
      );
      setSelectedNotification(null);
    } else {
      toast.error(res.message);
    }
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
            <h2 className="text-xl font-black text-gray-900">Notice Center</h2>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-0.5">
              {unreadCount} Unread Announcements
            </p>
          </div>
        </div>
      </div>

      {/* Notice Feed */}
      <div className="grid grid-cols-1 gap-4">
        {notifications.map((notification) => (
          <button
            key={notification.id}
            onClick={() => handleRead(notification)}
            className={clsx(
              "group relative flex items-center gap-6 p-6 bg-white rounded-[2rem] border transition-all text-left",
              notification.isRead
                ? "border-gray-50 opacity-75"
                : "border-brand/20 shadow-md ring-2 ring-brand/5",
            )}
          >
            {/* Priority Indicator */}
            <div
              className={clsx(
                "shrink-0 size-14 rounded-2xl flex items-center justify-center text-white shadow-lg",
                {
                  "bg-blue-500 shadow-blue-200":
                    notification.notice?.priority === "low",
                  "bg-emerald-500 shadow-emerald-200":
                    notification.notice?.priority === "normal",
                  "bg-orange-500 shadow-orange-200":
                    notification.notice?.priority === "high",
                  "bg-rose-500 shadow-rose-200":
                    notification.notice?.priority === "urgent",
                },
              )}
            >
              {notification.notice?.priority === "urgent" ? (
                <Zap size={24} />
              ) : notification.notice?.priority === "high" ? (
                <AlertTriangle size={24} />
              ) : (
                <Info size={24} />
              )}
            </div>

            {/* Content Preview */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3
                  className={clsx(
                    "text-base font-black truncate",
                    notification.isRead ? "text-gray-600" : "text-gray-900",
                  )}
                >
                  {notification.notice?.title}
                </h3>
                {!notification.isRead && (
                  <span className="size-2 rounded-full bg-brand animate-pulse" />
                )}
              </div>
              <p className="text-sm text-gray-500 line-clamp-1 font-medium leading-relaxed">
                {notification.notice?.content}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <Calendar size={12} />
                  {formatDate(notification.createdAt)}
                </div>
                {notification.isAcknowledged && (
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                    <UserCheck size={12} />
                    Acknowledged
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 size-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all">
              <ChevronRight size={18} />
            </div>
          </button>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="h-96 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-gray-100 p-12 text-center">
          <div className="size-24 rounded-[2rem] bg-gray-50 flex items-center justify-center mb-6">
            <Inbox size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-2">
            No Notices Yet
          </h3>
          <p className="text-gray-400 max-w-sm font-medium leading-relaxed">
            All good! You've received all notices from the administration.
          </p>
        </div>
      )}

      {/* Notice Detail Modal */}
      {selectedNotification && (
        <Modal
          isVisible
          onClose={() => setSelectedNotification(null)}
          title={selectedNotification.notice?.title}
          width="600"
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div
                  className={clsx(
                    "px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-[0.15em]",
                    {
                      "bg-blue-50 text-blue-600":
                        selectedNotification.notice?.priority === "low",
                      "bg-emerald-50 text-emerald-600":
                        selectedNotification.notice?.priority === "normal",
                      "bg-orange-50 text-orange-600":
                        selectedNotification.notice?.priority === "high",
                      "bg-rose-50 text-rose-600":
                        selectedNotification.notice?.priority === "urgent",
                    },
                  )}
                >
                  {selectedNotification.notice?.priority} Priority
                </div>
                <span className="text-sm font-bold text-gray-400">
                  {formatDate(selectedNotification.createdAt)}
                </span>
              </div>
            </div>

            <div className="prose prose-sm max-w-none mb-10">
              <p className="text-gray-700 leading-[1.8] text-base whitespace-pre-wrap font-medium">
                {selectedNotification.notice?.content}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {!selectedNotification.isAcknowledged ? (
                <button
                  onClick={() => handleAcknowledge(selectedNotification.id)}
                  className="w-full py-5 bg-brand text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-brand-800 transition-all shadow-xl shadow-brand/20 flex items-center justify-center gap-3"
                >
                  <CheckCircle2 size={20} />
                  Acknowledge Notice
                </button>
              ) : (
                <div className="w-full py-5 bg-emerald-50 text-emerald-700 rounded-2xl font-black uppercase tracking-widest text-sm border-2 border-emerald-100 flex items-center justify-center gap-3">
                  <CheckCircle2 size={20} />
                  Already Acknowledged
                </div>
              )}
              <button
                onClick={() => setSelectedNotification(null)}
                className="w-full py-4 text-gray-500 font-bold hover:text-gray-700 transition-colors"
              >
                Close Notice
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
