import { verifyStaffSession } from "@/actions";
import { getStaffPaymentHistory } from "@/actions/paymentRequestActions";
import { getMyServices, getStaffProfileStats } from "@/actions/staffActions";
import { StaffLayout } from "@/components/layout/StaffLayout";
import clsx from "clsx";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";

export default async function StaffTrackingPage() {
  const session = await verifyStaffSession();
  if (!session?.isAuth) return null;

  const userId = session.userId as string;

  const [statsRes, servicesRes, paymentsRes] = await Promise.all([
    getStaffProfileStats(userId),
    getMyServices(userId),
    getStaffPaymentHistory(userId),
  ]);

  const stats = statsRes.success ? statsRes.data : null;
  const services = servicesRes.success ? (servicesRes.data ?? []) : [];
  const paymentsList = paymentsRes.success ? (paymentsRes.data ?? []) : [];

  const totalEarnings = paymentsList
    .filter((p: any) => p.status === "completed")
    .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

  const pendingEarnings = paymentsList
    .filter((p: any) => p.status === "pending" || p.status === "processing")
    .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-600 text-white";
      case "canceled":
        return "bg-red-500 text-white";
      case "processing":
      case "pending":
        return "bg-orange-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  return (
    <StaffLayout balance={stats?.availableBalance || 0}>
      <div className="w-full max-w-7xl mx-auto">
        {/* Mobile Header */}
        <div className="bg-[#0A1A3A] text-white px-4 py-3 flex items-center gap-3 ">
          {/* Back Button */}
          <Link href="/staff/profile">
            <ArrowLeft size={18} />
          </Link>

          <h1 className="font-semibold">Tracking & History</h1>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          {/* Stats */}

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-100 rounded-xl p-4 text-center">
              <TrendingUp className="mx-auto text-green-600 mb-1" size={18} />
              <p className="font-bold text-lg">
                ৳{totalEarnings.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">TOTAL EARNED</p>
            </div>

            <div className="bg-gray-100 rounded-xl p-4 text-center">
              <Clock className="mx-auto text-yellow-500 mb-1" size={18} />
              <p className="font-bold text-lg">
                ৳{pendingEarnings.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">PENDING</p>
            </div>

            <div className="bg-gray-100 rounded-xl p-4 text-center">
              <CheckCircle className="mx-auto text-gray-700 mb-1" size={18} />
              <p className="font-bold text-lg">
                {stats?.successfulServices || 0}
              </p>
              <p className="text-xs text-gray-500">COMPLETED</p>
            </div>

            <div className="bg-gray-100 rounded-xl p-4 text-center">
              <XCircle className="mx-auto text-red-500 mb-1" size={18} />
              <p className="font-bold text-lg">
                {stats?.canceledServices || 0}
              </p>
              <p className="text-xs text-gray-500">CANCELLED</p>
            </div>
          </div>

          {/* Service History */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">
              Service History
            </h3>

            <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
              {services.map((service: any) => {
                const status =
                  service.statusHistory?.[0]?.status || "processing";

                return (
                  <div
                    key={service.id}
                    className="border rounded-md p-3 bg-white shadow-sm relative"
                  >
                    {/* Status Badge Top Right */}
                    <span
                      className={clsx(
                        "absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded",
                        getStatusStyle(status),
                      )}
                    >
                      {status.toUpperCase()}
                    </span>

                    <div className="text-xs space-y-1">
                      <p>
                        <span className="font-semibold">Service ID:</span>{" "}
                        {service.serviceId}
                      </p>

                      <p>
                        <span className="font-semibold">Customer:</span>{" "}
                        {service.customerName}
                      </p>

                      <p>
                        <span className="font-semibold">Phone:</span>{" "}
                        {service.customerPhone}
                        <span className="text-blue-500 ml-2">Call Now</span>
                      </p>

                      <p>
                        <span className="font-semibold">Product:</span>{" "}
                        {service.productModel || service.productType}
                      </p>

                      <Link
                        href={`/service-track?trackingId=${service.serviceId}`}
                        className="text-gray-500 text-[11px] font-semibold block mt-2"
                      >
                        DETAILS →
                      </Link>
                    </div>
                  </div>
                );
              })}

              {services.length === 0 && (
                <p className="text-center text-gray-400 py-10 text-sm">
                  No service history found
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
