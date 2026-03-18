"use client";

import { customerLogout } from "@/actions/customerActions";
import { CustomerLayout, MobilePageHeader } from "@/components/layout";
import Banner from "@/components/ui/Banner";
import {
  Activity,
  CheckCircle,
  Clock,
  Crown,
  FileText,
  Home,
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
      href: "/customer/services",
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
  ];

  return (
    <CustomerLayout>
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

        {/* Customer Info Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand/5 rounded-full -mr-24 -mt-24 blur-3xl" />

          <div className="flex items-center justify-between gap-4 relative z-10">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center px-3 py-1 rounded-lg bg-brand/5 text-brand text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                Active Customer
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-gray-900 truncate mb-1">
                {customer.name}
              </h2>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                ID: <span className="text-gray-900">{customer.customerId}</span>
              </p>
            </div>

            <div className="size-16 sm:size-24 rounded-2xl bg-gray-50 border-2 border-gray-100 flex items-center justify-center shadow-inner group overflow-hidden">
              <User className="size-8 sm:size-12 text-gray-300" />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-sm font-bold">
            <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3">
              <PhoneCall size={16} className="text-brand" />
              <span className="text-gray-600">{customer.phone}</span>
            </div>
            <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3 flex-1 min-w-[200px]">
              <MapPin size={16} className="text-brand" />
              <span className="text-gray-600 truncate">
                {customer.address || "No address provided"}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="text-emerald-500" size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">
                {stats?.totalServices || 0}
              </p>
              <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">
                Services
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <Clock className="text-indigo-500" size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">
                {stats?.activeSubscriptions || 0}
              </p>
              <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">
                Subscriptions
              </p>
            </div>
          </div>
        </div>

        {/* VIP Card Display */}
        {customer.vipStatus === "approved" && (
          <Link
            href="/customer/vip-card"
            className="block perspective-1000 group"
          >
            <div className="bg-[#1d4ed8] rounded-[2rem] p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden group border-4 border-white/20 animate-in slide-in-from-bottom-4 duration-500">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/10 transition-all duration-700"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <p className="text-blue-100 font-bold uppercase tracking-[0.2em] text-[10px] mb-1">
                      SE Electronics
                    </p>
                    <h2 className="text-xl font-black tracking-tight text-white/90">
                      VIP PREMIER
                    </h2>
                  </div>
                  <Crown size={28} className="text-white opacity-80" />
                </div>

                <div className="mb-8 font-mono">
                  <p className="text-blue-100/60 text-[8px] uppercase tracking-[0.3em] mb-2">
                    Member Number
                  </p>
                  <p className="text-xl sm:text-2xl font-bold tracking-[0.2em]">
                    {customer.vipCardNumber?.match(/.{1,4}/g)?.join(" ")}
                  </p>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-blue-100/60 text-[8px] uppercase tracking-[0.3em] mb-1">
                      Cardholder
                    </p>
                    <p className="text-sm font-bold uppercase tracking-wider">
                      {customer.name}
                    </p>
                  </div>
                  <div className="text-[10px] font-black italic tracking-widest bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                    ELITE
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Desktop Action Grid */}
        <div className="hidden sm:block bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black text-brand uppercase tracking-[0.25em]">
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
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8 sm:hidden">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
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
                <div className="size-12 sm:size-14 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-brand/5 transition-colors">
                  <action.icon
                    className={`${action.color} group-hover:scale-110 transition-transform`}
                    size={24}
                  />
                </div>
                <span className="text-[10px] sm:text-xs font-black text-gray-500 uppercase tracking-tighter text-center line-clamp-1 group-hover:text-gray-900 transition-colors">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <form action={customerLogout} className="mt-4">
          <button className="w-full py-4 rounded-2xl bg-gray-100 text-gray-500 font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-500 transition-all text-xs flex items-center justify-center gap-3">
            <LogOut size={16} />
            Logout Account
          </button>
        </form>
      </div>
    </CustomerLayout>
  );
}
