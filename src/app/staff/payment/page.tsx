import { verifyStaffSession } from "@/actions";
import { ArrowLeft, CreditCard, Settings, Wallet } from "lucide-react";
import Link from "next/link";

export default async function StaffPaymentHubPage() {
  const session = await verifyStaffSession();
  if (!session.isAuth) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-brand text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-3 py-3 sm:px-4 sm:py-4 flex items-center gap-3">
          <Link
            href="/staff/profile"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/10"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <Wallet size={20} className="text-blue-200" />
            <h1 className="text-lg font-bold">Payments</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-3 sm:p-4 py-4 sm:py-6 space-y-4">
        <p className="text-sm text-gray-500 px-1">
          Set how you receive payment, then request payout when needed. Admin gets an SMS for each request.
        </p>

        <Link
          href="/staff/payment/settings"
          className="__card p-5 sm:p-6 flex items-center gap-4 group hover:shadow-lg transition-shadow"
        >
          <div className="size-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center group-hover:scale-105 transition-transform">
            <Settings className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-gray-900">Payment settings</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Preferred method and account details (bKash/Nagad/Rocket number or bank account)
            </p>
          </div>
          <span className="text-gray-400 group-hover:text-brand">→</span>
        </Link>

        <Link
          href="/staff/payment/request"
          className="__card p-5 sm:p-6 flex items-center gap-4 group hover:shadow-lg transition-shadow"
        >
          <div className="size-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-gray-900">Request payment</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Enter amount and send request. Admin will be notified by SMS.
            </p>
          </div>
          <span className="text-gray-400 group-hover:text-teal-600">→</span>
        </Link>
      </main>
    </div>
  );
}
