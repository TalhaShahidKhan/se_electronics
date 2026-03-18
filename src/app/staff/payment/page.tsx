import { verifyStaffSession } from "@/actions";
import { getStaffPaymentHistory } from "@/actions/paymentRequestActions";
import { getStaffProfileStats } from "@/actions/staffActions";
import { StaffLayout } from "@/components/layout/StaffLayout";
import { PaymentDataType } from "@/types";
import clsx from "clsx";
import { ArrowLeft, ChevronRight, CreditCard, Wallet, Settings } from "lucide-react";
import Link from "next/link";
import { MobilePageHeader } from "@/components/layout";

export default async function StaffPaymentHubPage() {
  const session = await verifyStaffSession();
  if (!session.isAuth) return null;

  const userId = session.userId as string;
  const [statsRes, paymentsRes] = await Promise.all([
    getStaffProfileStats(userId),
    getStaffPaymentHistory(userId),
  ]);

  const stats = statsRes.success ? statsRes.data : null;
  const paymentsList = (
    paymentsRes.success ? (paymentsRes.data ?? []) : []
  ) as PaymentDataType[];

  return (
    <StaffLayout balance={stats?.availableBalance || 0}>
      <div className="min-h-screen bg-gray-50">
        <MobilePageHeader 
          title="Payments" 
          backHref="/staff/profile" 
          Icon={Wallet}
        />

        <div className="p-4 sm:p-6 space-y-6">
          {/* Action Header - Only show on desktop or as a separate section */}
          <div className="hidden lg:flex items-center gap-3 mb-2 px-1">
            <div className="p-2.5 bg-brand/5 rounded-2xl text-brand">
              <Wallet size={24} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Payments & Payouts
            </h1>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3 lg:gap-4">
            <Link
              href="/staff/payment/settings"
              className="bg-white p-4 lg:p-6 rounded-2xl lg:rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-3 lg:gap-5 group hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="size-10 lg:size-14 rounded-xl lg:rounded-2xl bg-brand/5 text-brand flex items-center justify-center group-hover:scale-110 transition-transform">
                <Settings className="w-5 h-5 lg:w-7 lg:h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-black text-gray-900 lg:text-lg text-sm">
                  Settings
                </h2>
                <p className="hidden lg:block text-sm sm:text-sm font-bold text-gray-400 mt-1 truncate">
                  Configure Wallet
                </p>
              </div>
              <ChevronRight
                className="text-gray-300 group-hover:text-brand transition-colors hidden lg:block"
                size={20}
              />
            </Link>

            <Link
              href="/staff/payment/request"
              className="w-full border-2 border-gray-200  p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] shadow-xl flex items-center justify-between gap-6 group hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-[0.99] relative overflow-hidden text-black"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-white/10 transition-all duration-700"></div>

              <div className="flex items-center gap-5 lg:gap-8 relative z-10">
                <div className="size-14 lg:size-20 rounded-2xl lg:rounded-3xl bg-white/10 backdrop-blur-md text-black flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg border border-white/20">
                  <CreditCard className="size-7 lg:size-10" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-black text-black text-xl lg:text-3xl uppercase tracking-tight mb-1">
                    Withdraw
                  </h2>
                  <p className="text-black/70 text-[10px] lg:text-sm font-black uppercase tracking-[0.2em]">
                    Instant Payout Request
                  </p>
                </div>
              </div>

              <div className="relative z-10 size-10 lg:size-14 rounded-full bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-white group-hover:text-brand transition-all">
                <ChevronRight size={24} className="translate-x-0.5" />
              </div>
            </Link>
          </div>

          {/* Payment History Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">
                Payout History
              </h2>
            </div>

            {paymentsList.length === 0 ? (
              <div className="bg-white p-12 lg:p-16 rounded-[2rem] border border-gray-100 text-center text-gray-500 shadow-sm">
                <CreditCard size={48} className="mx-auto mb-4 text-gray-100" />
                <p className="text-lg font-black text-gray-800">
                  No History Yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentsList.map((payment: PaymentDataType) => (
                  <Link
                    key={payment.paymentId}
                    href={`/staff/payment/${payment.invoiceNumber}`}
                    className="block bg-white rounded-xl lg:rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-brand/20 transition-all active:scale-[0.99] group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-full">
                        {/* Invoice + Status */}
                        <div className="flex justify-between items-center w-full">
                          <span className="font-black text-gray-700 lg:text-lg">
                            {payment.invoiceNumber.startsWith("BAL-")
                              ? "BAL#" + payment.paymentId.substring(0, 8)
                              : "SFC#" + payment.invoiceNumber}
                          </span>

                          <span
                            className={clsx(
                              "px-3 py-0.5 rounded-full text-[10px] lg:text-xs font-black uppercase tracking-wider",
                              payment.status === "completed"
                                ? "bg-[#E8F5E9] text-[#4CAF50]"
                                : payment.status === "rejected"
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-[#FFF8E1] text-[#FFA000]",
                            )}
                          >
                            {payment.status === "completed"
                              ? "Paid"
                              : payment.status}
                          </span>
                        </div>

                        {/* Payment Method */}
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-gray-600 font-semibold">
                            Payment Method
                          </p>
                          <span className="bg-[#E3F2FD] text-[#546E7A] px-2 py-0.5 rounded-md text-[10px] font-black uppercase">
                            {payment.paymentMethod}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-end -mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm lg:text-sm font-bold text-gray-500">
                          {new Date(
                            payment.date || payment.createdAt!,
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="text-lg lg:text-2xl font-black text-gray-900">
                        ৳{payment.amount?.toLocaleString()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
