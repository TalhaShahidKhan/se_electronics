import { verifyStaffSession } from "@/actions";
import { getMyServices } from "@/actions/staffActions";
import StaffDashboardActions from "@/components/features/staff/StaffDashboardActions";
import clsx from "clsx";
import { ArrowLeft, Wrench } from "lucide-react";
import Link from "next/link";

export default async function StaffServicesPage() {
  const session = await verifyStaffSession();
  if (!session.isAuth) return null;

  const userId = session.userId as string;
  const servicesRes = await getMyServices(userId);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-brand text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-3 py-3 sm:px-4 sm:py-4 flex items-center gap-3">
          <Link href="/staff/profile" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/10">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <Wrench size={20} className="text-blue-200" />
            <h1 className="text-lg font-bold">My Services</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-3 sm:p-4 py-4 sm:py-6">
        {services.length === 0 ? (
          <div className="__card p-8 text-center text-gray-500">
            <Wrench size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="font-semibold">No services assigned yet.</p>
            <p className="text-sm mt-1">When you get assigned a service, it will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service: any) => {
              const currentStatus = service.statusHistory?.[0]?.status || "pending";
              return (
                <div key={service.serviceId} className="__card p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-mono text-gray-400 mb-1">#{service.serviceId}</p>
                      <h3 className="font-bold text-gray-900 truncate">{service.customerName}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {service.productModel} • <span className="capitalize">{service.type} - {service.productType}</span>
                      </p>
                    </div>
                    <span className={clsx("px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wide whitespace-nowrap", getStatusColor(currentStatus))}>
                      {currentStatus.replace("_", " ")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(service.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      {currentStatus !== "completed" && currentStatus !== "canceled" && (
                        <Link
                          href={`/service-report?serviceId=${service.serviceId}`}
                          className="text-xs font-bold bg-brand text-white px-3 py-1.5 rounded-lg hover:bg-brand-800 transition-colors"
                        >
                          Report
                        </Link>
                      )}
                      {currentStatus === "completed" && (
                        <StaffDashboardActions staffId={userId} serviceId={service.serviceId} />
                      )}
                      <Link
                        href={`/service-track?trackingId=${service.serviceId}`}
                        className="text-xs font-bold text-brand bg-brand-50 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition-colors"
                      >
                        Track
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
