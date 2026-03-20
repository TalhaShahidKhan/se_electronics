import { verifyStaffSession } from "@/actions";
import { getStaffPaymentHistory } from "@/actions/paymentRequestActions";
import { getMyServices, getStaffProfileStats } from "@/actions/staffActions";
import { StaffLayout } from "@/components/layout/StaffLayout";
import clsx from "clsx";
import Link from "next/link";
import { ArrowLeft, BarChart3, Phone, Settings, TrendingUp, Clock, CheckCircle, XCircle, Hash, User, Box } from "lucide-react";
import { MobilePageHeader } from "@/components/layout";

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
        <MobilePageHeader 
          title="Tracking & History" 
          backHref="/staff/profile" 
          Icon={BarChart3}
        />

        <div className="p-4 md:p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-100 rounded-md p-4 text-center">
              <TrendingUp className="mx-auto text-green-600 mb-1" size={18} />
              <p className="font-bold text-lg">
                ৳{totalEarnings.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">TOTAL EARNED</p>
            </div>

            <div className="bg-gray-100 rounded-md p-4 text-center">
              <Clock className="mx-auto text-yellow-500 mb-1" size={18} />
              <p className="font-bold text-lg">
                ৳{pendingEarnings.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">PENDING</p>
            </div>

            <div className="bg-gray-100 rounded-md p-4 text-center">
              <CheckCircle className="mx-auto text-gray-700 mb-1" size={18} />
              <p className="font-bold text-lg">
                {stats?.completedServices || 0}
              </p>
              <p className="text-sm text-gray-500">COMPLETED</p>
            </div>

            <div className="bg-gray-100 rounded-md p-4 text-center">
              <XCircle className="mx-auto text-red-500 mb-1" size={18} />
              <p className="font-bold text-lg">{stats?.canceledServices || 0}</p>
              <p className="text-sm text-gray-500">CANCELLED</p>
            </div>
          </div>

          {/* Service History */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">
              Service History
            </h3>

            <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
              {services.map((service: any) => {
                const status = service.statusHistory?.[0]?.status || "processing";

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

                    <div className="text-sm space-y-1">
                      <p className="flex items-center gap-2">
                        <Hash size={16} className="text-gray-500" />
                        <span className="font-semibold">Service ID:</span>{" "}
                        {service.serviceId}
                      </p>

                      {/* Customer Name */}
                      <p className="flex items-center gap-2">
                        <User size={16} className="text-gray-500" />
                        <span className="font-semibold">Customer:</span>{" "}
                        {service.customerName}
                      </p>

                      <p className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-500" />
                        <span className="font-semibold">Phone:</span>{" "}
                        {service.customerPhone}
                        <a
                          href={`tel:+88${service.customerPhone}`}
                          className="text-blue-500 flex items-center gap-1 ml-2 hover:underline"
                        >
                          <Phone size={14} />
                          Call Now
                        </a>
                      </p>

                      <p className="flex items-center gap-2">
                        <Box size={16} className="text-gray-500" />
                        <span className="font-semibold">Product:</span>{" "}
                        {service.productModel || service.productType}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        {/* LEFT SIDE (Details) */}
                        <Link
                          href={`/service-track?trackingId=${service.serviceId}`}
                          className=" text-[15px] text-blue-500 underline flex items-center gap-2"
                        >
                          TRACKING →
                          <TrendingUp size={16} />
                        </Link>

                        {/* RIGHT SIDE (Settings Icon) */}
                        <Settings className="text-gray-500" size={18} />
                      </div>
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
