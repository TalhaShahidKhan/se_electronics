"use client";

import { StaffHeader } from "./StaffHeader";
import { StaffBottomNav } from "./StaffBottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { NoticeBanner } from "../features/notices";
import { useEffect, useState } from "react";
import { getStaffNotices } from "@/actions";
import { NoticeRecipientType } from "@/types";

interface StaffLayoutProps {
  children: React.ReactNode;
  balance: number;
}

export function StaffLayout({ children, balance }: StaffLayoutProps) {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<NoticeRecipientType[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const res = await getStaffNotices();
      if (res.success) setNotifications(res.data as any);
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <StaffHeader balance={balance} />
      
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

      <StaffBottomNav />
    </div>
  );
}
