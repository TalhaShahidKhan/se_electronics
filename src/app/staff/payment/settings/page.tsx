import { verifyStaffSession } from "@/actions";
import { getStaffById, getStaffProfileStats } from "@/actions/staffActions";
import { StaffPaymentSettingsForm } from "@/components/features/staff/StaffPaymentSettingsForm";
import { StaffLayout } from "@/components/layout/StaffLayout";
import { Settings, Wallet } from "lucide-react";

export default async function StaffPaymentSettingsPage() {
  const session = await verifyStaffSession();
  if (!session.isAuth) return null;

  const userId = session.userId as string;
  const [profileRes, statsRes] = await Promise.all([
    getStaffById(userId),
    getStaffProfileStats(userId),
  ]);

  const staffData = profileRes.success ? profileRes.data : null;
  const stats = statsRes.success ? statsRes.data : null;

  if (!staffData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-gray-600 font-bold">Staff profile data not available.</p>
      </div>
    );
  }

  return (
    <StaffLayout balance={stats?.availableBalance || 0}>
      <div className="p-4 space-y-6">
        {/* Page Title */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-brand/10 rounded-xl text-brand">
            <Settings size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Payout Configuration</h1>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-5 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
            <div className="size-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
               <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Preferred Withdrawal Gateway
              </h2>
              <p className="text-sm font-bold text-gray-800">Account & Identity Verification</p>
            </div>
          </div>

          <p className="text-xs font-medium text-gray-500 mb-6 leading-relaxed px-1">
            Configure your preferred payout gateway. Ensure the account details (bKash/Nagad/Bank) are accurate to avoid processing delays.
          </p>

          <div className="bg-gray-50/30 p-2 rounded-2xl border border-gray-100">
            <StaffPaymentSettingsForm
              initialPaymentPreference={staffData.paymentPreference}
              initialWalletNumber={staffData.walletNumber}
              initialBankInfo={staffData.bankInfo ?? null}
            />
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
           <div className="flex gap-3">
              <div className="size-5 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 text-[10px] font-bold mt-0.5">i</div>
              <div>
                 <p className="text-xs font-bold text-blue-800 uppercase tracking-tight">Important Note</p>
                 <p className="text-[11px] font-medium text-blue-700/80 mt-1 leading-relaxed">
                    Changes to payment settings may require up to 24 hours for verification by our administrative team.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </StaffLayout>
  );
}
