import { verifyCustomerSession } from "@/actions/customerActions";
import { getServiceHistoryById } from "@/actions/serviceActions";
import { AppError } from "@/utils";
import { Calendar, Navigation, Plus, Settings, Zap } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CustomerServicesPage() {
  const session = await verifyCustomerSession();

  if (!session.isAuth || !session.customer) {
    redirect("/customer/login");
  }

  const { customer } = session;
  const servicesRes = await getServiceHistoryById(customer.customerId);

  if (!servicesRes.success) {
    throw new AppError("Failed to load services");
  }

  const services = servicesRes.data || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/customer/profile"
            className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-5 h-5 text-gray-700"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">My Services</h1>
        </div>
      </header>

      <main className="flex-1 w-full max-w-xl mx-auto p-4 flex flex-col gap-6">
        {/* Big New Service Button */}
        <Link
          href="/get-service"
          className="mt-2 w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-200 flex flex-col items-center justify-center gap-2"
        >
          <div className="bg-white/20 p-2 rounded-full mb-1">
            <Plus size={24} />
          </div>
          Request New Service
        </Link>

        {/* Service List */}
        <div className="flex flex-col gap-4 ">
          {services.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <div className="bg-gray-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Settings size={28} />
              </div>
              <h3 className="text-gray-900 font-bold mb-1">
                No services found
              </h3>
              <p className="text-gray-500 text-sm">
                You haven't requested any services yet.
              </p>
            </div>
          ) : (
            services.map((service) => {
              const currentStatus =
                service.statusHistory?.[0]?.status || "pending";
              const isCompleted = currentStatus === "completed";
              const isCanceled = currentStatus === "canceled";

              let category = "Pending";
              let badgeColor = "bg-amber-100 text-amber-700";

              if (isCompleted) {
                category = "Completed";
                badgeColor = "bg-emerald-100 text-emerald-700";
              } else if (isCanceled) {
                category = "Canceled";
                badgeColor = "bg-rose-100 text-rose-700";
              }

              const serviceDate = new Date(
                service.createdAt,
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={service.id}
                  className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden"
                >
                  {/* Category Badge Top Right */}
                  <div
                    className={`absolute top-5 right-5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${badgeColor}`}
                  >
                    {category}
                  </div>

                  <div className="flex items-start gap-4 pr-24">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl flex-shrink-0">
                      {service.type === "install" ? (
                        <Zap size={24} />
                      ) : (
                        <Settings size={24} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">
                        {service.productModel ||
                          service.productType ||
                          "Hardware Service"}
                      </h3>
                      <p className="text-gray-500 text-sm font-medium mb-3">
                        {service.serviceId}
                      </p>
                      <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold">
                        <Calendar size={14} />
                        {serviceDate}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-50">
                    <Link
                      href={`/service-track?trackingId=${service.serviceId}`}
                      className="text-indigo-600 text-sm font-bold flex items-center justify-center gap-2 w-full p-2 bg-indigo-50/50 hover:bg-indigo-50 rounded-xl transition-colors"
                    >
                      <Navigation size={16} />
                      Track Service Progress
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
