import { getAdmin } from "@/actions";
import { DashboardLayout } from "@/components";
import { getSMSBalance } from "@/lib";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const response = await getAdmin();
  const smsBalance = await getSMSBalance();

  if (!response.success) {
    throw new Error();
  }

  const admin = response.data;
  return (
    <DashboardLayout username={admin.username} smsBalance={smsBalance}>
      {children}
    </DashboardLayout>
  );
}
