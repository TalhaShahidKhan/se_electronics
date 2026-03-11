import { staffLogout, verifyStaffSession } from "@/actions";
import { getStaffById, getStaffProfileStats } from "@/actions/staffActions";
import Banner from "@/components/ui/Banner";
import {
  Activity,
  Briefcase,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  LogOut,
  MapPin,
  MessageSquare,
  PhoneCall,
  ShieldCheck,
  Star,
  User,
  Wallet,
  Wrench,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function StaffProfilePage() {
  const session = await verifyStaffSession();

  if (!session.isAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">
          Access denied.{" "}
          <Link href="/staff/login" className="text-brand font-bold">
            Login
          </Link>
        </div>
      </div>
    );
  }

  const userId = session.userId as string;
  const [profileRes, statsRes] = await Promise.all([
    getStaffById(userId),
    getStaffProfileStats(userId),
  ]);

  const staffData = profileRes.success ? profileRes.data : null;
  const stats = statsRes.success ? statsRes.data : null;

  if (!staffData) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          Staff profile not found. Contact admin.
        </div>
      </div>
    );
  }

  const experienceYears =
    (staffData.hasRepairExperience && staffData.repairExperienceYears) ||
    (staffData.role === "technician"
      ? staffData.repairExperienceYears || 0
      : staffData.installationExperienceYears || 0);

  const adminPhone = process.env.ADMIN_PHONE_NUMBER || "017XX-XXXXXX";

  const dashboardActions = [
    {
      label: "My Services",
      icon: Wrench,
      href: "/staff/services",
      color: "bg-brand",
    },
    {
      label: "Report Task",
      icon: FileText,
      href: "/staff/services",
      color: "bg-brand-700",
    },
    {
      label: "Tracking",
      icon: Activity,
      href: "/staff/tracking",
      color: "bg-emerald-600",
    },
    {
      label: "Payments",
      icon: Wallet,
      href: "/staff/payments",
      color: "bg-teal-600",
    },
    {
      label: "My Profile",
      icon: User,
      href: "/staff/details",
      color: "bg-purple-600",
    },
    {
      label: "Feedbacks",
      icon: Star,
      href: "/staff/feedbacks",
      color: "bg-pink-600",
    },
    {
      label: "Customer care",
      icon: PhoneCall,
      href: `tel:${adminPhone}`,
      color: "bg-amber-500",
    },
    {
      label: "Chat",
      icon: MessageSquare,
      href: `https://wa.me/8801310673600`,
      color: "bg-violet-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar: Staff Details */}
      <header className="sticky top-0 z-50 bg-brand text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="size-12 sm:size-16 shrink-0 relative">
                {staffData.photoUrl ? (
                  <Image
                    src={staffData.photoUrl}
                    alt={staffData.name}
                    width={64}
                    height={64}
                    className="rounded-full object-cover w-full h-full border-2 border-white/20"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-white/10 flex items-center justify-center text-blue-200 border border-white/20">
                    <User className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                )}
              </div>
              <div className="overflow-hidden">
                <h1 className="text-lg sm:text-xl font-bold leading-tight truncate">
                  {staffData.name}
                </h1>
                <p className="text-xs sm:text-sm font-medium text-blue-200 capitalize flex items-center gap-1">
                  <Briefcase size={14} className="min-w-max" />
                  <span className="truncate">{staffData.role}</span> • ID:{" "}
                  {staffData.staffId}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-yellow-500 flex text-xs sm:text-sm tracking-widest">
                    {"★".repeat(Math.floor(stats?.rating || 0))}
                    {"☆".repeat(5 - Math.floor(stats?.rating || 0))}
                  </span>
                  <span className="text-blue-200 text-[10px] sm:text-xs ml-1 font-medium">
                    ({stats?.rating || 0})
                  </span>
                </div>
              </div>
            </div>
            <form action={staffLogout}>
              <button className="p-2.5 sm:p-3 rounded-md bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/10">
                <LogOut size={20} />
              </button>
            </form>
          </div>

          <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-blue-100  ">
              <PhoneCall size={16} className="text-blue-200 shrink-0" />
              <span className="font-semibold truncate">{staffData.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-blue-100  ">
              <MapPin size={16} className="text-blue-200 shrink-0" />
              <span className="font-medium truncate">
                {staffData.currentStreetAddress || "Location not specified"}
              </span>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-yellow-200 font-medium  px-3 py-1.5 rounded-lg border border-white/10 flex items-center justify-center gap-1">
            <ShieldCheck size={14} /> Contact Admin to update your profile
            details
          </div>
        </div>
      </header>

      {/* Banner content */}
      <div className="w-full max-w-4xl mx-auto p-2 sm:p-4 py-4 sm:py-6 flex flex-col justify-center">
        <Banner />
      </div>

      {/* Main Content: Dashboard Grid */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-2 sm:p-4 py-4 sm:py-8 flex flex-col justify-center">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="bg-white aspect-square rounded-[1.25rem] sm:rounded-md p-2 sm:p-4 shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center">
            <div className="bg-brand p-2 sm:p-3 rounded-xl text-white mb-1.5 shadow-lg pointer-events-none">
              <Briefcase className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <span className="text-lg sm:text-2xl font-bold text-gray-900 leading-none my-0.5 sm:my-1">
              {stats?.totalServices || 0}
            </span>
            <span className="text-[8px] sm:text-[11px] font-bold text-gray-500 uppercase">
              Assigned
            </span>
          </div>

          <div className="bg-white aspect-square rounded-[1.25rem] sm:rounded-md p-2 sm:p-4 shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center">
            <div className="bg-emerald-600 p-2 sm:p-3 rounded-xl text-white mb-1.5 shadow-lg pointer-events-none">
              <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <span className="text-lg sm:text-2xl font-bold text-gray-900 leading-none my-0.5 sm:my-1">
              {stats?.successfulServices || 0}
            </span>
            <span className="text-[8px] sm:text-[11px] font-bold text-gray-500 uppercase">
              Done
            </span>
          </div>

          <div className="bg-white aspect-square rounded-[1.25rem] sm:rounded-md p-2 sm:p-4 shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center">
            <div className="bg-rose-600 p-2 sm:p-3 rounded-xl text-white mb-1.5 shadow-lg pointer-events-none">
              <XCircle className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <span className="text-lg sm:text-2xl font-bold text-gray-900 leading-none my-0.5 sm:my-1">
              {stats?.canceledServices || 0}
            </span>
            <span className="text-[8px] sm:text-[11px] font-bold text-gray-500 uppercase">
              Canceled
            </span>
          </div>

          <div className="bg-white aspect-square rounded-[1.25rem] sm:rounded-md p-2 sm:p-4 shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center">
            <div className="bg-amber-500 p-2 sm:p-3 rounded-xl text-white mb-1.5 shadow-lg pointer-events-none">
              <Clock className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <span className="text-lg sm:text-2xl font-bold text-gray-900 leading-none my-0.5 sm:my-1">
              {experienceYears}
            </span>
            <span className="text-[8px] sm:text-[11px] font-bold text-gray-500 uppercase">
              Years Exp.
            </span>
          </div>
        </div>

        {/* Action Grid - matching customer dashboard */}
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
            SE Electronics Staff Portal
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
