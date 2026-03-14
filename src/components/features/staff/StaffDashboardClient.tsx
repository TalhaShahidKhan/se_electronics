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
      <div className="flex flex-col gap-6 p-4 sm:p-6 text-gray-800">
        {/* Banner Section */}
        <div className="w-full  overflow-hidden shadow-md">
          <Banner />
        </div>

        {/* Staff Welcome Info Overlay */}
        <div className="bg-gradient-to-br from-brand via-brand-800 to-brand-700 rounded-md p-6 sm:p-8 text-white shadow-xl overflow-hidden relative group">
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center px-2 py-1 rounded-lg bg-white/10 text-white/90 text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] mb-3">
                Active Staff Member
              </div>
              <h3 className="text-2xl sm:text-4xl font-black mb-1 truncate">{staffData.name}</h3>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-white/80 text-sm sm:text-base font-bold">
                <span className="flex items-center gap-2">
                  <Briefcase size={16} className="text-emerald-400" />
                  {staffData.role}
                </span>
                <span className="flex items-center gap-2">
                   <User size={16} className="text-blue-400" />
                   {staffData.staffId}
                </span>
              </div>
            </div>
            <div className="size-16 sm:size-28 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl group-hover:scale-105 transition-transform duration-500">
              <User size={36} className="sm:w-16 sm:h-16" />
            </div>
          </div>
          {/* Abstract background shapes */}
          <div className="absolute -right-8 -bottom-8 size-48 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute left-1/4 top-0 size-24 bg-brand-light/20 rounded-full blur-2xl" />
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white p-5 sm:p-8 rounded-md shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all group">
            <div className="p-3 sm:p-4 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
              <CheckCircle size={28} className="sm:w-8 sm:h-8" />
            </div>
            <div>
              <p className="text-2xl sm:text-4xl font-black text-gray-900 leading-none mb-1">
                {stats?.successfulServices || 0}
              </p>
              <p className="text-[11px] sm:text-xs uppercase font-black text-gray-400 tracking-widest">Services Done</p>
            </div>
          </div>
          <div className="bg-white p-5 sm:p-8 rounded-md shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all group">
            <div className="p-3 sm:p-4 bg-amber-50 rounded-2xl text-amber-600 group-hover:scale-110 transition-transform">
              <Clock size={28} className="sm:w-8 sm:h-8" />
            </div>
            <div>
              <p className="text-2xl sm:text-4xl font-black text-gray-900 leading-none mb-1">
                {experienceYears}
              </p>
              <p className="text-[11px] sm:text-xs uppercase font-black text-gray-400 tracking-widest">Years Exp.</p>
            </div>
          </div>
        </div>

        {/* Primary Action Grid (Large Cards) */}
        <div className="bg-white rounded-md p-6 sm:p-10 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
             <h4 className="text-xs sm:text-sm font-black text-gray-400 uppercase tracking-[0.25em]">Core Operations</h4>
             <div className="h-px flex-1 bg-gray-100 ml-8"></div>
          </div>
          <div className="grid grid-cols-4 gap-4 sm:gap-10">
            {[
              { label: "Services", icon: Wrench, href: "/staff/services", color: "text-emerald-500", bg: "bg-emerald-50" },
              { label: "Report", icon: FileText, href: "/staff/services", color: "text-amber-500", bg: "bg-amber-50" },
              { label: "Tracking", icon: Activity, href: "/staff/tracking", color: "text-blue-500", bg: "bg-blue-50" },
              { label: "Payments", icon: Wallet, href: "/staff/payments", color: "text-rose-500", bg: "bg-rose-50" },
            ].map((action, i) => (
              <Link key={action.label} href={action.href} className="flex flex-col items-center gap-4 group">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`${action.bg} ${action.color} p-4 sm:p-8 rounded-3xl shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all active:scale-95`}
                >
                  <action.icon size={32} className="sm:w-10 sm:h-10" />
                </motion.div>
                <span className="text-[11px] sm:text-sm font-black text-gray-700 text-center uppercase tracking-tight">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Secondary Action Grid (Smaller Items) */}
        <div className="bg-white rounded-md p-6 sm:p-10 shadow-sm border border-gray-200">
           <div className="flex items-center justify-between mb-10">
             <h4 className="text-xs sm:text-sm font-black text-gray-400 uppercase tracking-[0.25em]">Tools & Support</h4>
             <div className="h-px flex-1 bg-gray-100 ml-8"></div>
          </div>
          <div className="grid grid-cols-4 gap-y-10 gap-x-4">
            {[
              { label: "Detail", icon: User, href: "/staff/details", color: "text-purple-500" },
              { label: "Stats", icon: Briefcase, href: "/staff/tracking", color: "text-cyan-500" },
              { label: "Feedback", icon: Star, href: "/staff/feedbacks", color: "text-pink-500" },
              { label: "Support", icon: PhoneCall, href: `tel:${adminPhone}`, color: "text-brand" },
              { label: "WhatsApp", icon: MessageSquare, href: `https://wa.me/8801310673600`, color: "text-green-500" },
              { label: "Profile", icon: User, href: "/staff/details", color: "text-indigo-500" },
              { label: "History", icon: Clock, href: "/staff/tracking", color: "text-slate-500" },
              { label: "Done", icon: CheckCircle, href: "/staff/tracking", color: "text-emerald-600" },
            ].map((action, i) => (
              <Link key={action.label + i} href={action.href} className="flex flex-col items-center gap-3 group">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="group-hover:scale-125 transition-transform active:scale-90"
                >
                  <action.icon className={`${action.color}`} size={28} />
                </motion.div>
                <span className="text-[11px] sm:text-xs font-black text-gray-500 text-center uppercase tracking-tighter">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <form action={staffLogout}>
            <button
              type="submit"
              className="flex items-center gap-3 px-10 py-4 rounded-md bg-gray-200 text-gray-500 font-black text-xs sm:text-sm uppercase tracking-[0.2em] hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
            >
              <LogOut size={20} />
              Logout from Portal
            </button>
          </form>
        </div>
      </div>
    </StaffLayout>
  );
}
