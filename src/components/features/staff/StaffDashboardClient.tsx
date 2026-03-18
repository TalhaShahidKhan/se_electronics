"use client";
import Marquee from "react-fast-marquee";
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
  ShieldAlert,
} from "lucide-react";

import Banner from "@/components/ui/Banner";
import { StaffLayout, MobilePageHeader } from "@/components/layout";
import { staffLogout } from "@/actions";

interface StaffDashboardClientProps {
  staffData: any;
  stats: any;
  experienceYears: number;
  adminPhone: string;
  activeComplaints: any[];
}

export default function StaffDashboardClient({
  staffData,
  stats,
  experienceYears,
  adminPhone,
  activeComplaints,
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
      <MobilePageHeader 
        title="Dashboard" 
        Icon={User}
        showBackButton={false}
      />
      <div className="flex flex-col gap-6 p-4 sm:p-6 text-gray-800 pb-24">
        {/* Banner */}
        <div className="w-full overflow-hidden shadow-md">
          <Banner />
        </div>

        {/* Staff Info */}
        {/* <div className="bg-gradient-to-br from-brand via-brand-800 to-brand-700 rounded-md p-6 sm:p-8 text-white shadow-xl relative">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase font-black tracking-widest mb-2">
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

        <Marquee
          speed={50}
          gradient={false}
          pauseOnHover={true}
          className={`py-1 rounded-md ${activeComplaints.length > 0 ? "bg-rose-50 border border-rose-200" : ""}`}
        >
          {activeComplaints.length > 0 ? (
            activeComplaints.map((c, i) => (
              <Link
                key={c.complaintId}
                href={`/staff/complaints/${c.complaintId}`}
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <span className="text-rose-700 font-extrabold text-sm tracking-wide">
                  ⚠️ COMPLAINT ALERT: {c.customer?.name || "A Customer"} has
                  filed a report against you. Subject: {c.subject} | ID:{" "}
                  {c.complaintId} | Status:{" "}
                  {c.status.replace("_", " ").toUpperCase()} • CLICK TO VIEW
                  DETAILS
                </span>
                <span className="mx-8 text-rose-400">•</span>
              </Link>
            ))
          ) : (
            <>
              <span className="text-slate-900 font-extrabold text-sm tracking-wide">
                আপনার ইলেকট্রিশিয়ান আই ডি কার্ড টি ডাউনলোড করতে লিংকটি ক্লিক
                করুন
              </span>
              <span className="mx-6 text-slate-800">•</span>
              <span className="text-slate-900 font-extrabold text-sm tracking-wide">
                আপনার ইলেকট্রিশিয়ান আই ডি কার্ড টি ডাউনলোড করতে লিংকটি ক্লিক
                করুন
              </span>
              <span className="mx-6 text-slate-800">•</span>
              <span className="text-slate-800 font-extrabold text-sm tracking-wide">
                আপনার ইলেকট্রিশিয়ান আই ডি কার্ড টি ডাউনলোড করতে লিংকটি ক্লিক
                করুন
              </span>
              <span className="mx-6 text-slate-800">•</span>
            </>
          )}
        </Marquee>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-violet-100/50  border-violet-400/70 p-1.5 rounded-md shadow-sm border flex items-center text-center justify-center gap-4">
            {/* <CheckCircle className="text-emerald-400/70" size={28} /> */}
            <div>
              <p className="text-2xl font-black text-violet-600">
                {stats?.successfulServices || 0}
              </p>
              <p className="text-sm uppercase font-black text-violet-600">
                Complete Service
              </p>
            </div>
          </div>

          <div className="bg-green-100/50  border-green-400/70 p-1.5 rounded-md shadow-sm border flex items-center text-center justify-center gap-4">
            {/* <Clock className="text-amber-400/70" size={28} /> */}
            <div>
              <p className="text-2xl font-black text-green-600">
                {experienceYears}
              </p>
              <p className="text-sm text-green-600 uppercase font-black ">
                Servicing Center
              </p>
            </div>
          </div>

          <div className="bg-red-50/70 border-red-400/70 p-1.5 rounded-md shadow-sm border flex items-center text-center justify-center gap-4">
            {/* <Clock className="text-amber-500" size={28} /> */}
            <div>
              <p className="text-2xl font-black text-red-500">
                {staffData.cancle || "0"}
              </p>
              <p className="text-sm uppercase font-black text-red-500">
                Cancle
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Action Grid */}
        <div className="hidden sm:block bg-white rounded-md shadow-md p-8  border ">
          <div className="grid grid-cols-4 gap-10 rounded-t-md ">
            {primaryActions.map((action, i) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-4 group"
              >
                <div
                  className={`${action.bg} ${action.color} p-8 rounded-3xl shadow-sm animate-in zoom-in-90 duration-300`}
                  style={{
                    animationDelay: `${i * 50}ms`,
                    animationFillMode: "both",
                  }}
                >
                  <action.icon size={32} />
                </div>

                <span className="text-sm font-black text-gray-700 uppercase">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Secondary Grid */}
        <div className="md:hidden  bg-white rounded-md p-6 sm:p-10 shadow-sm border">
          <div className="grid grid-cols-4 gap-8">
            {[
              {
                label: "Services",
                icon: Wrench,
                href: "/staff/services",
                color: "text-emerald-500",
                bg: "bg-emerald-50",
              },

              {
                label: "Report",
                icon: User,
                href: "/staff/details",
                color: "text-yellow-500",
                bg: "bg-yellow-50",
              },
              {
                label: "Payments",
                icon: Wallet,
                href: "/staff/payments",
                color: "text-rose-500",
                bg: "bg-rose-50",
              },
              {
                label: "Complaints",
                icon: ShieldAlert,
                href: "/staff/feedbacks", // For now redirecting to feedback or I can make a list page
                color: "text-red-500",
                bg: "bg-red-50",
              },
              {
                label: "Tracking",
                icon: Activity,
                href: "/staff/tracking",
                color: "text-blue-500",
              },
            ].map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className="flex flex-col items-center gap-2"
              >
                <action.icon className={action.color} size={26} />
                <span className="text-sm font-black text-gray-500 uppercase">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-md p-6 sm:p-10 shadow-sm border">
          <div className="grid grid-cols-4 gap-8">
            {[
              {
                label: "Detail",
                icon: User,
                href: "/staff/details",
                color: "text-purple-500",
              },
              {
                label: "Stats",
                icon: Briefcase,
                href: "/staff/tracking",
                color: "text-cyan-500",
              },
              {
                label: "Feedback",
                icon: Star,
                href: "/staff/feedbacks",
                color: "text-pink-500",
              },
              {
                label: "Support",
                icon: PhoneCall,
                href: `tel:${adminPhone}`,
                color: "text-brand",
              },
              {
                label: "WhatsApp",
                icon: MessageSquare,
                href: "https://wa.me/8801310673600",
                color: "text-green-500",
              },
              {
                label: "Complaints",
                icon: ShieldAlert,
                href: "/staff/feedbacks",
                color: "text-red-600",
              },
              {
                label: "Tracking",
                icon: Activity,
                href: "/staff/tracking",
                color: "text-blue-500",
              },
              {
                label: "History",
                icon: Clock,
                href: "/staff/tracking",
                color: "text-slate-500",
              },
              {
                label: "Done",
                icon: CheckCircle,
                href: "/staff/tracking",
                color: "text-emerald-600",
              },
            ].map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className="flex flex-col items-center gap-2"
              >
                <action.icon className={action.color} size={26} />
                <span className="text-sm font-black text-gray-500 uppercase">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
