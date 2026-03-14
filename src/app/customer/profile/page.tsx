"use client";

import {
  customerLogout,
  getCustomerById,
  verifyCustomerSession,
} from "@/actions/customerActions";
import { getServiceHistoryById } from "@/actions/serviceActions";
import { getSubscriptionsByPhone } from "@/actions/subscriptionActions";
import Banner from "@/components/ui/Banner";
import {
  Activity,
  Crown,
  FileText,
  HomeIcon,
  LogOut,
  Map,
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
import CustomerNotificationBell from "@/components/features/customers/CustomerNotificationBell";
import LanguageToggle from "@/components/ui/LanguageToggle";
import { useEffect, useState } from "react";

interface DashboardAction {
  label: string;
  icon: any;
  href: string;
  color: string;
}

export default function CustomerProfilePage() {
  const [customer, setCustomer] = useState<any>(null);
  const [dashboardActions, setDashboardActions] = useState<DashboardAction[]>([]);
  const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE_NUMBER || "017XXXXXXXX";

  useEffect(() => {
    const fetchData = async () => {
      const session = await verifyCustomerSession();
      if (!session.isAuth) return;

      const customerData = session.customer;
      setCustomer(customerData);

      const actions: DashboardAction[] = [
        { label: "Home", icon: HomeIcon, href: "/customer/profile", color: "bg-red-400" },
        { label: "Online Service", icon: Monitor, href: "/get-service", color: "bg-brand" },
        { label: "Subscription", icon: Zap, href: "/maintenance-plans", color: "bg-amber-500" },
        { label: "Product Service", icon: Settings, href: "/customer/services", color: "bg-brand-700" },
        { label: "Tracking", icon: Activity, href: "/customer/services", color: "bg-emerald-600" },
        { label: "Check Warranty", icon: ShieldCheck, href: "/check-warranty", color: "bg-purple-600" },
        { label: "My Complaints", icon: FileText, href: "/customer/complain/history", color: "bg-rose-600" },
        { label: "VIP card request", icon: Crown, href: "/customer/vip-card", color: "bg-yellow-600" },
        { label: "Feedback Send", icon: Star, href: "/customer/services", color: "bg-pink-600" },
        { label: "Customer care", icon: PhoneCall, href: `tel:${adminPhone}`, color: "bg-teal-600" },
        { label: "Coverage Area", icon: MapPin, href: "/coverage", color: "bg-cyan-600" },
        { label: "Location", icon: Map, href: "/location", color: "bg-orange-600" },
        { label: "Chat", icon: MessageSquare, href: `https://wa.me/8801310673600`, color: "bg-violet-600" },
      ];

      setDashboardActions(actions);
    };

    fetchData();
  }, []);

  if (!customer) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-10">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-brand text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between relative">
          <div className="flex items-center gap-2">
            <CustomerNotificationBell />
            <LanguageToggle />
          </div>
          <h1 className="text-base sm:text-xl font-black tracking-[0.2em] uppercase flex-1 text-center truncate px-10">
            SE ELECTRONICS
          </h1>
          <form action={customerLogout} className="flex items-center">
            <button
              type="submit"
              className="p-2.5 rounded-md bg-white/10 text-white hover:bg-red-500 transition-all border border-white/10 active:scale-95"
              aria-label="Logout"
            >
              <LogOut size={20} className="sm:w-6 sm:h-6" />
            </button>
          </form>
        </div>
      </header>

      {/* Customer Info */}
      <div className="max-w-4xl mx-auto w-full px-3 sm:px-4 mt-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand/5 rounded-full -mr-24 -mt-24 blur-3xl" />
          <div className="flex flex-row items-center gap-6 sm:gap-10 p-6 sm:p-10 relative z-10">
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-2 sm:gap-3">
              <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-brand/5 text-brand text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] w-fit mb-2">
                Customer Account
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-gray-900 truncate">{customer.name}</h2>
              <div className="flex flex-col gap-2 sm:gap-3 mt-2">
                <div className="flex items-center gap-3 text-sm sm:text-base text-gray-500 font-bold">
                  <span className="shrink-0 w-20 uppercase tracking-tighter text-gray-400">ID:</span>
                  <span className="text-gray-900 font-black">{customer.customerId}</span>
                </div>
                <div className="flex items-center gap-3 text-sm sm:text-base text-gray-500 font-bold">
                  <span className="shrink-0 w-20 uppercase tracking-tighter text-gray-400">Phone:</span>
                  <span className="text-gray-900 font-black">{customer.phone}</span>
                </div>
                <div className="flex items-start gap-3 text-sm sm:text-base text-gray-500 font-bold">
                  <span className="shrink-0 w-20 uppercase tracking-tighter text-gray-400">Address:</span>
                  <span className="text-gray-900 font-black leading-relaxed">{customer.address || "No address provided"}</span>
                </div>
              </div>
            </div>
            <div className="shrink-0 flex items-center justify-center">
              <div className="size-24 sm:size-40 rounded-[2.5rem] bg-gray-50 border-2 border-gray-100 flex items-center justify-center shadow-inner group overflow-hidden relative">
                <User className="w-12 h-12 sm:w-20 sm:h-20 text-gray-300" />
                <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 mt-8">
        <div className="overflow-hidden shadow-lg border border-gray-100">
          <Banner />
        </div>
      </div>

      {/* Dashboard Grid */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-4 mt-10">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-sm sm:text-base font-black text-brand uppercase tracking-[0.25em]">
            Quick Actions
          </h3>
          <div className="h-px flex-1 bg-gray-200 ml-8 hidden sm:block"></div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 sm:gap-8">
          {dashboardActions.slice(4,13).map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="group relative flex flex-col items-center justify-center bg-white aspect-square rounded-md p-4 sm:p-6 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-2xl hover:scale-[1.05] active:scale-95 overflow-hidden"
              >
                <div
                  className={`${action.color} p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] text-white mb-3 sm:mb-6 shadow-xl shadow-black/5 group-hover:rotate-6 transition-transform duration-300`}
                >
                  <Icon className="w-6 h-6 sm:w-10 sm:h-10" />
                </div>
                <span className="text-[11px] sm:text-sm font-black text-gray-800 text-center leading-tight px-1 uppercase tracking-tight">
                  {action.label}
                </span>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-brand/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </Link>
            );
          })}
        </div>

        <div className="mt-10 sm:mt-12 text-center text-gray-400">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2">
            SE Electronics Service Portal
          </p>
          <div className="flex justify-center gap-4 text-xs">
            <Link href="/privacy-policy" className="hover:text-gray-600 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-gray-600 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </main>

      {/* MOBILE BOTTOM NAVBAR */}
      <div className="sm:hidden fixed bottom-0 left-0 w-full bg-white border-t shadow-lg z-50">
        <div className="grid grid-cols-4 py-2">
          {dashboardActions.slice(0, 4).map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center justify-center text-xs font-semibold"
              >
                <div className={`${action.color} p-2 rounded-lg text-white flex items-center justify-center`}>
                  <Icon size={20} />
                </div>
                <span className="text-[10px] mt-1">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
