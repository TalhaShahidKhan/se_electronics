import { verifyStaffSession } from "@/actions";
import { getStaffProfileStats } from "@/actions/staffActions";
import { StaffLayout } from "@/components/layout/StaffLayout";
import SMSSettingsForm from "@/components/features/staff/SMSSettingsForm";
import { db } from "@/db/drizzle";
import { staffs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function StaffSettingsPage() {
  const session = await verifyStaffSession();
  if (!session.isAuth) return null;

  const userId = session.userId as string;
  const staffData = await db.query.staffs.findFirst({
    where: eq(staffs.id, userId),
  });

  if (!staffData) redirect("/staff/login");

  const statsRes = await getStaffProfileStats(userId);
  const stats = statsRes.success ? statsRes.data : null;

  return (
    <StaffLayout balance={stats?.availableBalance || 0}>
      <div className="p-4 sm:p-6 lg:p-8 space-y-10">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Settings</h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">Manage your profile and preferences</p>
        </div>
        
        <SMSSettingsForm 
          initialData={{
            smsNotificationEnabled: staffData.smsNotificationEnabled,
            smsWorkingHoursOnly: staffData.smsWorkingHoursOnly,
            smsFrequency: staffData.smsFrequency as any,
            smsOptOut: staffData.smsOptOut,
          }} 
        />
      </div>
    </StaffLayout>
  );
}
