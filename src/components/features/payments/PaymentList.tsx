import { getPayments } from "@/actions";
import {
  CopyButton,
  InvoicePreviewButton,
  PaymentActionButtons,
  ProfileLinkButton,
} from "@/components";
import { SearchParams } from "@/types";
import { formatDate } from "@/utils";
import clsx from "clsx";

const statusColors: Record<string, string> = {
  requested: "bg-orange-100 text-orange-700 border-orange-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  processing: "bg-blue-100 text-blue-700 border-blue-200",
  approved: "bg-indigo-100 text-indigo-700 border-indigo-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-100 text-rose-700 border-rose-200",
  credited: "bg-cyan-100 text-cyan-700 border-cyan-200",
};

async function PaymentList(
  params: SearchParams & { staffId?: string; hideStaff?: boolean },
) {
  const { hideStaff = false, ...p } = params;
  const response = await getPayments(p);
  if (!response.success) {
    return (
      <tr>
        <td
          colSpan={hideStaff ? 7 : 8}
          className="text-center py-4 text-red-500"
        >
          <p>{response.message}</p>
        </td>
      </tr>
    );
  }

  if (response.data!.length === 0) {
    return (
      <tr className="border-b">
        <td
          colSpan={hideStaff ? 7 : 8}
          className="text-center py-4 text-gray-600"
        >
          <p>No data</p>
        </td>
      </tr>
    );
  }

  const payments = response.data!;

  return payments.map((payment: any) => {
    return (
      <tr
        key={payment.paymentId}
        className="border-b hover:bg-gray-50/50 transition-colors"
      >
        <td className="py-4 px-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">{payment.paymentId}</span>
            <CopyButton content={payment.paymentId} />
          </div>
        </td>
        <td className="py-4 px-4 whitespace-nowrap">
          {payment.invoiceNumber ? (
            <div className="flex items-center gap-2">
              <InvoicePreviewButton
                paymentData={payment}
                className="text-brand font-black hover:underline cursor-pointer"
              >
                <span>#{payment.invoiceNumber}</span>
              </InvoicePreviewButton>
              <CopyButton content={payment.invoiceNumber} />
            </div>
          ) : (
            <span className="text-sm text-gray-400 font-bold">N/A</span>
          )}
        </td>
        {!hideStaff && (
          <td className="text-left py-4 px-4">
            <p title={payment.staff.name} className="truncate max-w-52">
              <ProfileLinkButton
                text={payment.staff.name}
                staffId={payment.staffId}
              />
            </p>
          </td>
        )}
        <td className="text-left py-4 px-4 font-black text-gray-900">
          ৳ {payment.amount.toLocaleString()}
        </td>
        <td className="text-left py-4 px-4">
          <span
            className={clsx(
              "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border tracking-widest",
              statusColors[payment.status] ||
                "bg-gray-100 text-gray-700 border-gray-200",
            )}
          >
            {payment.status}
          </span>
        </td>
        <td className="text-left py-4 px-4 font-bold text-gray-600 uppercase text-sm">
          {payment.paymentMethod}
        </td>
        <td className="py-4 px-4 whitespace-nowrap text-gray-500 font-bold text-sm">
          {formatDate(payment.date)}
        </td>
        <td className="text-left py-4 px-4">
          <PaymentActionButtons paymentData={payment} />
        </td>
      </tr>
    );
  });
}

export default PaymentList;
