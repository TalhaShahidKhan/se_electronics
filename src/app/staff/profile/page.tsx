import { staffLogout, verifyStaffSession } from "@/actions";
import { getStaffById, getStaffProfileStats } from "@/actions/staffActions";
import { getComplaintsByStaff } from "@/actions/complaintActions";
import StaffDashboardClient from "@/components/features/staff/StaffDashboardClient";
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
  const [profileRes, statsRes, complaintsRes] = await Promise.all([
    getStaffById(userId),
    getStaffProfileStats(userId),
    getComplaintsByStaff(userId),
  ]);

  const staffData = profileRes.success ? profileRes.data : null;
  const stats = statsRes.success ? statsRes.data : null;
  const activeComplaints = complaintsRes.success
    ? complaintsRes.data || []
    : [];

  if (!staffData) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          Staff profile not found. Contact admin.
        </div>
      </div>
    );
  }

  const adminPhone = process.env.ADMIN_PHONE_NUMBER || "017XX-XXXXXX";

  if (!staffData.isActiveStaff) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-2">
        <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-xl border border-rose-100 text-center flex flex-col items-center gap-6 animate-in zoom-in duration-300">
          <div className="size-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center animate-pulse">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 mb-2 underline decoration-rose-500 underline-offset-4">
              ACCOUNT BLOCKED
            </h1>
            <p className="text-gray-500 text-sm font-medium">
              Your access to the portal has been suspended by the
              administration.
            </p>
          </div>

          <div className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-3 text-left">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center">
              Next Steps
            </p>
            <p className="text-sm text-gray-700 font-bold">
              Please contact the head office or branch manager to re-activate
              your account.
            </p>
            <div className="flex justify-center">
              <a
                href={`tel:${adminPhone}`}
                className="inline-flex items-center gap-2 text-brand font-black text-base hover:underline mt-2"
              >
                Call Administration
              </a>
            </div>
          </div>

          <form action={staffLogout} className="w-full">
            <button className="w-full py-4 rounded-2xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition-all text-sm">
              Return to Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const experienceYears =
    (staffData.hasRepairExperience && staffData.repairExperienceYears) ||
    (staffData.role === "technician"
      ? staffData.repairExperienceYears || 0
      : staffData.installationExperienceYears || 0);

  return (
    <StaffDashboardClient
      staffData={staffData}
      stats={stats}
      experienceYears={experienceYears}
      adminPhone={adminPhone}
      activeComplaints={activeComplaints}
    />
  );
}
