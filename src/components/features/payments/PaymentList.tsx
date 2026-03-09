import { getPayments } from "@/actions";
import {
  CopyButton,
  InvoicePreviewButton,
  PaymentActionButtons,
  ProfileLinkButton,
} from "@/components";
import { SearchParams } from "@/types";
import { formatDate } from "@/utils";

async function PaymentList(params: SearchParams) {
  const response = await getPayments(params);

  if (!response.success) {
    return (
      <tr>
        <td colSpan={7} className="text-center py-4 text-red-500">
          <p>{response.message}</p>
        </td>
      </tr>
    );
  }

  if (response.data!.length === 0) {
    return (
      <tr className="border-b">
        <td colSpan={7} className="text-center py-4 text-gray-600">
          <p>No data</p>
        </td>
      </tr>
    );
  }

  const payments = response.data!;

  return payments.map((payment: any) => {
    return (
      <tr key={payment.paymentId} className="border-b">
        <td className="py-4 px-2 whitespace-nowrap">
          <div className="flex items-center">
            <span>{payment.paymentId}</span>
            <CopyButton content={payment.paymentId} />
          </div>
        </td>
        <td className="py-4 px-2 whitespace-nowrap">
          {payment.invoiceNumber ? (
            <div className="flex items-center">
              <InvoicePreviewButton
                paymentData={payment}
                className="text-blue-500 hover:underline cursor-pointer"
              >
                <span>#{payment.invoiceNumber}</span>
              </InvoicePreviewButton>
              <CopyButton content={payment.invoiceNumber} />
            </div>
          ) : (
            <span className="text-sm text-gray-400 ">N/A</span>
          )}
        </td>
        <td className="text-left py-4 px-2">
          <p title={payment.staff.name} className="truncate max-w-52">
            <ProfileLinkButton
              text={payment.staff.name}
              staffId={payment.staffId}
            />
          </p>
        </td>
        <td className="text-left py-4 px-2">
          {payment.amount.toLocaleString()} TK
        </td>
        <td className="text-left py-4 px-2">
          {payment.paymentMethod.toUpperCase()}
        </td>
        <td className="py-4 px-2 whitespace-nowrap">
          {formatDate(payment.date)}
        </td>
        <td className="text-left py-4 px-2">
          <PaymentActionButtons paymentData={payment} />
        </td>
      </tr>
    );
  });
}

export default PaymentList;
