import { verifyCustomerSession } from "@/actions/customerActions";
import { getServiceHistoryById } from "@/actions/serviceActions";
import { StatusBadge } from "@/components";
import Link from "next/link";

export default async function CustomerFeedbackPage() {
  const session = await verifyCustomerSession();

  if (!session.isAuth) {
    return null;
  }

  const customer = session.customer!;
  const servicesRes = await getServiceHistoryById(customer.customerId);
  const allServices = servicesRes.success ? servicesRes.data! : [];

  // Only completed services are eligible for feedback
  const completedServices = allServices.filter((service: any) => {
    const status = service.statusHistory?.[0]?.status || "pending";
    return status === "completed";
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              Give Feedback
            </h1>
            <p className="text-sm text-gray-500">
              Select a completed service to send your feedback.
            </p>
          </div>
          <Link
            href="/customer/profile"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2"
          >
            Back to Dashboard
          </Link>
        </div>

        {completedServices.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              No completed services yet
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Once a service is completed, you&apos;ll be able to submit
              feedback from here.
            </p>
            <Link
              href="/customer/tracking"
              className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              View service tracking
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {completedServices.map((service: any) => (
              <div
                key={service.serviceId}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 sm:px-5 sm:py-4 flex items-start justify-between gap-3"
              >
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
                  <div className="mt-2">
                    <StatusBadge
                      status={service.statusHistory?.[0]?.status || "completed"}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Link
                    href={`/service-feedback?serviceId=${service.serviceId}`}
                    className="inline-flex items-center justify-center bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    Give Feedback
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
