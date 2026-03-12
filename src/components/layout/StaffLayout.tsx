"use client";

import { StaffHeader } from "./StaffHeader";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface StaffLayoutProps {
  children: React.ReactNode;
  balance: number;
}

export function StaffLayout({ children, balance }: StaffLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <StaffHeader balance={balance} />
      
      <main className="flex-1 w-full max-w-4xl mx-auto pb-20">
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

      {/* Bottom Nav Placeholder (User said ignore for now, but I'll leave space) */}
    </div>
  );
}
