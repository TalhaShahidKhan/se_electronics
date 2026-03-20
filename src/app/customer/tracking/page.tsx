import { verifyCustomerSession } from "@/actions/customerActions";
import { getServiceHistoryById } from "@/actions/serviceActions";
import { StatusBadge } from "@/components";
import Link from "next/link";
import { MobilePageHeader } from "@/components/layout";
import { Navigation } from "lucide-react";

export default async function CustomerTrackingPage() {
  const session = await verifyCustomerSession();

  if (!session.isAuth) {
    return null;
  }

  const customer = session.customer!;
  const servicesRes = await getServiceHistoryById(customer.customerId);
  const services = servicesRes.success ? servicesRes.data! : [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col selection:bg-blue-200">
      <MobilePageHeader 
        title="Tracking" 
        backHref="/customer/profile" 
        Icon={Navigation}
      />

      <div className="flex-1 max-w-3xl mx-auto py-8 px-4 w-full">
        <div className="hidden md:flex items-center justify-between gap-3 mb-2">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              Service Tracking
            </h1>
            <p className="text-sm text-gray-500">
              Track the progress of your active and past services.
            </p>
          </div>
          <Link
            href="/customer/profile"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2"
          >
            Back to Dashboard
          </Link>
        </div>

        {services.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-md p-10 text-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              No services found
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              You haven&apos;t requested any services yet.
            </p>
            <Link
              href="/get-service"
              className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Request a Service
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service: any) => (
              <Link
                key={service.serviceId}
                href={`/service-track?trackingId=${service.serviceId}`}
                className="block bg-white rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-shadow px-4 py-4 sm:px-5 sm:py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                      <span className="font-mono">#{service.serviceId}</span>
                      <span>•</span>
                      <span className="uppercase font-semibold">
                        {service.type}
                      </span>
                    </div>
                    <div className="font-semibold text-gray-900 truncate">
                      {service.productModel}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {new Date(service.createdAt).toLocaleString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge
                      status={service.statusHistory?.[0]?.status || "pending"}
                    />
                    <span className="text-[11px] text-blue-600 font-semibold">
                      View tracking →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
