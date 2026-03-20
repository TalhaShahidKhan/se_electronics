"use client";

import { customerLogout } from "@/actions/customerActions";
import { CustomerLayout } from "@/components/layout";
import Banner from "@/components/ui/Banner";
import {
  Activity,
  Boxes,
  CheckCircle,
  Clock,
  Crown,
  FileText,
  Home,
  LocateIcon,
  LogOut,
  MapPin,
  MessageSquare,
  Monitor,
  PhoneCall,
  Settings,
  ShieldCheck,
  Star,
  User,
  Zap,
} from "lucide-react";
import Link from "next/link";
import CustomerNotificationBell from "./CustomerNotificationBell";

interface CustomerDashboardClientProps {
  customer: {
    id: string;
    customerId: string;
    name: string;
    phone: string;
    address: string | null;
    vipStatus?: string | null;
    vipCardNumber?: string | null;
  };
  stats: {
    totalServices: number;
    activeSubscriptions: number;
  } | null;
  adminPhone: string;
}

export default function CustomerDashboardClient({
  customer,
  stats,
  adminPhone,
}: CustomerDashboardClientProps) {
  const primaryActions = [
    {
      label: "Home",
      icon: Home,
      href: "/customer/profile",
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      label: "Online Service",
      icon: Monitor,
      href: "/get-service",
      color: "text-brand",
      bg: "bg-brand/5",
    },
    {
      label: "Subscription",
      icon: Zap,
      href: "/maintenance-plans",
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    },
    {
      label: "Product Service",
      icon: Settings,
      href: "/customer/services",
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
  ];

  const secondaryActions = [
    {
      label: "History",
      icon: Activity,
      href: "/customer/services",
      color: "text-blue-500",
    },
    {
      label: "Warranty",
      icon: ShieldCheck,
      href: "/check-warranty",
      color: "text-purple-500",
    },
    {
      label: "Complaints",
      icon: FileText,
      href: "/customer/complain",
      color: "text-rose-500",
    },
    {
      label: "VIP Card",
      icon: Crown,
      href: "/customer/vip-card",
      color: "text-yellow-600",
    },
    {
      label: "Feedback",
      icon: Star,
      href: "/customer/feedback",
      color: "text-pink-500",
    },
    {
      label: "Support",
      icon: PhoneCall,
      href: `tel:${adminPhone}`,
      color: "text-brand",
    },
    {
      label: "Coverage",
      icon: MapPin,
      href: "/coverage",
      color: "text-cyan-600",
    },
    {
      label: "WhatsApp",
      icon: MessageSquare,
      href: `https://wa.me/8801310673600`,
      color: "text-green-500",
    },
    {
      label: "Online Service",
      icon: Monitor,
      href: "/get-service",
      color: "text-brand",
      bg: "bg-brand/5",
    },
    {
      label: "Subscription",
      icon: Zap,
      href: "/maintenance-plans",
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    },
    {
      label: "Location",
      icon: LocateIcon,
      href: "/location",
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      label: "My Service",
      icon: Boxes,
      href: "/customer/services",
      color: "text-green-500",
      bg: "bg-green-50",
    },
  ];

  return (
    <CustomerLayout>
      <div className="flex flex-col gap-6 p-4 sm:p-6 text-gray-800 pb-24">
        {/* Banner */}
        <div className="w-full overflow-hidden shadow-md">
          <Banner />
        </div>

        {/* only change this  Customer Info Card layout . must be professinal and looking good. other codewill be same  */}
        <div className="relative bg-white/90 backdrop-blur-xl rounded-md p-6 sm:p-8 border  overflow-hidden transition-all duration-300 ">
          {/* Gradient Glow */}
          <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-br from-brand/10 to-transparent rounded-full blur-3xl -mr-28 -mt-28" />

          {/* Header */}
          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3 min-w-0 ml-4">
              {/* Avatar */}
              <div className="p-2 rounded-md bg-brand/5 mt-7">
                <User className="text-brand" size={16} />
              </div>

              <div className="min-w-0">
                {/* Badge */}
                <div className="inline-flex items-center text-xs px-3 py-1.5 rounded-md bg-[#ECFDF5] border border-[#10B981]/25  font-extrabold uppercase tracking-[0.25em] mb-2 shadow-sm text-[#10B981] ">
                  ● Active Customer
                </div>

                {/* Name */}
                <h2 className="text-lg font-extrabold text-gray-900 truncate leading-tight">
                  {customer.name}
                </h2>

                {/* ID */}
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  ID:
                  <span className="text-gray-900  tracking-normal">
                    {customer.customerId}
                  </span>
                </p>
              </div>
            </div>

            {/* Status & Notifications */}
            <div className="flex flex-col items-end gap-3 -mt-1">
              <CustomerNotificationBell variant="card" />
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[14px] font-bold uppercase tracking-wider">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Active
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="my-2 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          {/* Info Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-semibold">
            {/* Phone */}
            <div className="flex items-center gap-3 px-4 py-1 rounded-md  border border-gray-100 hover:bg-gray-100 transition-all duration-200">
              <div className="p-2 rounded-md bg-brand/5">
                <PhoneCall size={16} className="text-brand" />
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] uppercase text-gray-400 font-semibold tracking-widest">
                  Phone
                </span>
                <span className="text-gray-700 text-sm truncate">
                  {customer.phone}
                </span>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center gap-3 px-4  rounded-md    hover:bg-gray-100 transition-all duration-200">
              <div className="p-2 rounded-md bg-brand/5">
                <MapPin size={16} className="text-brand" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[14px] uppercase text-gray-400 font-semibold tracking-widest">
                  Address
                </span>
                <span className="text-gray-700 text-sm truncate">
                  {customer.address || "No address provided"}
                </span>
              </div>
            </div>
          </div>

          {/* Optional VIP Section */}
          {customer.vipStatus === "approved" && (
            <div className="mt-6 flex items-center justify-between p-4 rounded-md bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-300">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-yellow-100">
                  <Crown size={18} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-yellow-600 uppercase tracking-wider">
                    VIP Member
                  </p>
                  <p className="text-sm font-extrabold text-gray-800">
                    Premium Access Enabled
                  </p>
                </div>
              </div>

              <span className="text-[13px] font-black text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full tracking-widest">
                ELITE
              </span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white p-5 rounded-md shadow-sm border  flex items-center gap-4">
            <div className="size-12 rounded-md bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="text-emerald-500" size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">
                {stats?.totalServices || 0}
              </p>
              <p className="text-[11px] uppercase font-black text-gray-400 tracking-widest">
                Services
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-md shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="size-12 rounded-md bg-indigo-50 flex items-center justify-center">
              <Clock className="text-indigo-500" size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">
                {stats?.activeSubscriptions || 0}
              </p>
              <p className="text-[11px] uppercase font-black text-gray-400 tracking-widest">
                Subscriptions
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Action Grid */}
        <div className="hidden sm:block bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-brand uppercase tracking-[0.25em]">
              Main Tools
            </h3>
            <div className="h-px flex-1 bg-gray-100 ml-8"></div>
          </div>

          <div className="grid grid-cols-4 gap-8">
            {primaryActions.map((action, i) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-4 group"
              >
                <div
                  className={`${action.bg} ${action.color} p-8 rounded-[2.5rem] shadow-sm group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 group-hover:rotate-3 animate-in zoom-in-90`}
                  style={{
                    animationDelay: `${i * 50}ms`,
                    animationFillMode: "both",
                  }}
                >
                  <action.icon size={32} />
                </div>

                <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest group-hover:text-brand transition-colors">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Secondary Grid */}
        <div className="bg-white rounded-md p-6 sm:p-10 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8 sm:hidden">
            <h3 className="text-[14px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Quick Actions
            </h3>
            <div className="h-px flex-1 bg-gray-50 ml-6"></div>
          </div>

          <div className="grid grid-cols-4 gap-y-10 gap-x-4">
            {secondaryActions.map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className="flex flex-col items-center gap-3 transition-transform active:scale-95 group"
              >
                <div className="size-12 sm:size-14 rounded-md bg-gray-50 flex items-center justify-center group-hover:bg-brand/5 transition-colors">
                  <action.icon
                    className={`${action.color} group-hover:scale-110 transition-transform`}
                    size={24}
                  />
                </div>
                <span className="text-[13px] sm:text-sm font-black text-gray-500 uppercase tracking-tighter text-center line-clamp-1 group-hover:text-gray-900 transition-colors">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <form action={customerLogout} className="mt-4">
          <button className="w-full py-4 rounded-md bg-gray-200 text-gray-500 font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-500 transition-all text-sm flex items-center justify-center gap-3">
            <LogOut size={16} />
            Logout Account
          </button>
        </form>
      </div>
    </CustomerLayout>
  );
}
