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

  if (response.data.length === 0) {
    return (
      <tr className="border-b">
        <td colSpan={8} className="text-center py-4 text-gray-600">
          <p>No data</p>
        </td>
      </tr>
    );
  }

  const customers = response.data;

  return customers.map((customer) => (
    <tr key={customer.id} className="border-b">
      <td className="py-4 px-2 whitespace-nowrap">
        <div className="flex items-center">
          <span>{customer.customerId}</span>
          <CopyButton content={customer.customerId} />
        </div>
      </td>
      <td className="py-4 px-2 whitespace-nowrap">
        <div className="flex items-center">
          {customer.invoiceNumber ? (
            <div className="flex items-center">
              <InvoicePreviewButton
                invoiceData={customer.invoice}
                rest={{
                  className: "text-blue-500 hover:underline cursor-pointer",
                }}
              >
                <span>#{customer.invoiceNumber}</span>
              </InvoicePreviewButton>
              <CopyButton content={customer.invoiceNumber} />
            </div>
          ) : (
            <span className="text-sm text-gray-400 ">N/A</span>
          )}
        </div>
      </td>
      <td className="py-4 px-2 whitespace-nowrap">
        <p title={customer.name} className="truncate max-w-52">
          {customer.name}
        </p>
      </td>
      <td className="py-4 px-2 whitespace-nowrap">
        <span>{customer.phone}</span>
      </td>
      <td className="py-4 px-2 whitespace-nowrap">
        <span>{customer.address}</span>
      </td>
      <td
        className={clsx(
          "py-4 px-2 whitespace-nowrap",
          (customer.invoice?.dueAmount || 0) > 0 && "text-red-500",
        )}
      >
        {customer.invoice?.total.toLocaleString() || 0} TK
      </td>
      <td className="py-4 px-2 whitespace-nowrap">
        {customer.invoice?.date ? formatDate(customer.invoice.date) : "N/A"}
      </td>
      <td className="py-4 px-2 whitespace-nowrap">
        <CustomerActionButtons customerData={customer} />
      </td>
    </tr>
  ));
}
