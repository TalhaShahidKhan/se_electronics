import { getPaymentsMetadata, getStaffById } from "@/actions";
import { DelayedLoading, PaymentList, Toolbar } from "@/components";
import { SearchParams } from "@/types";
import { Suspense } from "react";
import { notFound } from "next/navigation";

export default async function StaffPaymentHistoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ staffId: string }>;
  searchParams?: Promise<SearchParams>;
}) {
  const { staffId } = await params;
  const sp = await searchParams;

  const staffRes = await getStaffById(staffId);
  if (!staffRes.success || !staffRes.data) {
    notFound();
  }

  const staff = staffRes.data;
  const pagination = await getPaymentsMetadata({ ...sp, staffId });

  return (
    <div className="flex-1 overflow-hidden flex flex-col gap-4">
      <Toolbar
        title={`Payment History: ${staff.name}`}
        pagination={pagination}
      />
      <div className="overflow-auto flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm custom-scrollbar">
        <table id="services" className="w-full border-collapse text-sm text-left">
          <thead>
            <tr className="sticky top-0 z-10 bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-4 text-sm font-bold text-gray-700 whitespace-nowrap">Payment ID</th>
              <th className="py-4 px-4 text-sm font-bold text-gray-700 whitespace-nowrap">Invoice</th>
              <th className="py-4 px-4 text-sm font-bold text-gray-700 whitespace-nowrap">Amount</th>
              <th className="py-4 px-4 text-sm font-bold text-gray-700 whitespace-nowrap">Status</th>
              <th className="py-4 px-4 text-sm font-bold text-gray-700 whitespace-nowrap">Method</th>
              <th className="py-4 px-4 text-sm font-bold text-gray-700 whitespace-nowrap">Date</th>
              <th className="py-4 px-4 text-sm font-bold text-gray-700 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            <Suspense
              key={sp?.query}
              fallback={
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 font-medium">
                    <div className="flex flex-col items-center gap-3">
                      <DelayedLoading />
                      <span>Loading payment history...</span>
                    </div>
                  </td>
                </tr>
              }
            >
              <PaymentList {...{ ...sp, staffId, hideStaff: true }} />
            </Suspense>
          </tbody>
        </table>
      </div>
    </div>
  );
}
