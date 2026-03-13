import { InvoicesType } from "@/types";
import { formatDate } from "@/utils";
import clsx from "clsx";

export default function InvoiceTemplate({ data }: { data: InvoicesType & { bgImage: string } }) {
    return (
        <div
            className="relative w-[210mm] h-[297mm] mx-auto bg-white bg-center bg-no-repeat bg-cover"
            style={{
                backgroundImage: `url(${data.bgImage})`,
                fontFamily: `Inter, Tiro Bangla`
            }}
        >
            <div className="absolute top-[200px] left-[40px] right-[40px]">
                <div className="text-right text-xl font-bold tracking-wide mb-4">INVOICE</div>
                <div className="flex justify-between mb-4 text-sm">
                    <div className="space-y-1">
                        <div><span className="font-semibold text-xl ">Invoice To</span></div>
                        <div><span className="font-semibold">Name :</span> {data.customerName}</div>
                        <div><span className="font-semibold">Address :</span> {data.customerAddress}</div>
                        <div><span className="font-semibold">Phone :</span> {data.customerPhone}</div>
                    </div>
                    <div className="text-right space-y-1">
                        <div><span className="font-semibold ">Invoice number #</span> {data.invoiceNumber}</div>
                        <div><span className="font-semibold">Date :</span> {formatDate(data.date)}</div>
                        <div><span className="font-semibold">Customer ID :</span> {data.customerId}</div>
                    </div>
                </div>
                <div>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className={clsx("border border-black", data.dueAmount > 0 ? 'bg-[#FFD7DD]' : 'bg-[#E6EFE6]')}>
                                <th className="text-left py-2 px-3 font-bold text-sm border-r border-black w-4">No</th>
                                <th className="text-left py-2 px-3 font-bold text-sm border-r border-black">Product details</th>
                                <th className="text-center py-2 px-3 font-bold text-sm border-r border-black">Warrenty</th>
                                <th className="text-center py-2 px-3 font-bold text-sm border-r border-black">Qty</th>
                                <th className="text-right py-2 px-3 font-bold text-sm border-r border-black">Unit Price</th>
                                <th className="text-right py-2 px-3 font-bold text-sm border-black">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.products?.map((product, index) => (
                                <tr key={product.id} className="border border-black">
                                    <td className="py-3 px-3 text-md border-r border-black">{index + 1}.</td>
                                    <td className="py-3 px-3 text-md border-r border-black">{product.type.toUpperCase()}-{product.model}</td>
                                    <td className="py-3 px-3 text-center text-md border-r border-black">
                                        {product.warrantyDurationMonths === 0 ? 'None' : product.warrantyDurationMonths + ' Months'}
                                    </td>
                                    <td className="py-3 px-3 text-center text-md border-r border-black">{product.quantity}</td>
                                    <td className="py-3 px-3 text-right text-md border-r border-black">{product.unitPrice.toLocaleString()}</td>
                                    <td className="py-3 px-3 text-right text-md font-semibold border-black">{(product.unitPrice * product.quantity).toLocaleString()} TK</td>
                                </tr>
                            ))}
                            <tr>
                                <td colSpan={6} className="py-3 px-3 border-black">
                                    <div className="flex justify-end items-start">
                                        <div className="text-right space-y-2">
                                            <div className="text-base"><span className="font-semibold">Total Bill : </span>{data.total.toLocaleString()} Tk</div>
                                            {data.dueAmount > 0 ? <>
                                                <div className="text-base"><span className="font-semibold">Advance :</span> {(data.total - data.dueAmount).toLocaleString()} Tk</div>
                                                <div className="text-base"><span className="font-semibold">Due :</span> <span className="font-bold">{data.dueAmount.toLocaleString()} Tk</span></div>
                                            </> :
                                                <div className="text-base"><span className="font-semibold">Paid : </span>{data.total.toLocaleString()} Tk</div>
                                            }
                                            <div className="text-base"><span className="font-semibold">Payment Method : </span>{data.paymentType.toUpperCase()}</div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}