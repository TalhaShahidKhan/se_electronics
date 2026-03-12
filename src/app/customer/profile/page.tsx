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

export default async function CustomerProfilePage() {
  const session = await verifyCustomerSession();

  if (!session.isAuth) {
    return null;
  }

  const customer = session.customer!;

  const [servicesRes, customerRes, subscriptionsRes] = await Promise.all([
    getServiceHistoryById(customer.customerId),
    getCustomerById(customer.customerId),
    getSubscriptionsByPhone(customer.phone),
  ]);

  const customerDetails = customerRes.success ? customerRes.data : null;
  const adminPhone = process.env.ADMIN_PHONE_NUMBER || "017XX-XXXXXX";

  const dashboardActions = [
    {
      label: "Online Service",
      icon: Monitor,
      href: "/get-service",
      color: "bg-brand",
    },
    {
      label: "Subscription",
      icon: Zap,
      href: "/maintenance-plans",
      color: "bg-amber-500",
    },
    {
      label: "Product Service",
      icon: Settings,
      href: "/customer/services",
      color: "bg-brand-700",
    },
    {
      label: "Tracking",
      icon: Activity,
      href: "/service-track",
      color: "bg-emerald-600",
    },
    {
      label: "Check Warranty",
      icon: ShieldCheck,
      href: "/check-warranty",
      color: "bg-purple-600",
    },
    {
      label: "My Complaints",
      icon: FileText,
      href: "/customer/complain/history",
      color: "bg-rose-600",
    },

    {
      label: "VIP card request",
      icon: Crown,
      href: "/customer/vip-card",
      color: "bg-yellow-600",
    },
    {
      label: "Feedback Send",
      icon: Star,
      href: "/service-feedback",
      color: "bg-pink-600",
    },
    {
      label: "Customer care",
      icon: PhoneCall,
      href: `tel:${adminPhone}`,
      color: "bg-teal-600",
    },
    {
      label: "Coverage Area",
      icon: MapPin,
      href: "/coverage",
      color: "bg-cyan-600",
    },
    { label: "Location", icon: Map, href: "/location", color: "bg-orange-600" },
    {
      label: "Chat",
      icon: MessageSquare,
      href: `https://wa.me/8801310673600`,
      color: "bg-violet-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-10">
      {/* Top banner: WELCOME TO SE ELECTRONICS */}
      <header className="sticky top-0 z-50 bg-brand text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between relative">
          <div className="flex items-center gap-2">
             <CustomerNotificationBell />
          </div>
          <h1 className="text-sm sm:text-lg font-extrabold tracking-widest uppercase flex-1 text-center truncate px-10">
            SE ELECTRONICS
          </h1>
          <form action={customerLogout} className="flex items-center">
            <button
              type="submit"
              className="p-2 rounded-xl bg-white/10 text-white hover:bg-red-500 transition-all border border-white/10 active:scale-95"
              aria-label="Logout"
            >
              <LogOut size={18} className="sm:w-5 sm:h-5" />
            </button>
          </form>
        </div>
      </header>

      {/* White section: Customer details left, profile circle right */}
      <div className="max-w-4xl mx-auto w-full px-3 sm:px-4 mt-4">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
          {/* Abstract background accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          
          <div className="flex flex-row items-center gap-4 sm:gap-8 p-5 sm:p-8 relative z-10">
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5 sm:gap-2">
              <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-brand/5 text-brand text-[10px] font-bold uppercase tracking-wider w-fit mb-1">
                Customer Account
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 truncate">
                {customer.name}
              </h2>
              <div className="flex flex-col gap-1 sm:gap-2 mt-1">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-medium">
                  <span className="shrink-0 w-16">ID:</span>
                  <span className="text-gray-900 font-bold">{customer.customerId}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-medium">
                  <span className="shrink-0 w-16">Phone:</span>
                  <span className="text-gray-900 font-bold">{customer.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-500 font-medium">
                  <span className="shrink-0 w-16">Address:</span>
                  <span className="text-gray-900 font-bold leading-relaxed">
                    {customer.address || "No address provided"}
                  </span>
                </div>
              </div>
            </div>
            <div className="shrink-0 flex items-center justify-center">
              <div className="size-20 sm:size-32 rounded-3xl bg-gray-50 border-2 border-gray-100 flex items-center justify-center shadow-inner group overflow-hidden relative">
                <User className="w-10 h-10 sm:w-16 sm:h-16 text-gray-300" />
                <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banner content */}
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 mt-6">
        <div className="rounded-3xl overflow-hidden shadow-md">
          <Banner />
        </div>
      </div>

      {/* Main Content: Dashboard Grid */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-4 mt-8">
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-lg font-black text-brand uppercase tracking-wider">Quick Actions</h3>
           <div className="h-px flex-1 bg-gray-200 ml-4 hidden sm:block"></div>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {dashboardActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="group relative flex flex-col items-center justify-center bg-white aspect-square rounded-[2rem] sm:rounded-3xl p-3 sm:p-4 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:scale-[1.05] active:scale-95 overflow-hidden"
              >
                <div
                  className={`${action.color} p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl text-white mb-2 sm:mb-4 shadow-lg shadow-black/10 group-hover:rotate-6 transition-transform duration-300`}
                >
                  <Icon className="w-5 h-5 sm:w-8 sm:h-8" />
                </div>
                <span className="text-[10px] sm:text-xs font-extrabold text-gray-800 text-center leading-tight px-1 uppercase tracking-tight">
                  {action.label}
                </span>

                {/* Subtle gradient overlay on hover */}
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
            <Link
              href="/privacy-policy"
              className="hover:text-gray-600 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-gray-600 transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
