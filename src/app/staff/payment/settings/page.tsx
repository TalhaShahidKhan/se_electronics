import { verifyStaffSession } from "@/actions";
import { getStaffById } from "@/actions/staffActions";
import { StaffPaymentSettingsForm } from "@/components/features/staff/StaffPaymentSettingsForm";
import { ArrowLeft, Settings, Wallet } from "lucide-react";
import Link from "next/link";

export default async function StaffPaymentSettingsPage() {
  const session = await verifyStaffSession();
  if (!session.isAuth) return null;

  const userId = session.userId as string;
  const profileRes = await getStaffById(userId);
  const staffData = profileRes.success ? profileRes.data : null;

  if (!staffData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-gray-600">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-brand text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-3 py-3 sm:px-4 sm:py-4 flex items-center gap-3">
          <Link
            href="/staff/payment"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/10"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <Settings size={20} className="text-blue-200" />
            <h1 className="text-lg font-bold">Payment settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-3 sm:p-4 py-4 sm:py-6">
        <div className="__card p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-brand" />
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">
              Preferred method & account details
            </h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Choose how you want to receive payment and enter the number or account details. Admin will use this for payout.
          </p>
          <StaffPaymentSettingsForm
            initialPaymentPreference={staffData.paymentPreference}
            initialWalletNumber={staffData.walletNumber}
            initialBankInfo={staffData.bankInfo ?? null}
          />
        </div>
      </main>
    </div>
  );
}
