"use client";

import { CustomerHeader } from "./CustomerHeader";
import { CustomerBottomNav } from "./CustomerBottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { NoticeBanner } from "../features/notices";
import { useEffect, useState } from "react";
import { getCustomerNotices } from "@/actions";
import { NoticeRecipientType } from "@/types";

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export function CustomerLayout({ children }: CustomerLayoutProps) {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<NoticeRecipientType[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const res = await getCustomerNotices();
      if (res.success) setNotifications(res.data as any);
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <CustomerHeader />
      
      <NoticeBanner notifications={notifications} />

      <main className="flex-1 w-full max-w-4xl mx-auto pb-24 lg:pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <CustomerBottomNav />
    </div>
  );
}
