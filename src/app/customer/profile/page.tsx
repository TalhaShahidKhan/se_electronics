import { verifyCustomerSession } from "@/actions/customerActions";
import { getCustomerProfileStats } from "@/actions/customerActions";
import CustomerDashboardClient from "@/components/features/customers/CustomerDashboardClient";
import Link from "next/link";

export default async function CustomerProfilePage() {
  const session = await verifyCustomerSession();

  if (!session.isAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">
          Access denied.{" "}
          <Link href="/customer/login" className="text-brand font-bold">
            Login
          </Link>
        </div>
      </div>
    );
  }

  const userId = session.userId as string;
  const statsRes = await getCustomerProfileStats(userId);
  const stats = statsRes.success ? statsRes.data : null;
  const adminPhone = process.env.ADMIN_PHONE_NUMBER || "017XXXXXXXX";

  if (!session.customer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Customer profile not found.</div>
      </div>
    );
  }

  return (
    <CustomerDashboardClient 
      customer={session.customer as any}
      stats={stats as any}
      adminPhone={adminPhone}
    />
  );
}
