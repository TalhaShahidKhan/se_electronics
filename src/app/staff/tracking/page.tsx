import { verifyStaffSession } from "@/actions";
import { getStaffPaymentHistory } from "@/actions/paymentRequestActions";
import { getMyServices, getStaffProfileStats } from "@/actions/staffActions";
import clsx from "clsx";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle,
  Clock,
  CreditCard,
  TrendingUp,
  Wrench,
  XCircle,
} from "lucide-react";
import Link from "next/link";

export default async function StaffTrackingPage() {
  const session = await verifyStaffSession();
  if (!session.isAuth) return null;

  const userId = session.userId as string;
  const [statsRes, servicesRes, paymentsRes] = await Promise.all([
    getStaffProfileStats(userId),
    getMyServices(userId),
    getStaffPaymentHistory(userId),
  ]);

  const stats = statsRes.success ? statsRes.data : null;
  const services = servicesRes.success ? (servicesRes.data ?? []) : [];
  const paymentsList = paymentsRes.success ? (paymentsRes.data ?? []) : [];

  // Calculate earnings
  const totalEarnings = paymentsList
    .filter((p: any) => p.status === "completed")
    .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

  const pendingEarnings = paymentsList
    .filter((p: any) => p.status === "pending" || p.status === "processing")
    .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      canceled: "bg-red-100 text-red-800",
      staff_departed: "bg-purple-100 text-purple-800",
      staff_arrived: "bg-indigo-100 text-indigo-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-brand text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-3 py-3 sm:px-4 sm:py-4 flex items-center gap-3">
          <Link href="/staff/profile" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/10">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-200" />
            <h1 className="text-lg font-bold">Tracking & History</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-3 sm:p-4 py-4 sm:py-6 space-y-6">
        {/* Earnings Overview */}
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Earnings Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="__card p-4 text-center">
              <TrendingUp size={22} className="mx-auto text-emerald-600 mb-2" />
              <p className="text-lg sm:text-xl font-bold text-gray-900">৳{totalEarnings.toLocaleString()}</p>
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Total Earned</p>
            </div>
            <div className="__card p-4 text-center">
              <Clock size={22} className="mx-auto text-amber-500 mb-2" />
              <p className="text-lg sm:text-xl font-bold text-gray-900">৳{pendingEarnings.toLocaleString()}</p>
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Pending</p>
            </div>
            <div className="__card p-4 text-center">
              <CheckCircle size={22} className="mx-auto text-brand mb-2" />
              <p className="text-lg sm:text-xl font-bold text-gray-900">{stats?.successfulServices || 0}</p>
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Completed</p>
            </div>
            <div className="__card p-4 text-center">
              <XCircle size={22} className="mx-auto text-rose-500 mb-2" />
              <p className="text-lg sm:text-xl font-bold text-gray-900">{stats?.canceledServices || 0}</p>
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Canceled</p>
            </div>
          </div>
        </div>

        {/* Service History */}
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Service History</h2>
          {services.length === 0 ? (
            <div className="__card p-6 text-center text-gray-500">
              <Wrench size={36} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-semibold">No service history.</p>
            </div>
          ) : (
            <div className="__card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] sm:text-xs text-gray-500 uppercase font-bold tracking-wider">
                      <th className="px-3 sm:px-4 py-3">Service ID</th>
                      <th className="px-3 sm:px-4 py-3">Customer</th>
                      <th className="px-3 sm:px-4 py-3">Product</th>
                      <th className="px-3 sm:px-4 py-3">Status</th>
                      <th className="px-3 sm:px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs sm:text-sm divide-y divide-gray-100">
                    {services.slice(0, 20).map((service: any) => {
                      const currentStatus = service.statusHistory?.[0]?.status || "pending";
                      return (
                        <tr key={service.serviceId} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-3 sm:px-4 py-3 font-mono text-gray-400 text-[10px] sm:text-xs font-semibold">
                            <Link href={`/service-track?trackingId=${service.serviceId}`} className="hover:text-brand transition-colors">
                              #{service.serviceId.substring(0, 8)}
                            </Link>
                          </td>
                          <td className="px-3 sm:px-4 py-3 font-medium text-gray-800">
                            {service.customerName}
                          </td>
                          <td className="px-3 sm:px-4 py-3 text-gray-600">
                            <span className="capitalize">{service.productType}</span>
                            <div className="text-[10px] text-gray-400">{service.productModel}</div>
                          </td>
                          <td className="px-3 sm:px-4 py-3">
                            <span className={clsx("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase", getStatusColor(currentStatus))}>
                              {currentStatus.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 py-3 text-gray-400 text-xs">
                            {new Date(service.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Payment History */}
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Payment History</h2>
          {paymentsList.length === 0 ? (
            <div className="__card p-6 text-center text-gray-500">
              <CreditCard size={36} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-semibold">No payment records.</p>
            </div>
          ) : (
            <div className="__card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] sm:text-xs text-gray-500 uppercase font-bold tracking-wider">
                      <th className="px-3 sm:px-4 py-3">Date</th>
                      <th className="px-3 sm:px-4 py-3">Payment ID</th>
                      <th className="px-3 sm:px-4 py-3">Amount</th>
                      <th className="px-3 sm:px-4 py-3">Method</th>
                      <th className="px-3 sm:px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs sm:text-sm divide-y divide-gray-100">
                    {paymentsList.map((payment: any) => (
                      <tr key={payment.paymentId} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-3 sm:px-4 py-3 text-gray-600 text-xs">
                          {new Date(payment.date || payment.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 sm:px-4 py-3 font-mono text-gray-400 text-[10px] sm:text-xs">
                          {payment.paymentId?.substring(0, 8)}
                        </td>
                        <td className="px-3 sm:px-4 py-3 font-bold text-gray-900">
                          ৳{payment.amount?.toLocaleString()}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-gray-600 capitalize">
                          {payment.paymentMethod}
                        </td>
                        <td className="px-3 sm:px-4 py-3">
                          <span className={clsx(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                            payment.status === "completed" ? "bg-green-100 text-green-700" :
                            payment.status === "processing" ? "bg-blue-100 text-blue-700" :
                            payment.status === "rejected" ? "bg-red-100 text-red-700" :
                            "bg-yellow-100 text-yellow-700"
                          )}>
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
