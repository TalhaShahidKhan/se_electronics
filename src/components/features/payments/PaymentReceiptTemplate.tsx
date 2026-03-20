import { BankInfo, PaymentDataType } from "@/types";
import { formatDate } from "@/utils";

interface PaymentReceiptTemplateProps {
    bgImage: string;
    invoiceNumber: string;
    date: Date;
    description: string | null;
    staffId: string;
    transactionId: string | null;
    paymentId: string;
    paymentMethod: "cash" | "bkash" | "nagad" | "rocket" | "bank";
    senderWalletNumber: string | null;
    senderBankInfo: BankInfo | null;
    receiverWalletNumber: string | null;
    receiverBankInfo: BankInfo | null;
    amount: number;
    staff: {
        name: string;
    };
    serviceId?: string | null;
}

export default function PaymentReceiptTemplate({ data }: { data: PaymentReceiptTemplateProps }) {
    return (
        <div
            className="relative w-[210mm] h-[297mm] mx-auto bg-white p-[20mm]"
            style={{
                backgroundImage: `url(${data.bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                fontFamily: `'SolaimanLipi', sans-serif`
            }}
        >
            <div className="flex justify-center mb-8 pt-10">
                <div className="border-2 border-slate-700 px-8 py-2 rounded-md shadow-sm">
                    <h1 className="text-3xl font-bold tracking-widest uppercase">
                        <span className="text-red-600">Payment</span> <span className="text-green-700">Receipt</span>
                    </h1>
                </div>
            </div>

            <div className="text-right text-gray-800 font-bold mb-8 mr-4">
                Date: {formatDate(data.date)}
            </div>

            <div className="space-y-10 px-6">
                {/* Sender Information Section */}
                <div>
                     <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1">Sender Information</h2>
                    <table className="w-full border-collapse">
                        <tbody>
                            <tr>
                                <td className="border border-gray-400 px-4 py-2.5 font-bold w-1/3 bg-gray-50 uppercase text-xs">Company Name :</td>
                                <td className="border border-gray-400 px-4 py-2.5 w-2/3 font-semibold text-gray-800 tracking-wide uppercase">SE ELECTRONICS</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-400 px-4 py-2.5 font-bold bg-gray-50 uppercase text-xs">Payment Method :</td>
                                <td className="border border-gray-400 px-4 py-2.5 font-semibold text-gray-800 tracking-wide uppercase">{data.paymentMethod}</td>
                            </tr>
                            {data.paymentMethod === 'bank' && data.senderBankInfo && (
                                <>
                                    <tr>
                                        <td className="border border-gray-400 px-4 py-2.5 font-bold bg-gray-50 uppercase text-xs">Bank Name :</td>
                                        <td className="border border-gray-400 px-4 py-2.5">{data.senderBankInfo.bankName}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-400 px-4 py-2.5 font-bold bg-gray-50 uppercase text-xs">Account Holder :</td>
                                        <td className="border border-gray-400 px-4 py-2.5">{data.senderBankInfo.accountHolderName}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-400 px-4 py-2.5 font-bold bg-gray-50 uppercase text-xs">Account Number :</td>
                                        <td className="border border-gray-400 px-4 py-2.5">{data.senderBankInfo.accountNumber}</td>
                                    </tr>
                                </>
                            )}
                            {data.paymentMethod !== 'bank' && (
                                <>
                                    <tr>
                                        <td className="border border-gray-400 px-4 py-2.5 font-bold bg-gray-50 uppercase text-xs">Sender Number :</td>
                                        <td className="border border-gray-400 px-4 py-2.5 font-semibold">{data.senderWalletNumber || "N/A"}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-400 px-4 py-2.5 font-bold bg-gray-50 uppercase text-xs">Transaction ID :</td>
                                        <td className="border border-gray-400 px-4 py-2.5 font-mono text-gray-700">{data.transactionId || "N/A"}</td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Receipt Information Section */}
                <div className="pt-2">
                    <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1">Receipt Information</h2>
                    <table className="w-full border-collapse">
                        <tbody>
                            <tr>
                                <td className="border border-gray-400 px-4 py-2.5 font-bold w-1/3 bg-gray-50 uppercase text-xs">Employee Name :</td>
                                <td className="border border-gray-400 px-4 py-2.5 font-semibold text-gray-800 uppercase tracking-wide">{data.staff?.name}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-400 px-4 py-2.5 font-bold bg-gray-50 uppercase text-xs">Employee ID :</td>
                                <td className="border border-gray-400 px-4 py-2.5 font-semibold text-gray-800 tracking-wide">{data.staffId}</td>
                            </tr>
                            {data.paymentMethod === 'bank' && data.receiverBankInfo && (
                                <>
                                    <tr>
                                        <td className="border border-gray-400 px-4 py-2.5 font-bold bg-gray-50 uppercase text-xs">Receiver Bank :</td>
                                        <td className="border border-gray-400 px-4 py-2.5">{data.receiverBankInfo.bankName}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-gray-400 px-4 py-2.5 font-bold bg-gray-50 uppercase text-xs">Bank Account :</td>
                                        <td className="border border-gray-400 px-4 py-2.5">{data.receiverBankInfo.accountNumber}</td>
                                    </tr>
                                </>
                            )}
                            {data.paymentMethod !== 'bank' && (
                                <tr>
                                    <td className="border border-gray-400 px-4 py-2.5 font-bold bg-gray-50 uppercase text-xs">Receiver Number :</td>
                                    <td className="border border-gray-400 px-4 py-2.5 font-semibold">{data.receiverWalletNumber || "N/A"}</td>
                                </tr>
                            )}
                            <tr>
                                <td className="border border-gray-400 px-4 py-2.5 font-bold bg-gray-50 uppercase text-xs">Transaction ID :</td>
                                <td className="border border-gray-400 px-4 py-2.5 font-mono text-gray-700">{data.transactionId || "N/A"}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-400 px-4 py-3 font-bold bg-gray-50 uppercase text-xs align-top">Description :</td>
                                <td className="border border-gray-400 px-4 py-3 text-sm text-gray-600 italic">
                                    {data.description ? `: ${data.description}` : "N/A"}
                                </td>
                            </tr>
                            <tr className="bg-gray-100">
                                <td className="border border-gray-400 px-4 py-3 font-bold uppercase text-sm">Payment Received :</td>
                                <td className="border border-gray-400 px-4 py-3 font-black text-xl text-blue-900">{data.amount} TK</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Logo/Watermark Watermark Overlay (optional design addition) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-[-45deg] select-none">
                <span className="text-[12rem] font-black border-[20px] border-slate-900 rounded-full px-12 py-4">S E</span>
            </div>
        </div>
    );
}