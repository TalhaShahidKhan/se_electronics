"use client";

import { getStaffNotices } from "@/actions";
import { getStaffNotifications } from "@/actions/staffActions";
import { NoticeRecipientType, StaffNotificationType, CombinedNotificationType } from "@/types";
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";

export default function StaffNotificationBell() {
  const [notifications, setNotifications] = useState<CombinedNotificationType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    const [noticesRes, actionsRes] = await Promise.all([
      getStaffNotices(),
      getStaffNotifications()
    ]);
    
    let combined: CombinedNotificationType[] = [];
    if (noticesRes.success && noticesRes.data) {
      combined = [...combined, ...(noticesRes.data as NoticeRecipientType[]).map(n => ({ ...n, itemType: 'notice' as const }))];
    }
    if (actionsRes.success && actionsRes.data) {
      combined = [...combined, ...(actionsRes.data as StaffNotificationType[]).map(n => ({ ...n, itemType: 'action' as const }))];
    }
    
    combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setNotifications(combined);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
    // Poll every 1 minute for "real-time"
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
<<<<<<< HEAD
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(

          "relative size-12 rounded-xl flex items-center justify-center transition-all duration-300",
          isOpen ? "bg-white/35 text-white shadow-xl shadow-brand/20 scale-110" : "bg-white text-gray-400 hover:bg-brand/5 hover:text-brand border border-gray-100 shadow-sm"

        )}
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 size-6 bg-[#FF5252] text-white text-[10px] font-black rounded-full flex items-center justify-center border-4 border-brand shadow-lg">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/5" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-4 w-[350px] sm:w-[400px] bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all">
            {/* Header */}
            <div className="p-6 bg-brand text-white flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <Bell size={20} />
                  <h3 className="font-black uppercase tracking-widest text-sm">Notifications</h3>
               </div>
               <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {unreadCount} New
               </span>
            </div>

            {/* Content */}
            <div className="max-h-[450px] overflow-y-auto">
                {unreadNotifications.length > 0 ? (
                  <div className="divide-y divide-gray-50">
                    {unreadNotifications.map((notification) => {
                      const isAction = notification.itemType === 'action';
                      
                      let title = "";
                      let message = "";
                      
                      if (notification.itemType === 'action') {
                        title = notification.type === 'balance_added' ? 'Balance Added' : 'Notification';
                        message = notification.message;
                      } else {
                        title = notification.notice?.title || "Notice";
                        message = notification.notice?.content || "";
                      }

                      return (
                        <Link
                          key={notification.id}
                          href={isAction ? (notification.link || "/staff/notifications") : "/staff/notifications"}
                          onClick={() => setIsOpen(false)}
                          className="flex items-start gap-4 p-5 hover:bg-gray-50 transition-all group"
                        >
                          <div className={clsx(
                            "shrink-0 size-11 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform",
                            notification.itemType === 'action' ? "bg-brand" : {
                              "bg-blue-500": notification.notice?.priority === "low",
                              "bg-emerald-500": notification.notice?.priority === "normal",
                              "bg-orange-500": notification.notice?.priority === "high",
                              "bg-rose-500": notification.notice?.priority === "urgent",
                            }
                          )}>
                             {notification.itemType === 'action' ? (
                               notification.type === 'balance_added' ? <Wallet size={18} /> : <Info size={18} />
                             ) : (
                               notification.notice?.priority === "urgent" ? <Zap size={18} /> : 
                               notification.notice?.priority === "high" ? <AlertTriangle size={18} /> : 
                               <Info size={18} />
                             )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-gray-900 mb-0.5 truncate">{title}</p>
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-medium">
                              {message}
                            </p>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 block">
                              {formatDate(notification.createdAt)}
                            </span>
                          </div>
                          <ChevronRight size={14} className="text-gray-300 mt-1 group-hover:text-brand" />
                        </Link>
                      )
                    })}
                  </div>
               ) : (
                  <div className="p-12 text-center">
                     <div className="size-20 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                        <Inbox size={32} className="text-gray-200" />
                     </div>
                     <p className="text-sm font-black text-gray-900 mb-1">Inbox Zero!</p>
                     <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">No unread notifications</p>
                  </div>
               )}
            </div>

            {/* Footer */}
            <Link 
               href="/staff/notifications" 
               onClick={() => setIsOpen(false)}
               className="block p-5 bg-gray-50 text-center text-xs font-black text-brand uppercase tracking-widest hover:bg-brand/5 transition-all border-t border-gray-100"
            >
               View All Notifications
            </Link>
          </div>
        </>
=======
    <Link
      href="/staff/notifications"
      className="relative size-12 rounded-2xl flex items-center justify-center transition-all duration-300 bg-white/10 text-white hover:bg-white/20 border border-white/20 shadow-sm"
    >
      <Bell size={24} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 size-6 bg-[#FF5252] text-white text-[10px] font-black rounded-full flex items-center justify-center border-4 border-brand shadow-lg">
          {unreadCount}
        </span>
>>>>>>> e0fd63d8685d03480b0b8e98937a0f7f13c4a367
      )}
    </Link>
  );
}
