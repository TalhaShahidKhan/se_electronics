"use client";

import { useEffect, useState } from "react";
import { Bell, Check, ExternalLink, Inbox, Info, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getCustomerNotifications, markCustomerNotificationAsRead } from "@/actions/customerActions";
import { getCustomerNotices, markNoticeAsRead } from "@/actions/noticeActions";
import { formatDate } from "@/utils";
import clsx from "clsx";
import { CustomerLayout } from "@/components/layout/CustomerLayout";

export default function CustomerNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    const [notifRes, noticesRes] = await Promise.all([
      getCustomerNotifications(),
      getCustomerNotices()
    ]);

    if (notifRes.success && notifRes.data) setNotifications(notifRes.data);
    if (noticesRes.success && noticesRes.data) setNotices(noticesRes.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkNotifAsRead = async (id: string) => {
    const res = await markCustomerNotificationAsRead(id);
    if (res.success) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    }
  };

  const handleMarkNoticeAsRead = async (id: string) => {
    const res = await markNoticeAsRead(id);
    if (res.success) {
        setNotices(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    }
  };

  const allNotifications = [
    ...notifications.map(n => ({ ...n, itemType: 'notification' })),
    ...notices.map(n => ({ ...n, itemType: 'notice' }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <CustomerLayout>
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
            <Link href="/customer/profile" className="p-2 rounded-xl bg-white border border-gray-100 shadow-sm hover:bg-gray-50 text-gray-400 hover:text-brand transition-all">
                <ArrowLeft size={20} />
            </Link>
            <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Notifications</h1>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Stay updated with your service requests</p>
            </div>
        </div>

        {isLoading ? (
            <div className="space-y-4">
                {[1,2,3].map(i => (
                    <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-3xl" />
                ))}
            </div>
        ) : allNotifications.length > 0 ? (
            <div className="space-y-4">
                {allNotifications.map((n: any) => {
                    const isNew = !n.isRead;
                    const isNotice = n.itemType === 'notice';
                    
                    return (
                        <div 
                            key={n.id} 
                            className={clsx(
                                "group relative bg-white rounded-3xl p-5 border transition-all duration-300",
                                isNew ? "border-brand/20 shadow-lg shadow-brand/5 ring-1 ring-brand/5" : "border-gray-100 shadow-sm opacity-75"
                            )}
                        >
                            {isNew && (
                                <div className="absolute top-6 right-6 size-2 bg-brand rounded-full animate-pulse" />
                            )}
                            
                            <div className="flex gap-5">
                                <div className={clsx(
                                    "shrink-0 size-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
                                    isNotice ? "bg-amber-500" : "bg-brand"
                                )}>
                                    {isNotice ? <Bell size={20} /> : <Info size={20} />}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                            {isNotice ? "Announcement" : n.type} • {formatDate(n.createdAt)}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-base font-black text-gray-900 mb-1 leading-tight">
                                        {isNotice ? n.notice?.title : n.message}
                                    </h3>
                                    
                                    {isNotice && (
                                        <p className="text-sm text-gray-500 font-medium mb-3 line-clamp-2">
                                            {n.notice?.content}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap gap-3">
                                        {n.link && (
                                            <Link 
                                                href={n.link}
                                                className="inline-flex items-center gap-1.5 text-xs font-black text-brand uppercase tracking-widest hover:underline"
                                            >
                                                Details <ExternalLink size={12} />
                                            </Link>
                                        )}
                                        
                                        {isNew && (
                                            <button 
                                                onClick={() => isNotice ? handleMarkNoticeAsRead(n.id) : handleMarkNotifAsRead(n.id)}
                                                className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 uppercase tracking-widest hover:underline"
                                            >
                                                Mark Read <Check size={12} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        ) : (
            <div className="bg-white rounded-[3rem] p-16 text-center border border-dashed border-gray-200">
                <div className="size-24 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-6">
                    <Inbox size={40} className="text-gray-200" />
                </div>
                <h2 className="text-xl font-black text-gray-900 mb-2">No notifications yet</h2>
                <p className="text-gray-500 font-medium italic">We'll alert you here when something happens!</p>
            </div>
        )}
      </div>
    </CustomerLayout>
  );
}
