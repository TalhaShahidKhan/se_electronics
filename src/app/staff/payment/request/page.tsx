import { verifyStaffSession } from "@/actions";
import { getStaffPaymentHistory } from "@/actions/paymentRequestActions";
import { getStaffById, getStaffProfileStats } from "@/actions/staffActions";
import { StaffPaymentRequestForm } from "@/components/features/staff/StaffPaymentRequestForm";
import { StaffLayout } from "@/components/layout/StaffLayout";
import clsx from "clsx";
import { CreditCard, Wallet, AlertCircle, ShoppingBag } from "lucide-react";
import Link from "next/link";

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
      <div className="p-4 space-y-6">
        {/* Page Title */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-teal-100/50 rounded-xl text-teal-600">
            <ShoppingBag size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Request Payout</h1>
        </div>

        {!canRequest && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4">
            <div className="shrink-0 p-2 bg-amber-100 rounded-full h-fit">
               <AlertCircle size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-amber-800 font-bold leading-tight">Missing Withdrawal Information</p>
              <p className="text-xs text-amber-700/80 mt-1 font-medium leading-relaxed">
                You must configure your payout method (bKash, Nagad, or Bank) before you can request a payment.
              </p>
              <Link
                href="/staff/payment/settings"
                className="inline-flex items-center gap-2 mt-4 text-xs font-bold text-white bg-amber-600 px-4 py-2 rounded-xl hover:bg-amber-700 transition-colors shadow-sm"
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
                    <span className="text-lg font-bold text-gray-900 uppercase">{method}</span>
                    <span className="text-sm font-bold text-brand font-mono">
                      {hasWallet && maskNumber(staffData!.walletNumber!)}
                      {hasBank && staffData?.bankInfo && maskNumber(staffData.bankInfo.accountNumber)}
                    </span>
                  </div>
                  {hasBank && staffData?.bankInfo && (
                     <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">{staffData.bankInfo.bankName}</p>
                  )}
               </div>
               <Link href="/staff/payment/settings" className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-bold text-gray-500 hover:bg-gray-50 transition-colors text-center">
                  CHANGE METHOD
               </Link>
            </div>

            <div className="space-y-4 pt-2">
               <div className="px-1">
                  <p className="text-xs font-bold text-gray-800">Enter Withdrawal Amount</p>
                  <p className="text-[10px] font-medium text-gray-400 mt-1 leading-relaxed">
                    Submit the amount you wish to withdraw. The administrator will be notified via SMS and your request will be processed.
                  </p>
               </div>
               <StaffPaymentRequestForm staffId={userId} />
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
            Recent Payout Sessions
          </h2>
          {paymentsList.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-500">
              <CreditCard size={48} className="mx-auto mb-4 text-gray-200" />
              <p className="font-bold text-gray-700">No payout history</p>
              <p className="text-xs mt-1 text-gray-400 font-medium">Your payout requests will appear here once submitted.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentsList.map((payment: any) => (
                <div key={payment.paymentId} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-brand/20 transition-all group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold font-mono text-gray-300 uppercase tracking-tight">REQ ID: #{payment.paymentId.substring(0, 10)}</p>
                      <div className="flex items-baseline gap-1 mt-1">
                         <span className="text-[10px] font-bold text-gray-400">৳</span>
                         <span className="text-xl font-bold text-gray-900">
                           {payment.amount?.toLocaleString()}
                         </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-bold text-brand bg-brand/5 px-2 py-0.5 rounded-md uppercase">
                          {payment.paymentMethod}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          {new Date(payment.date || payment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <span
                      className={clsx(
                        "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm",
                        payment.status === "completed"
                          ? "bg-green-100 text-green-700 border border-green-200/50"
                          : payment.status === "processing"
                            ? "bg-blue-100 text-blue-700 border border-blue-200/50"
                            : payment.status === "rejected"
                              ? "bg-red-100 text-red-700 border border-red-200/50"
                              : "bg-yellow-100 text-yellow-700 border border-yellow-200/50"
                      )}
                    >
                      {payment.status}
                    </span>
                  </div>
                  {payment.description && (
                    <div className="mt-4 p-3 bg-gray-50/50 rounded-xl border border-gray-100 relative group-hover:bg-brand/5 transition-colors">
                      <p className="text-xs text-gray-600 font-medium leading-relaxed italic">
                        &ldquo;{payment.description}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </StaffLayout>
  );
}
