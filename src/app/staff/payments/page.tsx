import { verifyStaffSession } from "@/actions";
import { getStaffPaymentHistory } from "@/actions/paymentRequestActions";
import { getMyServices } from "@/actions/staffActions";
import StaffPaymentRequest from "@/components/features/staff/StaffPaymentRequest";
import clsx from "clsx";
import { ArrowLeft, CreditCard, Wallet } from "lucide-react";
import Link from "next/link";

export default async function StaffPaymentsPage() {
  const session = await verifyStaffSession();
  if (!session.isAuth) return null;

  const userId = session.userId as string;
  const [paymentsRes, servicesRes] = await Promise.all([
    getStaffPaymentHistory(userId),
    getMyServices(userId),
  ]);

  const paymentsList = paymentsRes.success ? (paymentsRes.data ?? []) : [];
  const services = servicesRes.success ? (servicesRes.data ?? []) : [];

  // Get completed services that can request payment
  const completedServices = services.filter(
    (s: any) => s.statusHistory?.[0]?.status === "completed"
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-brand text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-3 py-3 sm:px-4 sm:py-4 flex items-center gap-3">
          <Link href="/staff/profile" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/10">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <Wallet size={20} className="text-blue-200" />
            <h1 className="text-lg font-bold">Payments</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-3 sm:p-4 py-4 sm:py-6 space-y-6">
        {/* Request Payment Section */}
        {completedServices.length > 0 && (
          <div className="__card p-5 sm:p-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Request Payment</h2>
            <p className="text-xs text-gray-500 mb-4">Select a completed service to request payment from admin.</p>
            <StaffPaymentRequest staffId={userId} completedServices={completedServices} />
          </div>
        )}

        {/* Payment History */}
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Payment History</h2>
          {paymentsList.length === 0 ? (
            <div className="__card p-8 text-center text-gray-500">
              <CreditCard size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="font-semibold">No payment records yet.</p>
              <p className="text-sm mt-1">Your payment requests will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentsList.map((payment: any) => (
                <div key={payment.paymentId} className="__card p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-mono text-gray-400">#{payment.paymentId}</p>
                      <p className="text-lg font-bold text-gray-900 mt-0.5">৳{payment.amount?.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 capitalize mt-0.5">{payment.paymentMethod}</p>
                    </div>
                    <span className={clsx(
                      "px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wide whitespace-nowrap",
                      payment.status === "completed" ? "bg-green-100 text-green-700" :
                      payment.status === "processing" ? "bg-blue-100 text-blue-700" :
                      payment.status === "rejected" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    )}>
                      {payment.status}
                    </span>
                  </div>
                  {payment.description && (
                    <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100 mt-2">
                      {payment.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(payment.date || payment.createdAt).toLocaleDateString()}
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
