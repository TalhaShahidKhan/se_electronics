import {
  customerLogout,
  verifyCustomerSession,
} from "@/actions/customerActions";
import { getServiceHistoryById } from "@/actions/serviceActions";
import { StatusBadge } from "@/components";
import Link from "next/link";

export default async function CustomerProfilePage() {
  const session = await verifyCustomerSession();

  if (!session.isAuth) {
    return null; // Middleware will handle redirect
  }

  const customer = session.customer!;
  const servicesRes = await getServiceHistoryById(customer.customerId);
  const services = servicesRes.success ? servicesRes.data! : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
                Welcome, {customer.name}
              </h1>
              <p className="text-gray-500">
                Member ID:{" "}
                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-sm">
                  {customer.customerId}
                </span>
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/get-service"
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95"
              >
                Request a Service
              </Link>
              <form action={customerLogout}>
                <button className="bg-white text-red-600 border border-red-200 px-6 py-2.5 rounded-xl font-bold hover:bg-red-50 transition-all active:scale-95">
                  Logout
                </button>
              </form>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 pt-8 border-t border-gray-50">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-2xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium">Phone</p>
                <p className="text-lg font-bold text-gray-800">
                  {customer.phone}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-green-50 p-3 rounded-2xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium">Address</p>
                <p className="text-lg font-bold text-gray-800">
                  {customer.address || "Not Provided"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Service History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              Your Service History
            </h2>
            <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              {services.length} Total
            </div>
          </div>

          {services.length === 0 ? (
            <div className="p-16 text-center">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-700">
                No services found
              </h3>
              <p className="text-gray-400 mt-2 mb-8">
                You haven't requested any services yet.
              </p>
              <Link
                href="/get-service"
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all inline-block"
              >
                Request a Service
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Service ID
                    </th>
                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Product / Type
                    </th>
                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Staff
                    </th>
                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {services.map((service: any) => (
                    <tr
                      key={service.serviceId}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-8 py-6 font-mono text-sm text-blue-600 font-medium">
                        #{service.serviceId}
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-bold text-gray-800">
                          {service.productModel}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 uppercase font-semibold">
                          {service.type}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-gray-600 font-medium">
                        {service.staffName || "Unassigned"}
                      </td>
                      <td className="px-8 py-6">
                        <StatusBadge
                          status={
                            service.statusHistory?.[0]?.status || "pending"
                          }
                        />
                      </td>
                      <td className="px-8 py-6 text-gray-500 text-sm">
                        {new Date(service.createdAt).toLocaleDateString(
                          undefined,
                          { year: "numeric", month: "short", day: "numeric" },
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
