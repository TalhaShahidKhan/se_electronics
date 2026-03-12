import { verifyStaffSession } from "@/actions";
import { getStaffPaymentHistory } from "@/actions/paymentRequestActions";
import { getStaffById } from "@/actions/staffActions";
import { StaffPaymentRequestForm } from "@/components/features/staff/StaffPaymentRequestForm";
import clsx from "clsx";
import { ArrowLeft, CreditCard, Wallet } from "lucide-react";
import Link from "next/link";

function maskNumber(value: string) {
  if (!value || value.length < 4) return "****";
  return value.slice(-4).padStart(value.length, "*");
}

export default async function StaffPaymentRequestPage() {
  const session = await verifyStaffSession();
  if (!session.isAuth) return null;

  const userId = session.userId as string;
  const [paymentsRes, profileRes] = await Promise.all([
    getStaffPaymentHistory(userId),
    getStaffById(userId),
  ]);

  const paymentsList = paymentsRes.success ? (paymentsRes.data ?? []) : [];
  const staffData = profileRes.success ? profileRes.data : null;

  const method = staffData?.paymentPreference ?? "";
  const hasWallet =
    ["bkash", "nagad", "rocket"].includes(method) && staffData?.walletNumber;
  const hasBank = method === "bank" && staffData?.bankInfo;
  const canRequest = method === "cash" || hasWallet || hasBank;

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
            <Wallet size={20} className="text-blue-200" />
            <h1 className="text-lg font-bold">Request payment</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-3 sm:p-4 py-4 sm:py-6 space-y-6">
        {!canRequest && (
          <div className="__card p-4 bg-amber-50 border-amber-200">
            <p className="text-sm text-amber-800 font-medium">
              Set your preferred payment method and account details first.
            </p>
            <Link
              href="/staff/payment/settings"
              className="inline-block mt-2 text-sm font-bold text-brand hover:underline"
            >
              Go to Payment settings →
            </Link>
          </div>
        )}

        {canRequest && (
          <div className="__card p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-brand" />
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">
                Payout to
              </h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Payment will be sent to your saved {method.toUpperCase()} details.
              {hasWallet && (
                <span className="font-mono ml-1">
                  {maskNumber(staffData!.walletNumber!)}
                </span>
              )}
              {hasBank && staffData?.bankInfo && (
                <span className="ml-1">
                  {staffData.bankInfo.bankName} • {maskNumber(staffData.bankInfo.accountNumber)}
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Submit the amount below. Admin will get an SMS and process your request.
            </p>
            <StaffPaymentRequestForm staffId={userId} />
          </div>
        )}

        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
            Payment history
          </h2>
          {paymentsList.length === 0 ? (
            <div className="__card p-8 text-center text-gray-500">
              <CreditCard size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="font-semibold">No payment records yet.</p>
              <p className="text-sm mt-1">Your requests will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentsList.map((payment: any) => (
                <div key={payment.paymentId} className="__card p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-mono text-gray-400">
                        #{payment.paymentId}
                      </p>
                      <p className="text-lg font-bold text-gray-900 mt-0.5">
                        ৳{payment.amount?.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 capitalize mt-0.5">
                        {payment.paymentMethod}
                      </p>
                    </div>
                    <span
                      className={clsx(
                        "px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wide whitespace-nowrap",
                        payment.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : payment.status === "processing"
                            ? "bg-blue-100 text-blue-700"
                            : payment.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                      )}
                    >
                      {payment.status}
                    </span>
                  </div>
                  {payment.description && (
                    <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100 mt-2">
                      {payment.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(
                      payment.date || payment.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
