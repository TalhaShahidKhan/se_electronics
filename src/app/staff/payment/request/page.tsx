import { verifyStaffSession } from "@/actions";
import { getStaffPaymentHistory } from "@/actions/paymentRequestActions";
import { getStaffById, getStaffProfileStats } from "@/actions/staffActions";
import { StaffPaymentRequestForm } from "@/components/features/staff/StaffPaymentRequestForm";
import { StaffLayout } from "@/components/layout/StaffLayout";
import clsx from "clsx";
import { CreditCard, Wallet, AlertCircle, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { MobilePageHeader } from "@/components/layout";

function maskNumber(value: string) {
  if (!value || value.length < 4) return "****";
  return value.slice(-4).padStart(value.length, "*");
}

export default async function StaffPaymentRequestPage() {
  const session = await verifyStaffSession();
  if (!session.isAuth) return null;

  const userId = session.userId as string;
  const [paymentsRes, profileRes, statsRes] = await Promise.all([
    getStaffPaymentHistory(userId),
    getStaffById(userId),
    getStaffProfileStats(userId),
  ]);

  const paymentsList = paymentsRes.success ? (paymentsRes.data ?? []) : [];
  const staffData = profileRes.success ? profileRes.data : null;
  const stats = statsRes.success ? statsRes.data : null;

  const method = staffData?.paymentPreference ?? "";
  const hasWallet =
    ["bkash", "nagad", "rocket"].includes(method) && staffData?.walletNumber;
  const hasBank = method === "bank" && staffData?.bankInfo;
  const canRequest = method === "cash" || hasWallet || hasBank;

  return (
    <StaffLayout balance={stats?.availableBalance || 0}>
      <MobilePageHeader 
        title="Request Payout" 
        backHref="/staff/payment" 
        Icon={ShoppingBag}
      />

      <div className="p-4 sm:p-6 space-y-8">
        {/* Large Balance Display */}
        <div className="bg-gradient-to-br from-brand via-brand-800 to-brand-700 rounded-[2.5rem] p-8 sm:p-12 text-white shadow-xl overflow-hidden relative group text-center">
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white/10 text-white/90 text-sm font-black uppercase tracking-[0.25em] mb-4">
              Available Balance
            </div>
            <div className="flex items-center gap-4">
              <div className="size-12 sm:size-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  ৳
                </span>
              </div>
              <h1 className="text-5xl sm:text-7xl font-black tracking-tight">
                {(stats?.availableBalance || 0).toLocaleString()}
              </h1>
            </div>
            <p className="text-sm sm:text-base text-white/60 font-bold mt-4 uppercase tracking-widest">
              Ready for Withdrawal
            </p>
          </div>
          {/* Abstract background shapes */}
          <div className="absolute -right-12 -bottom-12 size-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -left-12 -top-12 size-48 bg-brand-light/20 rounded-full blur-2xl" />
        </div>

        {/* Page Title & Form Section (Desktop Only) */}
        <div className="hidden md:block space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="p-2.5 bg-brand/5 rounded-2xl text-brand">
              <ShoppingBag size={24} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Request Payout
            </h2>
          </div>
        </div>

        {!canRequest && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4">
            <div className="shrink-0 p-2 bg-amber-100 rounded-full h-fit">
              <AlertCircle size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-amber-800 font-bold leading-tight">
                Missing Withdrawal Information
              </p>
              <p className="text-sm text-amber-700/80 mt-1 font-medium leading-relaxed">
                You must configure your payout method (bKash, Nagad, or Bank)
                before you can request a payment.
              </p>
              <Link
                href="/staff/payment/settings"
                className="inline-flex items-center gap-2 mt-4 text-sm font-bold text-white bg-amber-600 px-4 py-2 rounded-xl hover:bg-amber-700 transition-colors shadow-sm"
              >
                Go to Settings
              </Link>
            </div>
          </div>
        )}

        {canRequest && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="w-4 h-4 text-brand" />
                  <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Payout Destination
                  </h2>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-gray-900 uppercase">
                    {method}
                  </span>
                  <span className="text-sm font-bold text-brand font-mono">
                    {hasWallet && maskNumber(staffData!.walletNumber!)}
                    {hasBank &&
                      staffData?.bankInfo &&
                      maskNumber(staffData.bankInfo.accountNumber)}
                  </span>
                </div>
                {hasBank && staffData?.bankInfo && (
                  <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">
                    {staffData.bankInfo.bankName}
                  </p>
                )}
              </div>
              <Link
                href="/staff/payment/settings"
                className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-bold text-gray-500 hover:bg-gray-50 transition-colors text-center"
              >
                CHANGE METHOD
              </Link>
            </div>

            <div className="space-y-4 pt-2">
              <div className="px-1">
                <p className="text-sm font-bold text-gray-800">
                  Enter Withdrawal Amount
                </p>
                <p className="text-[10px] font-medium text-gray-400 mt-1 leading-relaxed">
                  Submit the amount you wish to withdraw. The administrator will
                  be notified via SMS and your request will be processed.
                </p>
              </div>
              <StaffPaymentRequestForm staffId={userId} />
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
