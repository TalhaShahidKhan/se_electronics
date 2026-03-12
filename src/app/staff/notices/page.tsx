import { verifyStaffSession } from "@/actions";
import { getStaffProfileStats } from "@/actions/staffActions";
import { StaffLayout } from "@/components/layout/StaffLayout";
import { StaffNoticeList } from "@/components/features/notices";

export default async function StaffNoticesPage() {
  const session = await verifyStaffSession();
  if (!session.isAuth) return null;

  const userId = session.userId as string;
  const statsRes = await getStaffProfileStats(userId);
  const stats = statsRes.success ? statsRes.data : null;

  return (
    <StaffLayout balance={stats?.availableBalance || 0}>
      <div className="p-4">
        <StaffNoticeList />
      </div>
    </StaffLayout>
  );
}
