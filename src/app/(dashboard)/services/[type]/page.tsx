import { getServicesMetadata } from "@/actions";
import { DelayedLoading, ServiceList, Spinner, Toolbar } from "@/components";
import { Suspense } from "react";

export default async function Services({
  params,
  searchParams,
}: {
  params: Promise<{ type: "repairs" | "installations" }>;
  searchParams?: Promise<{
    query?: string;
    page?: string;
    limit?: string;
  }>;
}) {
  const prms = await params;
  const sp = await searchParams;
  const type = prms.type === "repairs" ? "repair" : "install";
  const title = prms.type === "repairs" ? "Repairs" : "Installations";
  const pagination = await getServicesMetadata({ ...sp, type: type });

  return (
    <div className="flex-1 overflow-hidden flex flex-col gap-4">
      <Toolbar title={title} pagination={pagination} />
      <div className="overflow-x-auto overflow-y-auto flex-1 bg-white rounded-md border border-gray-100 shadow-sm custom-scrollbar">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="sticky top-0 z-20">
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-4 font-bold text-gray-700 text-sm whitespace-nowrap">
                Service ID
              </th>
              <th className="py-4 px-4 font-bold text-gray-700 text-sm whitespace-nowrap">
                Customer Name
              </th>
              <th className="py-4 px-4 font-bold text-gray-700 text-sm whitespace-nowrap">
                Phone Number
              </th>
              <th className="py-4 px-4 font-bold text-gray-700 text-sm whitespace-nowrap">
                Address
              </th>
              <th className="py-4 px-4 font-bold text-gray-700 text-sm whitespace-nowrap">
                Product
              </th>
              <th className="py-4 px-4 font-bold text-gray-700 text-sm whitespace-nowrap">
                Date
              </th>
              <th className="py-4 px-4 font-bold text-gray-700 text-sm whitespace-nowrap">
                Status
              </th>
              <th className="py-4 px-4 font-bold text-gray-700 text-sm whitespace-nowrap">
                Staff Name
              </th>
              <th className="py-4 px-4 font-bold text-gray-700 text-sm whitespace-nowrap">
                Staff Number
              </th>
              <th className="py-4 px-4 font-bold text-gray-700 whitespace-nowrap sticky right-0 bg-gray-50 shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.1)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            <Suspense
              key={sp?.query}
              fallback={
                <tr className="border-b">
                  <td
                    colSpan={10}
                    className="text-center py-12 text-gray-400 font-medium"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <DelayedLoading />
                      <span>Loading services...</span>
                    </div>
                  </td>
                </tr>
              }
            >
              <ServiceList {...{ ...sp, type: type }} />
            </Suspense>
          </tbody>
        </table>
      </div>
    </div>
  );
}
