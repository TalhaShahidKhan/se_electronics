import { verifyStaffSession } from "@/actions";
import { getMyServices, getStaffProfileStats } from "@/actions/staffActions";
import StaffDashboardActions from "@/components/features/staff/StaffDashboardActions";
import { StaffLayout } from "@/components/layout/StaffLayout";
import clsx from "clsx";
import { Wrench } from "lucide-react";
import Link from "next/link";
import { MobilePageHeader } from "@/components/layout";

export default async function StaffServicesPage() {
  const session = await verifyStaffSession();
  if (!session.isAuth) return null;

  const userId = session.userId as string;
  const [statsRes, servicesRes] = await Promise.all([
    getStaffProfileStats(userId),
    getMyServices(userId),
  ]);

  const stats = statsRes.success ? statsRes.data : null;
  const services = servicesRes.success ? (servicesRes.data ?? []) : [];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      canceled: "bg-red-100 text-red-800",
      staff_departed: "bg-purple-100 text-purple-800",
      staff_arrived: "bg-indigo-100 text-indigo-800",
      appointment_retry: "bg-orange-100 text-orange-800",
      service_center: "bg-cyan-100 text-cyan-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <StaffLayout balance={stats?.availableBalance || 0}>
      <MobilePageHeader 
        title="My Services" 
        backHref="/staff/profile" 
        Icon={Wrench}
      />
      
      <div className="p-4 space-y-6">
        {/* Page Title (Desktop Only) */}
        <div className="hidden md:flex items-center gap-3 mb-2">
          <div className="p-2 bg-brand/10 rounded-xl text-brand">
            <Wrench size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-800">My Assigned Services</h1>
        </div>

        {services.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500">
            <Wrench size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="font-bold text-gray-700">No services assigned yet.</p>
            <p className="text-sm mt-1 text-gray-400 font-medium">When you get assigned a service, it will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service: any) => {
              const currentStatus = service.statusHistory?.[0]?.status || "pending";
              return (
                <div key={service.serviceId} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold font-mono text-gray-300 mb-1">SERVICE ID: #{service.serviceId.substring(0, 12)}...</p>
                      <h3 className="text-lg font-bold text-gray-900 truncate">{service.customerName}</h3>
                      <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-tight">
                        {service.productType} • {service.productModel}
                      </p>
                    </div>
                    <span className={clsx("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shadow-sm", getStatusColor(currentStatus))}>
                      {currentStatus.replace("_", " ")}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Created On</span>
                      <span className="text-xs text-gray-600 font-bold">
                        {new Date(service.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {currentStatus !== "completed" && currentStatus !== "canceled" && (
                        <Link
                          href={`/service-report?serviceId=${service.serviceId}`}
                          className="text-xs font-bold bg-brand text-white px-4 py-2 rounded-xl hover:bg-brand-800 transition-all active:scale-95 shadow-sm"
                        >
                          Send Report
                        </Link>
                      )}
                      {currentStatus === "completed" && (
                        <StaffDashboardActions staffId={userId} serviceId={service.serviceId} />
                      )}
                      <Link
                        href={`/service-track?trackingId=${service.serviceId}`}
                        className="text-xs font-bold text-gray-600 bg-gray-100 px-4 py-2 rounded-xl hover:bg-gray-200 transition-all active:scale-95"
                      >
                        Track Status
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
