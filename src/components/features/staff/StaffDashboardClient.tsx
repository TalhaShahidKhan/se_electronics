"use client";
import {
  Activity,
  MessageSquare,
  PhoneCall,
  ShieldAlert,
  Star,
  User,
  Wallet,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import Marquee from "react-fast-marquee";

import { StaffLayout } from "@/components/layout";
import Banner from "@/components/ui/Banner";

interface StaffDashboardClientProps {
  staffData: any;
  stats: any;
  experienceYears: number;
  adminPhone: string;
  activeComplaints: any[];
  activeNotices: any[];
}

export default function StaffDashboardClient({
  staffData,
  stats,
  experienceYears,
  adminPhone,
  activeComplaints,
  activeNotices,
}: StaffDashboardClientProps) {
  const unreadNotices = activeNotices.filter((n) => !n.isRead);
  const showMarquee =
    activeComplaints.length > 0 ||
    unreadNotices.length > 0 ||
    (stats?.activeServices || 0) > 0;

  return (
    <StaffLayout balance={stats?.availableBalance || 0}>
      <div className="flex flex-col gap-6 p-4 sm:p-6 text-gray-800 pb-24">
        {/* Banner */}
        <div className="w-full overflow-hidden shadow-md">
          <Banner />
        </div>

        {showMarquee && (
          <Marquee
            speed={50}
            gradient={false}
            pauseOnHover={true}
            className="py-1"
          >
            {/* Active Complaints */}
            {activeComplaints.map((c) => (
              <Link
                key={c.complaintId}
                href={`/staff/complaints/${c.complaintId}`}
                className="flex items-center mx-6 group font-black"
              >
                <div className="flex items-center gap-2">
                  <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
                    অভিযোগ
                  </span>
                  <span className="text-red-700 text-sm tracking-wide group-hover:underline uppercase">
                    সতর্কতা: আপনার বিরুদ্ধে একটি অভিযোগ জমা হয়েছে (আইডি:{" "}
                    {c.complaintId})। বিস্তারিত দেখতে এখানে ক্লিক করুন।
                  </span>
                </div>
              </Link>
            ))}

            {/* Unread Notices */}
            {unreadNotices.map((n) => (
              <Link
                key={n.id}
                href="/staff/notifications"
                className="flex items-center mx-6 group font-black"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`${n.notice.priority === "urgent" ? "bg-amber-600" : "bg-blue-600"} text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter`}
                  >
                    নোটিশ
                  </span>
                  <span className="text-slate-900 text-sm tracking-wide group-hover:underline uppercase">
                    {n.notice.title}: {n.notice.content.substring(0, 50)}...
                    বিস্তারিত দেখুন।
                  </span>
                </div>
              </Link>
            ))}

            {/* Assigned Services */}
            {(stats?.activeServices || 0) > 0 && (
              <Link
                href="/staff/services"
                className="flex items-center mx-6 group font-black"
              >
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
                    সার্ভিস
                  </span>
                  <span className="text-slate-900 text-sm tracking-wide group-hover:underline uppercase">
                    আপনার জন্য {stats.activeServices}টি সার্ভিস পেন্ডিং আছে।
                    দ্রুত কাজ শুরু করুন।
                  </span>
                </div>
              </Link>
            )}
          </Marquee>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-emerald-50 border-emerald-200 p-2 sm:p-4 rounded-md shadow-sm border flex items-center text-center justify-center">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600">
                {stats?.completedServices || 0}
              </p>
              <p className="text-[10px] sm:text-xs uppercase font-black text-emerald-600/70 tracking-tighter sm:tracking-widest">
                Service Completed
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border-amber-200 p-2 sm:p-4 rounded-md shadow-sm border flex items-center text-center justify-center">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-amber-600">
                {stats?.activeServices || 0}
              </p>
              <p className="text-[10px] sm:text-xs uppercase font-black text-amber-600/70 tracking-tighter sm:tracking-widest">
                Service Pending
              </p>
            </div>
          </div>

          <div className="bg-rose-50 border-rose-200 p-2 sm:p-4 rounded-md shadow-sm border flex items-center text-center justify-center">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-rose-600">
                {stats?.canceledServices || 0}
              </p>
              <p className="text-[10px] sm:text-xs uppercase font-black text-rose-600/70 tracking-tighter sm:tracking-widest">
                Service Canceled
              </p>
            </div>
          </div>
        </div>

        {/* Action Grid */}
        <div className="bg-white rounded-md shadow-sm border p-6 sm:p-10">
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-6 sm:gap-10">
            {[
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
                label: "Payment",
                icon: Wallet,
                href: "/staff/payment",
                color: "text-rose-500",
                bg: "bg-rose-50",
              },
              {
                label: "History",
                icon: Activity,
                href: "/staff/tracking",
                color: "text-blue-500",
                bg: "bg-blue-50",
              },
              {
                label: "Feedbacks",
                icon: Star,
                href: "/staff/feedbacks",
                color: "text-orange-500",
                bg: "bg-orange-50",
              },
              {
                label: "WhatsApp",
                icon: MessageSquare,
                href: "https://wa.me/8801310673600",
                color: "text-green-500",
                bg: "bg-green-50",
              },
              {
                label: "Support",
                icon: PhoneCall,
                href: `tel:${adminPhone}`,
                color: "text-brand",
                bg: "bg-brand/5",
              },
              {
                label: "Complains",
                icon: ShieldAlert,
                href: "/staff/complaints",
                color: "text-red-500",
                bg: "bg-red-50",
              },
            ].map((action, i) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-3 group"
              >
                <div
                  className={`${action.bg} ${action.color} size-14 sm:size-20 rounded-2xl sm:rounded-3xl shadow-sm flex items-center justify-center transition-all group-hover:scale-105 group-active:scale-95 animate-in zoom-in-90 duration-300`}
                  style={{
                    animationDelay: `${i * 50}ms`,
                    animationFillMode: "both",
                  }}
                >
                  <action.icon className="size-6 sm:size-8" />
                </div>

                <span className="text-[10px] sm:text-xs font-black text-gray-700 uppercase tracking-tighter sm:tracking-normal text-center">
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
