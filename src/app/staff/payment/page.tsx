import { verifyStaffSession } from "@/actions";
import { getStaffPaymentHistory } from "@/actions/paymentRequestActions";
import { getStaffProfileStats } from "@/actions/staffActions";
import { StaffLayout } from "@/components/layout/StaffLayout";
import { CreditCard, Settings, Wallet, ChevronRight, Download, Eye } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { InvoicePreviewButton } from "@/components/features/invoices";
import { PaymentDataType } from "@/types";

export default async function StaffPaymentHubPage() {
  const session = await verifyStaffSession();
  if (!session.isAuth) return null;

  const userId = session.userId as string;
  const [statsRes, paymentsRes] = await Promise.all([
    getStaffProfileStats(userId),
    getStaffPaymentHistory(userId),
  ]);

  const stats = statsRes.success ? statsRes.data : null;
  const paymentsList = (paymentsRes.success ? (paymentsRes.data ?? []) : []) as PaymentDataType[];

  return (
    <StaffLayout balance={stats?.availableBalance || 0}>
      <div className="p-4 sm:p-6 space-y-8">
        {/* Page Title */}
        <div className="flex items-center gap-3 mb-2 px-1">
          <div className="p-2.5 bg-brand/5 rounded-2xl text-brand">
            <Wallet size={24} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Payments & Payouts
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/staff/payment/settings"
            className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5 group hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="size-14 rounded-2xl bg-brand/5 text-brand flex items-center justify-center group-hover:scale-110 transition-transform">
              <Settings className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-black text-gray-900 text-lg">Settings</h2>
              <p className="text-xs sm:text-sm font-bold text-gray-400 mt-1 truncate">
                Configure bKash, Nagad or Bank
              </p>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-brand transition-colors" size={20} />
          </Link>

          <Link
            href="/staff/payment/request"
            className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5 group hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="size-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-black text-gray-900 text-lg">Withdraw</h2>
              <p className="text-xs sm:text-sm font-bold text-gray-400 mt-1 truncate">
                Request balance to your wallet
              </p>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-teal-600 transition-colors" size={20} />
          </Link>
        </div>

        {/* Payment History Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">
              Payout History
            </h2>
            <div className="h-px flex-1 bg-gray-100 ml-6"></div>
          </div>

          {paymentsList.length === 0 ? (
            <div className="bg-white p-16 rounded-[2.5rem] border border-gray-100 text-center text-gray-500 shadow-sm">
              <CreditCard size={64} className="mx-auto mb-6 text-gray-100" />
              <p className="text-xl font-black text-gray-800">No History Yet</p>
              <p className="text-sm mt-2 text-gray-400 font-bold max-w-xs mx-auto">
                Your payout requests will appear here once you start withdrawing.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paymentsList.map((payment: PaymentDataType) => (
                <div key={payment.paymentId} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 hover:border-brand/20 transition-all group relative overflow-hidden">
                  <div className="flex flex-col gap-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black font-mono text-gray-300 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-lg">
                        #{payment.paymentId.substring(0, 8)}
                      </span>
                      <span
                        className={clsx(
                          "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm border",
                          payment.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : payment.status === "requested"
                              ? "bg-orange-50 text-orange-700 border-orange-100"
                            : payment.status === "approved"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                            : payment.status === "credited"
                              ? "bg-cyan-50 text-cyan-700 border-cyan-100"
                            : payment.status === "rejected"
                              ? "bg-rose-50 text-rose-700 border-rose-100"
                              : "bg-amber-50 text-amber-700 border-amber-100"
                        )}
                      >
                        {payment.status}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1.5">
                       <span className="text-sm font-black text-gray-400">৳</span>
                       <span className="text-3xl font-black text-gray-900">
                         {payment.amount?.toLocaleString()}
                       </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Method</span>
                        <span className="text-xs font-black text-brand uppercase">{payment.paymentMethod}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Date</span>
                        <span className="text-xs font-bold text-gray-500">
                          {new Date(payment.date || payment.createdAt!).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-2">
                       <Link
                          href={`/staff/payment/${payment.invoiceNumber}`}
                          className="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 rounded-xl text-xs font-black transition-colors"
                        >
                          <Eye size={14} />
                          <span>View Details</span>
                       </Link>
                       
                       
                    </div>
                  </div>
                  {/* Subtle background icon */}
                  <Wallet className="absolute -right-4 -bottom-4 size-24 text-gray-50 group-hover:text-brand/5 transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </StaffLayout>
  );
}