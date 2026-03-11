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
      label: "Complain",
      icon: FileText,
      href: "/customer/complain",
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
      {/* Top Navbar: Customer Details */}
      <header className="sticky top-0 z-50 bg-brand text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="size-12 sm:size-16 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-blue-200" />
              </div>
              <div className="overflow-hidden">
                <h1 className="text-lg sm:text-xl font-bold leading-tight truncate">
                  {customer.name}
                </h1>
                <p className="text-xs sm:text-sm font-medium text-blue-200">
                  ID: {customer.customerId}
                </p>
                <li className="flex items-center gap-2 text-xs sm:text-sm font-medium text-blue-200 mt-1">
                  <PhoneCall size={16} className="text-blue-200 shrink-0" />
                  <span className="font-semibold">{customer.phone}</span>
                </li>

                <li className="flex items-center gap-2 text-xs sm:text-sm font-medium text-blue-200 mt-1">
                  <MapPin size={16} className="text-blue-200 shrink-0" />
                  <span className="font-medium">
                    {customer.address || "No address provided"}
                  </span>
                </li>
              </div>
            </div>
            <form action={customerLogout}>
              <button className="p-2.5 sm:p-3 rounded-md bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/10">
                <LogOut size={20} />
              </button>
            </form>
          </div>


        </div>
      </header>
       {/* Banner content */}
       <div className="w-full max-w-4xl mx-auto p-2 sm:p-4 py-4 sm:py-6 flex flex-col justify-center">
        <Banner></Banner>
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
