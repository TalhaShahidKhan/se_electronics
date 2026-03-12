import { verifyStaffSession } from "@/actions";
import { getStaffPaymentHistory } from "@/actions/paymentRequestActions";
import { getMyServices, getStaffProfileStats } from "@/actions/staffActions";
import { StaffLayout } from "@/components/layout/StaffLayout";
import clsx from "clsx";
import {
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
    <StaffLayout balance={stats?.availableBalance || 0}>
      <div className="p-4 space-y-6">
        {/* Page Title */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-brand/10 rounded-xl text-brand">
            <BarChart3 size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Tracking & History</h1>
        </div>

        {/* Earnings Overview */}
        <div className="space-y-3">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
            Earnings Overview
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
              <TrendingUp size={20} className="mx-auto text-emerald-600 mb-2" />
              <p className="text-lg font-bold text-gray-900">
                ৳{totalEarnings.toLocaleString()}
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase">
                Total Earned
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
              <Clock size={20} className="mx-auto text-amber-500 mb-2" />
              <p className="text-lg font-bold text-gray-900">
                ৳{pendingEarnings.toLocaleString()}
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase">
                Pending
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
              <CheckCircle size={20} className="mx-auto text-brand mb-2" />
              <p className="text-lg font-bold text-gray-900">
                {stats?.successfulServices || 0}
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase">
                Completed
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
              <XCircle size={20} className="mx-auto text-rose-500 mb-2" />
              <p className="text-lg font-bold text-gray-900">
                {stats?.canceledServices || 0}
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase">
                Canceled
              </p>
            </div>
          </div>
        </div>

        {/* Service History */}
        <div className="space-y-3">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
            Service History
          </h2>
          {services.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500">
              <Wrench size={36} className="mx-auto mb-2 text-gray-200" />
              <p className="text-sm font-semibold">No service history.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-gray-50/50 text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                      <th className="px-4 py-3">Service ID</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-50">
                    {services.slice(0, 20).map((service: any) => {
                      const currentStatus =
                        service.statusHistory?.[0]?.status || "pending";
                      return (
                        <tr
                          key={service.serviceId}
                          className="hover:bg-gray-50/30 transition-colors"
                        >
                          <td className="px-4 py-4 font-mono text-gray-400 text-[10px] font-bold">
                            <Link
                              href={`/service-track?trackingId=${service.serviceId}`}
                              className="hover:text-brand transition-colors"
                            >
                              #{service.serviceId.substring(0, 8)}
                            </Link>
                          </td>
                          <td className="px-4 py-4 font-semibold text-gray-700">
                            {service.customerName}
                          </td>
                          <td className="px-4 py-4 text-gray-500">
                            <span className="capitalize text-xs font-bold block">
                              {service.productType}
                            </span>
                            <div className="text-[10px] text-gray-400 truncate max-w-[120px]">
                              {service.productModel}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={clsx(
                                "px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider",
                                getStatusColor(currentStatus),
                              )}
                            >
                              {currentStatus.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-gray-400 text-[11px] font-medium text-right font-mono">
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
        <div className="space-y-3">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
            Payment History
          </h2>
          {paymentsList.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500">
              <CreditCard size={36} className="mx-auto mb-2 text-gray-200" />
              <p className="text-sm font-semibold">No payment records.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-gray-50/50 text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Payment ID</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-50">
                    {paymentsList.map((payment: any) => (
                      <tr
                        key={payment.paymentId}
                        className="hover:bg-gray-50/30 transition-colors"
                      >
                        <td className="px-4 py-4 text-gray-500 text-[11px] font-mono">
                          {new Date(
                            payment.date || payment.createdAt,
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 font-mono text-gray-400 text-[10px] font-bold">
                          {payment.paymentId?.substring(0, 8)}
                        </td>
                        <td className="px-4 py-4 font-bold text-gray-900">
                          ৳{payment.amount?.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-gray-500 capitalize text-xs font-bold">
                          {payment.paymentMethod}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span
                            className={clsx(
                              "px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider",
                              payment.status === "completed"
                                ? "bg-emerald-100 text-emerald-700"
                                : payment.status === "processing"
                                  ? "bg-blue-100 text-blue-700"
                                  : payment.status === "rejected"
                                    ? "bg-rose-100 text-rose-700"
                                    : "bg-amber-100 text-amber-700",
                            )}
                          >
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
      </div>
    </StaffLayout>
  );
}
