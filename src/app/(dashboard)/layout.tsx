import { DashboardLayout } from "@/components/layout";
import { verifySession } from "@/lib";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await verifySession(true, "admin");
  const { getSMSBalance } = await import("@/lib/sms");
  const smsBalance = await getSMSBalance();

  return (
    <DashboardLayout
      username={(session?.username as string) || "Admin"}
      smsBalance={smsBalance}
    >
      {children}
    </DashboardLayout>
  );
}
