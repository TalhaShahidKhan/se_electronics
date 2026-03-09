import { getInvoicesMetadata } from "@/actions";
import {
  AddCustomerButton,
  DelayedLoading,
  InvoiceList,
  Toolbar,
} from "@/components";
import { Suspense } from "react";

export default async function Invoices({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const pagination = await getInvoicesMetadata({ ...params });

  return (
    <div className="flex-1 overflow-hidden flex flex-col gap-4">
      <Toolbar
        title="Invoices"
        actions={<AddCustomerButton />}
        pagination={pagination}
      />
      <div className="overflow-auto flex-1">
        <table id="services" className="w-full border">
          <thead>
            <tr className="sticky top-0 z-10 bg-gray-100 border-b">
              <th className="text-left py-4 px-2">Invoice Number</th>
              <th className="text-left py-4 px-2">Customer ID</th>
              <th className="text-left py-4 px-2">Customer Name</th>
              <th className="text-left py-4 px-2">Phone Number</th>
              <th className="text-left py-4 px-2">Address</th>
              <th className="text-left py-4 px-2">Total</th>
              <th className="text-left py-4 px-2">Date</th>
              <th className="text-left py-4 px-2">Actions</th>
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
              <InvoiceList {...params} />
            </Suspense>
          </tbody>
        </table>
      </div>
    </div>
  );
}
