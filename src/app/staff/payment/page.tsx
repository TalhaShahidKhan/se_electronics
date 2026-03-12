import { verifyStaffSession } from "@/actions";
import { getStaffProfileStats } from "@/actions/staffActions";
import { StaffLayout } from "@/components/layout/StaffLayout";
import { CreditCard, Settings, Wallet } from "lucide-react";
import Link from "next/link";

export default async function StaffPaymentHubPage() {
  const session = await verifyStaffSession();
  if (!session.isAuth) return null;

  const userId = session.userId as string;
  const statsRes = await getStaffProfileStats(userId);
  const stats = statsRes.success ? statsRes.data : null;

  return (
    <StaffLayout balance={stats?.availableBalance || 0}>
      <div className="p-4 space-y-6">
        {/* Page Title */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-brand/10 rounded-xl text-brand">
            <Wallet size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Payments & Payouts</h1>
        </div>

        <p className="text-sm font-medium text-gray-500 px-1 leading-relaxed">
          Set how you receive payment, then request payout when needed. Admin gets an SMS for each request.
        </p>

        <div className="space-y-4">
          <Link
            href="/staff/payment/settings"
            className="block bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all active:scale-[0.99]"
          >
            <div className="size-12 rounded-2xl bg-brand/5 text-brand flex items-center justify-center group-hover:scale-110 transition-transform">
              <Settings className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-gray-900">Payment Settings</h2>
              <p className="text-xs font-medium text-gray-500 mt-1">
                Withdrawal methods (bKash/Nagad/Rocket/Bank)
              </p>
            </div>
            <div className="size-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-brand/10 group-hover:text-brand transition-colors">
              <span className="text-lg">→</span>
            </div>
          </Link>

          <Link
            href="/staff/payment/request"
            className="block bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all active:scale-[0.99]"
          >
            <div className="size-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-gray-900">Request Payment</h2>
              <p className="text-xs font-medium text-gray-500 mt-1">
                Enter amount and notify admin for payout
              </p>
            </div>
            <div className="size-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
              <span className="text-lg">→</span>
            </div>
          </Link>
        </div>

        {/* Info Card */}
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
          <div className="flex gap-3">
            <div className="size-5 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 text-[10px] font-bold">!</div>
            <div>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-tight">Security Note</p>
              <p className="text-xs font-medium text-amber-700/80 mt-1 leading-relaxed">
                Requests are processed within 24-48 hours. Ensure your account details are correct before requesting payout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
