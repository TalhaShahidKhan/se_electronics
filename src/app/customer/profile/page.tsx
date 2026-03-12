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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top banner: WELCOME TO SE ELECTRONICS */}
      <header className="sticky top-0 z-50 bg-brand text-white shadow-md rounded-b-2xl">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
             <CustomerNotificationBell />
          </div>
          <h1 className="text-base sm:text-lg font-bold tracking-wide w-full text-center">
            WELCOME TO SE ELECTRONICS
          </h1>
          <form action={customerLogout} className="absolute right-4 top-1/2 -translate-y-1/2">
            <button
              type="submit"
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/20"
              aria-label="Logout"
            >
              <LogOut size={20} />
            </button>
          </form>
        </div>
      </header>

      {/* White section: Customer details left, profile circle right */}
      <div className="max-w-4xl mx-auto w-full px-3 sm:px-4 -mt-px">
        <div className="bg-white rounded-b-2xl shadow-sm border border-t-0 border-gray-200 overflow-hidden">
          <div className="flex flex-row items-stretch gap-4 sm:gap-6 p-4 sm:p-6">
            <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1.5 sm:space-y-2">
              <p className="text-sm sm:text-base text-gray-800">
                <span className="font-semibold text-gray-600">Customer:</span>{" "}
                {customer.name}
              </p>
              <p className="text-sm sm:text-base text-gray-800">
                <span className="font-semibold text-gray-600">Customer ID:</span>{" "}
                {customer.customerId}
              </p>
              <p className="text-sm sm:text-base text-gray-800">
                <span className="font-semibold text-gray-600">Phone:</span>{" "}
                {customer.phone}
              </p>
              <p className="text-sm sm:text-base text-gray-800">
                <span className="font-semibold text-gray-600">Address:</span>{" "}
                {customer.address || "No address provided"}
              </p>
            </div>
            <div className="shrink-0 flex items-center justify-center">
              <div className="size-20 sm:size-28 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center">
                <User className="w-10 h-10 sm:w-14 sm:h-14 text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banner content */}
      <div className="w-full max-w-4xl mx-auto p-2 sm:p-4 py-4 sm:py-6 flex flex-col justify-center">
        <Banner />
      </div>
      {/* Main Content: Dashboard Grid */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-2 sm:p-4 py-4 sm:py-8 flex flex-col justify-center">
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
          {dashboardActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="group relative flex flex-col items-center justify-center bg-white aspect-square rounded-[1.25rem] sm:rounded-md p-2 sm:p-4 shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-xl hover:scale-[1.03] active:scale-95 overflow-hidden"
              >
                <div
                  className={`${action.color} p-2 sm:p-3 rounded-xl sm:rounded-2xl text-white mb-1.5 sm:mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-gray-700 text-center leading-tight px-0.5">
                  {action.label}
                </span>

                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
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
