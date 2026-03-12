import { staffLogout, verifyStaffSession } from "@/actions";
import { getStaffById, getStaffProfileStats } from "@/actions/staffActions";
import { StaffBalanceBar } from "@/components/features/staff/StaffBalanceBar";
import Banner from "@/components/ui/Banner";
import {
  Activity,
  Briefcase,
  CheckCircle,
  Clock,
  FileText,
  LogOut,
  MapPin,
  MessageSquare,
  PhoneCall,
  Star,
  User,
  Wallet,
  Wrench,
  XCircle,
} from "lucide-react";
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
      {/* Top banner: WELCOME TO SE ELECTRONICS */}
      <header className="sticky top-0 z-50 bg-brand text-white shadow-md rounded-b-2xl">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 relative flex items-center justify-center">
          <h1 className="text-base sm:text-lg font-bold tracking-wide text-center">
            WELCOME TO SE ELECTRONICS
          </h1>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <div className="hidden sm:block">
              <StaffBalanceBar amount={stats?.availableBalance || 0} />
            </div>
            <form action={staffLogout}>
              <button
                type="submit"
                className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/20"
                aria-label="Logout"
              >
                <LogOut size={20} />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* White section: Staff details left, profile circle right */}
      <div className="max-w-4xl mx-auto w-full px-3 sm:px-4 -mt-px">
        <div className="bg-white rounded-b-2xl shadow-sm border border-t-0 border-gray-200 overflow-hidden">
          <div className="flex flex-row items-stretch gap-4 sm:gap-6 p-4 sm:p-6">
            <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1.5 sm:space-y-2">
              <p className="text-sm sm:text-base text-gray-800">
                <span className="font-semibold text-gray-600">Staff:</span>{" "}
                {staffData.name}
              </p>
              <p className="text-sm sm:text-base text-gray-800">
                <span className="font-semibold text-gray-600">Staff ID:</span>{" "}
                {staffData.staffId}
              </p>
              <p className="text-sm sm:text-base text-gray-800">
                <span className="font-semibold text-gray-600">Phone:</span>{" "}
                {staffData.phone}
              </p>
              <p className="text-sm sm:text-base text-gray-800">
                <span className="font-semibold text-gray-600">Address:</span>{" "}
                {staffData.currentStreetAddress || "Not specified"}
              </p>
            </div>
            <div className="shrink-0 flex items-center justify-center">
              <StaffBalanceBar amount={stats?.availableBalance || 0} />
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
