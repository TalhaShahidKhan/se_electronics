import { getPaymentsMetadata } from "@/actions";
import {
  AddBalanceButton,
  AddPaymentButton,
  DelayedLoading,
  PaymentList,
  Toolbar,
} from "@/components";
import { SearchParams } from "@/types";
import { Suspense } from "react";

export default async function Payments({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const pagination = await getPaymentsMetadata({ ...params });

  return (
    <div className="flex-1 overflow-hidden flex flex-col gap-4">
      <Toolbar
        title="Payments"
        actions={
          <div className="flex items-center gap-2">
            <AddBalanceButton />
            <AddPaymentButton />
          </div>
        }
        pagination={pagination}
      />
      <div className="overflow-auto flex-1">
        <table id="services" className="w-full border">
          <thead>
            <tr className="sticky top-0 z-10 bg-gray-100 border-b">
              <th className="text-left text-sm  py-4 px-2">Payment ID</th>
              <th className="text-left text-sm  py-4 px-2">Invoice</th>
              <th className="text-left text-sm  py-4 px-2">Receiver</th>
              <th className="text-left text-sm  py-4 px-2">Amount</th>
              <th className="text-left text-sm  py-4 px-2">Status</th>
              <th className="text-left text-sm  py-4 px-2">Method</th>
              <th className="text-left text-sm  py-4 px-2">Date</th>
              <th className="text-left text-sm  py-4 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <Suspense
              key={params?.query}
              fallback={
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-600">
                    <DelayedLoading />
                  </td>
                </tr>
              }
            >
              <PaymentList {...params} />
            </Suspense>
          </tbody>
        </table>
      </div>
    </div>
  );
}
