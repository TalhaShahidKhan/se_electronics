"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Activity,
  Briefcase,
  CheckCircle,
  Clock,
  FileText,
  LogOut,
  MessageSquare,
  PhoneCall,
  Star,
  User,
  Wallet,
  Wrench,
  XCircle,
} from "lucide-react";
import Banner from "@/components/ui/Banner";
import { StaffLayout } from "@/components/layout/StaffLayout";
import { staffLogout } from "@/actions";

interface StaffDashboardClientProps {
  staffData: any;
  stats: any;
  experienceYears: number;
  adminPhone: string;
}

export default function StaffDashboardClient({
  staffData,
  stats,
  experienceYears,
  adminPhone,
}: StaffDashboardClientProps) {
  return (
    <StaffLayout balance={stats?.availableBalance || 0}>
      <div className="flex flex-col gap-4 p-4 text-gray-800">
        {/* Banner Section */}
        <div className="w-full">
          <Banner />
        </div>

        {/* Primary Action Grid (Large Cards) */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "My Services", icon: Wrench, href: "/staff/services", color: "text-emerald-500", bg: "bg-emerald-50" },
              { label: "Report Task", icon: FileText, href: "/staff/services", color: "text-amber-500", bg: "bg-amber-50" },
              { label: "Tracking", icon: Activity, href: "/staff/tracking", color: "text-blue-500", bg: "bg-blue-50" },
              { label: "Payments", icon: Wallet, href: "/staff/payments", color: "text-rose-500", bg: "bg-rose-50" },
            ].map((action, i) => (
              <Link key={action.label} href={action.href} className="flex flex-col items-center gap-2 group">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`${action.bg} ${action.color} p-3 rounded-2xl shadow-sm group-hover:shadow-md transition-all active:scale-95`}
                >
                  <action.icon size={24} />
                </motion.div>
                <span className="text-[10px] sm:text-xs font-bold text-gray-600 text-center uppercase tracking-tight">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Secondary Action Grid (Smaller Items) */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="grid grid-cols-4 gap-y-6 gap-x-2">
            {[
              { label: "Staff Detail", icon: User, href: "/staff/details", color: "text-purple-500" },
              { label: "Stats", icon: Briefcase, href: "/staff/tracking", color: "text-cyan-500" },
              { label: "Feedback", icon: Star, href: "/staff/feedbacks", color: "text-pink-500" },
              { label: "Support", icon: PhoneCall, href: `tel:${adminPhone}`, color: "text-brand" },
              { label: "WhatsApp", icon: MessageSquare, href: `https://wa.me/8801310673600`, color: "text-green-500" },
              { label: "Profile", icon: User, href: "/staff/details", color: "text-indigo-500" },
              { label: "History", icon: Clock, href: "/staff/tracking", color: "text-slate-500" },
              { label: "Done", icon: CheckCircle, href: "/staff/tracking", color: "text-emerald-600" },
            ].map((action, i) => (
              <Link key={action.label + i} href={action.href} className="flex flex-col items-center gap-1.5 group">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="group-hover:scale-110 transition-transform active:scale-90"
                >
                  <action.icon className={`${action.color}`} size={24} />
                </motion.div>
                <span className="text-[10px] sm:text-xs font-semibold text-gray-500 text-center">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Staff Welcome Info Overlay */}
        <div className="bg-gradient-to-r from-brand to-brand-700 rounded-2xl p-4 text-white shadow-lg overflow-hidden relative">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-white/70 text-[10px] uppercase font-bold tracking-wider">Active Staff</p>
              <h3 className="text-lg font-bold">{staffData.name}</h3>
              <p className="text-white/80 text-xs font-medium">{staffData.role} • {staffData.staffId}</p>
            </div>
            <div className="size-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <User size={24} />
            </div>
          </div>
          {/* Abstract background shapes */}
          <div className="absolute -right-4 -bottom-4 size-24 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute -right-2 -top-2 size-16 bg-white/10 rounded-full blur-xl" />
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-xl font-bold">{stats?.successfulServices || 0}</p>
              <p className="text-[10px] uppercase font-bold text-gray-400">Services Done</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xl font-bold">{experienceYears}</p>
              <p className="text-[10px] uppercase font-bold text-gray-400">Years Exp.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <form action={staffLogout}>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 rounded-full bg-gray-200 text-gray-600 font-bold text-xs uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <LogOut size={16} />
              Logout from Portal
            </button>
          </form>
        </div>
      </div>
    </StaffLayout>
  );
}
