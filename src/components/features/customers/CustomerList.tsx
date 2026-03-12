import { getCustomers } from "@/actions";
import { CopyButton } from "@/components/ui";
import { SearchParams } from "@/types";
import { formatDate } from "@/utils";
import clsx from "clsx";
import InvoicePreviewButton from "../../features/invoices/InvoicePreviewButton";
import CustomerActionButtons from "./CustomerActionButtons";

export default async function CustomerList(params: SearchParams) {
  const response = await getCustomers(params);

  if (!response.success) {
    return (
      <tr>
        <td colSpan={8} className="text-center py-4 text-red-500">
          <p>{response.message}</p>
        </td>
      </tr>
    );
  }

  if (response.data!.length === 0) {
    return (
      <tr className="border-b">
        <td colSpan={8} className="text-center py-4 text-gray-600">
          <p>No data</p>
        </td>
      </tr>
    );
  }

  const customers = response.data!;

  return customers.map((customer) => (
    <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors group">
      <td className="py-4 px-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900">{customer.customerId}</span>
          <CopyButton content={customer.customerId} />
        </div>
      </td>
      <td className="py-4 px-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          {customer.invoiceNumber ? (
            <div className="flex items-center gap-1.5">
              <InvoicePreviewButton
                invoiceData={customer.invoice}
                className="text-brand font-bold hover:underline cursor-pointer text-sm"
              >
                <span>#{customer.invoiceNumber}</span>
              </InvoicePreviewButton>
              <CopyButton content={customer.invoiceNumber} />
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic">No Invoice</span>
          )}
        </div>
      </td>
      <td className="py-4 px-4 whitespace-nowrap">
        <span className="font-medium text-gray-900">{customer.name}</span>
      </td>
      <td className="py-4 px-4 whitespace-nowrap text-gray-600 font-medium">
        {customer.phone}
      </td>
      <td className="py-4 px-4 whitespace-nowrap">
        <p title={customer.address} className="truncate max-w-[200px] text-gray-600 text-xs">
          {customer.address}
        </p>
      </td>
      <td
        className={clsx(
          "py-4 px-4 whitespace-nowrap text-right font-bold",
          (customer.invoice?.dueAmount || 0) > 0 ? "text-red-500" : "text-emerald-600",
        )}
      >
        ৳{customer.invoice?.total.toLocaleString() || 0}
      </td>
      <td className="py-4 px-4 whitespace-nowrap text-gray-500 text-xs font-medium">
        {customer.invoice?.date ? formatDate(customer.invoice.date) : "N/A"}
      </td>
      <td className="py-4 px-4 whitespace-nowrap sticky right-0 bg-white group-hover:bg-gray-50 transition-colors shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.1)]">
        <CustomerActionButtons customerData={customer} />
      </td>
    </tr>
  ));
}
