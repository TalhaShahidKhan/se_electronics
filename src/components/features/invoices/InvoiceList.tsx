import { getInvoices } from "@/actions";
import { CopyButton } from "@/components/ui";
import { SearchParams } from "@/types";
import { formatDate } from "@/utils";
import InvoiceActionButtons from "./InvoiceActionButtons";

export default async function InvoiceList(params: SearchParams) {
  const response = await getInvoices(params);

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

  const invoices = response.data!;

  return invoices.map((invoice) => (
    <tr key={invoice.invoiceNumber} className="hover:bg-gray-50/50 transition-colors group">
      <td className="py-4 px-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className="font-bold text-brand">#{invoice.invoiceNumber}</span>
          <CopyButton content={invoice.invoiceNumber} />
        </div>
      </td>
      <td className="py-4 px-4 whitespace-nowrap">
        {invoice.customerId ? (
          <div className="flex items-center gap-2">
            <span className="text-gray-900 font-medium">{invoice.customerId}</span>
            <CopyButton content={invoice.customerId} />
          </div>
        ) : (
          <span className="text-xs text-gray-400 italic">N/A</span>
        )}
      </td>
      <td className="py-4 px-4 whitespace-nowrap">
        <span className="font-medium text-gray-900">{invoice.customerName}</span>
      </td>
      <td className="py-4 px-4 whitespace-nowrap text-gray-600 font-medium">
        {invoice.customerPhone}
      </td>
      <td className="py-4 px-4 whitespace-nowrap">
        <p title={invoice.customerAddress} className="truncate max-w-[200px] text-gray-600 text-xs">
          {invoice.customerAddress}
        </p>
      </td>
      <td className="py-4 px-4 whitespace-nowrap text-right font-bold text-emerald-600">
        ৳{invoice.total.toLocaleString()}
      </td>
      <td className="py-4 px-4 whitespace-nowrap text-gray-500 text-xs font-medium">
        {formatDate(invoice.date!)}
      </td>
      <td className="py-4 px-4 whitespace-nowrap sticky right-0 bg-white group-hover:bg-gray-50 transition-colors shadow-[-4px_0_10px_-4px_rgba(0,0,0,0.1)]">
        <InvoiceActionButtons invoiceData={invoice} />
      </td>
    </tr>
  ));
}
