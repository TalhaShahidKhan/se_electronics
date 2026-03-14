import { verifyStaffSession } from "@/actions";
import { getStaffPaymentHistory } from "@/actions/paymentRequestActions";
import { getMyServices, getStaffProfileStats } from "@/actions/staffActions";
import { StaffLayout } from "@/components/layout/StaffLayout";
import clsx from "clsx";
import {
  BarChart3,
  CheckCircle,
  Clock,
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
          <div className="p-2 bg-brand/5 rounded-xl text-brand">
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
        <div className="space-y-4">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">
            Service History
          </h2>
          {services.length === 0 ? (
            <div className="bg-white p-12 rounded-[2rem] shadow-sm border border-gray-100 text-center text-gray-500">
              <Wrench size={48} className="mx-auto mb-4 text-gray-200" />
              <p className="font-bold text-gray-700">No service history found.</p>
              <p className="text-sm mt-1 text-gray-400 font-medium">Your completed and active services will show up here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-24">
              {services.map((service: any) => {
                const currentStatus = service.statusHistory?.[0]?.status || "pending";
                return (
                  <div 
                    key={service.serviceId} 
                    className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-[0.98] group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           <span className="text-[9px] font-black font-mono text-gray-300 uppercase tracking-tighter">
                             #{service.serviceId.substring(0, 8)}
                           </span>
                           <span className="size-1 rounded-full bg-gray-200" />
                           <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                             {new Date(service.createdAt).toLocaleDateString()}
                           </span>
                        </div>
                        <h3 className="text-base font-black text-gray-900 truncate group-hover:text-brand transition-colors">
                            {service.customerName}
                        </h3>
                        <p className="text-[10px] font-bold text-gray-500 mt-0.5 uppercase tracking-tight flex items-center gap-1">
                          <span className="text-brand/60">{service.productType}</span>
                          <span className="text-gray-300">•</span>
                          <span className="truncate">{service.productModel}</span>
                        </p>
                      </div>
                      <span className={clsx(
                        "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider whitespace-nowrap shadow-sm border",
                        currentStatus === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        currentStatus === "canceled" ? "bg-rose-50 text-rose-700 border-rose-100" :
                        "bg-brand/5 text-brand border-brand/10"
                      )}>
                        {currentStatus.replace("_", " ")}
                      </span>
                    </div>

                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                         <div className="flex -space-x-2">
                            <div className="size-6 rounded-full bg-brand/10 border-2 border-white flex items-center justify-center text-brand">
                                <Wrench size={10} />
                            </div>
                         </div>
                         <Link 
                            href={`/service-track?trackingId=${service.serviceId}`}
                            className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 hover:text-brand transition-colors"
                         >
                            Details <TrendingUp size={12} />
                         </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </StaffLayout>
  );
}
