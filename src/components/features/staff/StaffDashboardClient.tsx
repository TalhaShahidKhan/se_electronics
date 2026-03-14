"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Activity,
  Briefcase,
  CheckCircle,
  Clock,
  FileText,
  Home,
  LogOut,
  MessageSquare,
  PhoneCall,
  Star,
  User,
  Wallet,
  Wrench,
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

  const primaryActions = [
        {
      label: "Home",
      icon: Home,
      href: "/staff/profile",
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      label: "Services",
      icon: Wrench,
      href: "/staff/services",
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },

    {
      label: "Profile",
      icon: User,
      href: "/staff/details",
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    },
    {
      label: "Payments",
      icon: Wallet,
      href: "/staff/payments",
      color: "text-rose-500",
      bg: "bg-rose-50",
    },
  ];

  return (
    <StaffLayout balance={stats?.availableBalance || 0}>
<<<<<<< HEAD
      <div className="flex flex-col gap-6 p-4 sm:p-6 text-gray-800">
=======
      <div className="flex flex-col gap-6 p-3 text-gray-800 pb-24">
>>>>>>> 569184c (staff dashboarda dded)

        {/* Banner */}
        <div className="w-full overflow-hidden shadow-md">
          <Banner />
        </div>

        {/* Staff Info */}
        {/* <div className="bg-gradient-to-br from-brand via-brand-800 to-brand-700 rounded-md p-6 sm:p-8 text-white shadow-xl relative">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase font-black tracking-widest mb-2">
                Active Staff Member
              </p>
              <h3 className="text-2xl sm:text-4xl font-black">
                {staffData.name}
              </h3>

              <div className="flex gap-5 text-sm mt-2">
                <span className="flex items-center gap-2">
                  <Briefcase size={16} />
                  {staffData.role}
                </span>

                <span className="flex items-center gap-2">
                  <User size={16} />
                  {staffData.staffId}
                </span>
              </div>
            </div>

            <div className="size-16 sm:size-28 rounded-3xl bg-white/10 flex items-center justify-center">
              <User size={36} />
            </div>
          </div>
        </div> */}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white p-6 rounded-md shadow-sm border flex items-center gap-4">
            <CheckCircle className="text-emerald-500" size={28} />
            <div>
              <p className="text-2xl font-black">
                {stats?.successfulServices || 0}
              </p>
              <p className="text-xs uppercase font-black text-gray-400">
                Services Done
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-md shadow-sm border flex items-center gap-4">
            <Clock className="text-amber-500" size={28} />
            <div>
              <p className="text-2xl font-black">{experienceYears}</p>
              <p className="text-xs uppercase font-black text-gray-400">
                Years Exp.
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Action Grid */}
        <div className="hidden sm:block bg-white rounded-md p-8 shadow-sm border ">
          <div className="grid grid-cols-4 gap-10 rounded-t-md">
            {primaryActions.map((action, i) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-4 group"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`${action.bg} ${action.color} p-8 rounded-3xl shadow-sm`}
                >
                  <action.icon size={32} />
                </motion.div>

                <span className="text-sm font-black text-gray-700 uppercase">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Secondary Grid */}
        <div className="bg-white rounded-md p-6 sm:p-10 shadow-sm border">
          <div className="grid grid-cols-4 gap-8">
            {[
              { label: "Detail", icon: User, href: "/staff/details", color: "text-purple-500" },
              { label: "Stats", icon: Briefcase, href: "/staff/tracking", color: "text-cyan-500" },
              { label: "Feedback", icon: Star, href: "/staff/feedbacks", color: "text-pink-500" },
              { label: "Support", icon: PhoneCall, href: `tel:${adminPhone}`, color: "text-brand" },
              { label: "WhatsApp", icon: MessageSquare, href: "https://wa.me/8801310673600", color: "text-green-500" },
              { label: "Tracking", icon: Activity, href: "/staff/tracking", color: "text-blue-500" },
              { label: "History", icon: Clock, href: "/staff/tracking", color: "text-slate-500" },
              { label: "Done", icon: CheckCircle, href: "/staff/tracking", color: "text-emerald-600" },
            ].map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className="flex flex-col items-center gap-2"
              >
                <action.icon className={action.color} size={26} />
                <span className="text-xs font-black text-gray-500 uppercase">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

<<<<<<< HEAD
=======
        {/* Logout */}
        {/* <div className="flex justify-center mt-8">
          <form action={staffLogout}>
            <button
              type="submit"
              className="flex items-center gap-3 px-10 py-4 rounded-md border border-gray-300 bg-gray-300 text-gray-600 font-black text-sm uppercase hover:bg-red-100 hover:text-red-500"
            >
              <LogOut size={20} />
              Logout
            </button>
          </form>
        </div> */}
>>>>>>> 569184c (staff dashboarda dded)
      </div>
    </StaffLayout>
  );
}