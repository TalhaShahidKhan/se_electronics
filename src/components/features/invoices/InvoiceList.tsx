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

  if (response.data.length === 0) {
    return (
      <tr className="border-b">
        <td colSpan={8} className="text-center py-4 text-gray-600">
          <p>No data</p>
        </td>
      </tr>
    );
  }

  const invoices = response.data;

  return invoices.map((invoice) => (
    <tr key={invoice.invoiceNumber} className="border-b">
      <td className="py-4 px-2 whitespace-nowrap">
        <div className="flex items-center">
          <span>#{invoice.invoiceNumber}</span>
          <CopyButton content={invoice.invoiceNumber} />
        </div>
      </td>
      <td className="py-4 px-2 whitespace-nowrap">
        {invoice.customerId ? (
          <div className="flex items-center">
            <span>{invoice.customerId}</span>
            <CopyButton content={invoice.customerId} />
          </div>
        ) : (
          <span className="text-sm text-gray-400  text-center">N/A</span>
        )}
      </td>
      <td className="text-left py-4 px-2 whitespace-nowrap">
        {invoice.customerName}
      </td>
      <td className="text-left py-4 px-2 whitespace-nowrap">
        {invoice.customerPhone}
      </td>
      <td className="text-left py-4 px-2 whitespace-nowrap truncate">
        {invoice.customerAddress}
      </td>
      <td className="py-4 px-2 whitespace-nowrap">
        {invoice.total.toLocaleString()} TK
      </td>
      <td className="py-4 px-2 whitespace-nowrap">
        {formatDate(invoice.date!)}
      </td>
      <td className="py-4 px-2">
        <InvoiceActionButtons invoiceData={invoice} />
      </td>
    </tr>
  ));
}
